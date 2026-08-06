import { prisma } from "@/lib/db";
import { parseShippingAddress } from "@/lib/orders";
import { countryToIso, getCountryName } from "@/lib/country-iso";
import { buildHourlyTrend, percentChange } from "@/lib/live-view-utils";
import {
  getLiveMapRangeLabel,
  type LiveMapRange,
  type LiveViewData,
  type LiveVisitorCountry,
} from "@/lib/live-view-types";

export type {
  LiveMapRange,
  LiveMapMetric,
  LiveViewData,
  LiveVisitorCountry,
  LiveActivityEvent,
  LiveComparison,
  LiveHourlyPoint,
} from "@/lib/live-view-types";

export {
  parseLiveMapRange,
  getLiveMapRangeLabel,
  getLiveMapRangeShortLabel,
} from "@/lib/live-view-types";

function buildCountryMapFromViews(
  views: { sessionId: string; country: string | null }[]
) {
  const countryMap = new Map<string, LiveVisitorCountry>();
  const seen = new Set<string>();

  for (const view of views) {
    const key = `${view.sessionId}:${view.country ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const code = countryToIso(view.country) || view.country;
    if (!code) continue;

    const existing = countryMap.get(code) ?? {
      code,
      name: getCountryName(code) || code,
      visitors: 0,
      orders: 0,
      revenue: 0,
    };
    existing.visitors += 1;
    countryMap.set(code, existing);
  }

  return countryMap;
}

export async function getLiveViewData(
  storeId: string,
  currency: string,
  range: LiveMapRange = 24
): Promise<LiveViewData> {
  const now = new Date();
  const oneHourAgo = new Date(now);
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  const liveSince = new Date(now.getTime() - 5 * 60_000);

  const rangeStart = new Date(now);
  rangeStart.setHours(rangeStart.getHours() - range);

  const previousStart = new Date(rangeStart);
  previousStart.setHours(previousStart.getHours() - range);

  const [
    recentOrders,
    abandonedCount,
    hourOrders,
    rangeOrders,
    previousRangeOrders,
    liveViews,
    rangeViews,
    previousViews,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { storeId, status: { not: "draft" } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        createdAt: true,
        shippingAddress: true,
      },
    }),
    prisma.abandonedCheckout.count({
      where: { storeId, recoveredAt: null, updatedAt: { gte: oneHourAgo } },
    }),
    prisma.order.findMany({
      where: { storeId, status: { not: "draft" }, createdAt: { gte: oneHourAgo } },
      select: { total: true, shippingAddress: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { storeId, status: { not: "draft" }, createdAt: { gte: rangeStart } },
      select: { total: true, shippingAddress: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: {
        storeId,
        status: { not: "draft" },
        createdAt: { gte: previousStart, lt: rangeStart },
      },
      select: { total: true, shippingAddress: true, createdAt: true },
    }),
    prisma.storePageView.findMany({
      where: { storeId, createdAt: { gte: liveSince } },
      select: { sessionId: true, country: true, city: true, path: true, createdAt: true },
    }),
    prisma.storePageView.findMany({
      where: { storeId, createdAt: { gte: rangeStart } },
      select: { sessionId: true, country: true, path: true, createdAt: true },
    }),
    prisma.storePageView.findMany({
      where: { storeId, createdAt: { gte: previousStart, lt: rangeStart } },
      select: { sessionId: true, country: true },
    }),
  ]);

  const revenueLastHour = hourOrders.reduce((sum, order) => sum + order.total, 0);
  const ordersInRange = rangeOrders.length;
  const revenueInRange = rangeOrders.reduce((sum, order) => sum + order.total, 0);

  const activeVisitors = new Set(liveViews.map((v) => v.sessionId)).size;
  const rangeVisitorCount = new Set(rangeViews.map((v) => v.sessionId)).size;
  const previousVisitors = new Set(previousViews.map((v) => v.sessionId)).size;

  const liveCityMap = new Map<string, { city: string; country: string }>();
  for (const view of liveViews) {
    if (!view.city || liveCityMap.has(view.sessionId)) continue;
    liveCityMap.set(view.sessionId, {
      city: view.city,
      country: view.country ? getCountryName(view.country) || view.country : "—",
    });
  }
  const liveCities = Array.from(liveCityMap.entries())
    .map(([sessionId, meta]) => ({
      id: sessionId,
      city: meta.city,
      country: meta.country,
      active: true as const,
    }))
    .slice(0, 8);

  const countryMap = buildCountryMapFromViews(rangeViews);
  // merge order countries as revenue/orders overlay
  for (const order of rangeOrders) {
    const address = parseShippingAddress(order.shippingAddress);
    const code = countryToIso(address.country);
    if (!code) continue;
    const existing = countryMap.get(code) ?? {
      code,
      name: getCountryName(code),
      visitors: 0,
      orders: 0,
      revenue: 0,
    };
    existing.orders += 1;
    existing.revenue += order.total;
    countryMap.set(code, existing);
  }

  const visitorCountries = Array.from(countryMap.values()).sort((a, b) => b.visitors - a.visitors);
  const previousCountryMap = buildCountryMapFromViews(previousViews);
  const previousRegions = previousCountryMap.size;
  const previousOrders = previousRangeOrders.length;
  const previousRevenue = previousRangeOrders.reduce((sum, order) => sum + order.total, 0);

  const mappedRecentOrders = recentOrders.map((order) => {
    const address = parseShippingAddress(order.shippingAddress);
    const code = countryToIso(address.country);
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      countryCode: code,
      countryName: code ? getCountryName(code) : address.country || null,
    };
  });

  const pageCounts = new Map<string, number>();
  for (const view of rangeViews) {
    const label =
      view.path.includes("/product")
        ? "Products"
        : view.path.includes("/checkout")
          ? "Checkout"
          : view.path.includes("/collection")
            ? "Collections"
            : "Home";
    pageCounts.set(label, (pageCounts.get(label) ?? 0) + 1);
  }
  const topPages = Array.from(pageCounts.entries())
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  if (topPages.length === 0) {
    topPages.push(
      { page: "Home", views: 0 },
      { page: "Products", views: 0 },
      { page: "Checkout", views: abandonedCount }
    );
  }

  return {
    currency,
    range,
    rangeLabel: getLiveMapRangeLabel(range),
    activeVisitors,
    liveCities,
    cartsOpen: abandonedCount,
    ordersLastHour: hourOrders.length,
    revenueLastHour,
    ordersInRange,
    revenueInRange,
    comparison: {
      orders: previousOrders,
      revenue: previousRevenue,
      visitors: previousVisitors,
      regions: previousRegions,
      ordersChange: percentChange(ordersInRange, previousOrders),
      revenueChange: percentChange(revenueInRange, previousRevenue),
      visitorsChange: percentChange(rangeVisitorCount, previousVisitors),
      regionsChange: percentChange(visitorCountries.length, previousRegions),
    },
    hourlyTrend: buildHourlyTrend(rangeOrders, range, now),
    activityFeed: mappedRecentOrders.map((order) => ({
      id: order.id,
      type: "order" as const,
      title: `Order #${order.orderNumber}`,
      subtitle: `${order.customerName}${order.countryName ? ` · ${order.countryName}` : ""}`,
      amount: order.total,
      countryCode: order.countryCode,
      countryName: order.countryName,
      createdAt: order.createdAt,
    })),
    visitorCountries,
    recentOrders: mappedRecentOrders,
    topPages,
  };
}
