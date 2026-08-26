/**
 * Dr Sara — Intelligence OS V9 exports (Controlled Execution on V8 plans).
 */
export {
  getDrSaraSnapshot,
  getDrSaraCriticalCount,
  getDrSaraBriefing,
  buildDrSaraSnapshotFromState,
} from "@/lib/intelligence/snapshot";
export { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
export {
  toPlatformState,
  emptyPlatformState,
} from "@/lib/intelligence/platform-state";
export { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";
export { INTELLIGENCE_SCORING_CONFIG } from "@/lib/intelligence/config/scoring";
export { emptyIntelligenceMemory } from "@/lib/intelligence/memory/types";
export {
  runMemoryEngine,
  compareOutcome,
  buildStateFingerprints,
  primaryStateFingerprint,
  adjustConfidence,
  MEMORY_THRESHOLDS,
} from "@/lib/intelligence/memory/index";
export { buildPlatformDigitalTwin } from "@/lib/intelligence/twin/build";
export { buildStateGraph } from "@/lib/intelligence/twin/state-graph";
export { toDigitalTwinState } from "@/lib/intelligence/twin/state-contract";
export {
  generateScenarios,
  simulateNoAction,
  simulateIntervention,
} from "@/lib/intelligence/scenarios/simulate";
export {
  rankScenarios,
  calculateInterventionAdvantage,
} from "@/lib/intelligence/scenarios/rank";
export {
  simulateDrSaraScenario,
  simulateFromPartial,
} from "@/lib/intelligence/scenarios/api";
export {
  SCENARIO_REGISTRY,
  getScenarioDefinition,
  listScenariosForTwin,
} from "@/lib/intelligence/scenarios/registry";
export { compareScenarios } from "@/lib/intelligence/scenarios/compare";
export { comparePredictedVsObserved } from "@/lib/intelligence/scenarios/outcome";
export { buildCounterfactuals } from "@/lib/intelligence/counterfactual/engine";
export { simulateCounterfactual } from "@/lib/intelligence/counterfactual/simulate";
export {
  INTELLIGENCE_ASSUMPTIONS,
  assumptionsForScenario,
} from "@/lib/intelligence/assumptions/registry";
export {
  runDecisionEngine,
  generateDecisionCandidates,
  evaluateConstraints,
  scoreDecisionCandidate,
  DECISION_WEIGHTS,
  DECISION_THRESHOLDS,
} from "@/lib/intelligence/decisions/engine";
export {
  planIntervention,
  orchestrateIntervention,
  INTERVENTION_REGISTRY,
  buildIdempotencyKey,
} from "@/lib/intelligence/interventions/index";
export {
  runGovernedExecution,
  buildSnapshotExecutionSlice,
  resetExecutionEngine,
  executeIntervention,
  requestApproval,
  approve,
  reject,
  getKillSwitch,
  setKillSwitch,
  EXECUTION_REGISTRY,
  adminActor,
  toOutcomeMemoryRecord,
} from "@/lib/intelligence/execution/index";
export {
  buildMerchantTwin,
  generateMerchantScenarios,
} from "@/lib/intelligence/merchants/twin";
export { buildActivationPortfolios } from "@/lib/intelligence/portfolio/simulate";
export {
  buildStateTrajectory,
  simulateEscalationRisk,
  simulateRecovery,
} from "@/lib/intelligence/trajectory/forecast";
export { assessDecisionStability } from "@/lib/intelligence/stability/decision";
export {
  scenarioCacheKey,
  getCachedScenarios,
  setCachedScenarios,
  invalidateScenarioCache,
  cacheSize,
} from "@/lib/intelligence/cache/scenario-cache";
export { runQualityFirewallV2 } from "@/lib/intelligence/quality/firewall-v2";
export {
  getAutonomyPolicy,
  mayAutoExecute,
} from "@/lib/intelligence/cycle/autonomy";

export type { SaraBriefing } from "@/lib/intelligence/types";
export type {
  DrSaraSnapshot,
  PlatformState,
} from "@/lib/intelligence/engine-types";
export type {
  PlatformDigitalTwin,
  DigitalTwinState,
} from "@/lib/intelligence/twin/types";
export type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
export type {
  Decision,
  DecisionCandidate,
  DecisionEngineResult,
} from "@/lib/intelligence/decisions/types";
export type {
  DecisionMemoryRecord,
  OutcomeMemoryRecord,
  MemoryEngineResult,
} from "@/lib/intelligence/memory/v7-types";
export type { InterventionPlan } from "@/lib/intelligence/interventions/types";
export type {
  ExecutionRecord,
  ApprovalRecord,
  ExecutionOutcome,
} from "@/lib/intelligence/execution/types";
