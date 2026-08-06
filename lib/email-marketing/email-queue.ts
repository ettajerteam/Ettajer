import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import {
  isAnyEmailProviderConfigured,
  sendMarketingEmail,
} from "@/lib/email-marketing/providers";
import { buildEmailTemplateHtmlLive } from "@/lib/email-marketing/render";
import { resolveMarketingCompliance } from "@/lib/email-marketing/compliance";
import { normalizeSubscriberEmail } from "@/lib/newsletter";
import {
  EMAIL_QUEUE_BATCH_SIZE,
  EMAIL_QUEUE_LOCK_STALE_MS,
  EMAIL_QUEUE_MAX_ATTEMPTS,
  computeBackoffMs,
  type EmailJobKind,
  type EmailJobRenderPayload,
  type EmailJobRow,
  type EmailJobStatus,
  type EmailQueueStats,
} from "@/lib/email-marketing/email-queue-types";

export type {
  EmailJobKind,
  EmailJobRenderPayload,
  EmailJobRow,
  EmailJobStatus,
  EmailQueueStats,
} from "@/lib/email-marketing/email-queue-types";

export {
  formatEmailJobStatusLabel,
  EMAIL_JOB_STATUSES,
  EMAIL_QUEUE_BATCH_SIZE,
} from "@/lib/email-marketing/email-queue-types";

export function serializeEmailJob(row: {
  id: string;
  kind: string;
  status: string;
  toEmail: string;
  subject: string;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date | null;
  availableAt: Date;
  lastError: string | null;
  newsletterSendId: string | null;
  automationTrigger: string | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): EmailJobRow {
  return {
    id: row.id,
    kind: row.kind as EmailJobKind,
    status: row.status as EmailJobStatus,
    toEmail: row.toEmail,
    subject: row.subject,
    attempts: row.attempts,
    maxAttempts: row.maxAttempts,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    availableAt: row.availableAt.toISOString(),
    lastError: row.lastError,
    newsletterSendId: row.newsletterSendId,
    automationTrigger: row.automationTrigger,
    sentAt: row.sentAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getEmailQueueStats(
  storeId: string
): Promise<EmailQueueStats> {
  const groups = await prisma.emailJob.groupBy({
    by: ["status"],
    where: { storeId },
    _count: { _all: true },
  });
  const counts: EmailQueueStats = {
    pending: 0,
    scheduled: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
    total: 0,
  };
  for (const g of groups) {
    const n = g._count._all;
    counts.total += n;
    if (g.status in counts) {
      (counts as unknown as Record<string, number>)[g.status] = n;
    }
  }
  return counts;
}

export async function listEmailJobs(
  storeId: string,
  options?: {
    status?: EmailJobStatus | "all";
    take?: number;
  }
) {
  const status = options?.status ?? "all";
  return prisma.emailJob.findMany({
    where: {
      storeId,
      ...(status !== "all" ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: options?.take ?? 50,
  });
}

type EnqueueItem = {
  toEmail: string;
  idempotencyKey: string;
  scheduledAt?: Date | null;
  automationTrigger?: string | null;
  automationExecutionId?: string | null;
  emailTemplateId?: string | null;
  newsletterSendId?: string | null;
};

/**
 * Bulk-enqueue jobs. Skips idempotency conflicts (already queued/sent).
 * Returns created count (conflicts are not errors).
 */
export async function enqueueEmailJobs(input: {
  storeId: string;
  kind: EmailJobKind;
  subject: string;
  payload: EmailJobRenderPayload;
  items: EnqueueItem[];
  maxAttempts?: number;
}): Promise<{ created: number; skipped: number }> {
  if (input.items.length === 0) return { created: 0, skipped: 0 };

  const maxAttempts = input.maxAttempts ?? EMAIL_QUEUE_MAX_ATTEMPTS;
  const now = new Date();
  let created = 0;
  let skipped = 0;

  const CHUNK = 250;
  for (let i = 0; i < input.items.length; i += CHUNK) {
    const slice = input.items.slice(i, i + CHUNK);
    const data = slice.map((item) => {
      const scheduledAt = item.scheduledAt ?? null;
      const isScheduled = scheduledAt != null && scheduledAt.getTime() > now.getTime();
      return {
        storeId: input.storeId,
        kind: input.kind,
        status: isScheduled ? "scheduled" : "pending",
        toEmail: normalizeSubscriberEmail(item.toEmail),
        subject: input.subject,
        payload: input.payload as object,
        idempotencyKey: item.idempotencyKey,
        newsletterSendId: item.newsletterSendId ?? null,
        automationTrigger: item.automationTrigger ?? null,
        automationExecutionId: item.automationExecutionId ?? null,
        emailTemplateId: item.emailTemplateId ?? null,
        scheduledAt,
        availableAt: isScheduled ? scheduledAt! : now,
        maxAttempts,
      };
    });

    try {
      const result = await prisma.emailJob.createMany({
        data,
        skipDuplicates: true,
      });
      created += result.count;
      skipped += data.length - result.count;
    } catch (error) {
      // Fallback: insert one-by-one if createMany fails on provider quirks
      for (const row of data) {
        try {
          await prisma.emailJob.create({ data: row });
          created += 1;
        } catch {
          skipped += 1;
        }
      }
      console.error("[email-queue/enqueue]", error);
    }
  }

  return { created, skipped };
}

async function promoteDueScheduledJobs(limit = 200): Promise<number> {
  const now = new Date();
  const result = await prisma.emailJob.updateMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    data: {
      status: "pending",
      availableAt: now,
    },
  });
  // Prisma updateMany doesn't support take — promote in a second pass if needed
  void limit;
  return result.count;
}

/**
 * Atomically claim a job for this worker. Returns null if already claimed.
 */
async function claimJob(
  jobId: string,
  workerId: string,
  expectedAttempts: number
): Promise<boolean> {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - EMAIL_QUEUE_LOCK_STALE_MS);

  const fresh = await prisma.emailJob.updateMany({
    where: {
      id: jobId,
      attempts: expectedAttempts,
      status: { in: ["pending", "failed"] },
      availableAt: { lte: now },
    },
    data: {
      status: "sending",
      lockedAt: now,
      lockedBy: workerId,
      attempts: { increment: 1 },
      lastError: null,
    },
  });
  if (fresh.count === 1) return true;

  const stale = await prisma.emailJob.updateMany({
    where: {
      id: jobId,
      status: "sending",
      lockedAt: { lt: staleBefore },
    },
    data: {
      status: "sending",
      lockedAt: now,
      lockedBy: workerId,
      attempts: { increment: 1 },
      lastError: null,
    },
  });
  return stale.count === 1;
}

async function markJobSent(
  jobId: string,
  newsletterSendId: string | null,
  providerMessageId?: string | null
) {
  await prisma.$transaction(async (tx) => {
    const job = await tx.emailJob.update({
      where: { id: jobId },
      data: {
        status: "sent",
        sentAt: new Date(),
        lockedAt: null,
        lockedBy: null,
        lastError: null,
        ...(providerMessageId
          ? { providerMessageId: providerMessageId.trim() }
          : {}),
      },
      select: {
        storeId: true,
        toEmail: true,
        automationExecutionId: true,
        newsletterSendId: true,
        providerMessageId: true,
      },
    });
    if (newsletterSendId) {
      await tx.newsletterSend.update({
        where: { id: newsletterSendId },
        data: {
          sentCount: { increment: 1 },
          status: "sending",
        },
      });
    }
    if (job.automationExecutionId) {
      await tx.automationExecution.update({
        where: { id: job.automationExecutionId },
        data: {
          status: "sent",
          sentAt: new Date(),
          lastError: null,
        },
      });
    }
    return job;
  });
}

async function markJobFailed(
  jobId: string,
  attempts: number,
  maxAttempts: number,
  error: string,
  newsletterSendId: string | null
) {
  const terminal = attempts >= maxAttempts;
  const availableAt = terminal
    ? new Date()
    : new Date(Date.now() + computeBackoffMs(attempts));

  await prisma.$transaction(async (tx) => {
    const job = await tx.emailJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        availableAt,
        lockedAt: null,
        lockedBy: null,
        lastError: error.slice(0, 2000),
      },
      select: { automationExecutionId: true },
    });

    if (terminal && newsletterSendId) {
      await tx.newsletterSend.update({
        where: { id: newsletterSendId },
        data: {
          failedCount: { increment: 1 },
        },
      });
    }

    if (terminal && job.automationExecutionId) {
      await tx.automationExecution.update({
        where: { id: job.automationExecutionId },
        data: {
          status: "failed",
          lastError: error.slice(0, 2000),
        },
      });
    }
  });
}

async function finalizeCampaignIfDone(newsletterSendId: string | null) {
  if (!newsletterSendId) return;

  const open = await prisma.emailJob.count({
    where: {
      newsletterSendId,
      OR: [
        { status: { in: ["pending", "scheduled", "sending"] } },
        {
          status: "failed",
          attempts: { lt: EMAIL_QUEUE_MAX_ATTEMPTS },
        },
      ],
    },
  });

  if (open === 0) {
    await prisma.newsletterSend.update({
      where: { id: newsletterSendId },
      data: { status: "sent" },
    });
  }
}

async function processClaimedJob(jobId: string): Promise<"sent" | "failed" | "skipped"> {
  const job = await prisma.emailJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "sending") return "skipped";

  if (!isAnyEmailProviderConfigured()) {
    await markJobFailed(
      job.id,
      job.attempts,
      job.maxAttempts,
      "No email provider configured (set EMAIL_PROVIDER + credentials)",
      job.newsletterSendId
    );
    return "failed";
  }

  const compliance = await resolveMarketingCompliance({
    storeId: job.storeId,
    email: job.toEmail,
  });
  if (!compliance.allowed) {
    // Treat suppression as cancelled (not a hard failure)
    await prisma.$transaction(async (tx) => {
      await tx.emailJob.update({
        where: { id: job.id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          lockedAt: null,
          lockedBy: null,
          lastError: `Skipped: ${compliance.reason}`,
        },
      });
      if (job.automationExecutionId) {
        await tx.automationExecution.update({
          where: { id: job.automationExecutionId },
          data: {
            status: "skipped",
            lastError: `Skipped: ${compliance.reason}`.slice(0, 2000),
          },
        });
      }
    });
    await finalizeCampaignIfDone(job.newsletterSendId);
    return "skipped";
  }

  // Atlas: send-time optimization for automation / journey (not campaign blasts)
  const { maybeDeferJobForSendTime } = await import(
    "@/lib/email-marketing/atlas/send-time"
  );
  const deferred = await maybeDeferJobForSendTime({
    jobId: job.id,
    storeId: job.storeId,
    toEmail: job.toEmail,
    kind: job.kind,
  });
  if (deferred) return "skipped";

  const payload = job.payload as unknown as EmailJobRenderPayload;
  const html = await buildEmailTemplateHtmlLive({
    storeId: payload.storeId || job.storeId,
    currency: payload.currency || "MAD",
    template: payload.template,
    storeName: payload.storeName,
    storeSlug: payload.storeSlug,
    storePrimaryColor: payload.storePrimaryColor,
    storeAddress: payload.storeAddress,
    storeSupportEmail: payload.storeSupportEmail,
    marketingCompliance: {
      preferencesUrl: compliance.preferencesUrl,
      unsubscribeUrl: compliance.unsubscribeUrl,
    },
    recipientEmail: job.toEmail,
  });

  const result = await sendMarketingEmail(
    {
      to: job.toEmail,
      subject: job.subject,
      html,
      replyTo: payload.replyTo || undefined,
      headers: {
        "List-Unsubscribe": `<${compliance.unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    },
    null,
    { storeId: job.storeId, emailJobId: job.id, campaignId: job.newsletterSendId }
  );

  if (result.success) {
    await markJobSent(job.id, job.newsletterSendId, result.id);
    const { recordEmailJobSent } = await import(
      "@/lib/email-marketing/email-events"
    );
    await recordEmailJobSent({
      storeId: job.storeId,
      emailJobId: job.id,
      toEmail: job.toEmail,
      newsletterSendId: job.newsletterSendId,
      automationExecutionId: job.automationExecutionId,
      providerMessageId: result.id,
      provider: result.provider,
    });
    await finalizeCampaignIfDone(job.newsletterSendId);
    return "sent";
  }

  const attemptsForFailure =
    result.retryable === false ? job.maxAttempts : job.attempts;

  await markJobFailed(
    job.id,
    attemptsForFailure,
    job.maxAttempts,
    result.error || "Send failed",
    job.newsletterSendId
  );
  if (attemptsForFailure >= job.maxAttempts) {
    const { recordEmailJobFailed } = await import(
      "@/lib/email-marketing/email-events"
    );
    await recordEmailJobFailed({
      storeId: job.storeId,
      emailJobId: job.id,
      toEmail: job.toEmail,
      newsletterSendId: job.newsletterSendId,
      automationExecutionId: job.automationExecutionId,
      error: result.error || "Send failed",
    });
  }
  await finalizeCampaignIfDone(job.newsletterSendId);
  return "failed";
}

export async function runEmailQueueWorker(options?: {
  batchSize?: number;
}): Promise<{
  promoted: number;
  campaignsReleased: number;
  campaignJobsCreated: number;
  claimed: number;
  sent: number;
  failed: number;
  skipped: number;
}> {
  const workerId = `w-${randomUUID().slice(0, 8)}`;
  const batchSize = options?.batchSize ?? EMAIL_QUEUE_BATCH_SIZE;
  const now = new Date();
  const staleBefore = new Date(now.getTime() - EMAIL_QUEUE_LOCK_STALE_MS);

  const { releaseDueScheduledCampaigns } = await import(
    "@/lib/email-marketing/campaigns"
  );
  const campaignRelease = await releaseDueScheduledCampaigns();

  const promoted = await promoteDueScheduledJobs();

  const candidates = await prisma.emailJob.findMany({
    where: {
      OR: [
        {
          status: "pending",
          availableAt: { lte: now },
        },
        {
          status: "failed",
          availableAt: { lte: now },
          attempts: { lt: EMAIL_QUEUE_MAX_ATTEMPTS },
        },
        {
          status: "sending",
          lockedAt: { lt: staleBefore },
        },
      ],
    },
    orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
    take: batchSize,
    select: { id: true, attempts: true },
  });

  let claimed = 0;
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const ok = await claimJob(candidate.id, workerId, candidate.attempts);
    if (!ok) continue;
    claimed += 1;
    const outcome = await processClaimedJob(candidate.id);
    if (outcome === "sent") sent += 1;
    else if (outcome === "failed") failed += 1;
    else skipped += 1;
  }

  return {
    promoted,
    campaignsReleased: campaignRelease.released,
    campaignJobsCreated: campaignRelease.jobsCreated,
    claimed,
    sent,
    failed,
    skipped,
  };
}

export async function cancelEmailJobs(input: {
  storeId: string;
  jobIds?: string[];
  newsletterSendId?: string;
  /** When false, only cancel jobs — leave NewsletterSend status alone */
  updateCampaignStatus?: boolean;
}): Promise<number> {
  const result = await prisma.emailJob.updateMany({
    where: {
      storeId: input.storeId,
      status: { in: ["pending", "scheduled", "failed"] },
      ...(input.jobIds?.length ? { id: { in: input.jobIds } } : {}),
      ...(input.newsletterSendId
        ? { newsletterSendId: input.newsletterSendId }
        : {}),
    },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      lockedAt: null,
      lockedBy: null,
    },
  });

  if (input.newsletterSendId && input.updateCampaignStatus !== false) {
    await prisma.newsletterSend.updateMany({
      where: { id: input.newsletterSendId, storeId: input.storeId },
      data: { status: "cancelled" },
    });
  }

  return result.count;
}
