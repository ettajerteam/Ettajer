/**
 * V8 Intervention Orchestrator entry — consumes V6/V7 snapshot slices.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { planIntervention } from "@/lib/intelligence/interventions/planner";
import type { InterventionPlan } from "@/lib/intelligence/interventions/types";
import type { ActiveInterventionRef } from "@/lib/intelligence/interventions/conflicts-v8";

/** Re-export planner as primary API name used in docs */
export { planIntervention } from "@/lib/intelligence/interventions/planner";

export function orchestrateIntervention(input: {
  state: PlatformState;
  stateFingerprint: string;
  twinHash: string;
  topDecision: {
    id: string;
    title: string;
    score: number;
    confidence: number;
    route: string;
    whyThis: string[];
  } | null;
  dataQualityStatus: "OK" | "DEGRADED" | "INSUFFICIENT";
  insufficientEvidence: boolean;
  historicalReliability?: string;
  expectedAfter?: Record<string, [number, number]>;
  baseline?: Record<string, number>;
  activeInterventions?: ActiveInterventionRef[];
  activeConflictTypes?: string[];
  cycleId: string;
}): InterventionPlan | null {
  if (!input.topDecision) return null;
  return planIntervention({
    decisionId: input.topDecision.id,
    decisionTitle: input.topDecision.title,
    decisionScore: input.topDecision.score,
    decisionConfidence: input.topDecision.confidence,
    decisionRoute: input.topDecision.route,
    whyThis: input.topDecision.whyThis,
    state: input.state,
    stateFingerprint: input.stateFingerprint,
    twinHash: input.twinHash,
    dataQualityStatus: input.dataQualityStatus,
    insufficientEvidence: input.insufficientEvidence,
    historicalReliability: input.historicalReliability,
    expectedAfter: input.expectedAfter,
    baselineOverride: input.baseline,
    activeInterventions: input.activeInterventions,
    activeConflictTypes: input.activeConflictTypes,
    cycleId: input.cycleId,
  });
}
