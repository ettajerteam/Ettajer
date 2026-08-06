import { prisma } from "@/lib/db";
import { normalizeCampaignStatus } from "@/lib/email-marketing/campaign-types";
import { generateUnsubscribeToken } from "@/lib/email-marketing/unsubscribe-token";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NEWSLETTER_SUBSCRIBER_STATUSES = [
  "active",
  "unsubscribed",
  "bounced",
  "complained",
] as const;

export type NewsletterSubscriberStatus =
  (typeof NEWSLETTER_SUBSCRIBER_STATUSES)[number];

export function isNewsletterSubscriberStatus(
  value: string
): value is NewsletterSubscriberStatus {
  return (NEWSLETTER_SUBSCRIBER_STATUSES as readonly string[]).includes(value);
}

export function formatSubscriberStatusLabel(status: string): string {
  switch (status) {
    case "active":
      return "Active";
    case "unsubscribed":
      return "Unsubscribed";
    case "bounced":
      return "Bounced";
    case "complained":
      return "Complained";
    default:
      return status;
  }
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  source: string | null;
  status: string;
  tags: string[];
  language: string | null;
  createdAt: string;
  unsubscribedAt: string | null;
}

export interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
  thisWeek: number;
}

export function normalizeSubscriberEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidSubscriberEmail(email: string): boolean {
  return EMAIL_RE.test(normalizeSubscriberEmail(email));
}

export async function subscribeToNewsletter(options: {
  storeId: string;
  email: string;
  source?: string;
  /**
   * Only preferences / explicit consent flows may set this.
   * Storefront signup must leave it false so unsubscribed contacts stay out.
   */
  explicitOptIn?: boolean;
}): Promise<{
  created: boolean;
  reactivated: boolean;
  requiresOptIn: boolean;
  status: NewsletterSubscriberStatus | null;
  subscriberId: string | null;
}> {
  const email = normalizeSubscriberEmail(options.email);
  if (!isValidSubscriberEmail(email)) {
    throw new Error("Invalid email address");
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: {
      storeId_email: {
        storeId: options.storeId,
        email,
      },
    },
  });

  if (existing) {
    if (existing.status === "active") {
      return {
        created: false,
        reactivated: false,
        requiresOptIn: false,
        status: "active",
        subscriberId: existing.id,
      };
    }

    if (!options.explicitOptIn) {
      return {
        created: false,
        reactivated: false,
        requiresOptIn: true,
        status: existing.status as NewsletterSubscriberStatus,
        subscriberId: existing.id,
      };
    }

    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: {
        status: "active",
        source: options.source ?? existing.source,
        unsubscribedAt: null,
        unsubscribeToken:
          existing.unsubscribeToken || generateUnsubscribeToken(),
      },
    });
    return {
      created: false,
      reactivated: true,
      requiresOptIn: false,
      status: "active",
      subscriberId: existing.id,
    };
  }

  const created = await prisma.newsletterSubscriber.create({
    data: {
      storeId: options.storeId,
      email,
      source: options.source ?? "newsletter",
      status: "active",
      unsubscribeToken: generateUnsubscribeToken(),
    },
  });

  return {
    created: true,
    reactivated: false,
    requiresOptIn: false,
    status: "active",
    subscriberId: created.id,
  };
}

export async function listNewsletterSubscribers(
  storeId: string,
  options?: { status?: NewsletterSubscriberStatus | "all" }
) {
  const status = options?.status ?? "all";
  return prisma.newsletterSubscriber.findMany({
    where: {
      storeId,
      ...(status !== "all" ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNewsletterStats(storeId: string): Promise<NewsletterStats> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [total, active, unsubscribed, bounced, complained, thisWeek] =
    await Promise.all([
      prisma.newsletterSubscriber.count({ where: { storeId } }),
      prisma.newsletterSubscriber.count({ where: { storeId, status: "active" } }),
      prisma.newsletterSubscriber.count({
        where: { storeId, status: "unsubscribed" },
      }),
      prisma.newsletterSubscriber.count({
        where: { storeId, status: "bounced" },
      }),
      prisma.newsletterSubscriber.count({
        where: { storeId, status: "complained" },
      }),
      prisma.newsletterSubscriber.count({
        where: { storeId, createdAt: { gte: weekAgo } },
      }),
    ]);

  return { total, active, unsubscribed, bounced, complained, thisWeek };
}

export async function setNewsletterSubscriberStatus(
  id: string,
  storeId: string,
  status: NewsletterSubscriberStatus
) {
  const row = await prisma.newsletterSubscriber.findFirst({
    where: { id, storeId },
  });
  if (!row) throw new Error("Subscriber not found");
  return prisma.newsletterSubscriber.update({
    where: { id },
    data: {
      status,
      unsubscribedAt:
        status === "unsubscribed" ||
        status === "bounced" ||
        status === "complained"
          ? row.unsubscribedAt ?? new Date()
          : null,
      unsubscribeToken: row.unsubscribeToken || generateUnsubscribeToken(),
    },
  });
}

export async function deleteNewsletterSubscriber(id: string, storeId: string) {
  const row = await prisma.newsletterSubscriber.findFirst({
    where: { id, storeId },
  });
  if (!row) throw new Error("Subscriber not found");
  await prisma.newsletterSubscriber.delete({ where: { id } });
}

export function serializeNewsletterSubscriber(row: {
  id: string;
  email: string;
  source: string | null;
  status: string;
  tags?: string[];
  language?: string | null;
  createdAt: Date;
  unsubscribedAt?: Date | null;
}): NewsletterSubscriberRow {
  return {
    id: row.id,
    email: row.email,
    source: row.source,
    status: row.status,
    tags: row.tags ?? [],
    language: row.language ?? null,
    createdAt: row.createdAt.toISOString(),
    unsubscribedAt: row.unsubscribedAt
      ? row.unsubscribedAt.toISOString()
      : null,
  };
}

export function formatNewsletterSource(source: string | null): string {
  if (!source?.trim()) return "Storefront";
  return source
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface NewsletterSendRow {
  id: string;
  templateId: string;
  subject: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  status: string;
  scheduledAt: string | null;
  timezone: string | null;
  name: string | null;
  createdAt: string;
}

export function serializeNewsletterSend(row: {
  id: string;
  templateId: string;
  subject: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  status?: string;
  scheduledAt?: Date | null;
  timezone?: string | null;
  name?: string | null;
  createdAt: Date;
}): NewsletterSendRow {
  return {
    id: row.id,
    templateId: row.templateId,
    subject: row.subject,
    recipientCount: row.recipientCount,
    sentCount: row.sentCount,
    failedCount: row.failedCount,
    deliveredCount: row.deliveredCount ?? 0,
    openedCount: row.openedCount ?? 0,
    clickedCount: row.clickedCount ?? 0,
    status: normalizeCampaignStatus(row.status ?? "draft"),
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    timezone: row.timezone ?? null,
    name: row.name ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listNewsletterSends(storeId: string, take = 8) {
  return prisma.newsletterSend.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function createNewsletterSend(input: {
  storeId: string;
  templateId: string;
  subject: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status?: string;
  name?: string | null;
  scheduledAt?: Date | null;
  timezone?: string | null;
  payload?: object | null;
}) {
  return prisma.newsletterSend.create({
    data: {
      storeId: input.storeId,
      templateId: input.templateId,
      subject: input.subject,
      recipientCount: input.recipientCount,
      sentCount: input.sentCount,
      failedCount: input.failedCount,
      status: input.status ?? "draft",
      name: input.name ?? null,
      scheduledAt: input.scheduledAt ?? null,
      timezone: input.timezone ?? null,
      payload: input.payload ?? undefined,
    },
  });
}
