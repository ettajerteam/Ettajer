/**
 * Scenario comparison + trade-off engine (deterministic).
 */
import type { ScenarioOutcome } from "@/lib/intelligence/scenarios/simulate";
import {
  getScenarioDefinition,
  type HorizonTradeoff,
  type RegisteredScenario,
} from "@/lib/intelligence/scenarios/registry";
import { calculateInterventionAdvantage } from "@/lib/intelligence/scenarios/rank";

export type ScenarioComparisonRow = {
  scenarioId: string;
  label: string;
  expectedImpact: number;
  operationalRisk: number;
  revenueImpact: number;
  activationImpact: number;
  reversibility: number;
  actionability: number;
  confidence: number;
  timeToImpact: string;
  horizon: HorizonTradeoff;
  downside: string;
  assumptions: string[];
  score: number;
  whySelected: string | null;
  whyNot: string | null;
};

export type ScenarioComparisonResult = {
  rows: ScenarioComparisonRow[];
  top: ScenarioComparisonRow | null;
  tradeoffs: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  kind: "SIMULATED";
};

function defFor(outcome: ScenarioOutcome): RegisteredScenario | null {
  if (outcome.kind === "NO_ACTION") return getScenarioDefinition("NO_ACTION");
  if (outcome.intervention === "COD_VERIFICATION")
    return getScenarioDefinition("COD_VERIFICATION_CLEARANCE");
  if (
    outcome.intervention === "DNS_DIAGNOSIS" ||
    outcome.intervention === "FIX_DOMAIN"
  )
    return getScenarioDefinition("DNS_FAILURE_REMEDIATION");
  if (outcome.intervention === "SUPPORT_ESCALATION")
    return getScenarioDefinition("SUPPORT_BACKLOG_REDUCTION");
  if (outcome.intervention === "FIRST_SALE_ASSIST")
    return getScenarioDefinition("FIRST_SALE_ACTIVATION");
  if (outcome.intervention === "ACTIVATION_OUTREACH")
    return getScenarioDefinition("ACTIVATION_OUTREACH");
  if (outcome.intervention === "MERCHANT_ONBOARDING")
    return getScenarioDefinition("MERCHANT_ONBOARDING");
  return null;
}

export function compareScenarios(
  outcomes: ScenarioOutcome[]
): ScenarioComparisonResult {
  const noAction = outcomes.find((o) => o.kind === "NO_ACTION");
  const rows: ScenarioComparisonRow[] = outcomes.map((o) => {
    const def = defFor(o);
    const adv = noAction
      ? calculateInterventionAdvantage(o, noAction).advantage
      : o.expectedImpact;
    const reversibility = def?.reversibility ?? 0.5;
    const actionability =
      o.blockedFactors.length > 0 ? 0.2 : def?.actionability ?? 0.5;
    const score = Math.round(
      o.expectedImpact *
        40 +
        Math.max(0, adv) * 25 +
        o.confidence * 20 +
        reversibility * 10 +
        actionability * 15 -
        o.expectedRisk * 20
    );
    return {
      scenarioId: o.scenarioId,
      label: def?.scenarioId ?? o.label,
      expectedImpact: o.expectedImpact,
      operationalRisk: o.expectedRisk,
      revenueImpact:
        o.intervention === "FIRST_SALE_ASSIST" ||
        o.label.includes("GROWTH")
          ? 0.5
          : 0.15,
      activationImpact:
        o.intervention?.includes("ACTIVATION") ||
        o.intervention === "FIRST_SALE_ASSIST"
          ? 0.6
          : 0.1,
      reversibility,
      actionability,
      confidence: o.confidence,
      timeToImpact: def?.timeToImpact ?? o.timeToEffect,
      horizon: def?.horizon ?? "SHORT_TERM",
      downside:
        o.blockedFactors[0] ??
        def?.limitations[0] ??
        "See assumptions and uncertainty range.",
      assumptions: o.assumptions,
      score,
      whySelected: null,
      whyNot: null,
    };
  });

  rows.sort((a, b) => b.score - a.score);
  const top =
    rows.find((r) => r.scenarioId !== "sc-no-action" && r.label !== "NO_ACTION") ??
    rows[0] ??
    null;
  if (top) {
    top.whySelected = `Highest transparent score ${top.score} (impact×confidence×reversibility×actionability with advantage vs no-action). Horizon=${top.horizon}; timeToImpact=${top.timeToImpact}.`;
  }
  for (const r of rows) {
    if (top && r.scenarioId !== top.scenarioId) {
      r.whyNot = `Score ${r.score} < top ${top.score}. Trade-off: ${r.horizon} vs ${top.horizon}. ${r.downside}`;
    }
  }

  return {
    rows,
    top,
    tradeoffs: {
      shortTerm: rows
        .filter((r) => r.horizon === "SHORT_TERM")
        .map((r) => `${r.label}: impact=${r.expectedImpact}`),
      mediumTerm: rows
        .filter((r) => r.horizon === "MEDIUM_TERM")
        .map((r) => `${r.label}: impact=${r.expectedImpact}`),
      longTerm: rows
        .filter((r) => r.horizon === "LONG_TERM")
        .map((r) => `${r.label}: impact=${r.expectedImpact}`),
    },
    kind: "SIMULATED",
  };
}
