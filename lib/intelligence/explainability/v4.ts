/**
 * Explainability V4 — structured decision narrative.
 */
import type { ScoreComponents } from "@/lib/intelligence/decision/score-components";

export type ExplainabilityV4 = {
  decision: string;
  whatHappened: string;
  whyItMatters: string;
  evidence: string[];
  whatChanged: string;
  whatNext: string;
  whyThisAction: string;
  whatHappenedLastTime: string;
  whatWeExpect: string;
  whenWeMeasure: string;
  ifFails: string;
  scoreComponents: ScoreComponents | null;
  confidence: number;
  ruleIds: string[];
};

export function explainDecisionV4(input: {
  decision: string;
  whatHappened: string;
  whyItMatters: string;
  evidence: string[];
  whatChanged?: string;
  whatNext: string;
  whyThisAction: string;
  historicalNote: string;
  expected: string;
  measureIn: string;
  ifFails: string;
  scoreComponents?: ScoreComponents | null;
  confidence: number;
  ruleIds: string[];
}): ExplainabilityV4 {
  return {
    decision: input.decision,
    whatHappened: input.whatHappened,
    whyItMatters: input.whyItMatters,
    evidence: input.evidence,
    whatChanged: input.whatChanged ?? "No prior cycle delta available.",
    whatNext: input.whatNext,
    whyThisAction: input.whyThisAction,
    whatHappenedLastTime: input.historicalNote,
    whatWeExpect: input.expected,
    whenWeMeasure: input.measureIn,
    ifFails: input.ifFails,
    scoreComponents: input.scoreComponents ?? null,
    confidence: input.confidence,
    ruleIds: input.ruleIds,
  };
}
