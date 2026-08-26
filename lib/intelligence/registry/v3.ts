import type { PlatformState } from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_RULES as BASE_RULES } from "@/lib/intelligence/registry/rules";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

export type RuleCategory =
  | "TEMPORAL"
  | "EVENT"
  | "JOURNEY"
  | "BOTTLENECK"
  | "CAUSAL"
  | "RISK"
  | "OPPORTUNITY"
  | "FORECAST"
  | "ANOMALY"
  | "INTERVENTION"
  | "OUTCOME"
  | "OPERATIONS"
  | "ACTIVATION"
  | "REVENUE"
  | "SUPPORT"
  | "TECHNICAL";

export type RegistryRuleV3 = {
  ruleId: string;
  category: RuleCategory;
  description: string;
  inputs: string[];
  thresholds: Record<string, number | boolean>;
  evaluate: (state: PlatformState) => boolean;
  confidence: number;
  affectedDimensions: string[];
  recommendedActions: string[];
};

function mapBaseCategory(cat: string): RuleCategory {
  const c = cat.toUpperCase();
  if (c === "OPERATIONS") return "OPERATIONS";
  if (c === "ACTIVATION") return "ACTIVATION";
  if (c === "REVENUE") return "REVENUE";
  if (c === "SUPPORT") return "SUPPORT";
  if (c === "TECHNICAL") return "TECHNICAL";
  return "BOTTLENECK";
}

/** Expanded central registry — V3 */
export const INTELLIGENCE_RULES_V3: RegistryRuleV3[] = [
  ...BASE_RULES.map((r) => ({
    ruleId: r.id,
    category: mapBaseCategory(r.category),
    description: r.description,
    inputs: ["platformState"],
    thresholds: {} as Record<string, number | boolean>,
    evaluate: r.evaluate,
    confidence: 0.9,
    affectedDimensions: [r.category],
    recommendedActions: [] as string[],
  })),
  {
    ruleId: "CAUSAL_FIRST_SALE_DOMAIN_FRICTION",
    category: "CAUSAL",
    description:
      "Missing custom domains may contribute to first-sale friction.",
    inputs: ["firstSaleCount", "noCustomDomain", "firstSaleHighIntent"],
    thresholds: {},
    evaluate: (s) =>
      s.firstSaleCount > 0 && s.firstSaleBottlenecks.noCustomDomain > 0,
    confidence: 0.78,
    affectedDimensions: ["activation", "technical"],
    recommendedActions: ["/admin/activation?stage=listed"],
  },
  {
    ruleId: "CAUSAL_OPERATIONAL_TRUST_RISK",
    category: "CAUSAL",
    description: "COD backlog + support load may compound trust risk.",
    inputs: ["pendingRealOrders", "openSupport"],
    thresholds: {},
    evaluate: (s) => s.pendingRealOrders > 0 && s.openSupport > 0,
    confidence: 0.8,
    affectedDimensions: ["operations", "support"],
    recommendedActions: ["/admin/payments?focus=pending"],
  },
  {
    ruleId: "ANOMALY_SPIKE",
    category: "ANOMALY",
    description: "Metric exceeded percentage-change anomaly threshold.",
    inputs: ["temporal.deltaPct"],
    thresholds: { pctChangeThreshold: 50 },
    evaluate: (s) => Math.abs(s.revenueChange7d) >= 50,
    confidence: 0.7,
    affectedDimensions: ["revenue"],
    recommendedActions: ["/admin/analytics?range=7"],
  },
  {
    ruleId: "ANOMALY_COD_BACKLOG_ACCEL",
    category: "ANOMALY",
    description: "Pending COD exceeds critical threshold.",
    inputs: ["pendingRealOrders"],
    thresholds: { pendingOrdersCritical: T.pendingOrdersCritical },
    evaluate: (s) => s.pendingRealOrders >= T.pendingOrdersCritical,
    confidence: 1,
    affectedDimensions: ["operations"],
    recommendedActions: ["/admin/payments?focus=pending"],
  },
  {
    ruleId: "INTERVENTION_COD_VERIFICATION",
    category: "INTERVENTION",
    description: "Recommend clearing pending COD queue.",
    inputs: ["pendingRealOrders"],
    thresholds: {},
    evaluate: (s) => s.pendingRealOrders > 0,
    confidence: 1,
    affectedDimensions: ["operations"],
    recommendedActions: ["/admin/payments?focus=pending"],
  },
  {
    ruleId: "INTERVENTION_FIRST_SALE_ASSIST",
    category: "INTERVENTION",
    description: "Recommend first-sale assistance for catalog-ready merchants.",
    inputs: ["firstSaleCount", "firstSaleHighIntent"],
    thresholds: { firstSalePoolElevated: T.firstSalePoolElevated },
    evaluate: (s) => s.firstSaleCount >= T.firstSalePoolElevated,
    confidence: 0.85,
    affectedDimensions: ["activation"],
    recommendedActions: ["/admin/activation?stage=listed"],
  },
  {
    ruleId: "SEGMENT_HIGH_INTENT",
    category: "JOURNEY",
    description: "High-intent empty or first-sale merchants.",
    inputs: ["loggedInEmpty7d", "firstSaleHighIntent"],
    thresholds: {},
    evaluate: (s) => s.loggedInEmpty7d + s.firstSaleHighIntent > 0,
    confidence: 0.85,
    affectedDimensions: ["activation"],
    recommendedActions: ["/admin/activation"],
  },
  {
    ruleId: "FORECAST_GMV_TRAJECTORY",
    category: "FORECAST",
    description: "Deterministic GMV trajectory from period comparison.",
    inputs: ["realRevenue7d", "revenueChange7d"],
    thresholds: {},
    evaluate: (s) => s.realRevenue7d > 0 || s.revenueChange7d !== 0,
    confidence: 0.7,
    affectedDimensions: ["revenue"],
    recommendedActions: ["/admin/analytics?range=7"],
  },
];

export function evaluateRulesV3(state: PlatformState): {
  evaluated: number;
  fired: string[];
  results: { ruleId: string; fired: boolean; category: string }[];
} {
  const results = INTELLIGENCE_RULES_V3.map((r) => {
    let fired = false;
    try {
      fired = r.evaluate(state);
    } catch {
      fired = false;
    }
    return { ruleId: r.ruleId, fired, category: r.category };
  });
  return {
    evaluated: results.length,
    fired: results.filter((r) => r.fired).map((r) => r.ruleId),
    results,
  };
}
