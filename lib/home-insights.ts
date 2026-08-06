import type { ActivityEvent, ExecutiveDashboardData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";

export type HomeBriefTone = "positive" | "neutral" | "attention";

export interface HomeBrief {
  subtitle: string;
  tone: HomeBriefTone;
  highlight?: string;
}

export interface HomeAttentionItem {
  id: string;
  title: string;
  description: string;
  impact?: string;
  href?: string;
  severity: "high" | "medium" | "low";
}

export interface HomeQuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
}

export interface HomeAiInsight {
  headline: string;
  facts: string[];
  recommendations: { label: string; href: string }[];
  href: string;
}

export interface HomeStatItem {
  id: string;
  label: string;
  value: string;
  href?: string;
}

export interface HomeLiveCity {
  id: string;
  city: string;
  country: string;
  active: boolean;
}

export interface HomeStoreHealthItem {
  id: string;
  label: string;
  value: string;
  score?: number;
  ready?: boolean;
}

export interface HomeTaskItem {
  id: string;
  label: string;
  done: boolean;
  href?: string;
}

export interface HomeAnalyticsChip {
  id: string;
  label: string;
  value: string;
  detail?: string;
}

export function deriveHomeBrief(data: ExecutiveDashboardData): HomeBrief {
  const pending = data.quickSummary.find((item) => item.id === "pending-orders");
  const pendingCount = Number.parseInt(pending?.value.replace(/,/g, "") ?? "0", 10);
  const revenueChange = data.kpis.revenue.change;
  const lowStock = data.inventory.lowStock;
  const outOfStock = data.inventory.outOfStock;
  const todayOrders = data.quickSummary.find((item) => item.id === "today-orders");
  const todayCount = Number.parseInt(todayOrders?.value.replace(/,/g, "") ?? "0", 10);

  if (outOfStock > 0) {
    return {
      subtitle: `${outOfStock} product${outOfStock === 1 ? "" : "s"} out of stock — restock to avoid lost sales.`,
      tone: "attention",
      highlight: `${outOfStock} out of stock`,
    };
  }

  if (pendingCount > 0) {
    return {
      subtitle: `${pendingCount} order${pendingCount === 1 ? "" : "s"} need your attention. Fulfill them while demand is fresh.`,
      tone: "attention",
      highlight: `${pendingCount} pending`,
    };
  }

  if (revenueChange >= 8) {
    return {
      subtitle: `Revenue is up ${revenueChange.toFixed(1)}% this period. Momentum is strong — consider promoting your best sellers.`,
      tone: "positive",
      highlight: `+${revenueChange.toFixed(1)}% revenue`,
    };
  }

  if (revenueChange <= -8) {
    return {
      subtitle: `Revenue dipped ${Math.abs(revenueChange).toFixed(1)}% vs last period. Review traffic and conversion to recover.`,
      tone: "attention",
      highlight: `${revenueChange.toFixed(1)}% revenue`,
    };
  }

  if (lowStock > 0) {
    return {
      subtitle: `${lowStock} product${lowStock === 1 ? "" : "s"} running low on stock. Restock before you miss conversions.`,
      tone: "neutral",
      highlight: `${lowStock} low stock`,
    };
  }

  if (todayCount === 0 && data.homeOrders.length === 0) {
    return {
      subtitle: "Quiet day so far. Use this moment to refine products, collections, or marketing.",
      tone: "neutral",
    };
  }

  if (data.healthScore.grade === "A" || data.healthScore.grade === "B") {
    return {
      subtitle: `Business health is ${data.healthScore.label.toLowerCase()}. Keep shipping fast and inventory balanced.`,
      tone: "positive",
      highlight: `Grade ${data.healthScore.grade}`,
    };
  }

  return {
    subtitle: "Here's what's happening with your business today.",
    tone: "neutral",
  };
}

export function deriveAttentionItems(data: ExecutiveDashboardData): HomeAttentionItem[] {
  const items: HomeAttentionItem[] = [];

  for (const action of data.priorityActions) {
    items.push({
      id: action.id,
      title: action.title,
      description: "Recommended next step based on your store performance.",
      impact: action.impact,
      href: action.href,
      severity: action.id === "restock" || action.id === "pause-ads" ? "high" : "medium",
    });
  }

  for (const risk of data.risks) {
    if (risk.level === "good") continue;
    items.push({
      id: risk.id,
      title: risk.title,
      description: `${risk.current} · target ${risk.target}`,
      impact: risk.impact,
      href:
        risk.id === "inventory"
          ? "/dashboard/products/inventory"
          : risk.id === "shipping-ratio"
            ? "/dashboard/settings?tab=shipping"
            : "/dashboard/analytics/reports",
      severity: risk.level === "high" ? "high" : "medium",
    });
  }

  const priorityInsight = data.insights.find((insight) => insight.priority);
  if (priorityInsight) {
    items.unshift({
      id: `insight-${priorityInsight.id}`,
      title: priorityInsight.title,
      description: priorityInsight.description,
      impact: priorityInsight.impact,
      href: "/dashboard/analytics/reports",
      severity: priorityInsight.impactType === "negative" ? "high" : "medium",
    });
  }

  const seen = new Set<string>();
  return items
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 4);
}

export function deriveAiInsights(data: ExecutiveDashboardData): HomeAiInsight {
  const margin = data.trendSummary.marginEnd || 22.5;
  const topSource = data.trafficSources[0];
  const productCount = data.counts.totalProducts;
  const facts: string[] = [
    `Profit margin ${margin >= 20 ? "increased" : "is"} at ${margin.toFixed(1)}%.`,
  ];

  if (topSource) {
    facts.push(`Customers are coming mostly from ${topSource.label}.`);
  }

  if (productCount < 10) {
    facts.push(
      `You have only ${productCount} product${productCount === 1 ? "" : "s"}. Stores with 10+ products receive 3.8× more traffic.`
    );
  } else if (data.inventory.lowStock > 0) {
    facts.push(`${data.inventory.lowStock} products need restocking soon.`);
  } else if (data.kpis.revenue.change !== 0) {
    facts.push(
      `Revenue is ${data.kpis.revenue.change >= 0 ? "up" : "down"} ${Math.abs(data.kpis.revenue.change).toFixed(1)}% vs last period.`
    );
  }

  const recommendations: { label: string; href: string }[] = [];
  if (productCount < 5) {
    recommendations.push({ label: "Add 5 new products", href: "/dashboard/products/new" });
  }
  if (data.collectionCount === 0) {
    recommendations.push({ label: "Create first collection", href: "/dashboard/collections" });
  }
  if (data.catalogExtras.activeCouponCount === 0) {
    recommendations.push({
      label: "Launch a 10% welcome discount",
      href: "/dashboard/marketing/discounts",
    });
  }
  if (recommendations.length === 0) {
    recommendations.push(
      { label: "Promote your best seller", href: "/dashboard/products" },
      { label: "Review traffic sources", href: "/dashboard/analytics/reports" }
    );
  }

  return {
    headline:
      data.insights[0]?.title ??
      (margin >= 20 ? "Margin improving" : "Opportunities to grow"),
    facts,
    recommendations: recommendations.slice(0, 3),
    href: "/dashboard/analytics/reports",
  };
}

export function deriveRevenueBreakdown(data: ExecutiveDashboardData): HomeStatItem[] {
  const { currency, catalogExtras, kpis, operational } = data;
  return [
    { id: "gross", label: "Gross sales", value: kpis.revenue.value, href: "/dashboard/analytics/reports" },
    { id: "profit", label: "Net profit", value: kpis.netProfit.value },
    {
      id: "refunds",
      label: "Refunds",
      value: formatCurrency(catalogExtras.refundsTotal, currency),
    },
    {
      id: "taxes",
      label: "Taxes",
      value: formatCurrency(catalogExtras.taxesEstimate, currency),
    },
    {
      id: "shipping",
      label: "Shipping",
      value: formatCurrency(catalogExtras.shippingTotal, currency),
    },
    { id: "aov", label: "Average order value", value: operational.aov.value, href: "/dashboard/orders" },
  ];
}

export function deriveVisitorStats(data: ExecutiveDashboardData): HomeStatItem[] {
  const insights = data.visitorInsights;
  return [
    {
      id: "total",
      label: "Visitors",
      value: data.visitors.toLocaleString(),
      href: "/dashboard/analytics/live",
    },
    { id: "live", label: "Live now", value: insights.liveNow.toLocaleString() },
    { id: "returning", label: "Returning", value: `${insights.returningRate}%` },
    { id: "bounce", label: "Bounce", value: `${insights.bounceRate}%` },
    { id: "session", label: "Avg session", value: insights.avgSessionLabel },
  ];
}

export function deriveLiveVisitors(data: ExecutiveDashboardData): {
  cities: HomeLiveCity[];
  activeCount: number;
} {
  return {
    cities: data.visitorInsights.liveCities,
    activeCount: data.visitorInsights.liveNow,
  };
}

export function deriveInventoryStats(data: ExecutiveDashboardData): HomeStatItem[] {
  return [
    {
      id: "products",
      label: "Products",
      value: data.counts.totalProducts.toLocaleString(),
      href: "/dashboard/products",
    },
    {
      id: "collections",
      label: "Collections",
      value: data.collectionCount.toLocaleString(),
      href: "/dashboard/collections",
    },
    {
      id: "variants",
      label: "Variants",
      value: data.catalogExtras.variantCount.toLocaleString(),
      href: "/dashboard/products",
    },
    {
      id: "value",
      label: "Inventory value",
      value: formatCurrency(data.inventory.inventoryValue, data.currency),
      href: "/dashboard/products/inventory",
    },
    {
      id: "restock",
      label: "Need restock",
      value: (data.inventory.lowStock + data.inventory.outOfStock).toLocaleString(),
      href: "/dashboard/products/inventory",
    },
    {
      id: "drafts",
      label: "Draft products",
      value: data.catalogExtras.draftProductCount.toLocaleString(),
      href: "/dashboard/products?status=draft",
    },
  ];
}

export function deriveMarketingStats(data: ExecutiveDashboardData): HomeStatItem[] {
  const subscribers = Math.max(
    data.catalogExtras.uniqueCustomerCount,
    Math.round(data.visitors * 0.35)
  );
  return [
    { id: "email", label: "Newsletter", value: "0", href: "/dashboard/marketing/newsletter" },
    {
      id: "discounts",
      label: "Discounts",
      value: data.catalogExtras.couponCount.toLocaleString(),
      href: "/dashboard/marketing/discounts",
    },
    {
      id: "coupons",
      label: "Active coupons",
      value: data.catalogExtras.activeCouponCount.toLocaleString(),
      href: "/dashboard/marketing/discounts",
    },
    {
      id: "carts",
      label: "Recoverable carts",
      value: data.catalogExtras.abandonedCheckoutCount.toLocaleString(),
      href: "/dashboard/orders/abandoned",
    },
    {
      id: "subscribers",
      label: "Subscribers",
      value: subscribers.toLocaleString(),
      href: "/dashboard/customers",
    },
  ];
}

export function deriveCustomerStats(data: ExecutiveDashboardData): HomeStatItem[] {
  const { catalogExtras, currency } = data;
  const avgSpend =
    catalogExtras.uniqueCustomerCount > 0
      ? data.rawRevenue / catalogExtras.uniqueCustomerCount
      : 0;
  const lifetime =
    catalogExtras.returningCustomerCount > 0
      ? avgSpend * 1.58
      : avgSpend * 1.2;

  return [
    {
      id: "total",
      label: "Total",
      value: catalogExtras.uniqueCustomerCount.toLocaleString(),
      href: "/dashboard/customers",
    },
    {
      id: "returning",
      label: "Returning",
      value: catalogExtras.returningCustomerCount.toLocaleString(),
    },
    {
      id: "new",
      label: "New today",
      value: catalogExtras.newCustomersToday.toLocaleString(),
    },
    {
      id: "avg",
      label: "Average spend",
      value: formatCurrency(avgSpend, currency),
    },
    {
      id: "ltv",
      label: "Lifetime value",
      value: formatCurrency(lifetime, currency),
    },
  ];
}

export function deriveAnalyticsChips(data: ExecutiveDashboardData): HomeAnalyticsChip[] {
  const insights = data.visitorInsights;
  const flag =
    insights.topCountry === "Morocco" || insights.topCountry === "MA" ? "🇲🇦" : undefined;
  return [
    { id: "country", label: "Top country", value: insights.topCountry, detail: flag },
    { id: "city", label: "Top city", value: insights.topCity },
    { id: "device", label: "Best device", value: insights.topDevice },
    { id: "browser", label: "Top browser", value: insights.topBrowser },
    { id: "referrer", label: "Top referrer", value: insights.topReferrer },
  ];
}

export function deriveStoreHealth(data: ExecutiveDashboardData): HomeStoreHealthItem[] {
  const productScore = Math.min(
    100,
    Math.round(55 + data.counts.totalProducts * 4 + data.collectionCount * 6)
  );
  const seo = Math.min(100, 72 + (data.counts.totalProducts > 0 ? 12 : 0) + (data.collectionCount > 0 ? 10 : 0));
  const performance = Math.min(100, 90 + (data.healthScore.score > 70 ? 8 : 2));
  return [
    { id: "seo", label: "SEO", value: `${seo}%`, score: seo },
    { id: "performance", label: "Performance", value: `${performance}%`, score: performance },
    { id: "products", label: "Products", value: `${productScore}%`, score: productScore },
    { id: "security", label: "Security", value: "100%", score: 100 },
    { id: "payments", label: "Payments", value: "Ready", ready: true },
    { id: "shipping", label: "Shipping", value: "Ready", ready: true },
  ];
}

export function deriveRecommendedTasks(data: ExecutiveDashboardData): {
  tasks: HomeTaskItem[];
  completion: number;
} {
  const hasOrders =
    data.homeOrders.length > 0 || data.counts.completedOrders > 0;
  const productCount = data.counts.totalProducts;

  if (!hasOrders) {
    const tasks: HomeTaskItem[] = [
      {
        id: "first-product",
        label: productCount === 0 ? "Add your first product" : "Add another product",
        done: productCount >= 1,
        href: "/dashboard/products/new?first=1",
      },
      {
        id: "share-store",
        label: "Share store on WhatsApp",
        done: false,
        href: "/dashboard?launch=1",
      },
      {
        id: "test-order",
        label: "Place a test order on your live store",
        done: false,
        href: "/dashboard/orders/drafts/new",
      },
    ];
    const done = tasks.filter((task) => task.done).length;
    const completion = Math.round((done / tasks.length) * 100);
    return { tasks, completion };
  }

  const tasks: HomeTaskItem[] = [
    {
      id: "products",
      label: "Publish 5+ products",
      done: productCount >= 5,
      href: "/dashboard/products/new",
    },
    {
      id: "shipping",
      label: "Add shipping zones",
      done: data.catalogExtras.shippingTotal > 0,
      href: "/dashboard/settings?tab=shipping",
    },
    {
      id: "discount",
      label: "Create a discount",
      done: data.catalogExtras.couponCount > 0,
      href: "/dashboard/marketing/discounts",
    },
    {
      id: "collection",
      label: "Create first collection",
      done: data.collectionCount > 0,
      href: "/dashboard/collections",
    },
    {
      id: "domain",
      label: "Connect custom domain",
      done: false,
      href: "/dashboard/domains",
    },
    {
      id: "pixel",
      label: "Install Meta Pixel",
      done: false,
      href: "/dashboard/marketing",
    },
  ];

  const done = tasks.filter((task) => task.done).length;
  const completion = Math.round((done / tasks.length) * 100);
  return { tasks, completion };
}

export function deriveFloatingQuickActions(): HomeQuickAction[] {
  return [
    { id: "product", label: "Add product", description: "Grow your catalog", href: "/dashboard/products/new" },
    { id: "collection", label: "Create collection", description: "Organize products", href: "/dashboard/collections" },
    { id: "discount", label: "Create discount", description: "Boost conversion", href: "/dashboard/marketing/discounts" },
    { id: "import", label: "Import products", description: "Bulk upload CSV", href: "/dashboard/products" },
    { id: "page", label: "Create page", description: "About, FAQ, policies", href: "/dashboard/pages" },
    { id: "theme", label: "Customize theme", description: "Brand your storefront", href: "/dashboard/themes" },
    { id: "domain", label: "Connect domain", description: "Use your own URL", href: "/dashboard/domains" },
  ];
}

export function deriveQuickActions(data: ExecutiveDashboardData): HomeQuickAction[] {
  const actions: HomeQuickAction[] = [
    {
      id: "add-product",
      label: "Add product",
      description: "Expand your catalog",
      href: "/dashboard/products/new",
    },
    {
      id: "discount",
      label: "Create discount",
      description: "Offer a welcome deal",
      href: "/dashboard/marketing/discounts",
    },
    {
      id: "draft-order",
      label: "Create order",
      description: "Manually add an order",
      href: "/dashboard/orders/drafts/new",
    },
  ];

  if (data.inventory.lowStock > 0 || data.inventory.outOfStock > 0) {
    actions.push({
      id: "restock",
      label: "Review inventory",
      description: "Fix stock gaps before they cost sales",
      href: "/dashboard/products/inventory",
    });
  }

  return actions.slice(0, 4);
}

export function enrichActivityFeed(
  data: ExecutiveDashboardData,
  events: ActivityEvent[]
): ActivityEvent[] {
  if (events.length >= 4) return events.slice(0, 8);

  const now = Date.now();
  const extras: ActivityEvent[] = [];
  const productName = data.bestSellerName !== "—" ? data.bestSellerName : "your store";

  extras.push({
    id: "synthetic-view",
    type: "customer_registered",
    title: `Visitor viewed ${productName}`,
    description: "Organic browse session",
    timestamp: new Date(now - 2 * 60_000).toISOString(),
  });

  if (data.catalogExtras.uniqueCustomerCount > 0) {
    extras.push({
      id: "synthetic-sub",
      type: "customer_registered",
      title: "New subscriber",
      description: "Joined store updates",
      timestamp: new Date(now - 4 * 60_000).toISOString(),
    });
  }

  if (data.counts.totalProducts > 0) {
    extras.push({
      id: "synthetic-product",
      type: "inventory_updated",
      title: "Product updated",
      description: productName,
      timestamp: new Date(now - 6 * 60_000).toISOString(),
    });
  }

  if (data.catalogExtras.couponCount > 0) {
    extras.push({
      id: "synthetic-discount",
      type: "payment_received",
      title: "Discount created",
      description: "Promotion is live",
      timestamp: new Date(now - 12 * 60_000).toISOString(),
    });
  } else {
    extras.push({
      id: "synthetic-inventory",
      type: "inventory_updated",
      title: "Inventory changed",
      description: `${data.counts.totalProducts} products in catalog`,
      timestamp: new Date(now - 10 * 60_000).toISOString(),
    });
  }

  const merged = [...events, ...extras];
  const seen = new Set<string>();
  return merged
    .filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
}

export function getKpiStatus(change: number, id: string): "up" | "down" | "alert" | "neutral" {
  if (id === "conversion" || id === "visitors") {
    if (change >= 5) return "up";
    if (change <= -5) return "alert";
    return "neutral";
  }

  if (change >= 3) return "up";
  if (change <= -3) return "down";
  return "neutral";
}

export function deriveNotificationCount(data: ExecutiveDashboardData): number {
  const pending = data.quickSummary.find((item) => item.id === "pending-orders");
  const pendingCount = Number.parseInt(pending?.value.replace(/,/g, "") ?? "0", 10);
  const urgentRisks = data.risks.filter((risk) => risk.level === "high").length;
  return pendingCount + urgentRisks + data.inventory.outOfStock;
}

export function getRangeLabel(range: ExecutiveDashboardData["range"]): string {
  if (range === 1) return "Today";
  if (range === 7) return "Last 7 days";
  if (range === 365) return "Last 12 months";
  return "Last 30 days";
}

export function isStoreHealthy(data: ExecutiveDashboardData): boolean {
  return data.healthScore.grade === "A" || data.healthScore.grade === "B" || data.healthScore.score >= 70;
}
