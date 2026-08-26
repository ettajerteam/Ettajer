import type { ActivationGapData } from "@/lib/admin/activation-stats";

export type AdminAnalyticsRange = 7 | 30 | 90;

export type AdminTrendPoint = {
  date: string;
  revenue: number;
  orders: number;
  signups: number;
};

export type AdminInsightSeverity = "high" | "medium" | "low" | "positive";

export type AdminInsight = {
  id: string;
  severity: AdminInsightSeverity;
  title: string;
  detail: string;
  href: string;
  cta: string;
};

export type AdminIntelligenceInput = {
  range: AdminAnalyticsRange;
  revenue: number;
  revenuePrev: number;
  orders: number;
  ordersPrev: number;
  signups: number;
  signupsPrev: number;
  aov: number;
  aovPrev: number;
  testSharePct: number;
  waitingUsers: number;
  openSupport: number;
  failedLogins24h: number;
  domainsConnected: number;
  domainsConnectedSuccess: number;
  topStoreSharePct: number;
  topStoreName: string | null;
  funnel: ActivationGapData["funnel"];
  hotEmptyCount: number;
  loggedInEmpty7d: number;
};

export function pctChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function parseAdminAnalyticsRange(
  raw: string | string[] | undefined
): AdminAnalyticsRange {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(value);
  if (n === 7 || n === 30 || n === 90) return n;
  return 30;
}

export function deriveAdminInsights(
  input: AdminIntelligenceInput
): AdminInsight[] {
  const insights: AdminInsight[] = [];
  const revenueChange = pctChange(input.revenue, input.revenuePrev);
  const ordersChange = pctChange(input.orders, input.ordersPrev);
  const signupsChange = pctChange(input.signups, input.signupsPrev);
  const activatedPct =
    input.funnel.totalStores > 0
      ? Math.round((input.funnel.hasOrders / input.funnel.totalStores) * 100)
      : 0;

  if (input.waitingUsers > 0) {
    insights.push({
      id: "waiting-users",
      severity: "high",
      title: `${input.waitingUsers} merchant${input.waitingUsers === 1 ? "" : "s"} waiting`,
      detail:
        "Accounts stuck in waiting status cannot sell. Activate or reject them to keep the funnel clean.",
      href: "/admin/users",
      cta: "Review waiting users",
    });
  }

  if (input.openSupport > 0) {
    insights.push({
      id: "open-support",
      severity: input.openSupport >= 5 ? "high" : "medium",
      title: `${input.openSupport} open support thread${input.openSupport === 1 ? "" : "s"}`,
      detail: "Unanswered merchant tickets slow activation and trust.",
      href: "/admin/messages",
      cta: "Open inbox",
    });
  }

  if (input.failedLogins24h >= 10) {
    insights.push({
      id: "failed-logins",
      severity: "high",
      title: `${input.failedLogins24h} failed logins in 24h`,
      detail: "Spike may mean credential stuffing or broken auth. Check recent errors.",
      href: "/admin/errors",
      cta: "Inspect errors",
    });
  }

  if (input.hotEmptyCount > 0) {
    insights.push({
      id: "hot-empty",
      severity: "medium",
      title: `${input.hotEmptyCount} empty store${input.hotEmptyCount === 1 ? "" : "s"} still active`,
      detail: `${input.loggedInEmpty7d} logged in this week without listing products — prime nudge targets.`,
      href: "/admin/activation",
      cta: "Open activation",
    });
  }

  if (input.funnel.activeNoOrders > 0 && activatedPct < 40) {
    insights.push({
      id: "listed-zero",
      severity: "medium",
      title: `${input.funnel.activeNoOrders} stores listed, zero real orders`,
      detail: `Only ${activatedPct}% of stores have a real sale. Push share + COD verification.`,
      href: "/admin/activation",
      cta: "See first-sale gaps",
    });
  }

  if (revenueChange <= -15) {
    insights.push({
      id: "gmv-drop",
      severity: "high",
      title: `Real GMV down ${Math.abs(revenueChange)}% vs prior ${input.range}d`,
      detail: "Check top stores, payment failures, and whether test traffic is crowding real COD.",
      href: "/admin/payments",
      cta: "Review payments",
    });
  } else if (revenueChange >= 20) {
    insights.push({
      id: "gmv-up",
      severity: "positive",
      title: `Real GMV up ${revenueChange}% vs prior ${input.range}d`,
      detail: "Momentum is real — watch concentration risk and keep support latency low.",
      href: "/admin/stores",
      cta: "See top stores",
    });
  }

  if (signupsChange <= -20 && input.signupsPrev > 5) {
    insights.push({
      id: "signup-drop",
      severity: "medium",
      title: `Signups down ${Math.abs(signupsChange)}% vs prior ${input.range}d`,
      detail: "Acquisition slowed. Check landing conversion and Google OAuth health.",
      href: "/admin/users",
      cta: "Review users",
    });
  }

  if (input.testSharePct >= 25) {
    insights.push({
      id: "test-share",
      severity: "low",
      title: `Test orders are ${input.testSharePct}% of volume`,
      detail: "Sandbox noise can inflate ops dashboards. Keep real-vs-test filters on.",
      href: "/admin/payments",
      cta: "Filter payments",
    });
  }

  if (
    input.domainsConnected > 0 &&
    input.domainsConnectedSuccess < input.domainsConnected
  ) {
    const failing = input.domainsConnected - input.domainsConnectedSuccess;
    insights.push({
      id: "dns-fail",
      severity: "medium",
      title: `${failing} custom domain${failing === 1 ? "" : "s"} failing DNS`,
      detail: "Broken domains kill storefront trust for merchants who already paid to brand.",
      href: "/admin/stores",
      cta: "Check stores",
    });
  }

  if (input.topStoreSharePct >= 45 && input.topStoreName) {
    insights.push({
      id: "concentration",
      severity: "low",
      title: `${input.topStoreName} is ${input.topStoreSharePct}% of real GMV`,
      detail: "Platform GMV is concentrated. Grow the mid-tier so one merchant cannot swing the curve.",
      href: "/admin/stores",
      cta: "Browse stores",
    });
  }

  if (ordersChange >= 15 && input.aov > 0 && pctChange(input.aov, input.aovPrev) <= -10) {
    insights.push({
      id: "aov-soft",
      severity: "low",
      title: "Orders up, average order value soft",
      detail: `AOV ${Math.round(input.aov).toLocaleString()} MAD vs prior period — more small COD tickets.`,
      href: "/admin/analytics",
      cta: "Stay on intelligence",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "steady",
      severity: "positive",
      title: "Platform pulse looks steady",
      detail: `No critical blockers in the last ${input.range} days. Keep watching activation and support latency.`,
      href: "/admin/activation",
      cta: "Scan activation",
    });
  }

  const rank: Record<AdminInsightSeverity, number> = {
    high: 0,
    medium: 1,
    low: 2,
    positive: 3,
  };

  return insights.sort((a, b) => rank[a.severity] - rank[b.severity]).slice(0, 6);
}
