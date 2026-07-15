import { prisma } from "@/lib/db";
import { getProductImage } from "@/lib/storefront-assets";
import type {
  ActivityEvent,
  AiInsight,
  BestSeller,
  DashboardRange,
  DeviceSale,
  ExecutiveDashboardData,
  HealthScore,
  HomeKpiCardData,
  HomeOrderRow,
  HomeTopProductCard,
  OverviewCounts,
  PriorityAction,
  QuickSummaryItem,
  RiskAlert,
  TopProduct,
  TrafficSource,
  TransactionRow,
  TrendPoint,
} from "@/types/dashboard";

const COMPLETED_STATUSES = ["delivered", "completed", "paid", "shipped"];
const CANCELED_STATUSES = ["cancelled", "canceled", "returned", "refunded"];

const PROFIT_MARGIN = 0.225;
const AD_SPEND_RATIO = 0.114;
const MONTHLY_OPEX_ESTIMATE_RATIO = 0.35;

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function sumRevenue(orders: { total: number }[]): number {
  return orders.reduce((s, o) => s + o.total, 0);
}

function groupByDay(
  orders: { createdAt: Date; total: number }[],
  days: number
): TrendPoint[] {
  if (days === 1) {
    return groupByHourToday(orders);
  }
  if (days === 365) {
    return groupByMonth(orders, 12);
  }

  const points: TrendPoint[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const dayOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < next);
    const revenue = sumRevenue(dayOrders);
    points.push({
      date: d.toISOString().slice(0, 10),
      revenue,
      profit: revenue * PROFIT_MARGIN,
    });
  }
  return points;
}

function groupByHourToday(orders: { createdAt: Date; total: number }[]): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  for (let h = 0; h < 24; h++) {
    const d = new Date(start);
    d.setHours(h);
    const next = new Date(d);
    next.setHours(h + 1);
    if (d > now) break;

    const hourOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < next);
    points.push({
      date: d.toISOString(),
      revenue: sumRevenue(hourOrders),
      profit: sumRevenue(hourOrders) * PROFIT_MARGIN,
    });
  }

  return points.length ? points : [{ date: now.toISOString(), revenue: 0, profit: 0 }];
}

function groupByMonth(
  orders: { createdAt: Date; total: number }[],
  months: number
): TrendPoint[] {
  const points: TrendPoint[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < next);
    const revenue = sumRevenue(monthOrders);
    points.push({
      date: d.toISOString().slice(0, 10),
      revenue,
      profit: revenue * PROFIT_MARGIN,
    });
  }

  return points;
}

function groupByDayInWindow(
  orders: { createdAt: Date; total: number }[],
  windowEnd: Date,
  days: number
): TrendPoint[] {
  const points: TrendPoint[] = [];
  const end = new Date(windowEnd);
  end.setHours(0, 0, 0, 0);

  for (let i = days; i >= 1; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const dayOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < next);
    const revenue = sumRevenue(dayOrders);
    points.push({
      date: d.toISOString().slice(0, 10),
      revenue,
      profit: revenue * PROFIT_MARGIN,
    });
  }
  return points;
}

function buildSparkline(trend: TrendPoint[], key: "revenue" | "profit"): number[] {
  const bucket = Math.max(1, Math.floor(trend.length / 12));
  const points: number[] = [];
  for (let i = 0; i < trend.length; i += bucket) {
    const slice = trend.slice(i, i + bucket);
    points.push(slice.reduce((s, p) => s + p[key], 0));
  }
  return points.length ? points : [0];
}

function formatCompact(amount: number, currency: string): string {
  if (currency === "MAD" || currency === "DZD" || currency === "TND") {
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k ${currency}`;
    return `${Math.round(amount)} ${currency}`;
  }
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${Math.round(amount)}`;
}

function formatImpact(amount: number, currency: string): string {
  if (currency === "MAD" || currency === "DZD" || currency === "TND") {
    return `${Math.round(amount).toLocaleString()} ${currency}`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function computeHealthScore(input: {
  revenueGrowth: number;
  roas: number;
  shippingRatio: number;
  returnRate: number;
  outOfStock: number;
  totalProducts: number;
  cashRunwayMonths: number;
}): HealthScore {
  const growthScore = clamp(50 + input.revenueGrowth * 2);
  const roasScore = clamp((input.roas / 4) * 100);
  const shippingScore = clamp(100 - Math.max(0, input.shippingRatio - 8) * 8);
  const returnScore = clamp(100 - input.returnRate * 8);
  const stockScore = clamp(
    input.totalProducts > 0
      ? 100 - (input.outOfStock / input.totalProducts) * 100
      : 80
  );
  const cashScore = clamp((input.cashRunwayMonths / 6) * 100);

  const factors = [
    { label: "Growth", value: Math.round(growthScore), weight: 0.25 },
    { label: "Ad efficiency", value: Math.round(roasScore), weight: 0.2 },
    { label: "Shipping", value: Math.round(shippingScore), weight: 0.15 },
    { label: "Returns", value: Math.round(returnScore), weight: 0.1 },
    { label: "Stock", value: Math.round(stockScore), weight: 0.15 },
    { label: "Cash", value: Math.round(cashScore), weight: 0.15 },
  ];

  const score = Math.round(
    factors.reduce((sum, f) => sum + f.value * f.weight, 0)
  );

  let grade: HealthScore["grade"] = "D";
  let label = "Needs attention";
  if (score >= 80) {
    grade = "A";
    label = "Excellent";
  } else if (score >= 65) {
    grade = "B";
    label = "Healthy";
  } else if (score >= 50) {
    grade = "C";
    label = "Fair";
  }

  return { score, grade, label, factors };
}

export async function getExecutiveDashboardData(
  storeId: string,
  storeName: string,
  currency: string,
  range: DashboardRange = 30,
  storeTheme = "minimal"
): Promise<ExecutiveDashboardData> {
  const now = new Date();
  const rangeStart = new Date(now);
  if (range === 1) {
    rangeStart.setHours(0, 0, 0, 0);
  } else {
    rangeStart.setDate(rangeStart.getDate() - range);
  }
  const doubleRangeStart = new Date(now);
  if (range === 1) {
    doubleRangeStart.setDate(doubleRangeStart.getDate() - 1);
    doubleRangeStart.setHours(0, 0, 0, 0);
  } else {
    doubleRangeStart.setDate(doubleRangeStart.getDate() - range * 2);
  }
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [ordersFullWindow, products, recentOrders, homeOrdersList, collectionCount, pendingOrderCount, todayOrdersList] =
    await Promise.all([
    prisma.order.findMany({
      where: { storeId, status: { not: "draft" }, createdAt: { gte: doubleRangeStart } },
      select: {
        id: true,
        total: true,
        subtotal: true,
        shipping: true,
        status: true,
        createdAt: true,
        customerEmail: true,
        customerName: true,
        items: { select: { quantity: true, productId: true, price: true } },
      },
    }),
    prisma.product.findMany({
      where: { storeId },
      select: { id: true, title: true, price: true, inventory: true, images: true },
    }),
    prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
        items: {
          take: 1,
          select: { quantity: true, product: { select: { title: true } } },
        },
      },
    }),
    prisma.order.findMany({
      where: { storeId, status: { not: "draft" } },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        total: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.collection.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId, status: "pending" } }),
    prisma.order.findMany({
      where: { storeId, createdAt: { gte: todayStart }, status: { not: "draft" } },
      select: { customerEmail: true, total: true, status: true },
    }),
  ]);

  const totalProductCount = products.length;

  const currentPeriod = ordersFullWindow.filter((o) => o.createdAt >= rangeStart);
  const previousPeriod = ordersFullWindow.filter((o) => o.createdAt < rangeStart);

  const revenue = sumRevenue(currentPeriod);
  const prevRevenue = sumRevenue(previousPeriod);
  const revenueGrowth = pctChange(revenue, prevRevenue);

  const netProfit = revenue * PROFIT_MARGIN;
  const prevProfit = prevRevenue * PROFIT_MARGIN;
  const profitGrowth = pctChange(netProfit, prevProfit);

  const adSpend = revenue * AD_SPEND_RATIO;
  const prevAdSpend = prevRevenue * AD_SPEND_RATIO;
  const roas = adSpend > 0 ? revenue / adSpend : 0;

  const monthlyBurn = revenue > 0 ? revenue * MONTHLY_OPEX_ESTIMATE_RATIO : 1;
  const cashEstimate = netProfit * 3;
  const cashRunwayMonths = monthlyBurn > 0 ? cashEstimate / monthlyBurn : 5.8;

  const orderCount = currentPeriod.length;
  const prevOrderCount = previousPeriod.length;
  const aov = orderCount > 0 ? revenue / orderCount : 0;
  const prevAov = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

  const returnedOrders = currentPeriod.filter((o) =>
    ["returned", "cancelled", "refunded"].includes(o.status)
  );
  const returnRate = orderCount > 0 ? (returnedOrders.length / orderCount) * 100 : 0;
  const prevReturned = previousPeriod.filter((o) =>
    ["returned", "cancelled", "refunded"].includes(o.status)
  );
  const prevReturnRate =
    prevOrderCount > 0 ? (prevReturned.length / prevOrderCount) * 100 : 0;

  const totalShipping = currentPeriod.reduce((s, o) => s + o.shipping, 0);
  const shippingRatio = revenue > 0 ? (totalShipping / revenue) * 100 : 0;

  const weekShipping = currentPeriod
    .filter((o) => o.createdAt >= sevenDaysAgo)
    .reduce((s, o) => s + o.shipping, 0);
  const prevWeekShipping = currentPeriod
    .filter((o) => o.createdAt >= fourteenDaysAgo && o.createdAt < sevenDaysAgo)
    .reduce((s, o) => s + o.shipping, 0);
  const shippingWeekChange = pctChange(weekShipping, prevWeekShipping);

  const productSales = new Map<string, number>();
  for (const order of currentPeriod) {
    for (const item of order.items) {
      productSales.set(
        item.productId,
        (productSales.get(item.productId) ?? 0) + item.quantity
      );
    }
  }
  let topProductId = "";
  let topUnits = 0;
  productSales.forEach((units, id) => {
    if (units > topUnits) {
      topUnits = units;
      topProductId = id;
    }
  });
  const topProduct = products.find((p) => p.id === topProductId);

  const lowStock = products.filter((p) => p.inventory > 0 && p.inventory <= 5).length;
  const outOfStock = products.filter((p) => p.inventory === 0).length;
  const inventoryValue = products.reduce((s, p) => s + p.price * p.inventory, 0);
  const slowMoving = products.filter((p) => p.inventory > 10);
  const slowMovingValue = slowMoving.reduce((s, p) => s + p.price * p.inventory * 0.3, 0);

  const dailyAvgUnits =
    orderCount > 0
      ? currentPeriod.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0) / range
      : 0;
  const totalUnitsInStock = products.reduce((s, p) => s + p.inventory, 0);
  const stockCoverageDays =
    dailyAvgUnits > 0 ? Math.round(totalUnitsInStock / dailyAvgUnits) : 41;

  const trend = groupByDay(currentPeriod, range);
  const previousTrend = groupByDayInWindow(previousPeriod, rangeStart, range);
  const marginStart = 22.5;
  const marginEnd = PROFIT_MARGIN * 100 * (1 + Math.min(profitGrowth, 15) / 100 / 10);
  const suggestedGoal = Math.round(Math.max(revenue, prevRevenue) * 1.15);

  const productRevenue = new Map<string, number>();
  for (const order of currentPeriod) {
    for (const item of order.items) {
      productRevenue.set(
        item.productId,
        (productRevenue.get(item.productId) ?? 0) + item.price * item.quantity
      );
    }
  }
  const topProducts: TopProduct[] = Array.from(productSales.entries())
    .map(([id, units]) => {
      const product = products.find((p) => p.id === id);
      const rev = productRevenue.get(id) ?? 0;
      return {
        id,
        title: product?.title ?? "Unknown product",
        units,
        revenue: rev,
        share: revenue > 0 ? (rev / revenue) * 100 : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const healthScore = computeHealthScore({
    revenueGrowth,
    roas,
    shippingRatio,
    returnRate,
    outOfStock,
    totalProducts: products.length,
    cashRunwayMonths,
  });

  const completedCurrent = currentPeriod.filter((o) =>
    COMPLETED_STATUSES.includes(o.status)
  ).length;
  const completedPrev = previousPeriod.filter((o) =>
    COMPLETED_STATUSES.includes(o.status)
  ).length;
  const canceledCurrent = currentPeriod.filter((o) =>
    CANCELED_STATUSES.includes(o.status)
  ).length;
  const canceledPrev = previousPeriod.filter((o) =>
    CANCELED_STATUSES.includes(o.status)
  ).length;

  const prevProductSales = new Map<string, number>();
  for (const order of previousPeriod) {
    for (const item of order.items) {
      prevProductSales.set(
        item.productId,
        (prevProductSales.get(item.productId) ?? 0) + item.quantity
      );
    }
  }
  const prevTopUnits = Math.max(0, ...Array.from(prevProductSales.values()), 0);

  const counts: OverviewCounts = {
    totalProducts: totalProductCount,
    completedOrders: completedCurrent,
    canceledOrders: canceledCurrent,
    topProductUnits: topUnits,
    totalProductsChange: 0,
    completedOrdersChange: pctChange(completedCurrent, completedPrev),
    canceledOrdersChange: pctChange(canceledCurrent, canceledPrev),
    topProductUnitsChange: pctChange(topUnits, prevTopUnits),
  };

  const transactions: TransactionRow[] = recentOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    item: o.items[0]?.product?.title ?? "—",
    date: o.createdAt.toISOString(),
    price: o.total,
    status: o.status,
  }));

  const bestSellers: BestSeller[] = topProducts.slice(0, 5).map((p) => {
    const product = products.find((prod) => prod.id === p.id);
    const images = Array.isArray(product?.images) ? (product?.images as string[]) : [];
    return {
      id: p.id,
      title: p.title,
      unitsSold: p.units,
      image: getProductImage(storeTheme, images, p.id),
    };
  });

  const insights: AiInsight[] = [];

  insights.push({
    id: "profit",
    title: profitGrowth >= 0 ? "Profit improving" : "Profit under pressure",
    description: `Margin at ${(PROFIT_MARGIN * 100).toFixed(1)}%`,
    impact:
      profitGrowth >= 0
        ? `+${formatImpact(Math.max(netProfit - prevProfit, 0), currency)}`
        : `-${formatImpact(Math.abs(netProfit - prevProfit), currency)}`,
    impactType: profitGrowth >= 0 ? "positive" : "negative",
    priority: true,
  });

  if (shippingWeekChange > 3 || shippingRatio > 9) {
    insights.push({
      id: "shipping",
      title: "Shipping costs rising",
      description: `${Math.abs(shippingWeekChange).toFixed(0)}% vs prior week`,
      impact: `-${formatImpact(weekShipping * 0.1, currency)}`,
      impactType: "negative",
      priority: shippingRatio > 10,
    });
  }

  if (topProduct && topUnits > 0) {
    insights.push({
      id: "top-product",
      title: "Top product scaling",
      description: `${topProduct.title.slice(0, 36)} — ${topUnits} units sold`,
      impact: `+${formatImpact(topUnits * topProduct.price * 0.08, currency)}`,
      impactType: "positive",
      priority: false,
    });
  }

  if (roas < 3 && revenue > 0) {
    insights.push({
      id: "roas",
      title: "Ad efficiency review",
      description: `ROAS at ${roas.toFixed(1)}x — target 2.5x+`,
      impact: "Review",
      impactType: "neutral",
      priority: roas < 2.5,
      action: "Review",
    });
  }

  const risks: RiskAlert[] = [
    {
      id: "shipping-ratio",
      title: "Shipping Cost Ratio",
      level: shippingRatio > 10 ? "high" : shippingRatio > 8 ? "watch" : "good",
      current: `${shippingRatio.toFixed(1)}%`,
      target: "10%",
      impact:
        shippingRatio > 10
          ? `-${formatImpact(totalShipping * 0.2, currency)} / month est.`
          : "Within target",
      action: shippingRatio > 10 ? "Negotiate rates" : undefined,
    },
    {
      id: "roas",
      title: "Ad ROAS",
      level: roas < 2.5 && revenue > 0 ? "watch" : "good",
      current: `${roas.toFixed(1)}x`,
      target: "2.5x",
      impact: roas < 2.5 ? "Review ad spend" : "On target",
      action: roas < 2.5 ? "Pause if no recovery" : undefined,
    },
    {
      id: "inventory",
      title: "Inventory Health",
      level: outOfStock > 5 ? "high" : lowStock > 8 ? "watch" : "good",
      current: `${stockCoverageDays} days coverage`,
      target: "30–45 days",
      impact: outOfStock > 0 ? `${outOfStock} SKUs out of stock` : "Healthy levels",
    },
  ];

  const lowestStock = products
    .filter((p) => p.inventory > 0 && p.inventory <= 5)
    .sort((a, b) => a.inventory - b.inventory)[0];

  const priorityActions: PriorityAction[] = [];

  if (roas < 2.5 && adSpend > 0) {
    priorityActions.push({
      id: "pause-ads",
      title: "Review ad spend efficiency",
      impact: `Save ${formatImpact(adSpend * 0.1, currency)}`,
    });
  }

  if (lowestStock) {
    priorityActions.push({
      id: "restock",
      title: `Restock ${lowestStock.title.slice(0, 28)}`,
      impact: `Protect ${formatImpact(lowestStock.price * 5, currency)}`,
      href: "/dashboard/products",
    });
  }

  if (shippingRatio > 8) {
    priorityActions.push({
      id: "shipping",
      title: "Negotiate shipping contract",
      impact: `Save ${formatImpact(totalShipping * 0.15, currency)}/mo`,
      href: "/dashboard/settings?tab=shipping",
    });
  }

  if (slowMovingValue > 500 && priorityActions.length < 3) {
    priorityActions.push({
      id: "discount",
      title: "Discount slow-moving items 15%",
      impact: `+${formatImpact(slowMovingValue * 0.5, currency)}`,
      href: "/dashboard/products",
    });
  }

  const totalProjectedImpact = priorityActions.reduce((sum, a) => {
    const num = parseFloat(a.impact.replace(/[^\d.]/g, "")) || 0;
    return sum + num;
  }, 0);

  let recommendedText = "Focus on converting traffic and maintaining healthy margins.";
  let recommendedSavings = formatImpact(500, currency);
  if (shippingRatio > 10) {
    recommendedText = "Renegotiate shipping rates and review ad spend on low-ROAS channels.";
    recommendedSavings = formatImpact(totalShipping * 0.15 + adSpend * 0.1, currency);
  } else if (lowStock > 0 && lowestStock) {
    recommendedText = `Restock ${lowStock} low-inventory product(s) to protect revenue.`;
    recommendedSavings = formatImpact(lowestStock.price * 10, currency);
  }

  const estimatedConversion = orderCount > 0 ? Math.min(5.9, 2.5 + orderCount / 200) : 2.1;
  const prevConversion = prevOrderCount > 0 ? Math.min(5.5, 2.2 + prevOrderCount / 200) : 2.1;

  const orderCountsByDate = new Map<string, number>();
  for (const order of currentPeriod) {
    const key =
      range === 1
        ? new Date(order.createdAt).toISOString().slice(0, 13)
        : order.createdAt.toISOString().slice(0, 10);
    orderCountsByDate.set(key, (orderCountsByDate.get(key) ?? 0) + 1);
  }

  const ordersTrend: TrendPoint[] = trend.map((point) => {
    const key = range === 1 ? point.date.slice(0, 13) : point.date.slice(0, 10);
    const count = orderCountsByDate.get(key) ?? 0;
    return { date: point.date, revenue: count, profit: count };
  });

  const revenueSpark = buildSparkline(trend, "revenue");
  const profitSpark = buildSparkline(trend, "profit");
  const ordersSpark = buildSparkline(ordersTrend, "revenue");
  const rangeLabel =
    range === 1 ? "vs yesterday" : range === 365 ? "vs prev 12 months" : `vs prev ${range} days`;

  const productsSold = currentPeriod.reduce(
    (sum, o) => sum + o.items.reduce((acc, item) => acc + item.quantity, 0),
    0
  );
  const prevProductsSold = previousPeriod.reduce(
    (sum, o) => sum + o.items.reduce((acc, item) => acc + item.quantity, 0),
    0
  );

  const visitors =
    orderCount > 0
      ? Math.round(orderCount / (estimatedConversion / 100))
      : Math.max(48, totalProductCount * 8);
  const prevVisitors =
    prevOrderCount > 0
      ? Math.round(prevOrderCount / (prevConversion / 100))
      : visitors;

  const homeOrders: HomeOrderRow[] = homeOrdersList.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }));

  const homeTopProducts: HomeTopProductCard[] = topProducts.map((p) => {
    const product = products.find((prod) => prod.id === p.id);
    const images = Array.isArray(product?.images) ? (product?.images as string[]) : [];
    const prevUnits = prevProductSales.get(p.id) ?? 0;
    return {
      id: p.id,
      title: p.title,
      image: getProductImage(storeTheme, images, p.id),
      revenue: p.revenue,
      unitsSold: p.units,
      stock: product?.inventory ?? 0,
      growth: pctChange(p.units, prevUnits),
    };
  });

  const homeKpis: HomeKpiCardData[] = [
    {
      id: "revenue",
      label: "Revenue",
      value: formatCompact(revenue, currency),
      change: revenueGrowth,
      changeLabel: rangeLabel,
      sparkline: revenueSpark,
      href: "/dashboard/analytics/reports",
    },
    {
      id: "orders",
      label: "Orders",
      value: orderCount.toLocaleString(),
      change: pctChange(orderCount, prevOrderCount),
      changeLabel: rangeLabel,
      sparkline: ordersSpark,
      href: "/dashboard/orders",
    },
    {
      id: "products-sold",
      label: "Products sold",
      value: productsSold.toLocaleString(),
      change: pctChange(productsSold, prevProductsSold),
      changeLabel: rangeLabel,
      sparkline: buildSparkline(trend, "profit"),
      href: "/dashboard/products",
    },
    {
      id: "visitors",
      label: "Visitors",
      value: visitors.toLocaleString(),
      change: pctChange(visitors, prevVisitors),
      changeLabel: "estimated",
      sparkline: revenueSpark,
      href: "/dashboard/analytics/live",
    },
    {
      id: "conversion",
      label: "Conversion rate",
      value: `${estimatedConversion.toFixed(1)}%`,
      change: pctChange(estimatedConversion, prevConversion),
      changeLabel: "estimated",
      sparkline: ordersSpark,
      href: "/dashboard/analytics/reports",
    },
    {
      id: "aov",
      label: "Average order value",
      value: formatCompact(aov, currency),
      change: pctChange(aov, prevAov),
      changeLabel: rangeLabel,
      sparkline: profitSpark,
      href: "/dashboard/orders",
    },
  ];

  const todayOrders = todayOrdersList.length;
  const customersToday = new Set(todayOrdersList.map((o) => o.customerEmail)).size;
  const recentPayments = todayOrdersList
    .filter((o) => COMPLETED_STATUSES.includes(o.status))
    .slice(0, 3)
    .reduce((sum, o) => sum + o.total, 0);

  const quickSummary: QuickSummaryItem[] = [
    {
      id: "today-orders",
      label: "Today's orders",
      value: todayOrders.toLocaleString(),
      href: "/dashboard/orders",
    },
    {
      id: "pending-orders",
      label: "Pending orders",
      value: pendingOrderCount.toLocaleString(),
      href: "/dashboard/orders?status=pending",
    },
    {
      id: "low-stock",
      label: "Products low in stock",
      value: lowStock.toLocaleString(),
      href: "/dashboard/products/inventory",
    },
    {
      id: "customers-today",
      label: "Customers today",
      value: customersToday.toLocaleString(),
      href: "/dashboard/customers",
    },
    {
      id: "recent-payments",
      label: "Recent payments",
      value: formatCompact(recentPayments, currency),
      href: "/dashboard/orders",
    },
  ];

  const trafficSources: TrafficSource[] = [
    { id: "organic", label: "Organic", value: Math.round(visitors * 0.38), percentage: 38 },
    { id: "direct", label: "Direct", value: Math.round(visitors * 0.24), percentage: 24 },
    { id: "social", label: "Social", value: Math.round(visitors * 0.18), percentage: 18 },
    { id: "ads", label: "Ads", value: Math.round(visitors * 0.12), percentage: 12 },
    { id: "email", label: "Email", value: Math.round(visitors * 0.05), percentage: 5 },
    { id: "referral", label: "Referral", value: Math.round(visitors * 0.03), percentage: 3 },
  ];

  const salesByDevice: DeviceSale[] = [
    { id: "mobile", label: "Mobile", value: Math.round(revenue * 0.58), percentage: 58 },
    { id: "desktop", label: "Desktop", value: Math.round(revenue * 0.32), percentage: 32 },
    { id: "tablet", label: "Tablet", value: Math.round(revenue * 0.1), percentage: 10 },
  ];

  const activityTimeline: ActivityEvent[] = homeOrders
    .flatMap((order) => {
      const events: ActivityEvent[] = [
        {
          id: `order-${order.id}`,
          type: "order_created",
          title: "Order created",
          description: `#${order.orderNumber} · ${order.customerName}`,
          timestamp: order.createdAt,
        },
      ];

      if (["returned", "refunded", "cancelled", "canceled"].includes(order.status)) {
        events.push({
          id: `refund-${order.id}`,
          type: "refund_issued",
          title: "Refund issued",
          description: `Order #${order.orderNumber}`,
          timestamp: order.createdAt,
        });
      }

      if (COMPLETED_STATUSES.includes(order.status)) {
        events.push({
          id: `payment-${order.id}`,
          type: "payment_received",
          title: "Payment received",
          description: `${formatCompact(order.total, currency)} from ${order.customerName}`,
          timestamp: order.createdAt,
        });
      }

      return events;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  if (lowStock > 0 && lowestStock) {
    activityTimeline.push({
      id: "inventory-alert",
      type: "inventory_updated",
      title: "Inventory updated",
      description: `${lowestStock.title} is running low (${lowestStock.inventory} left)`,
      timestamp: now.toISOString(),
    });
  }

  const seenCustomers = new Set<string>();
  for (const order of [...homeOrdersList].reverse()) {
    if (!seenCustomers.has(order.customerEmail)) {
      seenCustomers.add(order.customerEmail);
      activityTimeline.push({
        id: `customer-${order.customerEmail}`,
        type: "customer_registered",
        title: "Customer registered",
        description: order.customerName,
        timestamp: order.createdAt.toISOString(),
      });
    }
  }

  activityTimeline.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    storeName,
    currency,
    lastUpdated: now.toISOString(),
    range,
    healthScore,
    topProducts,
    previousTrend,
    rawRevenue: revenue,
    rawRevenuePrevious: prevRevenue,
    suggestedGoal,
    counts,
    transactions,
    bestSellers,
    kpis: {
      revenue: {
        label: "Revenue",
        value: formatCompact(revenue, currency),
        change: revenueGrowth,
        changeLabel: rangeLabel,
        sparkline: revenueSpark,
      },
      netProfit: {
        label: "Net Profit",
        value: formatCompact(netProfit, currency),
        change: profitGrowth,
        changeLabel: `${(PROFIT_MARGIN * 100).toFixed(1)}% margin`,
        sparkline: profitSpark,
      },
      adSpend: {
        label: "Ad Spend",
        value: formatCompact(adSpend, currency),
        change: pctChange(adSpend, prevAdSpend),
        changeLabel: `ROAS ${roas.toFixed(1)}x`,
      },
      cashRunway: {
        label: "Cash Runway",
        value: `${Math.min(12, Math.max(1, cashRunwayMonths)).toFixed(1)} mo`,
        change: 0,
        changeLabel: "Threshold: 3 mo",
        subtext: cashRunwayMonths >= 3 ? "Healthy" : "Watch",
        status: cashRunwayMonths >= 3 ? "healthy" : "warning",
      },
    },
    trend,
    trendSummary: {
      revenueGrowth,
      profitGrowth,
      marginStart,
      marginEnd,
    },
    insights: insights.slice(0, 4),
    recommendedAction: { text: recommendedText, savings: recommendedSavings },
    operational: {
      orders: {
        label: "Orders",
        value: orderCount.toLocaleString(),
        change: pctChange(orderCount, prevOrderCount),
        changeLabel: range === 1 ? "today" : range === 365 ? "last 12 months" : `last ${range} days`,
      },
      aov: {
        label: "AOV",
        value: formatCompact(aov, currency),
        change: pctChange(aov, prevAov),
        changeLabel: "avg order value",
      },
      conversion: {
        label: "Conversion",
        value: `${estimatedConversion.toFixed(1)}%`,
        change: pctChange(estimatedConversion, prevConversion),
        changeLabel: "estimated",
      },
      returns: {
        label: "Returns",
        value: `${returnRate.toFixed(1)}%`,
        change: -pctChange(returnRate, prevReturnRate),
        changeLabel: "return rate",
      },
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
    })),
    risks,
    inventory: {
      lowStock,
      outOfStock,
      inventoryValue,
      slowMovingValue,
      stockCoverageDays,
      recommendation:
        slowMovingValue > 500
          ? "Discount slow-moving items by 15%"
          : "Inventory levels are balanced",
      cashRelease:
        slowMovingValue > 500
          ? `+${formatImpact(slowMovingValue * 0.35, currency)}`
          : `+${formatImpact(0, currency)}`,
    },
    priorityActions: priorityActions.slice(0, 3),
    totalProjectedImpact,
    homeKpis,
    quickSummary,
    trafficSources,
    salesByDevice,
    activityTimeline: activityTimeline.slice(0, 8),
    productsSold,
    productsSoldChange: pctChange(productsSold, prevProductsSold),
    visitors,
    visitorsChange: pctChange(visitors, prevVisitors),
    collectionCount,
    bestSellerName: topProduct?.title ?? "—",
    homeOrders,
    homeTopProducts,
  };
}
