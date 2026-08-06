import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  CAMPAIGN_HISTORY_FILTERS,
  type CampaignHistoryFilter,
  type CampaignListResult,
  type CampaignRecipientListResult,
  type CampaignRecipientRow,
  type CampaignStatusCounts,
  type CampaignTimelineItem,
  normalizeCampaignStatus,
  getCampaignPresentationStatus,
} from "@/lib/email-marketing/campaign-types";
import { serializeCampaign } from "@/lib/email-marketing/campaign-serialize";
import { formatCampaignPresentationLabel } from "@/lib/email-marketing/campaign-types";

export { serializeCampaign } from "@/lib/email-marketing/campaign-serialize";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function clampPageSize(size?: number) {
  if (!size || Number.isNaN(size)) return DEFAULT_PAGE_SIZE;
  return Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(size)));
}

function clampPage(page?: number) {
  if (!page || Number.isNaN(page) || page < 1) return 1;
  return Math.floor(page);
}

export function isCampaignHistoryFilter(
  value: string
): value is CampaignHistoryFilter {
  return (CAMPAIGN_HISTORY_FILTERS as readonly string[]).includes(value);
}

function buildStatusWhere(
  filter: CampaignHistoryFilter
): Prisma.NewsletterSendWhereInput {
  switch (filter) {
    case "all":
      return { NOT: { status: "cancelled" } };
    case "draft":
      return { status: "draft" };
    case "scheduled":
      return { status: "scheduled" };
    case "sending":
      return { status: { in: ["sending", "queued"] } };
    case "completed":
      return {
        status: { in: ["sent", "completed"] },
        NOT: {
          AND: [
            { failedCount: { gt: 0 } },
            { sentCount: 0 },
            { recipientCount: { gt: 0 } },
          ],
        },
      };
    case "failed":
      return {
        status: { in: ["sent", "completed", "sending", "queued"] },
        failedCount: { gt: 0 },
        sentCount: 0,
        recipientCount: { gt: 0 },
      };
    case "archived":
      return { status: "archived" };
    case "cancelled":
      return { status: "cancelled" };
    default:
      return {};
  }
}

export async function getCampaignStatusCounts(
  storeId: string
): Promise<CampaignStatusCounts> {
  const rows = await prisma.newsletterSend.findMany({
    where: { storeId },
    select: {
      status: true,
      sentCount: true,
      failedCount: true,
      recipientCount: true,
    },
  });

  const counts: CampaignStatusCounts = {
    draft: 0,
    scheduled: 0,
    sending: 0,
    sent: 0,
    archived: 0,
    cancelled: 0,
    failed: 0,
    total: 0,
  };

  for (const row of rows) {
    counts.total += 1;
    const presentation = getCampaignPresentationStatus(row);
    if (presentation === "failed") {
      counts.failed += 1;
      continue;
    }
    const status = normalizeCampaignStatus(row.status);
    if (status === "sent") counts.sent += 1;
    else if (status === "draft") counts.draft += 1;
    else if (status === "scheduled") counts.scheduled += 1;
    else if (status === "sending") counts.sending += 1;
    else if (status === "archived") counts.archived += 1;
    else if (status === "cancelled") counts.cancelled += 1;
  }

  return counts;
}

export async function listCampaignHistory(
  storeId: string,
  options?: {
    filter?: CampaignHistoryFilter;
    q?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<CampaignListResult> {
  const filter = options?.filter ?? "all";
  const page = clampPage(options?.page);
  const pageSize = clampPageSize(options?.pageSize);
  const q = options?.q?.trim() || "";

  const where: Prisma.NewsletterSendWhereInput = {
    storeId,
    ...buildStatusWhere(filter),
    ...(q
      ? {
          OR: [
            { subject: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, rows, counts] = await Promise.all([
    prisma.newsletterSend.count({ where }),
    prisma.newsletterSend.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    getCampaignStatusCounts(storeId),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    campaigns: rows.map(serializeCampaign),
    total,
    page,
    pageSize,
    totalPages,
    counts,
  };
}

export async function getCampaignOrThrow(storeId: string, campaignId: string) {
  const row = await prisma.newsletterSend.findFirst({
    where: { id: campaignId, storeId },
  });
  if (!row) throw new Error("Campaign not found");
  return row;
}

export function buildCampaignTimeline(row: {
  id: string;
  status: string;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt: Date | null;
  queuedAt: Date | null;
  sentCount: number;
  failedCount: number;
  recipientCount: number;
  deliveredCount?: number;
}): CampaignTimelineItem[] {
  const status = normalizeCampaignStatus(row.status);
  const presentation = getCampaignPresentationStatus(row);
  const items: CampaignTimelineItem[] = [
    {
      id: `${row.id}:draft`,
      type: "draft",
      label: "Draft",
      detail: "Campaign created",
      at: row.createdAt.toISOString(),
    },
  ];

  if (row.scheduledAt) {
    items.push({
      id: `${row.id}:scheduled`,
      type: "scheduled",
      label: "Scheduled",
      detail: "Send time set",
      at: row.scheduledAt.toISOString(),
    });
  }

  if (row.queuedAt) {
    items.push({
      id: `${row.id}:sending`,
      type: "sending",
      label: "Sending",
      detail: `Queued for ${row.recipientCount} recipient${row.recipientCount === 1 ? "" : "s"}`,
      at: row.queuedAt.toISOString(),
    });
  }

  if (status === "cancelled") {
    items.push({
      id: `${row.id}:cancelled`,
      type: "cancelled",
      label: "Cancelled",
      detail: "Campaign cancelled",
      at: row.updatedAt.toISOString(),
    });
  }

  if (presentation === "failed") {
    items.push({
      id: `${row.id}:failed`,
      type: "failed",
      label: "Failed",
      detail: `${row.failedCount} failed · 0 sent`,
      at: row.updatedAt.toISOString(),
    });
  } else if (status === "sent") {
    items.push({
      id: `${row.id}:completed`,
      type: "completed",
      label: "Completed",
      detail: `${row.sentCount} sent · ${row.failedCount} failed · ${row.deliveredCount ?? 0} delivered`,
      at: row.updatedAt.toISOString(),
    });
  }

  if (status === "archived") {
    items.push({
      id: `${row.id}:archived`,
      type: "archived",
      label: "Archived",
      detail: "Moved to archive",
      at: row.updatedAt.toISOString(),
    });
  }

  return items.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );
}

export async function getCampaignHistoryDetail(
  storeId: string,
  campaignId: string
) {
  const row = await getCampaignOrThrow(storeId, campaignId);
  const campaign = serializeCampaign(row);

  const [eventRows, jobGroups] = await Promise.all([
    prisma.emailEvent.findMany({
      where: { storeId, newsletterSendId: campaignId },
      orderBy: { occurredAt: "asc" },
      take: 100,
      select: {
        id: true,
        type: true,
        toEmail: true,
        occurredAt: true,
        provider: true,
      },
    }),
    prisma.emailJob.groupBy({
      by: ["status"],
      where: { storeId, newsletterSendId: campaignId },
      _count: { _all: true },
    }),
  ]);

  const milestone = buildCampaignTimeline(row);
  const events: CampaignTimelineItem[] = eventRows.map((ev) => ({
    id: ev.id,
    type: "event",
    label: ev.type.charAt(0).toUpperCase() + ev.type.slice(1),
    detail: ev.toEmail
      ? `${ev.toEmail}${ev.provider ? ` · ${ev.provider}` : ""}`
      : ev.provider || null,
    at: ev.occurredAt.toISOString(),
    meta: { eventType: ev.type, provider: ev.provider },
  }));

  const timeline = [...milestone, ...events].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
  );

  const recipientStatusCounts: Record<string, number> = {};
  for (const g of jobGroups) {
    recipientStatusCounts[g.status] = g._count._all;
  }

  return {
    campaign,
    timeline,
    presentationLabel: formatCampaignPresentationLabel(
      campaign.presentationStatus
    ),
    recipientStatusCounts,
  };
}

export async function listCampaignRecipients(
  storeId: string,
  campaignId: string,
  options?: {
    status?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<CampaignRecipientListResult> {
  await getCampaignOrThrow(storeId, campaignId);
  const page = clampPage(options?.page);
  const pageSize = clampPageSize(options?.pageSize);
  const q = options?.q?.trim() || "";
  const status = options?.status?.trim() || "all";

  const where: Prisma.EmailJobWhereInput = {
    storeId,
    newsletterSendId: campaignId,
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? { toEmail: { contains: q, mode: "insensitive" } }
      : {}),
  };

  const [total, rows, groups] = await Promise.all([
    prisma.emailJob.count({ where }),
    prisma.emailJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        toEmail: true,
        status: true,
        attempts: true,
        maxAttempts: true,
        lastError: true,
        sentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.emailJob.groupBy({
      by: ["status"],
      where: { storeId, newsletterSendId: campaignId },
      _count: { _all: true },
    }),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const g of groups) statusCounts[g.status] = g._count._all;

  const recipients: CampaignRecipientRow[] = rows.map((r) => ({
    id: r.id,
    email: r.toEmail,
    status: r.status,
    attempts: r.attempts,
    maxAttempts: r.maxAttempts,
    lastError: r.lastError,
    sentAt: r.sentAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return {
    recipients,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    statusCounts,
  };
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportCampaignRecipientsCsv(
  storeId: string,
  campaignId: string
): Promise<{ filename: string; csv: string }> {
  const campaign = await getCampaignOrThrow(storeId, campaignId);
  const jobs = await prisma.emailJob.findMany({
    where: { storeId, newsletterSendId: campaignId },
    orderBy: { createdAt: "asc" },
    select: {
      toEmail: true,
      status: true,
      attempts: true,
      maxAttempts: true,
      lastError: true,
      sentAt: true,
      createdAt: true,
    },
  });

  const header = [
    "email",
    "status",
    "attempts",
    "max_attempts",
    "last_error",
    "sent_at",
    "created_at",
  ];
  const lines = [header.join(",")];
  for (const job of jobs) {
    lines.push(
      [
        csvEscape(job.toEmail),
        csvEscape(job.status),
        String(job.attempts),
        String(job.maxAttempts),
        csvEscape(job.lastError || ""),
        csvEscape(job.sentAt?.toISOString() || ""),
        csvEscape(job.createdAt.toISOString()),
      ].join(",")
    );
  }

  const slug = (campaign.name || campaign.subject || "campaign")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return {
    filename: `campaign-${slug || campaign.id}-recipients.csv`,
    csv: lines.join("\n"),
  };
}

export async function deleteCampaign(storeId: string, campaignId: string) {
  const existing = await getCampaignOrThrow(storeId, campaignId);
  const status = normalizeCampaignStatus(existing.status);
  if (!["draft", "cancelled", "archived"].includes(status)) {
    throw new Error(
      "Only draft, cancelled, or archived campaigns can be deleted. Archive completed campaigns first."
    );
  }

  // Cancel leftover jobs, then remove campaign (events/jobs unlink via SetNull/Cascade)
  await prisma.emailJob.updateMany({
    where: {
      storeId,
      newsletterSendId: campaignId,
      status: { in: ["pending", "scheduled", "sending", "failed"] },
    },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
      lockedAt: null,
      lockedBy: null,
    },
  });

  await prisma.newsletterSend.delete({ where: { id: campaignId } });
  return { ok: true as const };
}
