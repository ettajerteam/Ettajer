/**
 * Configurable decision weights & thresholds — no scattered magic numbers.
 */
export const DECISION_WEIGHTS = {
  impact: 30,
  urgency: 25,
  confidence: 20,
  reversibility: 10,
  actionability: 15,
  scenarioSupport: 20,
  riskPenalty: 25,
  costPenalty: 10,
  delayPenalty: 12,
} as const;

export const DECISION_THRESHOLDS = {
  /** Minimum score to prefer an action over NO_ACTION when evidence exists */
  preferActionOverNoAction: 8,
  /** Confidence floor when data quality is DEGRADED */
  degradedConfidenceCap: 0.55,
  /** Confidence floor / selection when INSUFFICIENT */
  insufficientForceNoAction: true,
  insufficientConfidenceCap: 0.35,
  /** Scenario support strength cutoffs on matched scenario confidence × impact */
  scenarioStrong: 0.7,
  scenarioModerate: 0.45,
  scenarioWeak: 0.2,
  /** Cost bands (0–1 normalized) */
  costNavigation: 0.15,
  costReview: 0.25,
  costStrategic: 0.45,
  /** Delay penalty by timeToImpact band */
  delayPenaltyByBand: {
    immediate: 0,
    "<24h": 0.1,
    "1–3 days": 0.25,
    "3–7 days": 0.4,
    "7–14 days": 0.55,
    "14–30 days": 0.7,
  } as Record<string, number>,
  /** Tie-break: prefer higher urgency then higher reversibility */
  tieEpsilon: 0.01,
} as const;

export type DecisionWeights = typeof DECISION_WEIGHTS;
export type DecisionThresholds = typeof DECISION_THRESHOLDS;
