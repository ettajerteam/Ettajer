/**
 * Dr Sara — Intelligence OS V5 exports (Digital Twin + scenarios).
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
export { buildPlatformDigitalTwin } from "@/lib/intelligence/twin/build";
export { buildStateGraph } from "@/lib/intelligence/twin/state-graph";
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
export { buildCounterfactuals } from "@/lib/intelligence/counterfactual/engine";
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
export type { PlatformDigitalTwin } from "@/lib/intelligence/twin/types";
export type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
