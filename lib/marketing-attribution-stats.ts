import { prisma } from "@/lib/db";

export interface AttributionSourceRow {
  source: string;
  medium: string | null;
  campaign: string | null;
  orders: number;
  revenue: number;
}

export interface AttributionStats {
  attributedOrders: number;
  totalOrders: number;
  attributedRevenue: number;
  topSources: AttributionSourceRow[];
}

export async function getAttributionStats(storeId: string): Promise<AttributionStats> {
  const [orders, attributed] = await Promise.all([
    prisma.order.findMany({
      where: { storeId, status: { not: "draft" } },
      select: { total: true, utmSource: true, utmMedium: true, utmCampaign: true },
    }),
    prisma.order.findMany({
      where: {
        storeId,
        status: { not: "draft" },
        OR: [
          { utmSource: { not: null } },
          { utmMedium: { not: null } },
          { utmCampaign: { not: null } },
        ],
      },
      select: { total: true, utmSource: true, utmMedium: true, utmCampaign: true },
    }),
  ]);

  const grouped = new Map<string, AttributionSourceRow>();

  for (const order of attributed) {
    const source = order.utmSource ?? "(direct)";
    const key = `${source}|${order.utmMedium ?? ""}|${order.utmCampaign ?? ""}`;
    const existing = grouped.get(key) ?? {
      source,
      medium: order.utmMedium,
      campaign: order.utmCampaign,
      orders: 0,
      revenue: 0,
    };
    existing.orders += 1;
    existing.revenue += order.total;
    grouped.set(key, existing);
  }

  const topSources = Array.from(grouped.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    attributedOrders: attributed.length,
    totalOrders: orders.length,
    attributedRevenue: attributed.reduce((sum, order) => sum + order.total, 0),
    topSources,
  };
}

export function buildTrackedUrl(
  baseUrl: string,
  params: {
    utmSource: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
  }
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", params.utmSource);
  if (params.utmMedium) url.searchParams.set("utm_medium", params.utmMedium);
  if (params.utmCampaign) url.searchParams.set("utm_campaign", params.utmCampaign);
  if (params.utmTerm) url.searchParams.set("utm_term", params.utmTerm);
  if (params.utmContent) url.searchParams.set("utm_content", params.utmContent);
  return url.toString();
}
