/**
 * Intervention advantage + scenario ranking → TOP_SCENARIO.
 */
import type { ScoreComponents } from "@/lib/intelligence/decision/score-components";
import { buildScoreComponents, scoreDecisionV4 } from "@/lib/intelligence/decision/score-components";
import type { ScenarioOutcome } from "@/lib/intelligence/scenarios/simulate";

export type InterventionAdvantage = {
  scenarioId: string;
  intervention: string | null;
  advantage: number;
  riskReduction: number;
  timeSavedHint: string;
  merchantImpact: number;
  operationalImpact: number;
  formula: string;
  evidence: string[];
};

export function calculateInterventionAdvantage(
  scenario: ScenarioOutcome,
  noAction: ScenarioOutcome
): InterventionAdvantage {
  const noImpact = noAction.expectedImpact;
  const impact = scenario.expectedImpact;
  const advantage = Math.round((impact - noImpact) * 1000) / 1000;
  const riskReduction =
    Math.round((noAction.expectedRisk - scenario.expectedRisk) * 1000) / 1000;
  return {
    scenarioId: scenario.scenarioId,
    intervention: scenario.intervention,
    advantage,
    riskReduction,
    timeSavedHint: scenario.timeToEffect,
    merchantImpact:
      scenario.intervention?.includes("FIRST_SALE") ||
      scenario.intervention?.includes("ACTIVATION")
        ? 0.5
        : 0.2,
    operationalImpact:
      scenario.intervention === "COD_VERIFICATION" ||
      scenario.intervention === "SUPPORT_ESCALATION"
        ? 0.8
        : 0.3,
    formula: "advantage = scenario.expectedImpact − noAction.expectedImpact",
    evidence: [
      `scenarioImpact=${impact}`,
      `noActionImpact=${noImpact}`,
      `riskReduction=${riskReduction}`,
    ],
  };
}

export type RankedScenario = {
  rank: number;
  scenario: ScenarioOutcome;
  score: number;
  scoreComponents: ScoreComponents & {
    interventionAdvantage: number;
    riskReduction: number;
  };
  advantage: InterventionAdvantage;
  whyChosen: string;
  whyNotChosen: string | null;
};

export function rankScenarios(input: {
  scenarios: ScenarioOutcome[];
  urgencies?: Record<string, number>;
}): {
  ranked: RankedScenario[];
  topScenario: RankedScenario | null;
  noAction: ScenarioOutcome | null;
} {
  const noAction =
    input.scenarios.find((s) => s.kind === "NO_ACTION") ?? null;
  if (!noAction) {
    return { ranked: [], topScenario: null, noAction: null };
  }

  const actionable = input.scenarios.filter(
    (s) => s.kind !== "NO_ACTION" && s.kind !== "BASELINE"
  );

  const ranked: RankedScenario[] = actionable
    .map((scenario) => {
      const advantage = calculateInterventionAdvantage(scenario, noAction);
      const blockedPenalty = scenario.blockedFactors.length > 0 ? 0.3 : 1;
      const base = buildScoreComponents({
        impact: scenario.expectedImpact,
        urgency:
          input.urgencies?.[scenario.intervention ?? ""] ??
          (scenario.intervention === "COD_VERIFICATION" ? 1 : 0.6),
        confidence: scenario.confidence,
        reversibility:
          scenario.intervention === "COD_VERIFICATION" ||
          scenario.intervention === "SUPPORT_ESCALATION"
            ? 0.95
            : 0.6,
        actionability: scenario.blockedFactors.length ? 0.3 : 0.9,
        historicalEffectiveness: scenario.confidence,
        timeSensitivity:
          scenario.intervention === "COD_VERIFICATION" ? 0.95 : 0.55,
        evidenceQuality: scenario.confidence,
      });
      const withExtra = {
        ...base,
        interventionAdvantage: Math.max(0, Math.min(1, (advantage.advantage + 1) / 2)),
        riskReduction: Math.max(0, Math.min(1, advantage.riskReduction + 0.5)),
      };
      const scored = scoreDecisionV4(base);
      const score = Math.round(
        scored.score *
          blockedPenalty *
          (0.85 + 0.15 * withExtra.interventionAdvantage)
      );
      return {
        rank: 0,
        scenario,
        score,
        scoreComponents: withExtra,
        advantage,
        whyChosen: "",
        whyNotChosen: scenario.whyNotChosen,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  const top = ranked[0] ?? null;
  if (top) {
    top.whyChosen = [
      "No-action scenario predicts weaker or negative trajectory.",
      `Historical/deterministic support: ${top.scenario.historicalSupport}`,
      `Intervention advantage=${top.advantage.advantage}`,
      `Blocked factors=${top.scenario.blockedFactors.length}`,
      `Score=${top.score}`,
    ].join(" ");
    top.scenario = {
      ...top.scenario,
      whyChosen: top.whyChosen,
    };
  }

  for (const r of ranked.slice(1)) {
    r.whyNotChosen =
      r.scenario.blockedFactors.length > 0
        ? r.scenario.whyNotChosen ??
          `Blocked by: ${r.scenario.blockedFactors.join(", ")}.`
        : `Lower combined score (${r.score}) than top scenario (${top?.score}).`;
    r.scenario = { ...r.scenario, whyNotChosen: r.whyNotChosen };
  }

  return { ranked, topScenario: top, noAction };
}
