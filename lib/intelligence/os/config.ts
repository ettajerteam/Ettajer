/**
 * V10 OS configuration — deterministic policies only.
 */
export const OS_CONFIG = {
  maxConfidence: 0.98,
  minConfidence: 0.01,
  minSampleForRate: 5,
  minSampleForStrong: 10,
  /** CONTROLLED_AUTO disabled by default — never surprise-execute */
  controlledAutoEnabled: false as const,
  defaultAutonomy: "OBSERVE" as const,
  budgets: {
    executionSlots: 3,
    merchantContact: 50,
    operationalCapacity: 100,
    riskUnits: 10,
    blastRadiusUnits: 8,
  },
  riskCost: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 4,
    CRITICAL: 8,
  } as Record<string, number>,
  blastCost: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 4,
    CRITICAL: 8,
  } as Record<string, number>,
  adaptation: {
    successBoost: 2,
    failurePenalty: 3,
    underperformPenalty: 2,
    maxAbsDelta: 8,
  },
  note: "V10 orchestrates V1–V9. V9 remains the execution boundary. autoExecute=false. CONTROLLED_AUTO=DISABLED by default.",
};

export const TRACE_STAGES = [
  "OBSERVE",
  "MODEL",
  "DETECT",
  "DIAGNOSE",
  "PREDICT",
  "SIMULATE",
  "DECIDE",
  "PLAN",
  "GOVERN",
  "APPROVE",
  "EXECUTE",
  "VERIFY",
  "MEASURE",
  "LEARN",
  "ADAPT",
] as const;
