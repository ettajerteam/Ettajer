/**
 * Deterministic intelligence memory types (V4).
 * Persistent via AdminAuditLog `dr_sara.*` or in-memory fixtures — no new Prisma models.
 */

export type InterventionLifecycleStatus =
  | "PLANNED"
  | "APPROVED"
  | "EXECUTED"
  | "MEASURED"
  | "SUCCESS"
  | "PARTIAL"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

export type PlatformDimensionKey =
  | "OPERATIONS"
  | "ACTIVATION"
  | "REVENUE"
  | "SUPPORT"
  | "TECHNICAL"
  | "TRUST";

export type PlatformDimensionSnapshot = Record<PlatformDimensionKey, number>;

export type IntelligenceObservation = {
  observationId: string;
  cycleId: string;
  observedAt: Date;
  metrics: {
    pendingRealOrders: number;
    pendingRealGmv: number;
    openSupport: number;
    domainFailing: number;
    firstSaleCount: number;
    realRevenue7d: number;
    realOrders7d: number;
    revenueChange7d: number;
    ordersChange7d: number;
  };
  dimensions: PlatformDimensionSnapshot;
};

export type IntelligenceInterventionRecord = {
  interventionId: string;
  ruleId: string;
  diagnosisId: string | null;
  targetType: "platform" | "merchant" | "store" | "domain" | "support";
  targetId: string;
  action: string;
  type: string;
  createdAt: Date;
  executedAt: Date | null;
  measuredAt: Date | null;
  baseline: Record<string, number>;
  expected: Record<string, number>;
  observed: Record<string, number> | null;
  expectedOutcome: string;
  confidence: number;
  predictedImpact: number;
  reversibility: number;
  actionability: number;
  status: InterventionLifecycleStatus;
  cooldownUntil: Date | null;
  chainId: string | null;
  stepIndex: number;
};

export type IntelligenceOutcomeRecord = {
  outcomeId: string;
  interventionId: string;
  measuredAt: Date;
  absoluteDelta: Record<string, number>;
  relativeDelta: Record<string, number>;
  classification: "SUCCESS" | "PARTIAL" | "FAILED" | "NO_EFFECT" | "INCONCLUSIVE";
  impactRealized: number;
  impactMissed: number;
  expectedVsActual: string;
  evidence: string[];
};

export type RulePerformance = {
  ruleId: string;
  type: string;
  attempts: number;
  successes: number;
  partials: number;
  failures: number;
  successRate: number | null;
  historicalImpact: number | null;
  historicalSpeedHours: number | null;
  adaptivePriority: number;
  note: string;
};

export type IntelligenceMemory = {
  observations: IntelligenceObservation[];
  interventions: IntelligenceInterventionRecord[];
  outcomes: IntelligenceOutcomeRecord[];
  rulePerformance: RulePerformance[];
  lastCycleId: string | null;
};

export function emptyIntelligenceMemory(): IntelligenceMemory {
  return {
    observations: [],
    interventions: [],
    outcomes: [],
    rulePerformance: [],
    lastCycleId: null,
  };
}
