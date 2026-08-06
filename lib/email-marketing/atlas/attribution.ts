import { prisma } from "@/lib/db";
import { ratePercent } from "@/lib/email-marketing/email-analytics-types";

export interface CampaignRevenueAttribution {
  campaignId: string;
  revenue: number;
  orders: number;
  recipients: number;
  sent: number;
  conversionRate: number;
  averageOrderValue: number;
  revenuePerRecipient: number;
  revenuePerEmail: number;
  /** Rough ROI assuming email cost floor */
  roi: number;
  recoveredRevenue: number;
  attributedAt: string | null;
}

/**
 * Attribute orders to a campaign via utm_campaign = attributionKey|campaignId
 * within an attribution window after queuedAt/createdAt.
 */
export async function attributeCampaignRevenue(
  storeId: string,
  campaignId: string,
  options?: { windowDays?: number; emailCostPerSend?: number }
): Promise<CampaignRevenueAttribution> {
  const campaign = await prisma.newsletterSend.findFirst({
    where: { id: campaignId, storeId },
  });
  if (!campaign) throw new Error("Campaign not found");

  const windowDays = options?.windowDays ?? 7;
  const start =
    campaign.queuedAt || campaign.scheduledAt || campaign.createdAt;
  const end = new Date(start.getTime() + windowDays * 86_400_000);
  const key = campaign.attributionKey || campaign.id;

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      status: { notIn: ["cancelled"] },
      createdAt: { gte: start, lte: end },
      OR: [
        { utmCampaign: key },
        { utmCampaign: campaign.id },
        ...(campaign.name
          ? [{ utmCampaign: { equals: campaign.name, mode: "insensitive" as const } }]
          : []),
      ],
    },
    select: { total: true, id: true },
  });

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const orderCount = orders.length;
  const recipients = Math.max(campaign.recipientCount, 1);
  const sent = Math.max(campaign.sentCount, campaign.deliveredCount, 1);
  const aov = orderCount ? revenue / orderCount : 0;
  const conversionRate = ratePercent(orderCount, campaign.recipientCount || sent);
  const revenuePerRecipient = revenue / recipients;
  const revenuePerEmail = revenue / sent;
  const cost =
    (options?.emailCostPerSend ?? 0.001) *
    Math.max(campaign.sentCount, campaign.recipientCount, 1);
  const roi = cost > 0 ? revenue / cost : revenue > 0 ? 999 : 0;

  // Recovered revenue: only meaningful for cart-style campaigns — use abandoned checkouts recovered in window
  const recovered = await prisma.abandonedCheckout.aggregate({
    where: {
      storeId,
      recoveredAt: { gte: start, lte: end },
    },
    _sum: { subtotal: true },
  });
  const recoveredRevenue = recovered._sum.subtotal ?? 0;

  const updated = await prisma.newsletterSend.update({
    where: { id: campaign.id },
    data: {
      attributedRevenue: revenue,
      attributedOrders: orderCount,
      attributedAt: new Date(),
      attributionKey: key,
    },
  });

  return {
    campaignId: updated.id,
    revenue,
    orders: orderCount,
    recipients: campaign.recipientCount,
    sent: campaign.sentCount,
    conversionRate,
    averageOrderValue: Math.round(aov * 100) / 100,
    revenuePerRecipient: Math.round(revenuePerRecipient * 100) / 100,
    revenuePerEmail: Math.round(revenuePerEmail * 100) / 100,
    roi: Math.round(roi * 10) / 10,
    recoveredRevenue,
    attributedAt: updated.attributedAt?.toISOString() ?? null,
  };
}

export async function attributeStoreCampaigns(
  storeId: string,
  limit = 30
): Promise<{ updated: number }> {
  const campaigns = await prisma.newsletterSend.findMany({
    where: {
      storeId,
      status: { in: ["sent", "completed", "sending", "archived"] },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: { id: true },
  });
  let updated = 0;
  for (const c of campaigns) {
    await attributeCampaignRevenue(storeId, c.id);
    updated += 1;
  }
  return { updated };
}

export function serializeCampaignAttribution(row: {
  attributedRevenue?: number | null;
  attributedOrders?: number | null;
  attributedAt?: Date | null;
  recipientCount: number;
  sentCount: number;
}): Omit<
  CampaignRevenueAttribution,
  "campaignId" | "recoveredRevenue"
> & { recoveredRevenue?: number } {
  const revenue = row.attributedRevenue ?? 0;
  const orders = row.attributedOrders ?? 0;
  const recipients = Math.max(row.recipientCount, 1);
  const sent = Math.max(row.sentCount, 1);
  return {
    revenue,
    orders,
    recipients: row.recipientCount,
    sent: row.sentCount,
    conversionRate: ratePercent(orders, row.recipientCount || sent),
    averageOrderValue: orders ? Math.round((revenue / orders) * 100) / 100 : 0,
    revenuePerRecipient: Math.round((revenue / recipients) * 100) / 100,
    revenuePerEmail: Math.round((revenue / sent) * 100) / 100,
    roi: revenue > 0 ? Math.round((revenue / (sent * 0.001)) * 10) / 10 : 0,
    attributedAt: row.attributedAt?.toISOString() ?? null,
  };
}
