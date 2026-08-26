import type { ActivationGapData } from "@/lib/admin/activation-stats";

export type AdminAnalyticsRange = 7 | 30 | 90;

export type AdminTrendPoint = {
  date: string;
  revenue: number;
  orders: number;
  signups: number;
};

export type AdminInsightSeverity = "high" | "medium" | "low" | "positive";

export type AdminInsightCategory =
  | "growth"
  | "activation"
  | "revenue"
  | "support"
  | "risk"
  | "technical";

export type AdminInsight = {
  id: string;
  severity: AdminInsightSeverity;
  category: AdminInsightCategory;
  /** What happened */
  signal: string;
  /** Why it matters */
  why: string;
  /** What the admin should do */
  action: string;
  href: string;
  cta: string;
  /** @deprecated use signal — kept for older call sites */
  title: string;
  /** @deprecated use why */
  detail: string;
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

function insight(partial: {
  id: string;
  severity: AdminInsightSeverity;
  category: AdminInsightCategory;
  signal: string;
  why: string;
  action: string;
  href: string;
  cta: string;
}): AdminInsight {
  return {
    ...partial,
    title: partial.signal,
    detail: partial.why,
  };
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
    insights.push(
      insight({
        id: "waiting-users",
        severity: "high",
        category: "activation",
        signal: `${input.waitingUsers} merchant${input.waitingUsers === 1 ? "" : "s"} waiting for activation`,
        why: "Accounts stuck in waiting status cannot sell. Every day in queue lowers conversion odds.",
        action: "Activate or reject waiting accounts to keep the funnel clean.",
        href: "/admin/users?status=waiting",
        cta: "Review waiting users",
      })
    );
  }

  if (input.openSupport > 0) {
    insights.push(
      insight({
        id: "open-support",
        severity: input.openSupport >= 5 ? "high" : "medium",
        category: "support",
        signal: `${input.openSupport} open support thread${input.openSupport === 1 ? "" : "s"}`,
        why: "Unanswered merchant tickets slow activation and erode trust.",
        action: "Reply to open threads, starting with newest unread.",
        href: "/admin/messages",
        cta: "Open inbox",
      })
    );
  }

  if (input.failedLogins24h >= 10) {
    insights.push(
      insight({
        id: "failed-logins",
        severity: "high",
        category: "technical",
        signal: `${input.failedLogins24h} failed logins in 24h`,
        why: "Spike may mean credential stuffing or a broken auth path blocking merchants.",
        action: "Inspect recent login errors and lockouts.",
        href: "/admin/errors",
        cta: "Inspect errors",
      })
    );
  }

  if (input.hotEmptyCount > 0) {
    insights.push(
      insight({
        id: "hot-empty",
        severity: "medium",
        category: "activation",
        signal: `${input.hotEmptyCount} active store${input.hotEmptyCount === 1 ? "" : "s"} have zero products`,
        why: `${input.loggedInEmpty7d} of these merchants logged in during the last 7 days, showing current platform interest.`,
        action: `Contact the ${Math.max(input.loggedInEmpty7d, 1)} recently active merchant${input.loggedInEmpty7d === 1 ? "" : "s"} with product setup assistance.`,
        href: "/admin/activation?stage=empty",
        cta: "View empty stores",
      })
    );
  }

  if (input.funnel.activeNoOrders > 0 && activatedPct < 40) {
    insights.push(
      insight({
        id: "listed-zero",
        severity: "medium",
        category: "growth",
        signal: `${input.funnel.activeNoOrders} stores have live products but zero real orders`,
        why: `Only ${activatedPct}% of stores have a real sale — catalogs exist without traffic or COD conversion.`,
        action: "Prioritize first-sale coaching: share storefront, verify domain, confirm COD flow.",
        href: "/admin/activation?stage=listed",
        cta: "See first-sale targets",
      })
    );
  }

  if (revenueChange <= -15) {
    insights.push(
      insight({
        id: "gmv-drop",
        severity: "high",
        category: "revenue",
        signal: `Real GMV down ${Math.abs(revenueChange)}% vs prior ${input.range}d`,
        why: "A sustained dip usually concentrates in top stores, pending COD, or test noise crowding ops views.",
        action: "Review payments pipeline and top-merchant concentration.",
        href: "/admin/payments",
        cta: "Review payments",
      })
    );
  } else if (revenueChange >= 20) {
    insights.push(
      insight({
        id: "gmv-up",
        severity: "positive",
        category: "revenue",
        signal: `Real GMV up ${revenueChange}% vs prior ${input.range}d`,
        why: "Momentum is real — concentration risk rises when growth is narrow.",
        action: "Keep support latency low and watch mid-tier activation.",
        href: "/admin/analytics?range=" + input.range,
        cta: "Open intelligence",
      })
    );
  }

  if (signupsChange <= -20 && input.signupsPrev > 5) {
    insights.push(
      insight({
        id: "signup-drop",
        severity: "medium",
        category: "growth",
        signal: `Signups down ${Math.abs(signupsChange)}% vs prior ${input.range}d`,
        why: "Acquisition slowed relative to the prior window.",
        action: "Check landing conversion and Google OAuth health.",
        href: "/admin/users",
        cta: "Review users",
      })
    );
  }

  if (input.testSharePct >= 25) {
    insights.push(
      insight({
        id: "test-share",
        severity: "low",
        category: "risk",
        signal: `Test orders are ${input.testSharePct}% of volume`,
        why: "Sandbox noise can inflate ops dashboards and hide real COD bottlenecks.",
        action: "Keep real-vs-test filters on when reviewing payments.",
        href: "/admin/payments",
        cta: "Filter payments",
      })
    );
  }

  if (
    input.domainsConnected > 0 &&
    input.domainsConnectedSuccess < input.domainsConnected
  ) {
    const failing = input.domainsConnected - input.domainsConnectedSuccess;
    insights.push(
      insight({
        id: "dns-fail",
        severity: "medium",
        category: "technical",
        signal: `${failing} custom domain${failing === 1 ? "" : "s"} failing DNS checks`,
        why: "Broken domains kill storefront trust for merchants who already branded.",
        action: "Diagnose failing domains and share the exact DNS fix.",
        href: "/admin/domains",
        cta: "Open domain health",
      })
    );
  }

  if (input.topStoreSharePct >= 45 && input.topStoreName) {
    insights.push(
      insight({
        id: "concentration",
        severity: "low",
        category: "risk",
        signal: `Revenue concentration is high: ${input.topStoreName} generates ${input.topStoreSharePct}% of tracked GMV`,
        why: "A large decline in one merchant could significantly impact total platform revenue.",
        action: "Grow mid-tier merchants so one store cannot swing the curve.",
        href: "/admin/analytics?range=" + input.range,
        cta: "Review concentration",
      })
    );
  }

  if (
    ordersChange >= 15 &&
    input.aov > 0 &&
    pctChange(input.aov, input.aovPrev) <= -10
  ) {
    insights.push(
      insight({
        id: "aov-soft",
        severity: "low",
        category: "revenue",
        signal: "Orders up, average order value soft",
        why: `AOV ${Math.round(input.aov).toLocaleString()} MAD vs prior period — more small COD tickets.`,
        action: "Watch basket composition on top stores; no action required unless AOV keeps falling.",
        href: "/admin/analytics",
        cta: "Stay on intelligence",
      })
    );
  }

  if (insights.length === 0) {
    insights.push(
      insight({
        id: "steady",
        severity: "positive",
        category: "growth",
        signal: "Platform pulse looks steady",
        why: `No critical blockers derived from the last ${input.range} days of live data.`,
        action: "Keep watching activation and support latency.",
        href: "/admin/activation",
        cta: "Scan activation",
      })
    );
  }

  const rank: Record<AdminInsightSeverity, number> = {
    high: 0,
    medium: 1,
    low: 2,
    positive: 3,
  };

  return insights.sort((a, b) => rank[a.severity] - rank[b.severity]).slice(0, 8);
}
