/**
 * Configurable V7 memory / learning thresholds — no scattered magic numbers.
 */
export const MEMORY_THRESHOLDS = {
  minSampleForReliability: 5,
  minSampleForStrong: 10,
  successRateHigh: 0.75,
  successRateMedium: 0.5,
  maxConfidence: 0.98,
  minConfidence: 0.2,
  boostPerStrongHistory: 0.02,
  boostPerModerateHistory: 0.01,
  penaltyPerFailurePattern: 0.03,
  penaltyPerMissPattern: 0.02,
  /** Score bonuses/penalties applied after V6 score (never bypass BLOCK) */
  historicalReliabilityBonusCap: 8,
  predictionAccuracyBonusCap: 5,
  recentFailurePenaltyCap: 10,
  evidencePenaltyInsufficient: 6,
  /** COD backlog fingerprint bands */
  codHigh: 10,
  codMedium: 5,
  firstSaleHigh: 50,
  dnsCluster: 3,
  supportBacklog: 3,
  concentrationPct: 60,
} as const;

export type MemoryThresholds = typeof MEMORY_THRESHOLDS;
