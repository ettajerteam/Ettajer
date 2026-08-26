/**
 * Multi-strategy comparison — ranges only, no fake point forecasts.
 */
import type {
  BestStrategy,
  StrategyOption,
} from "@/lib/intelligence/os/types";
import type { PlatformState } from "@/lib/intelligence/engine-types";

export function buildStrategyPortfolio(input: {
  state: PlatformState;
  topScenarioLabel: string | null;
}): { strategies: StrategyOption[]; best: BestStrategy } {
  const s = input.state;
  const strategies: StrategyOption[] = [
    {
      strategyId: "COD_FIRST",
      label: "COD verification first",
      primaryInterventions: ["COD_VERIFICATION", "SUPPORT_ESCALATION"],
      expectedImpact: impactRange(s.pendingRealOrders, 0.4, 0.7),
      risk: s.pendingRealOrders >= 10 ? "HIGH" : "MEDIUM",
      confidence: s.pendingRealOrders > 0 ? 0.75 : 0.2,
      timeHorizon: {
        shortTerm: "Reduce pending COD backlog",
        mediumTerm: "Stabilize fulfillment trust",
        longTerm: "Support repeat-order conditions",
      },
      dependencies: [],
      resourceUsage: 3,
      uncertainty: s.pendingRealOrders > 0 ? "MODERATE" : "HIGH",
      why: [
        `pendingRealOrders=${s.pendingRealOrders}`,
        "Operational backlog blocks trust loop.",
      ],
    },
    {
      strategyId: "DNS_FIRST",
      label: "DNS diagnosis first",
      primaryInterventions: ["DNS_DIAGNOSIS", "FIRST_SALE_ASSISTANCE"],
      expectedImpact: impactRange(s.domainFailing, 0.3, 0.6),
      risk: "MEDIUM",
      confidence: s.domainFailing > 0 ? 0.7 : 0.2,
      timeHorizon: {
        shortTerm: "Restore storefront accessibility",
        mediumTerm: "Enable first-sale conversion",
        longTerm: "Sustain merchant growth path",
      },
      dependencies: ["DNS_DIAGNOSIS ENABLES FIRST_SALE_ASSISTANCE"],
      resourceUsage: 2,
      uncertainty: "MODERATE",
      why: [`domainFailing=${s.domainFailing}`],
    },
    {
      strategyId: "ACTIVATION_FIRST",
      label: "Activation first",
      primaryInterventions: ["FIRST_SALE_ASSISTANCE", "ACTIVATION_OUTREACH"],
      expectedImpact: impactRange(s.firstSaleHighIntent, 0.2, 0.5),
      risk: "MEDIUM",
      confidence: s.firstSaleHighIntent > 0 ? 0.65 : 0.25,
      timeHorizon: {
        shortTerm: "Assist high-intent merchants",
        mediumTerm: "Increase first-sale conversion",
        longTerm: "Broaden revenue base",
      },
      dependencies: ["Prefer after DNS if failing"],
      resourceUsage: 4,
      uncertainty: "HIGH",
      why: [`firstSaleHighIntent=${s.firstSaleHighIntent}`],
    },
    {
      strategyId: "SUPPORT_FIRST",
      label: "Support first",
      primaryInterventions: ["SUPPORT_ESCALATION"],
      expectedImpact: impactRange(s.openSupport, 0.2, 0.45),
      risk: "LOW",
      confidence: s.openSupport > 0 ? 0.7 : 0.2,
      timeHorizon: {
        shortTerm: "Clear support backlog",
        mediumTerm: "Restore merchant trust",
        longTerm: "Protect retention",
      },
      dependencies: [],
      resourceUsage: 1,
      uncertainty: "LOW",
      why: [`openSupport=${s.openSupport}`],
    },
  ];

  // Score = confidence * midpoint impact / risk penalty / uncertainty
  const ranked = [...strategies].sort((a, b) => {
    const sa = strategyScore(a);
    const sb = strategyScore(b);
    return sb - sa || a.strategyId.localeCompare(b.strategyId);
  });

  const bestOpt = ranked[0]!;
  const best: BestStrategy = {
    strategyId: bestOpt.strategyId,
    label: bestOpt.label,
    whyThisStrategy: [
      ...bestOpt.why,
      `Expected impact range ${bestOpt.expectedImpact[0]}–${bestOpt.expectedImpact[1]}`,
      `Confidence ${bestOpt.confidence}`,
      input.topScenarioLabel
        ? `Aligned with TOP_SCENARIO=${input.topScenarioLabel}`
        : "No TOP_SCENARIO alignment available",
    ],
    alternativesRejected: ranked.slice(1).map((alt) => ({
      strategyId: alt.strategyId,
      reasons: [
        `Lower composite score than ${bestOpt.strategyId}`,
        `confidence=${alt.confidence} uncertainty=${alt.uncertainty}`,
      ],
    })),
  };

  return { strategies: ranked, best };
}

function impactRange(
  driver: number,
  loFactor: number,
  hiFactor: number
): [number, number] {
  const base = Math.min(100, Math.max(0, driver));
  return [
    Math.round(base * loFactor * 10) / 10,
    Math.round(base * hiFactor * 10) / 10,
  ];
}

function strategyScore(s: StrategyOption): number {
  const mid = (s.expectedImpact[0] + s.expectedImpact[1]) / 2;
  const riskPen =
    s.risk === "CRITICAL" ? 0.5 : s.risk === "HIGH" ? 0.7 : s.risk === "MEDIUM" ? 0.85 : 1;
  const uncPen =
    s.uncertainty === "HIGH" ? 0.7 : s.uncertainty === "MODERATE" ? 0.85 : 1;
  return mid * s.confidence * riskPen * uncPen;
}
