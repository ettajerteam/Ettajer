/**
 * Dr Sara — deterministic platform intelligence engine V3 (Intelligence OS).
 * DETECT → DIAGNOSE → PREDICT → DECIDE → INTERVENE → MEASURE → LEARN
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
export { collectAllSignals } from "@/lib/intelligence/signals/collect";
export { correlateSignals } from "@/lib/intelligence/correlation";
export { diagnosePlatform } from "@/lib/intelligence/diagnosis";
export {
  calculatePriority,
  prioritizeSignals,
} from "@/lib/intelligence/scoring/priority";
export { calculatePlatformHealth } from "@/lib/intelligence/scoring/health";
export { getOpportunities } from "@/lib/intelligence/opportunities";
export {
  getRecommendedActions,
  getRisks,
  isValidAdminHref,
} from "@/lib/intelligence/recommendations/actions";
export {
  getMerchantSegments,
  getMerchantSegmentSummary,
  segmentForMerchantFacts,
} from "@/lib/intelligence/segments/merchants";
export {
  explainSignal,
  explainPriority,
  explainDiagnosis,
  explainAction,
} from "@/lib/intelligence/explainability/why";
export { explainTopDecision } from "@/lib/intelligence/explainability/why-first";
export { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";
export { INTELLIGENCE_SCORING_CONFIG } from "@/lib/intelligence/config/scoring";
export {
  comparePeriods,
  detectTrend,
  detectAcceleration,
  detectAnomaly,
} from "@/lib/intelligence/temporal";
export {
  buildMerchantJourney,
  detectMerchantBottleneck,
  inferJourneyStage,
} from "@/lib/intelligence/merchants/journey";
export {
  buildMerchantIntelligenceProfile,
  scoreIntent,
  scoreActivation,
} from "@/lib/intelligence/merchants/profile";
export { detectPlatformBottlenecks } from "@/lib/intelligence/bottlenecks/platform";
export { buildForecasts, buildTemporalTrends } from "@/lib/intelligence/forecasting";
export { buildForecastsV2 } from "@/lib/intelligence/forecasts/v2";
export { buildCausalHypotheses } from "@/lib/intelligence/causal/hypotheses";
export { detectAnomalies } from "@/lib/intelligence/anomalies/detect";
export {
  getTopAction,
  rankTopActions,
  calculateExtendedPriority,
} from "@/lib/intelligence/prioritization/top-action";
export {
  buildPlatformInterventions,
  buildMerchantInterventions,
  rankInterventions,
  getTopIntervention,
  adaptiveActionScore,
  scoreIntervention,
} from "@/lib/intelligence/interventions/engine";
export {
  classifyOutcome,
  classifyBacklogOutcome,
  appendActionEvent,
  createRecommendedEvent,
} from "@/lib/intelligence/outcomes/lifecycle";
export {
  aggregateInterventionMemory,
  emptyInterventionMemory,
} from "@/lib/intelligence/outcomes/memory";
export {
  measureActionOutcome,
  summarizeOutcomes,
} from "@/lib/intelligence/actions/outcomes";
export { assessDataQuality } from "@/lib/intelligence/data-quality";
export { runQualityFirewall } from "@/lib/intelligence/quality/firewall";
export { INTELLIGENCE_RULES, evaluateRegistry } from "@/lib/intelligence/registry/rules";
export {
  INTELLIGENCE_RULES_V3,
  evaluateRulesV3,
} from "@/lib/intelligence/registry/v3";
export { buildRichSegments } from "@/lib/intelligence/segments/rich";
export { buildIntelligenceGraph } from "@/lib/intelligence/graph/model";

export type { SaraBriefing } from "@/lib/intelligence/types";
export type {
  DrSaraSnapshot,
  IntelligenceSignal,
  PlatformState,
  Diagnosis,
  PrioritizedItem,
} from "@/lib/intelligence/engine-types";
