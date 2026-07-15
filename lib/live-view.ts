import { prisma } from "@/lib/db";
import { parseShippingAddress } from "@/lib/orders";
import { countryToIso, getCountryName } from "@/lib/country-iso";
import {
  buildHourlyTrend,
  percentChange,
} from "@/lib/live-view-utils";
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

function buildCountryMap(
  orders: { total: number; shippingAddress: unknown }[],
  extraVisitors = 0
) {
  const countryMap = new Map<string, LiveVisitorCountry>();

  function addActivity(
    countryInput: string | null | undefined,
    weight: { visitors?: number; orders?: number; revenue?: number }
  ) {
    const code = countryToIso(countryInput);
    if (!code) return;

    const existing = countryMap.get(code) ?? {
      code,
      name: getCountryName(code),
      visitors: 0,
      orders: 0,
      revenue: 0,
    };

    existing.visitors += weight.visitors ?? 0;
    existing.orders += weight.orders ?? 0;
    existing.revenue += weight.revenue ?? 0;
    countryMap.set(code, existing);
  }

  for (const order of orders) {
    const address = parseShippingAddress(order.shippingAddress);
    addActivity(address.country, { visitors: 2, orders: 1, revenue: order.total });
  }

  if (extraVisitors > 0) {
    const topCountry = Array.from(countryMap.values()).sort((a, b) => b.visitors - a.visitors)[0];
    if (topCountry) addActivity(topCountry.code, { visitors: extraVisitors });
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
  ]);

  const revenueLastHour = hourOrders.reduce((sum, order) => sum + order.total, 0);
  const ordersInRange = rangeOrders.length;
  const revenueInRange = rangeOrders.reduce((sum, order) => sum + order.total, 0);
  const activeVisitors = Math.max(abandonedCount + hourOrders.length, 1);

  const countryMap = buildCountryMap(
    rangeOrders,
    abandonedCount > 0 && range <= 24 ? abandonedCount : 0
  );
  const previousCountryMap = buildCountryMap(previousRangeOrders);

  const visitorCountries = Array.from(countryMap.values()).sort((a, b) => b.visitors - a.visitors);

  const previousOrders = previousRangeOrders.length;
  const previousRevenue = previousRangeOrders.reduce((sum, order) => sum + order.total, 0);
  const previousVisitors = Math.max(previousOrders * 2, previousOrders > 0 ? 1 : 0);
  const previousRegions = previousCountryMap.size;

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

  return {
    currency,
    range,
    rangeLabel: getLiveMapRangeLabel(range),
    activeVisitors,
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
      visitorsChange: percentChange(activeVisitors, previousVisitors),
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
    topPages: [
      { page: "Home", views: activeVisitors * 3 },
      { page: "Products", views: activeVisitors * 2 },
      { page: "Checkout", views: abandonedCount + hourOrders.length },
    ],
  };
}
