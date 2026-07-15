export interface KpiMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  subtext?: string;
  status?: "healthy" | "warning" | "critical";
  sparkline?: number[];
}

export type DashboardRange = 1 | 7 | 30 | 365;

export interface HomeKpiCardData {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  sparkline: number[];
  href?: string;
}

export interface QuickSummaryItem {
  id: string;
  label: string;
  value: string;
  href?: string;
}

export interface TrafficSource {
  id: string;
  label: string;
  value: number;
  percentage: number;
}

export interface DeviceSale {
  id: string;
  label: string;
  value: number;
  percentage: number;
}

export type ActivityEventType =
  | "order_created"
  | "refund_issued"
  | "inventory_updated"
  | "customer_registered"
  | "payment_received";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
}

export interface HomeOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface HomeTopProductCard {
  id: string;
  title: string;
  image: string;
  revenue: number;
  unitsSold: number;
  stock: number;
  growth: number;
}

export interface TopProduct {
  id: string;
  title: string;
  units: number;
  revenue: number;
  share: number;
}

export interface HealthScore {
  score: number;
  grade: "A" | "B" | "C" | "D";
  label: string;
  factors: { label: string; value: number; weight: number }[];
}

export interface OverviewCounts {
  totalProducts: number;
  completedOrders: number;
  canceledOrders: number;
  topProductUnits: number;
  totalProductsChange: number;
  completedOrdersChange: number;
  canceledOrdersChange: number;
  topProductUnitsChange: number;
}

export interface TransactionRow {
  id: string;
  orderNumber: string;
  item: string;
  date: string;
  price: number;
  status: string;
}

export interface BestSeller {
  id: string;
  title: string;
  unitsSold: number;
  image: string;
}

export interface TrendPoint {
  date: string;
  revenue: number;
  profit: number;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  impact: string;
  impactType: "positive" | "negative" | "neutral";
  priority: boolean;
  action?: string;
}

export interface RiskAlert {
  id: string;
  title: string;
  level: "high" | "watch" | "good";
  current: string;
  target: string;
  impact: string;
  action?: string;
}

export interface PriorityAction {
  id: string;
  title: string;
  impact: string;
  href?: string;
}

export interface ExecutiveDashboardData {
  storeName: string;
  currency: string;
  lastUpdated: string;
  range: DashboardRange;
  healthScore: HealthScore;
  topProducts: TopProduct[];
  previousTrend: TrendPoint[];
  rawRevenue: number;
  rawRevenuePrevious: number;
  suggestedGoal: number;
  counts: OverviewCounts;
  transactions: TransactionRow[];
  bestSellers: BestSeller[];
  kpis: {
    revenue: KpiMetric;
    netProfit: KpiMetric;
    adSpend: KpiMetric;
    cashRunway: KpiMetric;
  };
  trend: TrendPoint[];
  trendSummary: {
    revenueGrowth: number;
    profitGrowth: number;
    marginStart: number;
    marginEnd: number;
  };
  insights: AiInsight[];
  recommendedAction: {
    text: string;
    savings: string;
  };
  operational: {
    orders: KpiMetric;
    aov: KpiMetric;
    conversion: KpiMetric;
    returns: KpiMetric;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
  }[];
  risks: RiskAlert[];
  inventory: {
    lowStock: number;
    outOfStock: number;
    inventoryValue: number;
    slowMovingValue: number;
    stockCoverageDays: number;
    recommendation: string;
    cashRelease: string;
  };
  priorityActions: PriorityAction[];
  totalProjectedImpact: number;
  homeKpis: HomeKpiCardData[];
  quickSummary: QuickSummaryItem[];
  trafficSources: TrafficSource[];
  salesByDevice: DeviceSale[];
  activityTimeline: ActivityEvent[];
  productsSold: number;
  productsSoldChange: number;
  visitors: number;
  visitorsChange: number;
  collectionCount: number;
  bestSellerName: string;
  homeOrders: HomeOrderRow[];
  homeTopProducts: HomeTopProductCard[];
}
