import type { PlatformState, RiskItem } from "@/lib/intelligence/engine-types";
import type { TemporalMetric } from "@/lib/intelligence/temporal";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";
import { getRisks as getBaseRisks } from "@/lib/intelligence/recommendations/actions";
import type { IntelligenceSignal } from "@/lib/intelligence/engine-types";

/**
 * Proactive risks — can exist before a problem is critical.
 */
export function detectProactiveRisks(
  state: PlatformState,
  signals: IntelligenceSignal[],
  temporal: TemporalMetric[]
): RiskItem[] {
  const risks = getBaseRisks(state, signals);
  const gmv = temporal.find((t) => t.id === "gmv");
  const orders = temporal.find((t) => t.id === "orders");

  // Churn risk: order velocity declining sharply while we still have merchants with orders historically
  if (
    orders &&
    orders.direction === "down" &&
    orders.deltaPct <= -40 &&
    state.funnel.hasOrders > 0
  ) {
    risks.push({
      id: "risk-churn",
      category: "Merchant churn risk",
      title: "Order velocity declining — churn risk",
      metric: `${orders.deltaPct}%`,
      detail:
        "Order volume dropped vs prior window while an activated merchant base exists. Intervene before dormancy.",
      riskLevel: "medium",
      href: "/admin/analytics?range=7",
      cta: "Inspect trends",
      evidence: [
        {
          label: "ordersDeltaPct",
          value: orders.deltaPct,
          source: "temporal.orders",
        },
        {
          label: "hasOrdersStores",
          value: state.funnel.hasOrders,
          source: "activation.funnel",
        },
      ],
      ruleId: "MERCHANT_CHURN_RISK",
      confidence: 0.72,
    });
  }

  if (gmv && gmv.direction === "down" && gmv.deltaPct <= -25) {
    risks.push({
      id: "risk-revenue-decline",
      category: "Revenue decline",
      title: "GMV trajectory declining",
      metric: `${gmv.deltaPct}%`,
      detail: "Real GMV below prior baseline — watch concentration and COD backlog.",
      riskLevel: gmv.deltaPct <= -50 ? "high" : "medium",
      href: "/admin/analytics?range=7",
      cta: "View analytics",
      evidence: [
        { label: "gmvDeltaPct", value: gmv.deltaPct, source: "temporal.gmv" },
      ],
      ruleId: "REVENUE_DECLINE",
      confidence: gmv.confidence,
    });
  }

  // Activation decay risk
  if (
    state.funnel.noProducts > 30 &&
    state.loggedInEmpty7d > 0 &&
    state.loggedInEmpty7d < state.hotEmptyCount
  ) {
    risks.push({
      id: "risk-activation-decay",
      category: "Activation",
      title: "Activation decay risk",
      metric: String(state.funnel.noProducts),
      detail:
        "Large empty-store pool with fewer recent logins than hot count — outreach window may be closing.",
      riskLevel: "medium",
      href: "/admin/activation?stage=empty",
      cta: "Open activation",
      evidence: [
        {
          label: "noProducts",
          value: state.funnel.noProducts,
          source: "activation.funnel",
        },
        {
          label: "loggedInEmpty7d",
          value: state.loggedInEmpty7d,
          source: "activation.gap",
        },
      ],
      ruleId: "ACTIVATION_DECAY",
      confidence: 0.7,
    });
  }

  // Concentration as proactive even if slightly below critical threshold
  if (
    state.top2SharePct / 100 >= T.revenueConcentrationHigh * 0.85 &&
    state.top2SharePct / 100 < T.revenueConcentrationHigh &&
    !risks.some((r) => r.id === "risk-concentration")
  ) {
    risks.push({
      id: "risk-concentration-watch",
      category: "Revenue concentration",
      title: "Approaching concentration threshold",
      metric: `${state.top2SharePct}%`,
      detail: `Top-2 share nearing ${(T.revenueConcentrationHigh * 100).toFixed(0)}% threshold.`,
      riskLevel: "low",
      href: "/admin/analytics?range=30",
      cta: "View merchants",
      evidence: [
        {
          label: "top2SharePct",
          value: state.top2SharePct,
          source: "platform.gmv",
        },
      ],
      ruleId: "GMV_CONCENTRATION_WATCH",
      confidence: 0.8,
    });
  }

  return risks;
}
