import type {
  IntelligenceSignal,
  PlatformState,
  RecommendedAction,
  RiskItem,
} from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

const VALID_ADMIN_PREFIXES = [
  "/admin",
  "/admin/payments",
  "/admin/domains",
  "/admin/activation",
  "/admin/messages",
  "/admin/analytics",
  "/admin/stores",
  "/admin/users",
  "/admin/errors",
  "/admin/email",
  "/admin/activity",
] as const;

export function isValidAdminHref(href: string): boolean {
  if (!href.startsWith("/admin")) return false;
  const path = href.split("?")[0]!;
  return (
    path === "/admin" ||
    VALID_ADMIN_PREFIXES.some(
      (p) => p !== "/admin" && (path === p || path.startsWith(`${p}/`))
    ) ||
    path.startsWith("/admin/")
  );
}

export function getRecommendedActions(
  state: PlatformState,
  signals: IntelligenceSignal[]
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const ids = new Set(signals.map((s) => s.id));

  if (ids.has("pending-cod") || state.pendingRealOrders > 0) {
    actions.push({
      id: "PENDING_COD",
      type: "navigation",
      label: "Review pending COD",
      description: `${state.pendingRealOrders} orders awaiting verification`,
      href: "/admin/payments?focus=pending",
      urgency:
        state.pendingRealOrders >= T.pendingOrdersCritical
          ? "critical"
          : "high",
      ruleId: "orders.pending_real_cod > 0",
      relatedSignalIds: ["pending-cod"],
    });
  }

  if (ids.has("support-backlog") || state.openSupport > 0) {
    actions.push({
      id: "SUPPORT_BACKLOG",
      type: "navigation",
      label: "Open support inbox",
      description: `${state.openSupport} open conversations`,
      href: "/admin/messages",
      urgency: state.openSupport >= T.supportBacklogHigh ? "high" : "normal",
      ruleId: "support.unanswered_threads > 0",
      relatedSignalIds: ["support-backlog"],
    });
  }

  if (
    ids.has("empty-active-stores") ||
    ids.has("zero-sale-stores") ||
    state.hotEmptyCount > 0 ||
    state.firstSaleCount > 0
  ) {
    actions.push({
      id: "FIRST_SALE_TARGET",
      type: "navigation",
      label: "Open activation targets",
      description: "Empty stores & first-sale queue",
      href: "/admin/activation",
      urgency: "high",
      ruleId: "activation.live_products && realOrders = 0",
      relatedSignalIds: ["empty-active-stores", "zero-sale-stores"],
    });
  }

  if (ids.has("dns-failure") || state.domainFailing > 0) {
    actions.push({
      id: "DNS_FAILURE",
      type: "navigation",
      label: "Diagnose domains",
      description: `${state.domainFailing} DNS failing`,
      href: "/admin/domains",
      urgency: state.domainFailing >= 3 ? "critical" : "high",
      ruleId: "technical.custom_domain && dnsStatus != healthy",
      relatedSignalIds: ["dns-failure"],
    });
  }

  actions.push({
    id: "VIEW_ANALYTICS",
    type: "navigation",
    label: "View analytics",
    description: "Signal · why · action",
    href: "/admin/analytics?range=30",
    urgency: "normal",
  });

  if (state.concentration[0]) {
    actions.push({
      id: "VIEW_TOP_MERCHANT",
      type: "navigation",
      label: "View top merchant",
      description: state.concentration[0].name,
      href: `/admin/stores/${state.concentration[0].id}`,
      urgency: "normal",
    });
  }

  actions.push({
    id: "VIEW_ORDERS",
    type: "navigation",
    label: "View orders",
    description: "Order & payments pipeline",
    href: "/admin/payments",
    urgency: "normal",
  });

  return actions.filter((a) => isValidAdminHref(a.href)).slice(0, 8);
}

export function getRisks(
  state: PlatformState,
  signals: IntelligenceSignal[]
): RiskItem[] {
  const risks: RiskItem[] = [];

  const pending = signals.find((s) => s.id === "pending-cod");
  if (pending) {
    risks.push({
      id: "risk-pending-cod",
      category: "Operational",
      title: "Pending COD verification",
      metric: String(state.pendingRealOrders),
      detail: "Orders waiting before courier handoff.",
      riskLevel:
        state.pendingRealOrders >= T.pendingOrdersCritical ? "high" : "medium",
      href: "/admin/payments?focus=pending",
      cta: "Review orders",
      evidence: pending.evidence,
      ruleId: pending.ruleId,
      confidence: pending.confidence,
    });
  }

  const conc = signals.find((s) => s.id === "revenue-concentration");
  if (state.top2SharePct > 0) {
    risks.push({
      id: "risk-concentration",
      category: "Revenue concentration",
      title: "Top-2 merchant GMV share",
      metric: `${state.top2SharePct}%`,
      detail:
        state.concentrationMessage ??
        "Share of tracked GMV from top 2 merchants.",
      riskLevel:
        state.top2SharePct / 100 >= T.revenueConcentrationCritical
          ? "high"
          : state.top2SharePct / 100 >= T.revenueConcentrationHigh
            ? "high"
            : state.top2SharePct >= 35
              ? "medium"
              : "low",
      href: "/admin/analytics?range=30",
      cta: "View merchants",
      evidence: conc?.evidence ?? [
        {
          label: "top2SharePct",
          value: state.top2SharePct,
          source: "platform.gmv",
        },
      ],
      ruleId: conc?.ruleId ?? `revenue.top2_share >= ${T.revenueConcentrationHigh}`,
      confidence: conc?.confidence ?? 0.9,
    });
  }

  const dns = signals.find((s) => s.id === "dns-failure");
  if (dns) {
    risks.push({
      id: "risk-dns",
      category: "Technical",
      title: "Custom domains failing DNS",
      metric: String(state.domainFailing),
      detail: "Broken domains damage merchant trust and storefront reach.",
      riskLevel: state.domainFailing >= 3 ? "high" : "medium",
      href: "/admin/domains",
      cta: "Diagnose",
      evidence: dns.evidence,
      ruleId: dns.ruleId,
      confidence: dns.confidence,
    });
  }

  const support = signals.find((s) => s.id === "support-backlog");
  if (support) {
    risks.push({
      id: "risk-support",
      category: "Support",
      title: "Open support threads",
      metric: String(state.openSupport),
      detail: "Unresolved merchant conversations.",
      riskLevel: state.openSupport >= T.supportBacklogHigh ? "medium" : "low",
      href: "/admin/messages",
      cta: "Open inbox",
      evidence: support.evidence,
      ruleId: support.ruleId,
      confidence: support.confidence,
    });
  }

  if (state.funnel.noProducts > 20) {
    risks.push({
      id: "risk-activation-empty",
      category: "Activation",
      title: "Stores with no products",
      metric: String(state.funnel.noProducts),
      detail: "Large empty-store backlog slows platform GMV growth.",
      riskLevel: state.funnel.noProducts >= 50 ? "medium" : "low",
      href: "/admin/activation?stage=empty",
      cta: "Open activation",
      evidence: [
        {
          label: "funnel.noProducts",
          value: state.funnel.noProducts,
          source: "activation.funnel",
        },
      ],
      ruleId: "activation.funnel.noProducts > 20",
      confidence: 0.9,
    });
  }

  return risks;
}
