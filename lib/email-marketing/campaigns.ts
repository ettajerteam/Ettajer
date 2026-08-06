import { prisma } from "@/lib/db";
import { listNewsletterSubscribers } from "@/lib/newsletter";
import {
  cancelEmailJobs,
  enqueueEmailJobs,
  type EmailJobRenderPayload,
} from "@/lib/email-marketing/email-queue";
import {
  normalizeCampaignStatus,
  type CampaignPayloadSnapshot,
  type CampaignRow,
  type CampaignStatus,
  type CampaignStatusCounts,
} from "@/lib/email-marketing/campaign-types";
import {
  isValidIanaTimeZone,
  zonedLocalToUtc,
} from "@/lib/email-marketing/campaign-timezone";
import { serializeCampaign } from "@/lib/email-marketing/campaign-serialize";
import {
  getCampaignStatusCounts,
  listCampaignHistory,
  isCampaignHistoryFilter,
} from "@/lib/email-marketing/campaign-history";

export type {
  CampaignRow,
  CampaignStatus,
  CampaignStatusCounts,
} from "@/lib/email-marketing/campaign-types";

export {
  CAMPAIGN_STATUSES,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_HISTORY_FILTERS,
  formatCampaignStatusLabel,
  formatCampaignPresentationLabel,
  getCampaignPresentationStatus,
  normalizeCampaignStatus,
} from "@/lib/email-marketing/campaign-types";

export { serializeCampaign } from "@/lib/email-marketing/campaign-serialize";
export {
  getCampaignStatusCounts,
  listCampaignHistory,
  getCampaignHistoryDetail,
  listCampaignRecipients,
  exportCampaignRecipientsCsv,
  deleteCampaign,
  isCampaignHistoryFilter,
} from "@/lib/email-marketing/campaign-history";

/** Paginated-aware list used by older callers — prefer listCampaignHistory. */
export async function listCampaigns(
  storeId: string,
  options?: {
    status?: CampaignStatus | "all" | string;
    take?: number;
    page?: number;
    pageSize?: number;
    q?: string;
  }
) {
  const raw = options?.status ?? "all";
  const filter =
    !raw || raw === "all"
      ? ("all" as const)
      : raw === "sent"
        ? ("completed" as const)
        : isCampaignHistoryFilter(raw)
          ? raw
          : ("all" as const);

  return listCampaignHistory(storeId, {
    filter,
    page: options?.page ?? 1,
    pageSize: options?.pageSize ?? options?.take ?? 50,
    q: options?.q,
  });
}

type StoreContext = {
  id: string;
  name: string;
  slug: string;
  primaryColor: string | null;
  contactEmail: string | null;
  address: string | null;
  currency?: string | null;
};

export async function resolveCampaignTemplatePayload(input: {
  store: StoreContext;
  emailTemplateId?: string | null;
  templateId?: string | null;
  subject?: string | null;
  title?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  themeId?: string | null;
}): Promise<{
  subject: string;
  recordTemplateId: string;
  templatePayload: EmailJobRenderPayload["template"];
}> {
  const { getAbsoluteStoreUrl } = await import("@/lib/storefront-urls");
  const { isNewsletterTemplateId } = await import(
    "@/lib/email/newsletter-templates"
  );
  const { isNewsletterThemeId } = await import(
    "@/lib/email/newsletter-themes"
  );

  if (input.emailTemplateId) {
    const tpl = await prisma.emailTemplate.findFirst({
      where: { id: input.emailTemplateId, storeId: input.store.id },
    });
    if (!tpl) throw new Error("Template not found");

    const subject = input.subject?.trim() || tpl.subject;
    const title = input.title?.trim() || tpl.title;
    const body = input.body?.trim() || tpl.body;
    const ctaLabel = input.ctaLabel?.trim() || tpl.ctaLabel;
    const ctaUrl = input.ctaUrl?.trim() || tpl.ctaUrl;
    const themeId = input.themeId || tpl.themeId;

    if (ctaUrl) {
      const url = new URL(ctaUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("CTA URL must start with http:// or https://");
      }
    }

    const { parseEmailBlocks } = await import(
      "@/lib/email-marketing/email-blocks"
    );
    return {
      subject,
      recordTemplateId: tpl.id,
      templatePayload: {
        themeId,
        subject,
        title,
        body,
        ctaLabel,
        ctaUrl,
        galleryId: tpl.galleryId,
        blocks: parseEmailBlocks(tpl.blocks),
      },
    };
  }

  if (!input.templateId || !isNewsletterTemplateId(input.templateId)) {
    throw new Error("Unknown template");
  }
  if (!input.subject?.trim() || !input.title?.trim() || !input.body?.trim()) {
    throw new Error("Subject, title, and body are required");
  }
  const themeId = isNewsletterThemeId(input.themeId || "store")
    ? (input.themeId as string)
    : "store";
  const ctaUrl =
    input.ctaUrl?.trim() || getAbsoluteStoreUrl(input.store.slug);
  if (ctaUrl) {
    const url = new URL(ctaUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("CTA URL must start with http:// or https://");
    }
  }
  const subject = input.subject.trim();
  return {
    subject,
    recordTemplateId: input.templateId,
    templatePayload: {
      themeId,
      subject,
      title: input.title.trim(),
      body: input.body.trim(),
      ctaLabel: input.ctaLabel?.trim() || "Visit the store",
      ctaUrl,
      galleryId: input.templateId,
    },
  };
}

function buildPayloadSnapshot(
  store: StoreContext,
  template: EmailJobRenderPayload["template"]
): CampaignPayloadSnapshot {
  return {
    storeName: store.name,
    storeSlug: store.slug,
    storePrimaryColor: store.primaryColor,
    storeAddress: store.address,
    storeSupportEmail: store.contactEmail,
    replyTo: store.contactEmail,
    storeId: store.id,
    currency: store.currency || "MAD",
    template,
  };
}

async function resolveCampaignRecipients(
  storeId: string,
  segmentIds: string[] = []
): Promise<{ email: string }[]> {
  const { resolveSegmentIdsEmails, SEGMENT_MAX_RECIPIENTS } = await import(
    "@/lib/email-marketing/segments"
  );
  const emails = await resolveSegmentIdsEmails(storeId, segmentIds);
  if (emails.length === 0) {
    throw new Error(
      segmentIds.length
        ? "No active subscribers match the selected segments"
        : "No active subscribers to email"
    );
  }
  if (emails.length > SEGMENT_MAX_RECIPIENTS) {
    throw new Error(
      `Too many recipients (${emails.length}). Max ${SEGMENT_MAX_RECIPIENTS} per campaign.`
    );
  }
  return emails.map((email) => ({ email }));
}

async function countActiveRecipients(storeId: string, segmentIds: string[] = []) {
  return resolveCampaignRecipients(storeId, segmentIds);
}

export async function createOrUpdateCampaignDraft(input: {
  store: StoreContext;
  campaignId?: string;
  name?: string | null;
  emailTemplateId?: string | null;
  templateId?: string | null;
  subject?: string | null;
  title?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  themeId?: string | null;
  segmentIds?: string[];
}) {
  const resolved = await resolveCampaignTemplatePayload(input);
  const payload = buildPayloadSnapshot(input.store, resolved.templatePayload);
  const segmentIds = input.segmentIds ?? [];
  let recipientCount = 0;
  try {
    recipientCount = (await countActiveRecipients(input.store.id, segmentIds))
      .length;
  } catch {
    recipientCount = 0;
  }

  if (input.campaignId) {
    const existing = await prisma.newsletterSend.findFirst({
      where: { id: input.campaignId, storeId: input.store.id },
    });
    if (!existing) throw new Error("Campaign not found");
    const status = normalizeCampaignStatus(existing.status);
    if (status !== "draft" && status !== "scheduled") {
      throw new Error("Only draft or scheduled campaigns can be edited");
    }
    return prisma.newsletterSend.update({
      where: { id: existing.id },
      data: {
        name: input.name?.trim() || existing.name,
        templateId: resolved.recordTemplateId,
        subject: resolved.subject,
        recipientCount,
        segmentIds,
        payload: payload as object,
        ...(status === "draft"
          ? { scheduledAt: null, timezone: null }
          : {}),
      },
    });
  }

  return prisma.newsletterSend.create({
    data: {
      storeId: input.store.id,
      name: input.name?.trim() || null,
      templateId: resolved.recordTemplateId,
      subject: resolved.subject,
      recipientCount,
      segmentIds,
      status: "draft",
      payload: payload as object,
    },
  });
}

export async function scheduleCampaign(input: {
  store: StoreContext;
  campaignId?: string;
  name?: string | null;
  emailTemplateId?: string | null;
  templateId?: string | null;
  subject?: string | null;
  title?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  themeId?: string | null;
  segmentIds?: string[];
  /** ISO UTC or pair with localDatetime + timezone */
  scheduledAt?: string | Date | null;
  localDatetime?: string | null;
  timezone: string;
}) {
  if (!isValidIanaTimeZone(input.timezone)) {
    throw new Error("Invalid timezone");
  }

  let scheduledAt: Date;
  if (input.localDatetime?.trim()) {
    scheduledAt = zonedLocalToUtc(input.localDatetime.trim(), input.timezone);
  } else if (input.scheduledAt) {
    scheduledAt = new Date(input.scheduledAt);
  } else {
    throw new Error("Schedule time is required");
  }
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Invalid schedule time");
  }
  if (scheduledAt.getTime() <= Date.now() + 30_000) {
    throw new Error("Schedule time must be at least 1 minute in the future");
  }

  const resolved = await resolveCampaignTemplatePayload(input);
  const payload = buildPayloadSnapshot(input.store, resolved.templatePayload);
  const segmentIds =
    input.segmentIds ??
    (input.campaignId
      ? (
          await prisma.newsletterSend.findFirst({
            where: { id: input.campaignId, storeId: input.store.id },
            select: { segmentIds: true },
          })
        )?.segmentIds ?? []
      : []);
  const recipients = await countActiveRecipients(input.store.id, segmentIds);

  if (input.campaignId) {
    const existing = await prisma.newsletterSend.findFirst({
      where: { id: input.campaignId, storeId: input.store.id },
    });
    if (!existing) throw new Error("Campaign not found");
    const status = normalizeCampaignStatus(existing.status);
    if (status !== "draft" && status !== "scheduled") {
      throw new Error("Only draft or scheduled campaigns can be rescheduled");
    }
    await cancelEmailJobs({
      storeId: input.store.id,
      newsletterSendId: existing.id,
      updateCampaignStatus: false,
    });
    return prisma.newsletterSend.update({
      where: { id: existing.id },
      data: {
        name: input.name?.trim() || existing.name,
        templateId: resolved.recordTemplateId,
        subject: resolved.subject,
        recipientCount: recipients.length,
        segmentIds,
        status: "scheduled",
        scheduledAt,
        timezone: input.timezone,
        payload: payload as object,
        queuedAt: null,
      },
    });
  }

  return prisma.newsletterSend.create({
    data: {
      storeId: input.store.id,
      name: input.name?.trim() || null,
      templateId: resolved.recordTemplateId,
      subject: resolved.subject,
      recipientCount: recipients.length,
      segmentIds,
      status: "scheduled",
      scheduledAt,
      timezone: input.timezone,
      payload: payload as object,
    },
  });
}

async function enqueueCampaignJobs(input: {
  store: StoreContext;
  campaign: {
    id: string;
    subject: string;
    templateId: string;
    payload: unknown;
    segmentIds?: string[];
  };
  scheduledAt?: Date | null;
}) {
  const snapshot = input.campaign.payload as CampaignPayloadSnapshot | null;
  if (!snapshot?.template) {
    throw new Error("Campaign has no content payload");
  }

  const recipients = await resolveCampaignRecipients(
    input.store.id,
    input.campaign.segmentIds ?? []
  );
  const payload: EmailJobRenderPayload = {
    storeName: snapshot.storeName || input.store.name,
    storeSlug: snapshot.storeSlug || input.store.slug,
    storePrimaryColor:
      snapshot.storePrimaryColor ?? input.store.primaryColor,
    storeAddress: snapshot.storeAddress ?? input.store.address,
    storeSupportEmail:
      snapshot.storeSupportEmail ?? input.store.contactEmail,
    replyTo: snapshot.replyTo ?? input.store.contactEmail,
    storeId: snapshot.storeId || input.store.id,
    currency: snapshot.currency || input.store.currency || "MAD",
    template: snapshot.template,
  };

  const { created, skipped } = await enqueueEmailJobs({
    storeId: input.store.id,
    kind: "campaign",
    subject: input.campaign.subject,
    payload,
    items: recipients.map((sub) => ({
      toEmail: sub.email,
      idempotencyKey: `campaign:${input.campaign.id}:${sub.email.toLowerCase()}`,
      newsletterSendId: input.campaign.id,
      emailTemplateId:
        input.campaign.templateId.length >= 20
          ? input.campaign.templateId
          : null,
      scheduledAt: input.scheduledAt ?? null,
    })),
  });

  return { created, skipped, recipientCount: recipients.length };
}

export async function sendCampaignNow(input: {
  store: StoreContext;
  campaignId?: string;
  name?: string | null;
  emailTemplateId?: string | null;
  templateId?: string | null;
  subject?: string | null;
  title?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  themeId?: string | null;
  segmentIds?: string[];
}) {
  const { isAnyEmailProviderConfigured } = await import(
    "@/lib/email-marketing/providers"
  );
  if (!isAnyEmailProviderConfigured()) {
    throw new Error(
      "Email is not configured on this server. Add EMAIL_PROVIDER credentials (e.g. RESEND_API_KEY) to send newsletters."
    );
  }

  let campaign;
  if (input.campaignId) {
    const existing = await prisma.newsletterSend.findFirst({
      where: { id: input.campaignId, storeId: input.store.id },
    });
    if (!existing) throw new Error("Campaign not found");
    const status = normalizeCampaignStatus(existing.status);
    if (status !== "draft" && status !== "scheduled") {
      throw new Error("Only draft or scheduled campaigns can be sent now");
    }

    const segmentIds = input.segmentIds ?? existing.segmentIds ?? [];
    const resolved = await resolveCampaignTemplatePayload({
      ...input,
      emailTemplateId: input.emailTemplateId || existing.templateId,
    });
    const payload = buildPayloadSnapshot(input.store, resolved.templatePayload);
    await cancelEmailJobs({
      storeId: input.store.id,
      newsletterSendId: existing.id,
      updateCampaignStatus: false,
    });
    campaign = await prisma.newsletterSend.update({
      where: { id: existing.id },
      data: {
        name: input.name?.trim() || existing.name,
        templateId: resolved.recordTemplateId,
        subject: resolved.subject,
        segmentIds,
        status: "sending",
        scheduledAt: null,
        timezone: null,
        payload: payload as object,
        queuedAt: new Date(),
      },
    });
  } else {
    const segmentIds = input.segmentIds ?? [];
    const resolved = await resolveCampaignTemplatePayload(input);
    const payload = buildPayloadSnapshot(input.store, resolved.templatePayload);
    const recipients = await countActiveRecipients(input.store.id, segmentIds);
    campaign = await prisma.newsletterSend.create({
      data: {
        storeId: input.store.id,
        name: input.name?.trim() || null,
        templateId: resolved.recordTemplateId,
        subject: resolved.subject,
        recipientCount: recipients.length,
        segmentIds,
        status: "sending",
        payload: payload as object,
        queuedAt: new Date(),
      },
    });
  }

  const result = await enqueueCampaignJobs({
    store: input.store,
    campaign,
    scheduledAt: null,
  });

  await prisma.newsletterSend.update({
    where: { id: campaign.id },
    data: { recipientCount: result.recipientCount },
  });

  return { campaign, ...result };
}

export async function cancelScheduledCampaign(input: {
  storeId: string;
  campaignId: string;
  /** When true, move back to draft instead of cancelled */
  toDraft?: boolean;
}) {
  const existing = await prisma.newsletterSend.findFirst({
    where: { id: input.campaignId, storeId: input.storeId },
  });
  if (!existing) throw new Error("Campaign not found");
  const status = normalizeCampaignStatus(existing.status);
  if (status !== "scheduled" && status !== "draft" && status !== "sending") {
    throw new Error("This campaign cannot be cancelled");
  }

  const cancelledJobs = await cancelEmailJobs({
    storeId: input.storeId,
    newsletterSendId: existing.id,
    updateCampaignStatus: false,
  });

  const updated = await prisma.newsletterSend.update({
    where: { id: existing.id },
    data: input.toDraft
      ? {
          status: "draft",
          scheduledAt: null,
          timezone: null,
          queuedAt: null,
        }
      : {
          status: status === "draft" ? "cancelled" : "cancelled",
          scheduledAt: null,
          queuedAt: null,
        },
  });

  return { campaign: updated, cancelledJobs };
}

export async function archiveCampaign(storeId: string, campaignId: string) {
  const existing = await prisma.newsletterSend.findFirst({
    where: { id: campaignId, storeId },
  });
  if (!existing) throw new Error("Campaign not found");
  const status = normalizeCampaignStatus(existing.status);
  if (status !== "sent" && status !== "cancelled" && status !== "archived") {
    throw new Error(
      "Only completed, cancelled, or already archived campaigns can be archived"
    );
  }
  if (status === "archived") return existing;
  return prisma.newsletterSend.update({
    where: { id: existing.id },
    data: { status: "archived" },
  });
}

export async function duplicateCampaign(storeId: string, campaignId: string) {
  const existing = await prisma.newsletterSend.findFirst({
    where: { id: campaignId, storeId },
  });
  if (!existing) throw new Error("Campaign not found");

  const subscribers = await listNewsletterSubscribers(storeId, {
    status: "active",
  }).catch(() => []);

  return prisma.newsletterSend.create({
    data: {
      storeId,
      name: existing.name
        ? `${existing.name} (copy)`
        : `${existing.subject} (copy)`,
      templateId: existing.templateId,
      subject: existing.subject,
      recipientCount: subscribers.length,
      segmentIds: existing.segmentIds ?? [],
      status: "draft",
      payload: existing.payload ?? undefined,
      scheduledAt: null,
      timezone: null,
      queuedAt: null,
    },
  });
}

/**
 * Release due scheduled campaigns into the email queue.
 * Called from the minute cron worker before processing jobs.
 */
export async function releaseDueScheduledCampaigns(limit = 20): Promise<{
  released: number;
  jobsCreated: number;
}> {
  const now = new Date();
  const due = await prisma.newsletterSend.findMany({
    where: {
      status: "scheduled",
      scheduledAt: { lte: now },
    },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });

  let released = 0;
  let jobsCreated = 0;

  for (const campaign of due) {
    const store = await prisma.store.findUnique({
      where: { id: campaign.storeId },
      select: {
        id: true,
        name: true,
        slug: true,
        primaryColor: true,
        contactEmail: true,
        address: true,
      },
    });
    if (!store) continue;

    try {
      // Claim campaign so concurrent workers don't double-enqueue
      const claimed = await prisma.newsletterSend.updateMany({
        where: { id: campaign.id, status: "scheduled" },
        data: {
          status: "sending",
          queuedAt: now,
        },
      });
      if (claimed.count !== 1) continue;

      const result = await enqueueCampaignJobs({
        store,
        campaign,
        scheduledAt: null,
      });
      await prisma.newsletterSend.update({
        where: { id: campaign.id },
        data: { recipientCount: result.recipientCount },
      });
      released += 1;
      jobsCreated += result.created;
    } catch (error) {
      console.error(`[campaigns/release ${campaign.id}]`, error);
      await prisma.newsletterSend
        .update({
          where: { id: campaign.id },
          data: {
            status: "scheduled",
            queuedAt: null,
          },
        })
        .catch(() => undefined);
    }
  }

  return { released, jobsCreated };
}
