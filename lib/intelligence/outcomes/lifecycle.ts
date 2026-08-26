/**
 * Append-only action lifecycle + outcome classification.
 */

export type ActionLifecycleStatus =
  | "DETECTED"
  | "RECOMMENDED"
  | "ACCEPTED"
  | "EXECUTED"
  | "OBSERVING"
  | "SUCCESS"
  | "PARTIAL_SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "NO_EFFECT"
  | "NEGATIVE"
  | "INCONCLUSIVE";

export type DrSaraActionEvent = {
  actionId: string;
  merchantId: string | null;
  ruleId: string;
  type: string;
  timestamp: Date;
  actor: "system" | "admin";
  status: ActionLifecycleStatus;
  targetMetric: string;
  baselineValue: number | null;
  postValue: number | null;
  delta: number | null;
  outcome: ActionLifecycleStatus | null;
  evidence: string[];
};

export type OutcomeClass =
  | "SUCCESS"
  | "PARTIAL_SUCCESS"
  | "NO_EFFECT"
  | "NEGATIVE"
  | "INCONCLUSIVE";

export function classifyOutcome(input: {
  baseline: number;
  observed: number;
  /** Minimum improvement to count as partial */
  partialRatio?: number;
  sufficientData: boolean;
}): OutcomeClass {
  if (!input.sufficientData) return "INCONCLUSIVE";
  const delta = input.observed - input.baseline;
  if (input.baseline === 0) {
    if (input.observed > 0) return "SUCCESS";
    return "NO_EFFECT";
  }
  // For metrics where lower is better (pending, support, dns)
  // callers should invert before calling, or use direction
  if (delta > 0) {
    const ratio = delta / Math.max(1, Math.abs(input.baseline));
    if (ratio >= 1) return "SUCCESS";
    if (ratio >= (input.partialRatio ?? 0.25)) return "PARTIAL_SUCCESS";
    return "NO_EFFECT";
  }
  if (delta < 0) return "NEGATIVE";
  return "NO_EFFECT";
}

/** Classify backlog-style metrics where decrease is success */
export function classifyBacklogOutcome(input: {
  baseline: number;
  observed: number;
  sufficientData: boolean;
}): OutcomeClass {
  if (!input.sufficientData) return "INCONCLUSIVE";
  if (input.baseline <= 0 && input.observed <= 0) return "SUCCESS";
  if (input.observed < input.baseline) {
    const cleared = input.baseline - input.observed;
    const ratio = cleared / input.baseline;
    if (input.observed === 0 || ratio >= 1) return "SUCCESS";
    if (ratio >= 0.25) return "PARTIAL_SUCCESS";
    return "NO_EFFECT";
  }
  if (input.observed > input.baseline) return "NEGATIVE";
  return "NO_EFFECT";
}

export function appendActionEvent(
  history: DrSaraActionEvent[],
  event: DrSaraActionEvent
): DrSaraActionEvent[] {
  return [...history, event];
}

export function createRecommendedEvent(input: {
  actionId: string;
  merchantId: string | null;
  type: string;
  ruleId: string;
  targetMetric: string;
  baselineValue: number | null;
  now: Date;
  evidence: string[];
}): DrSaraActionEvent {
  return {
    actionId: input.actionId,
    merchantId: input.merchantId,
    ruleId: input.ruleId,
    type: input.type,
    timestamp: input.now,
    actor: "system",
    status: "RECOMMENDED",
    targetMetric: input.targetMetric,
    baselineValue: input.baselineValue,
    postValue: null,
    delta: null,
    outcome: null,
    evidence: input.evidence,
  };
}
