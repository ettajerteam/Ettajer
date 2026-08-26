/**
 * Decision explainability — no opaque scores.
 */
import type { DecisionExplanation } from "@/lib/intelligence/os/types";
import type { BestStrategy } from "@/lib/intelligence/os/types";

export function buildDecisionExplanation(input: {
  decisionId: string | null;
  evidence: string[];
  diagnoses: string[];
  alternatives: { id: string; title: string; reasons: string[] }[];
  expectedEffect: string;
  confidence: number;
  uncertainty: string;
  risk: string;
  dependencies: string[];
  historicalEvidence: string;
  whyChosen: string[];
  bestStrategy: BestStrategy | null;
}): DecisionExplanation | null {
  if (!input.decisionId) return null;
  return {
    decision: input.decisionId,
    evidence: input.evidence,
    diagnosis: input.diagnoses,
    alternatives: input.alternatives.map((a) => ({
      id: a.id,
      rejectedBecause: a.reasons,
    })),
    expectedEffect: input.expectedEffect,
    confidence: input.confidence,
    uncertainty: input.uncertainty,
    risk: input.risk,
    dependencies: input.dependencies,
    historicalEvidence: input.historicalEvidence,
    whyChosen: [
      ...input.whyChosen,
      ...(input.bestStrategy
        ? [`Best strategy=${input.bestStrategy.strategyId}`]
        : []),
    ],
    whyAlternativesRejected: input.alternatives.flatMap((a) =>
      a.reasons.map((r) => `${a.id}: ${r}`)
    ),
  };
}
