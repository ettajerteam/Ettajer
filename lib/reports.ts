import { prisma } from "@/lib/db";
import { parseShippingAddress } from "@/lib/orders";
import { countryToIso, getCountryName } from "@/lib/country-iso";

export type ReportRange = 1 | 7 | 30 | 365;

export type ReportBriefTone = "positive" | "neutral" | "attention";

export interface ReportTrendPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface ReportsData {
  range: ReportRange;
  rangeLabel: string;
  currency: string;
  lastUpdated: string;
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  averageOrderValue: number;
  aovChange: number;
  unitsSold: number;
  unitsChange: number;
  refundedOrders: number;
  refundsChange: number;
  brief: { message: string; tone: ReportBriefTone };
  topProducts: { title: string; units: number; revenue: number; share: number }[];
  ordersByStatus: { status: string; count: number; share: number }[];
  revenueTrend: ReportTrendPoint[];
  previousRevenueTrend: ReportTrendPoint[];
  peakRevenue: number;
  peakLabel: string | null;
  previousRevenue: number;
  previousOrders: number;
  topRegions: { code: string; name: string; orders: number; revenue: number; share: number }[];
}

type OrderRow = {
  total: number;
  status: string;
  createdAt: Date;
  items: { quantity: number; price: number; product: { title: string } }[];
};

const REPORT_RANGES: ReportRange[] = [1, 7, 30, 365];

export function parseReportRange(value?: string | number | null): ReportRange {
  const parsed = typeof value === "string" ? Number(value) : value;
  if (parsed === 1 || parsed === 7 || parsed === 30 || parsed === 365) return parsed;
  return 30;
}

export function getReportRangeLabel(range: ReportRange): string {
  if (range === 1) return "Today";
  if (range === 365) return "Last 12 months";
  return `Last ${range} days`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function sumRevenue(orders: { total: number }[]): number {
  return orders.reduce((sum, order) => sum + order.total, 0);
}

function sumUnits(orders: OrderRow[]): number {
  return orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
}

function getRangeBounds(range: ReportRange, now = new Date()) {
  const end = new Date(now);
  const start = new Date(now);

  if (range === 1) {
    start.setHours(0, 0, 0, 0);
    const prevEnd = new Date(start);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 1);
    return { start, end, prevStart, prevEnd: start };
  }

  if (range === 365) {
    start.setMonth(start.getMonth() - 11, 1);
    start.setHours(0, 0, 0, 0);
    const prevEnd = new Date(start);
    const prevStart = new Date(start);
    prevStart.setMonth(prevStart.getMonth() - 12);
    return { start, end, prevStart, prevEnd };
  }

  start.setDate(start.getDate() - range);
  start.setHours(0, 0, 0, 0);
  const prevEnd = new Date(start);
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - range);
  return { start, end, prevStart, prevEnd };
}

function buildHourlyTrend(orders: OrderRow[], dayStart: Date): ReportTrendPoint[] {
  const points: ReportTrendPoint[] = [];
  const start = new Date(dayStart);
  start.setHours(0, 0, 0, 0);
  const now = new Date();

  for (let hour = 0; hour < 24; hour++) {
    const bucketStart = new Date(start);
    bucketStart.setHours(hour);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setHours(hour + 1);
    if (bucketStart > now) break;

    const bucketOrders = orders.filter(
      (order) => order.createdAt >= bucketStart && order.createdAt < bucketEnd
    );
    points.push({
      date: bucketStart.toISOString(),
      revenue: sumRevenue(bucketOrders),
      orders: bucketOrders.length,
    });
  }

  return points.length ? points : [{ date: start.toISOString(), revenue: 0, orders: 0 }];
}

function buildDailyTrend(orders: OrderRow[], days: number, windowEnd: Date): ReportTrendPoint[] {
  const points: ReportTrendPoint[] = [];
  const end = new Date(windowEnd);
  end.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index--) {
    const dayStart = new Date(end);
    dayStart.setDate(dayStart.getDate() - index);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayOrders = orders.filter(
      (order) => order.createdAt >= dayStart && order.createdAt < dayEnd
    );
    points.push({
      date: dayStart.toISOString().slice(0, 10),
      revenue: sumRevenue(dayOrders),
      orders: dayOrders.length,
    });
  }

  return points;
}

function buildMonthlyTrend(orders: OrderRow[], months: number): ReportTrendPoint[] {
  const points: ReportTrendPoint[] = [];
  const now = new Date();

  for (let index = months - 1; index >= 0; index--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    const monthOrders = orders.filter(
      (order) => order.createdAt >= monthStart && order.createdAt < monthEnd
    );
    points.push({
      date: monthStart.toISOString().slice(0, 10),
      revenue: sumRevenue(monthOrders),
      orders: monthOrders.length,
    });
  }

  return points;
}

function buildTrend(orders: OrderRow[], range: ReportRange, windowEnd: Date): ReportTrendPoint[] {
  if (range === 1) {
    const dayStart = new Date(windowEnd);
    dayStart.setHours(0, 0, 0, 0);
    return buildHourlyTrend(orders, dayStart);
  }
  if (range === 365) return buildMonthlyTrend(orders, 12);
  return buildDailyTrend(orders, range, windowEnd);
}

function deriveBrief(input: {
  revenueChange: number;
  ordersChange: number;
  refundedOrders: number;
  rangeLabel: string;
}): { message: string; tone: ReportBriefTone } {
  if (input.refundedOrders > 0 && input.revenueChange < 0) {
    return {
      message: `${input.rangeLabel}: revenue is down ${Math.abs(input.revenueChange).toFixed(0)}% with ${input.refundedOrders} refund${input.refundedOrders === 1 ? "" : "s"} to review.`,
      tone: "attention",
    };
  }
  if (input.revenueChange >= 10) {
    return {
      message: `${input.rangeLabel}: revenue is up ${input.revenueChange.toFixed(0)}% vs the previous period.`,
      tone: "positive",
    };
  }
  if (input.ordersChange >= 15) {
    return {
      message: `Order volume grew ${input.ordersChange.toFixed(0)}% — momentum is building.`,
      tone: "positive",
    };
  }
  if (input.revenueChange <= -10) {
    return {
      message: `Revenue dipped ${Math.abs(input.revenueChange).toFixed(0)}% vs the previous period. Check traffic and top products.`,
      tone: "attention",
    };
  }
  return {
    message: `${input.rangeLabel} performance is steady. Use compare mode on the chart to spot shifts.`,
    tone: "neutral",
  };
}

function formatPeakLabel(range: ReportRange, date: string | null): string | null {
  if (!date) return null;
  if (range === 1) {
    return new Date(date).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" });
  }
  if (range === 365) {
    return new Date(date).toLocaleDateString("en", { month: "short", year: "numeric" });
  }
  return new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export async function getReportsData(
  storeId: string,
  currency: string,
  range: ReportRange = 30
): Promise<ReportsData> {
  const safeRange = REPORT_RANGES.includes(range) ? range : 30;
  const now = new Date();
  const { start, prevStart } = getRangeBounds(safeRange, now);

  const orders = await prisma.order.findMany({
    where: { storeId, status: { not: "draft" }, createdAt: { gte: prevStart } },
    select: {
      total: true,
      status: true,
      createdAt: true,
      shippingAddress: true,
      items: { select: { quantity: true, price: true, product: { select: { title: true } } } },
    },
  });

  const current = orders.filter((order) => order.createdAt >= start);
  const previous = orders.filter((order) => order.createdAt < start);

  const revenue = sumRevenue(current);
  const prevRevenue = sumRevenue(previous);
  const orderCount = current.length;
  const prevOrderCount = previous.length;
  const aov = orderCount > 0 ? revenue / orderCount : 0;
  const prevAov = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;
  const unitsSold = sumUnits(current);
  const prevUnits = sumUnits(previous);

  const refundedOrders = current.filter(
    (order) => order.status === "returned" || order.status === "cancelled"
  ).length;
  const prevRefunded = previous.filter(
    (order) => order.status === "returned" || order.status === "cancelled"
  ).length;

  const productMap = new Map<string, { title: string; units: number; revenue: number }>();
  for (const order of current) {
    for (const item of order.items) {
      const key = item.product.title;
      const existing = productMap.get(key) ?? { title: key, units: 0, revenue: 0 };
      existing.units += item.quantity;
      existing.revenue += item.price * item.quantity;
      productMap.set(key, existing);
    }
  }

  const statusMap = new Map<string, number>();
  for (const order of current) {
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
  }

  const regionMap = new Map<string, { code: string; name: string; orders: number; revenue: number }>();
  for (const order of current) {
    const address = parseShippingAddress(order.shippingAddress);
    const code = countryToIso(address.country);
    if (!code) continue;

    const existing = regionMap.get(code) ?? {
      code,
      name: getCountryName(code),
      orders: 0,
      revenue: 0,
    };
    existing.orders += 1;
    existing.revenue += order.total;
    regionMap.set(code, existing);
  }

  const revenueTrend = buildTrend(current, safeRange, now);
  const previousRevenueTrend = buildTrend(previous, safeRange, start);

  const peakPoint = revenueTrend.reduce(
    (best, point) => (point.revenue > best.revenue ? point : best),
    { date: "", revenue: 0, orders: 0 }
  );

  const rangeLabel = getReportRangeLabel(safeRange);

  return {
    range: safeRange,
    rangeLabel,
    currency,
    lastUpdated: now.toISOString(),
    revenue,
    revenueChange: pctChange(revenue, prevRevenue),
    orders: orderCount,
    ordersChange: pctChange(orderCount, prevOrderCount),
    averageOrderValue: aov,
    aovChange: pctChange(aov, prevAov),
    unitsSold,
    unitsChange: pctChange(unitsSold, prevUnits),
    refundedOrders,
    refundsChange: pctChange(refundedOrders, prevRefunded),
    brief: deriveBrief({
      revenueChange: pctChange(revenue, prevRevenue),
      ordersChange: pctChange(orderCount, prevOrderCount),
      refundedOrders,
      rangeLabel,
    }),
    topProducts: Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map((product) => ({
        ...product,
        share: revenue > 0 ? (product.revenue / revenue) * 100 : 0,
      })),
    ordersByStatus: Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        count,
        share: orderCount > 0 ? (count / orderCount) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count),
    revenueTrend,
    previousRevenueTrend,
    peakRevenue: peakPoint.revenue,
    peakLabel: peakPoint.revenue > 0 ? formatPeakLabel(safeRange, peakPoint.date) : null,
    previousRevenue: prevRevenue,
    previousOrders: prevOrderCount,
    topRegions: Array.from(regionMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map((region) => ({
        ...region,
        share: revenue > 0 ? (region.revenue / revenue) * 100 : 0,
      })),
  };
}
