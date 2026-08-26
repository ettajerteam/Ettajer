/**
 * Interventions barrel — V3 engine/chains + V8 orchestration.
 */
export {
  scoreIntervention,
  adaptiveActionScore,
  buildPlatformInterventions,
  buildMerchantInterventions,
  rankInterventions,
  getTopIntervention,
} from "@/lib/intelligence/interventions/engine";
export type {
  Intervention,
  InterventionType,
} from "@/lib/intelligence/interventions/engine";
export {
  activeChainsFor,
  nextChainStep,
} from "@/lib/intelligence/interventions/chains";

export { INTERVENTION_REGISTRY, getInterventionDef, decisionToInterventionType } from "@/lib/intelligence/interventions/registry";
export { planIntervention } from "@/lib/intelligence/interventions/planner";
export { orchestrateIntervention } from "@/lib/intelligence/interventions/orchestrator";
export { evaluatePrerequisites } from "@/lib/intelligence/interventions/prerequisites";
export { evaluateSafety, calculateBlastRadius } from "@/lib/intelligence/interventions/safety";
export { evaluateRisk } from "@/lib/intelligence/interventions/risk";
export { evaluateApproval } from "@/lib/intelligence/interventions/approval";
export { buildRollbackPlan } from "@/lib/intelligence/interventions/rollback";
export { buildMeasurementPlan } from "@/lib/intelligence/interventions/measurement-plan";
export {
  buildExecutionPlan,
  buildIdempotencyKey,
} from "@/lib/intelligence/interventions/execution-plan";
export {
  detectConflicts,
  detectDuplicate,
} from "@/lib/intelligence/interventions/conflicts-v8";
export { INTERVENTION_THRESHOLDS } from "@/lib/intelligence/interventions/config";

export type {
  InterventionPlan,
  InterventionStatus,
  OrchestratedInterventionType,
} from "@/lib/intelligence/interventions/types";
