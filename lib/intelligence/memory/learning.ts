/**
 * Memory-aware score adjustments — additive to V6 scores.
 * NEVER bypasses BLOCK constraints.
 */
import { MEMORY_THRESHOLDS as T } from "@/lib/intelligence/memory/config";
import type { ScoredDecisionCandidate } from "@/lib/intelligence/decisions/types";
import type { ReliabilityAssessment } from "@/lib/intelligence/memory/v7-types";
import { reliabilityForType } from "@/lib/intelligence/memory/reliability";

export type MemoryScoreAdjustment = {
  decisionType: string;
  historicalReliabilityBonus: number;
  predictionAccuracyBonus: number;
  recentFailurePenalty: number;
  evidencePenalty: number;
  net: number;
  blockedPreserved: boolean;
};

export function computeMemoryScoreAdjustments(input: {
  candidates: ScoredDecisionCandidate[];
  reliability: ReliabilityAssessment[];
}): MemoryScoreAdjustment[] {
  return input.candidates.map((c) => {
    const rel = reliabilityForType(input.reliability, c.id);
    let historicalReliabilityBonus = 0;
    let predictionAccuracyBonus = 0;
    let recentFailurePenalty = 0;
    let evidencePenalty = 0;

    if (rel.evidenceStrength === "INSUFFICIENT") {
      evidencePenalty = T.evidencePenaltyInsufficient * 0; // informational only when empty
    } else if (rel.band === "HIGH") {
      historicalReliabilityBonus = T.historicalReliabilityBonusCap;
      if ((rel.predictionAccuracyGoodShare ?? 0) >= 0.7) {
        predictionAccuracyBonus = T.predictionAccuracyBonusCap;
      }
    } else if (rel.band === "MEDIUM") {
      historicalReliabilityBonus = Math.round(
        T.historicalReliabilityBonusCap * 0.5
      );
    } else if (rel.band === "LOW") {
      recentFailurePenalty = T.recentFailurePenaltyCap;
    }

    if (rel.evidenceStrength === "WEAK") {
      evidencePenalty = Math.round(T.evidencePenaltyInsufficient * 0.5);
    }

    const net =
      historicalReliabilityBonus +
      predictionAccuracyBonus -
      recentFailurePenalty -
      evidencePenalty;

    return {
      decisionType: c.id,
      historicalReliabilityBonus,
      predictionAccuracyBonus,
      recentFailurePenalty,
      evidencePenalty,
      net: c.blocked ? 0 : net, // BLOCK: no memory override of score path used for selection
      blockedPreserved: c.blocked,
    };
  });
}

/**
 * Apply memory net adjustments to scores. Blocked candidates stay blocked / low.
 */
export function applyMemoryToCandidates(
  candidates: ScoredDecisionCandidate[],
  adjustments: MemoryScoreAdjustment[]
): ScoredDecisionCandidate[] {
  const byType = new Map(adjustments.map((a) => [a.decisionType, a]));
  return candidates.map((c) => {
    const adj = byType.get(c.id);
    if (!adj || c.blocked) return c;
    return {
      ...c,
      score: Math.round((c.score + adj.net) * 100) / 100,
    };
  });
}
