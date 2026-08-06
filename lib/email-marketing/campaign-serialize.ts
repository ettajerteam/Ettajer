import type { CampaignRow } from "@/lib/email-marketing/campaign-types";
import {
  getCampaignPresentationStatus,
  normalizeCampaignStatus,
} from "@/lib/email-marketing/campaign-types";
import { ratePercent } from "@/lib/email-marketing/email-analytics-types";
import { serializeCampaignAttribution } from "@/lib/email-marketing/atlas/attribution";

export function serializeCampaign(row: {
  id: string;
  name?: string | null;
  templateId: string;
  subject: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  bouncedCount?: number;
  scheduledAt?: Date | null;
  timezone?: string | null;
  queuedAt?: Date | null;
  segmentIds?: string[];
  createdAt: Date;
  updatedAt?: Date;
  attributedRevenue?: number | null;
  attributedOrders?: number | null;
  attributedAt?: Date | null;
}): CampaignRow {
  const status = normalizeCampaignStatus(row.status);
  const deliveredCount = row.deliveredCount ?? 0;
  const openedCount = row.openedCount ?? 0;
  const clickedCount = row.clickedCount ?? 0;
  const bouncedCount = row.bouncedCount ?? 0;
  const denom = Math.max(row.recipientCount, row.sentCount, 1);
  const attr = serializeCampaignAttribution({
    attributedRevenue: row.attributedRevenue,
    attributedOrders: row.attributedOrders,
    attributedAt: row.attributedAt,
    recipientCount: row.recipientCount,
    sentCount: row.sentCount,
  });

  return {
    id: row.id,
    name: row.name ?? null,
    templateId: row.templateId,
    subject: row.subject,
    status,
    presentationStatus: getCampaignPresentationStatus({
      status,
      sentCount: row.sentCount,
      failedCount: row.failedCount,
      recipientCount: row.recipientCount,
    }),
    recipientCount: row.recipientCount,
    sentCount: row.sentCount,
    failedCount: row.failedCount,
    deliveredCount,
    openedCount,
    clickedCount,
    bouncedCount,
    openRate: ratePercent(openedCount, Math.max(deliveredCount, row.sentCount, 1)),
    clickRate: ratePercent(clickedCount, Math.max(deliveredCount, row.sentCount, 1)),
    bounceRate: ratePercent(bouncedCount, denom),
    deliveryRate: ratePercent(deliveredCount, denom),
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    timezone: row.timezone ?? null,
    queuedAt: row.queuedAt?.toISOString() ?? null,
    segmentIds: row.segmentIds ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: (row.updatedAt ?? row.createdAt).toISOString(),
    attributedRevenue: attr.revenue,
    attributedOrders: attr.orders,
    attributedAt: attr.attributedAt,
    conversionRate: attr.conversionRate,
    averageOrderValue: attr.averageOrderValue,
    revenuePerRecipient: attr.revenuePerRecipient,
    revenuePerEmail: attr.revenuePerEmail,
    roi: attr.roi,
  };
}
