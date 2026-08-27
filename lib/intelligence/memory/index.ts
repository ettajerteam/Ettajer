/**
 * Dr Sara V7 memory barrel — additive exports (does not replace V4 memory types).
 */
export { MEMORY_THRESHOLDS } from "@/lib/intelligence/memory/config";
export {
  buildStateFingerprints,
  primaryStateFingerprint,
  fingerprintHash,
} from "@/lib/intelligence/memory/fingerprints";
export {
  emptyDecisionHistory,
  summarizeDecisionHistory,
  decisionsOfType,
  buildDecisionMemoryRecord,
} from "@/lib/intelligence/memory/decision-history";
export {
  emptyOutcomeHistory,
  compareOutcome,
  classifyMetricAccuracy,
  outcomesOfType,
  roundConfidence,
} from "@/lib/intelligence/memory/outcome-history";
export {
  computeSuccessRates,
  successRatesFromRulePerformance,
  mapInterventionToDecisionType,
} from "@/lib/intelligence/memory/success-rates";
export {
  assessReliability,
  reliabilityForType,
} from "@/lib/intelligence/memory/reliability";
export {
  adjustConfidence,
  confidenceBand,
} from "@/lib/intelligence/memory/confidence-adjustment";
export {
  computeMemoryScoreAdjustments,
  applyMemoryToCandidates,
} from "@/lib/intelligence/memory/learning";
export { runMemoryEngine } from "@/lib/intelligence/memory/memory-engine";

export type {
  DecisionMemoryRecord,
  OutcomeMemoryRecord,
  SuccessRateSummary,
  ReliabilityAssessment,
  MemoryEngineResult,
  CompareOutcomeResult,
  LearningTraceStage,
} from "@/lib/intelligence/memory/v7-types";

// Re-export V4 memory surface for convenience
export {
  emptyIntelligenceMemory,
} from "@/lib/intelligence/memory/types";
export type { IntelligenceMemory } from "@/lib/intelligence/memory/types";
