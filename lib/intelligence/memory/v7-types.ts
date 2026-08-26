/**
 * Dr Sara V7 — Memory & Outcome Intelligence types.
 * Additive to existing V4 IntelligenceMemory (see memory/types.ts).
 * No ML. No fabricated history.
 */

export type DecisionOutcomeStatus =
  | "PENDING"
  | "SUCCESS"
  | "PARTIAL"
  | "FAILED"
  | "UNKNOWN"
  | "NOT_MEASURED";

export type ExecutionStatus =
  | "RECOMMENDED"
  | "NOT_EXECUTED"
  | "EXECUTED"
  | "MEASURED";

export type EvidenceStrength =
  | "STRONG"
  | "MODERATE"
  | "WEAK"
  | "INSUFFICIENT";

export type PredictionAccuracyClass =
  | "ACCURATE"
  | "ACCEPTABLE"
  | "DRIFT"
  | "MISS"
  | "NOT_MEASURED";

export type ReliabilityBand = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

export type ConfidenceBand = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

/** Serializable decision memory record (in-memory / fixture — no Prisma writes). */
export type DecisionMemoryRecord = {
  decisionId: string;
  decisionType: string;
  timestamp: string;
  stateFingerprint: string;
  twinHash: string;
  topAction: string | null;
  topScenario: string | null;
  decisionScore: number;
  confidence: number;
  constraints: { constraintId: string; status: string }[];
  rationale: string[];
  selectedCandidate: string;
  alternatives: string[];
  mode: "RECOMMENDED";
  executionStatus: ExecutionStatus;
  outcomeStatus: DecisionOutcomeStatus;
};

export type OutcomeMemoryRecord = {
  outcomeId: string;
  decisionId: string;
  decisionType: string;
  stateFingerprint: string;
  measuredAt: string;
  status: DecisionOutcomeStatus;
  accuracy: PredictionAccuracyClass;
  predicted: Record<string, number | [number, number]>;
  observed: Record<string, number>;
  delta: Record<string, number>;
  expectedRange: Record<string, [number, number]>;
  confidence: number;
  measurementWindow: string;
  evidenceStrength: EvidenceStrength;
  evidence: string[];
};

export type SuccessRateSummary = {
  decisionType: string;
  totalMeasured: number;
  successCount: number;
  partialCount: number;
  failureCount: number;
  unknownCount: number;
  successRate: number | null;
  failureRate: number | null;
  sampleQuality: "SUFFICIENT" | "INSUFFICIENT";
  evidenceStrength: EvidenceStrength;
};

export type ReliabilityAssessment = {
  decisionType: string;
  band: ReliabilityBand;
  successRate: number | null;
  sampleSize: number;
  predictionAccuracyGoodShare: number | null;
  evidenceStrength: EvidenceStrength;
  note: string;
};

export type ConfidenceAdjustment = {
  before: number;
  after: number;
  delta: number;
  reason: string;
  applied: boolean;
};

export type LearningTraceStage = {
  stage: string;
  detail: string;
};

export type MemoryEngineResult = {
  fingerprints: string[];
  primaryFingerprint: string;
  decisionHistorySummary: {
    totalRecords: number;
    byType: Record<string, number>;
  };
  successRates: SuccessRateSummary[];
  reliability: ReliabilityAssessment[];
  topDecisionMemory: {
    decisionType: string;
    confidenceBeforeMemory: number;
    confidenceAfterMemory: number;
    historicalReliability: ReliabilityBand;
    evidenceStrength: EvidenceStrength;
    memoryImpact: "BOOST" | "PENALTY" | "NONE";
    adjustment: ConfidenceAdjustment;
    note: string;
  } | null;
  learningTrace: LearningTraceStage[];
  scoreAdjustments: {
    decisionType: string;
    historicalReliabilityBonus: number;
    predictionAccuracyBonus: number;
    recentFailurePenalty: number;
    evidencePenalty: number;
    net: number;
    blockedPreserved: boolean;
  }[];
};

export type CompareOutcomeResult = {
  status: DecisionOutcomeStatus;
  accuracy: PredictionAccuracyClass;
  evidenceStrength: EvidenceStrength;
  deviations: string[];
  explanation: string;
};
