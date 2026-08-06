import { prisma } from "@/lib/db";
import {
  emptyEmailAnalyticsSummary,
  ratePercent,
  type EmailAnalyticsDailyPoint,
  type EmailAnalyticsSummary,
  type EmailCampaignAnalyticsRow,
} from "@/lib/email-marketing/email-analytics-types";
import { normalizeCampaignStatus } from "@/lib/email-marketing/campaign-types";

export type {
  EmailAnalyticsDailyPoint,
  EmailAnalyticsSummary,
  EmailCampaignAnalyticsRow,
} from "@/lib/email-marketing/email-analytics-types";

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function dayKey(d: Date): string {
  return startOfUtcDay(d).toISOString().slice(0, 10);
}

function fillDailySeries(
  from: Date,
  to: Date,
  byDay: Map<string, EmailAnalyticsDailyPoint>
): EmailAnalyticsDailyPoint[] {
  const points: EmailAnalyticsDailyPoint[] = [];
  const cursor = startOfUtcDay(from);
  const end = startOfUtcDay(to);
  while (cursor.getTime() <= end.getTime()) {
    const key = dayKey(cursor);
    points.push(
      byDay.get(key) ?? { date: key, sends: 0, opens: 0, clicks: 0 }
    );
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return points;
}

async function countEvents(
  storeId: string,
  type: string,
  from: Date,
  to: Date
): Promise<number> {
  return prisma.emailEvent.count({
    where: {
      storeId,
      type,
      occurredAt: { gte: from, lte: to },
    },
  });
}

export async function getEmailAnalyticsSummary(
  storeId: string,
  options?: { days?: number }
): Promise<EmailAnalyticsSummary> {
  const days = Math.min(Math.max(options?.days ?? 30, 1), 365);
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  from.setUTCHours(0, 0, 0, 0);

  const [sent, delivered, failed, opened, clicked, bounced, unsubscribed] =
    await Promise.all([
      countEvents(storeId, "sent", from, to),
      countEvents(storeId, "delivered", from, to),
      countEvents(storeId, "failed", from, to),
      countEvents(storeId, "opened", from, to),
      countEvents(storeId, "clicked", from, to),
      countEvents(storeId, "bounced", from, to),
      countEvents(storeId, "unsubscribed", from, to),
    ]);

  const deliveryBase = delivered > 0 ? delivered : sent;

  return {
    sent,
    delivered: deliveryBase,
    failed,
    opened,
    clicked,
    bounced,
    unsubscribed,
    openRate: ratePercent(opened, deliveryBase),
    clickRate: ratePercent(clicked, deliveryBase),
    bounceRate: ratePercent(bounced, sent > 0 ? sent : deliveryBase),
    ctr: ratePercent(clicked, deliveryBase),
  };
}

export async function getEmailAnalyticsDaily(
  storeId: string,
  options?: { days?: number }
): Promise<EmailAnalyticsDailyPoint[]> {
  const days = Math.min(Math.max(options?.days ?? 30, 1), 365);
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  from.setUTCHours(0, 0, 0, 0);

  const rows = await prisma.emailEvent.findMany({
    where: {
      storeId,
      type: { in: ["sent", "opened", "clicked"] },
      occurredAt: { gte: from, lte: to },
    },
    select: { type: true, occurredAt: true },
    orderBy: { occurredAt: "asc" },
  });

  const byDay = new Map<string, EmailAnalyticsDailyPoint>();
  for (const row of rows) {
    const key = dayKey(row.occurredAt);
    const point = byDay.get(key) ?? {
      date: key,
      sends: 0,
      opens: 0,
      clicks: 0,
    };
    if (row.type === "sent") point.sends += 1;
    else if (row.type === "opened") point.opens += 1;
    else if (row.type === "clicked") point.clicks += 1;
    byDay.set(key, point);
  }

  return fillDailySeries(from, to, byDay);
}

export function serializeCampaignAnalytics(row: {
  id: string;
  subject: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: Date;
}): EmailCampaignAnalyticsRow {
  const delivered =
    row.deliveredCount > 0 ? row.deliveredCount : row.sentCount;
  return {
    id: row.id,
    subject: row.subject,
    status: normalizeCampaignStatus(row.status),
    recipients: row.recipientCount,
    delivered,
    opened: row.openedCount,
    clicked: row.clickedCount,
    failed: row.failedCount,
    openRate: ratePercent(row.openedCount, delivered),
    ctr: ratePercent(row.clickedCount, delivered),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listCampaignAnalytics(
  storeId: string,
  take = 20
): Promise<EmailCampaignAnalyticsRow[]> {
  const rows = await prisma.newsletterSend.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(serializeCampaignAnalytics);
}

export async function getCampaignAnalyticsDetail(
  storeId: string,
  sendId: string
): Promise<EmailCampaignAnalyticsRow | null> {
  const row = await prisma.newsletterSend.findFirst({
    where: { id: sendId, storeId },
  });
  if (!row) return null;
  return serializeCampaignAnalytics(row);
}

export async function getEmailAnalyticsBundle(
  storeId: string,
  options?: { days?: number }
) {
  const days = options?.days ?? 30;
  const [summary, daily, campaigns] = await Promise.all([
    getEmailAnalyticsSummary(storeId, { days }),
    getEmailAnalyticsDaily(storeId, { days }),
    listCampaignAnalytics(storeId, 25),
  ]);
  return { summary, daily, campaigns, days };
}
