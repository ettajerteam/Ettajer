export type LiveMapRange = 1 | 24 | 168;
export type LiveMapMetric = "visitors" | "orders" | "revenue";

const LIVE_MAP_RANGES: LiveMapRange[] = [1, 24, 168];

export function parseLiveMapRange(value?: string | number | null): LiveMapRange {
  const parsed = Number(value);
  if (LIVE_MAP_RANGES.includes(parsed as LiveMapRange)) return parsed as LiveMapRange;
  return 24;
}

export function getLiveMapRangeLabel(range: LiveMapRange): string {
  if (range === 1) return "Last hour";
  if (range === 168) return "Last 7 days";
  return "Last 24 hours";
}

export function getLiveMapRangeShortLabel(range: LiveMapRange): string {
  if (range === 1) return "1h";
  if (range === 168) return "7d";
  return "24h";
}

export interface LiveVisitorCountry {
  code: string;
  name: string;
  visitors: number;
  orders: number;
  revenue: number;
}

export interface LiveActivityEvent {
  id: string;
  type: "order";
  title: string;
  subtitle: string;
  amount: number;
  countryCode: string | null;
  countryName: string | null;
  createdAt: string;
}

export interface LiveHourlyPoint {
  label: string;
  orders: number;
  revenue: number;
}

export interface LiveComparison {
  orders: number;
  revenue: number;
  visitors: number;
  regions: number;
  ordersChange: number;
  revenueChange: number;
  visitorsChange: number;
  regionsChange: number;
}

export interface LiveViewData {
  currency: string;
  range: LiveMapRange;
  rangeLabel: string;
  activeVisitors: number;
  cartsOpen: number;
  ordersLastHour: number;
  revenueLastHour: number;
  ordersInRange: number;
  revenueInRange: number;
  comparison: LiveComparison;
  hourlyTrend: LiveHourlyPoint[];
  activityFeed: LiveActivityEvent[];
  visitorCountries: LiveVisitorCountry[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    createdAt: string;
    countryCode: string | null;
    countryName: string | null;
  }[];
  topPages: { page: string; views: number }[];
}
