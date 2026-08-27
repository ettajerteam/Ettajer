/**
 * Rule-based confidence adjustment — not ML.
 */
import { MEMORY_THRESHOLDS as T } from "@/lib/intelligence/memory/config";
import { roundConfidence } from "@/lib/intelligence/memory/outcome-history";
import type {
  ConfidenceAdjustment,
  ReliabilityAssessment,
} from "@/lib/intelligence/memory/v7-types";

export function adjustConfidence(input: {
  confidenceBefore: number;
  reliability: ReliabilityAssessment;
  recentFailureStreak?: number;
  predictionDegraded?: boolean;
}): ConfidenceAdjustment {
  const before = roundConfidence(input.confidenceBefore);

  if (input.reliability.evidenceStrength === "INSUFFICIENT") {
    return {
      before,
      after: before,
      delta: 0,
      reason:
        "No sufficient measured historical outcomes — confidence unchanged.",
      applied: false,
    };
  }

  let delta = 0;
  const reasons: string[] = [];

  if (input.reliability.band === "HIGH") {
    delta += T.boostPerStrongHistory;
    reasons.push(`HIGH reliability → +${T.boostPerStrongHistory}`);
  } else if (input.reliability.band === "MEDIUM") {
    delta += T.boostPerModerateHistory;
    reasons.push(`MEDIUM reliability → +${T.boostPerModerateHistory}`);
  } else if (input.reliability.band === "LOW") {
    delta -= T.penaltyPerFailurePattern;
    reasons.push(`LOW reliability → -${T.penaltyPerFailurePattern}`);
  }

  if ((input.recentFailureStreak ?? 0) >= 2) {
    delta -= T.penaltyPerFailurePattern;
    reasons.push(
      `recentFailureStreak=${input.recentFailureStreak} → -${T.penaltyPerFailurePattern}`
    );
  }

  if (input.predictionDegraded) {
    delta -= T.penaltyPerMissPattern;
    reasons.push(`prediction accuracy degraded → -${T.penaltyPerMissPattern}`);
  }

  const after = roundConfidence(before + delta);
  const appliedDelta = Math.round((after - before) * 100) / 100;

  return {
    before,
    after,
    delta: appliedDelta,
    reason: reasons.join("; ") || "No adjustment.",
    applied: appliedDelta !== 0,
  };
}

export function confidenceBand(
  confidence: number
): "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT" {
  if (!Number.isFinite(confidence)) return "INSUFFICIENT";
  if (confidence >= 0.8) return "HIGH";
  if (confidence >= 0.55) return "MEDIUM";
  if (confidence >= T.minConfidence) return "LOW";
  return "INSUFFICIENT";
}
