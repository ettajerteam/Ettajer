/**
 * Attach V5 scenario outcomes to decision candidates.
 */
import type { ScenarioOutcome } from "@/lib/intelligence/scenarios/simulate";
import type {
  DecisionCandidate,
  ScenarioSupport,
  ScenarioSupportStrength,
} from "@/lib/intelligence/decisions/types";
import { DECISION_THRESHOLDS } from "@/lib/intelligence/decisions/config";

const ACTION_TO_INTERVENTION: Record<string, string[]> = {
  REVIEW_PENDING_COD: ["COD_VERIFICATION"],
  DIAGNOSE_DNS: ["DNS_DIAGNOSIS", "FIX_DOMAIN"],
  ANSWER_SUPPORT: ["SUPPORT_ESCALATION"],
  PRIORITIZE_FIRST_SALE: ["FIRST_SALE_ASSIST"],
  ACTIVATE_MID_TIER_MERCHANTS: ["ACTIVATION_OUTREACH"],
  NO_ACTION: ["NO_ACTION"],
};

function strengthFrom(
  confidence: number,
  impact: number
): ScenarioSupportStrength {
  const v = confidence * Math.max(0.2, impact);
  if (v >= DECISION_THRESHOLDS.scenarioStrong) return "STRONG";
  if (v >= DECISION_THRESHOLDS.scenarioModerate) return "MODERATE";
  if (v >= DECISION_THRESHOLDS.scenarioWeak) return "WEAK";
  return "NONE";
}

function uncertaintyFrom(confidence: number): ScenarioSupport["uncertainty"] {
  if (confidence >= 0.7) return "LOW";
  if (confidence >= 0.45) return "MEDIUM";
  return "HIGH";
}

export function attachScenarioSupport(
  candidate: DecisionCandidate,
  scenarios: ScenarioOutcome[]
): ScenarioSupport {
  if (candidate.id === "REVIEW_REVENUE_CONCENTRATION") {
    return {
      strength: "UNAVAILABLE",
      scenarioId: null,
      baseline: {},
      expectedAfter: {},
      expectedDirection: null,
      uncertainty: "HIGH",
      scenarioConfidence: 0,
      assumptions: [
        "INSUFFICIENT EVIDENCE for precise GMV redistribution without intervention history.",
      ],
      tradeoffs: ["LONG_TERM strategic risk vs short-term ops"],
      note: "No deterministic clearance scenario for concentration — opportunity/risk framing only.",
    };
  }

  const keys = ACTION_TO_INTERVENTION[candidate.id] ?? [];
  let match: ScenarioOutcome | undefined;

  if (candidate.id === "NO_ACTION") {
    match = scenarios.find((s) => s.kind === "NO_ACTION");
  } else {
    match = scenarios.find(
      (s) =>
        s.intervention != null &&
        keys.includes(s.intervention) &&
        s.blockedFactors.length === 0
    );
    if (!match) {
      match = scenarios.find(
        (s) => s.intervention != null && keys.includes(s.intervention)
      );
    }
    // COD+SUPPORT combo preferred for COD when present
    if (candidate.id === "REVIEW_PENDING_COD") {
      const combo = scenarios.find((s) => s.scenarioId === "sc-cod-plus-support");
      if (combo && combo.expectedImpact >= (match?.expectedImpact ?? 0)) {
        match = combo;
      }
    }
  }

  if (!match) {
    return {
      strength: "UNAVAILABLE",
      scenarioId: null,
      baseline: {},
      expectedAfter: {},
      expectedDirection: null,
      uncertainty: "HIGH",
      scenarioConfidence: 0,
      assumptions: [],
      tradeoffs: [],
      note: "No matching V5 scenario for this candidate.",
    };
  }

  const baseline: Record<string, number> = {};
  const expectedAfter: Record<string, [number, number]> = {};
  let direction: string | null = null;
  for (const [k, v] of Object.entries(match.metrics)) {
    baseline[k] = v.before;
    expectedAfter[k] = v.expectedAfter;
    direction = direction ?? `${k}:${v.direction}`;
  }

  const strength = strengthFrom(match.confidence, match.expectedImpact);

  return {
    strength,
    scenarioId: match.scenarioId,
    baseline,
    expectedAfter,
    expectedDirection: direction,
    uncertainty: uncertaintyFrom(match.confidence),
    scenarioConfidence: match.confidence,
    assumptions: [...match.assumptions],
    tradeoffs: [
      ...match.cascadingEffects.slice(0, 3),
      `timeToEffect=${match.timeToEffect}`,
    ],
    note: `Matched V5 scenario ${match.label} (${match.kind}) — SIMULATED ranges only.`,
  };
}
