/**
 * Configurable V8 intervention thresholds — no scattered magic numbers.
 */
export const INTERVENTION_THRESHOLDS = {
  blastLow: 5,
  blastMedium: 25,
  blastHigh: 100,
  revenueBlastMedium: 1000,
  revenueBlastHigh: 10000,
  highRiskRequiresApproval: true,
  maxConfidenceClaim: 0.98,
} as const;

export type InterventionThresholds = typeof INTERVENTION_THRESHOLDS;
