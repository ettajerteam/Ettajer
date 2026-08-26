import type { Evidence, PlatformState } from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

export type CausalHypothesis = {
  id: string;
  ruleId: string;
  title: string;
  /** Soft language — never claims absolute causation */
  hypothesis: string;
  evidence: Evidence[];
  evidenceLines: string[];
  confidence: number;
  affectedCount: number;
  dimensions: string[];
  severity: "critical" | "high" | "medium" | "low";
  recommendedAction: { label: string; href: string };
  explanation: string;
};

function causalConfidence(signalCount: number, sampleSize: number): number {
  let c = C.causal.baseTwoSignals + Math.max(0, signalCount - 2) * C.causal.perExtraSignal;
  if (sampleSize < C.causal.minSampleForFullConfidence) {
    c -= C.causal.smallSamplePenalty;
  }
  return Math.max(0.4, Math.min(C.causal.max, Math.round(c * 100) / 100));
}

/**
 * Deterministic causal hypotheses — heuristic/corroborative only.
 * Language: "may contribute", "consistent with", "likely contributing factor".
 */
export function buildCausalHypotheses(
  state: PlatformState
): CausalHypothesis[] {
  const out: CausalHypothesis[] = [];

  if (
    state.firstSaleCount > 0 &&
    state.firstSaleBottlenecks.noCustomDomain > 0
  ) {
    const sample = state.firstSaleCount;
    const noDomain = state.firstSaleBottlenecks.noCustomDomain;
    const highIntent = state.firstSaleHighIntent;
    const signals =
      2 + (highIntent > 0 ? 1 : 0) + (state.liveStores > 0 ? 1 : 0);
    out.push({
      id: "causal-first-sale-domain",
      ruleId: "CAUSAL_FIRST_SALE_DOMAIN_FRICTION",
      title: "Domain friction may contribute to first-sale gap",
      hypothesis:
        "Missing healthy custom domains may be contributing to first-sale friction.",
      evidence: [
        {
          label: "firstSaleCount",
          value: sample,
          source: "activation.funnel",
        },
        {
          label: "noCustomDomain",
          value: noDomain,
          source: "store.settings",
        },
        {
          label: "highIntent",
          value: highIntent,
          source: "activation.temperature",
        },
        {
          label: "liveStores",
          value: state.liveStores,
          source: "platform.overview",
        },
      ],
      evidenceLines: [
        `${sample} merchants have products but zero real orders`,
        `${noDomain} of those merchants have no custom domain`,
        highIntent > 0
          ? `${highIntent} show recent activity`
          : "Recent activity among first-sale pool is limited",
      ],
      confidence: causalConfidence(signals, sample),
      affectedCount: noDomain,
      dimensions: ["activation", "technical"],
      severity: sample >= 20 ? "high" : "medium",
      recommendedAction: {
        label: "Diagnose domains / first-sale assist",
        href: "/admin/activation?stage=listed",
      },
      explanation:
        "Consistent with FIRST_SALE_FRICTION: catalog-ready merchants without branded domains may struggle to share storefronts confidently.",
    });
  }

  if (
    state.firstSaleCount > 0 &&
    state.firstSaleBottlenecks.noCodConfigured > 0
  ) {
    const n = state.firstSaleBottlenecks.noCodConfigured;
    out.push({
      id: "causal-first-sale-cod",
      ruleId: "CAUSAL_FIRST_SALE_COD_FRICTION",
      title: "Missing COD may contribute to checkout friction",
      hypothesis:
        "Incomplete COD configuration may be a contributing factor to zero first orders.",
      evidence: [
        {
          label: "noCodConfigured",
          value: n,
          source: "store.settings",
        },
        {
          label: "firstSaleCount",
          value: state.firstSaleCount,
          source: "activation.funnel",
        },
      ],
      evidenceLines: [
        `${state.firstSaleCount} stores have products but zero real orders`,
        `${n} lack COD configuration`,
      ],
      confidence: causalConfidence(2, n),
      affectedCount: n,
      dimensions: ["activation", "operations"],
      severity: "medium",
      recommendedAction: {
        label: "Review COD readiness",
        href: "/admin/activation?stage=listed",
      },
      explanation:
        "Likely contributing factor when catalogs are live but checkout COD is not configured.",
    });
  }

  if (state.pendingRealOrders > 0 && state.openSupport > 0) {
    out.push({
      id: "causal-ops-trust",
      ruleId: "CAUSAL_OPERATIONAL_TRUST_RISK",
      title: "COD backlog + support load may compound trust risk",
      hypothesis:
        "Pending COD verification combined with unanswered support is consistent with elevated operational trust risk.",
      evidence: [
        {
          label: "pendingRealOrders",
          value: state.pendingRealOrders,
          source: "platform.overview",
        },
        {
          label: "openSupport",
          value: state.openSupport,
          source: "support.inbox",
        },
      ],
      evidenceLines: [
        `${state.pendingRealOrders} COD orders pending verification`,
        `${state.openSupport} support thread(s) unanswered`,
      ],
      confidence: causalConfidence(2, state.pendingRealOrders),
      affectedCount: state.pendingRealOrders + state.openSupport,
      dimensions: ["operations", "support"],
      severity: "high",
      recommendedAction: {
        label: "Clear COD then support",
        href: "/admin/payments?focus=pending",
      },
      explanation:
        "May contribute to merchant distrust if both queues remain elevated.",
    });
  }

  if (
    state.revenueChange7d >= 20 &&
    state.top2SharePct / 100 >= 0.6
  ) {
    out.push({
      id: "causal-growth-concentration",
      ruleId: "CAUSAL_GROWTH_CONCENTRATION_RISK",
      title: "Strong GMV growth may be concentrated",
      hypothesis:
        "Positive GMV momentum with high top-2 share is consistent with concentrated growth rather than broad activation.",
      evidence: [
        {
          label: "revenueChange7d",
          value: state.revenueChange7d,
          source: "platform.analytics",
        },
        {
          label: "top2SharePct",
          value: state.top2SharePct,
          source: "platform.gmv",
        },
      ],
      evidenceLines: [
        `Real GMV change ${state.revenueChange7d}% / 7d`,
        `Top-2 merchants = ${state.top2SharePct}% of tracked GMV`,
      ],
      confidence: causalConfidence(2, 2),
      affectedCount: 2,
      dimensions: ["revenue", "activation"],
      severity: "medium",
      recommendedAction: {
        label: "Grow mid-tier first sales",
        href: "/admin/activation?stage=listed",
      },
      explanation:
        "Likely contributing factor to REVENUE_CONCENTRATION_RISK while momentum remains strong.",
    });
  }

  return out;
}
