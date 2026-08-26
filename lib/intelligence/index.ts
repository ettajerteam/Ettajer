/**
 * Dr Sara — deterministic platform intelligence engine V2.
 * OBSERVE → DETECT → CORRELATE → DIAGNOSE → PRIORITIZE → RECOMMEND → MEASURE
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
export { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";
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
export { detectPlatformBottlenecks } from "@/lib/intelligence/bottlenecks/platform";
export { buildForecasts, buildTemporalTrends } from "@/lib/intelligence/forecasting";
export {
  getTopAction,
  rankTopActions,
  calculateExtendedPriority,
} from "@/lib/intelligence/prioritization/top-action";
export {
  measureActionOutcome,
  summarizeOutcomes,
} from "@/lib/intelligence/actions/outcomes";
export { assessDataQuality } from "@/lib/intelligence/data-quality";
export { INTELLIGENCE_RULES, evaluateRegistry } from "@/lib/intelligence/registry/rules";

export type { SaraBriefing } from "@/lib/intelligence/types";
export type {
  DrSaraSnapshot,
  IntelligenceSignal,
  PlatformState,
  Diagnosis,
  PrioritizedItem,
} from "@/lib/intelligence/engine-types";
