/**
 * Deterministic decision scoring — configurable weights, normalized dimensions.
 */
import {
  DECISION_THRESHOLDS,
  DECISION_WEIGHTS as W,
} from "@/lib/intelligence/decisions/config";
import type {
  DecisionCandidate,
  ScoredDecisionCandidate,
  ScenarioSupportStrength,
} from "@/lib/intelligence/decisions/types";
import { isBlocked } from "@/lib/intelligence/decisions/constraints";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

function scenarioSupportPoints(strength: ScenarioSupportStrength): number {
  switch (strength) {
    case "STRONG":
      return 1;
    case "MODERATE":
      return 0.65;
    case "WEAK":
      return 0.35;
    case "NONE":
      return 0.1;
    case "UNAVAILABLE":
      return 0;
    default:
      return 0;
  }
}

/**
 * DecisionScore =
 *   weightedImpact + weightedUrgency + weightedConfidence
 *   + weightedReversibility + weightedActionability + scenarioSupport
 *   - riskPenalty - costPenalty - delayPenalty
 */
export function scoreDecisionCandidate(
  candidate: DecisionCandidate
): ScoredDecisionCandidate {
  const impact = clamp01(candidate.expectedImpact);
  const urgency = clamp01(candidate.urgency);
  const confidence = clamp01(candidate.confidence);
  const reversibility = clamp01(candidate.reversibility);
  const actionability = clamp01(candidate.actionability);
  const risk = clamp01(candidate.risk);
  const cost = clamp01(candidate.cost);
  const delay = clamp01(
    DECISION_THRESHOLDS.delayPenaltyByBand[candidate.timeToImpact] ?? 0.5
  );
  const scenario = scenarioSupportPoints(candidate.scenarioSupport.strength);

  const weightedImpact = impact * W.impact;
  const weightedUrgency = urgency * W.urgency;
  const weightedConfidence = confidence * W.confidence;
  const weightedReversibility = reversibility * W.reversibility;
  const weightedActionability = actionability * W.actionability;
  const scenarioSupport = scenario * W.scenarioSupport;
  const riskPenalty = risk * W.riskPenalty;
  const costPenalty = cost * W.costPenalty;
  const delayPenalty = delay * W.delayPenalty;

  let score =
    weightedImpact +
    weightedUrgency +
    weightedConfidence +
    weightedReversibility +
    weightedActionability +
    scenarioSupport -
    riskPenalty -
    costPenalty -
    delayPenalty;

  const blocked = isBlocked(candidate.constraints);
  if (blocked) score = Math.min(score, -50);

  // NO_ACTION: low positive when nothing else is urgent
  if (candidate.id === "NO_ACTION") {
    score = Math.round(
      (weightedConfidence + weightedReversibility - riskPenalty) * 10
    ) / 10;
  }

  score = Math.round(score * 100) / 100;

  const formula =
    `impact(${impact})*${W.impact}` +
    `+urgency(${urgency})*${W.urgency}` +
    `+confidence(${confidence})*${W.confidence}` +
    `+rev(${reversibility})*${W.reversibility}` +
    `+act(${actionability})*${W.actionability}` +
    `+scenario(${scenario})*${W.scenarioSupport}` +
    `-risk(${risk})*${W.riskPenalty}` +
    `-cost(${cost})*${W.costPenalty}` +
    `-delay(${delay})*${W.delayPenalty}` +
    (blocked ? ";BLOCKED" : "");

  return {
    ...candidate,
    score,
    blocked,
    scoreBreakdown: {
      weightedImpact: Math.round(weightedImpact * 100) / 100,
      weightedUrgency: Math.round(weightedUrgency * 100) / 100,
      weightedConfidence: Math.round(weightedConfidence * 100) / 100,
      weightedReversibility: Math.round(weightedReversibility * 100) / 100,
      weightedActionability: Math.round(weightedActionability * 100) / 100,
      scenarioSupport: Math.round(scenarioSupport * 100) / 100,
      riskPenalty: Math.round(riskPenalty * 100) / 100,
      costPenalty: Math.round(costPenalty * 100) / 100,
      delayPenalty: Math.round(delayPenalty * 100) / 100,
      formula,
    },
  };
}

export function rankScoredCandidates(
  scored: ScoredDecisionCandidate[]
): ScoredDecisionCandidate[] {
  return [...scored].sort((a, b) => {
    if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
    if (Math.abs(a.score - b.score) > DECISION_THRESHOLDS.tieEpsilon) {
      return b.score - a.score;
    }
    // Tie-break: urgency, then reversibility, then stable id
    if (a.urgency !== b.urgency) return b.urgency - a.urgency;
    if (a.reversibility !== b.reversibility) {
      return b.reversibility - a.reversibility;
    }
    return a.id.localeCompare(b.id);
  });
}

export function selectTopDecisionCandidate(
  ranked: ScoredDecisionCandidate[],
  insufficientEvidence: boolean
): ScoredDecisionCandidate | null {
  if (ranked.length === 0) return null;

  const noAction = ranked.find((c) => c.id === "NO_ACTION") ?? null;

  if (insufficientEvidence && DECISION_THRESHOLDS.insufficientForceNoAction) {
    return noAction ?? ranked[0]!;
  }

  const actionable = ranked.filter((c) => !c.blocked && c.id !== "NO_ACTION");
  if (actionable.length === 0) return noAction ?? ranked[0]!;

  const top = actionable[0]!;
  if (
    noAction &&
    top.score + DECISION_THRESHOLDS.preferActionOverNoAction < noAction.score
  ) {
    return noAction;
  }
  return top;
}
