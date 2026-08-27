/**
 * Execution outcome → V7 memory-compatible record.
 */
import type { ExecutionOutcome } from "@/lib/intelligence/execution/types";
import type { OutcomeMemoryRecord } from "@/lib/intelligence/memory/v7-types";
import { compareOutcome } from "@/lib/intelligence/memory/outcome-history";
import { stableHash } from "@/lib/intelligence/execution/idempotency";

export function buildExecutionOutcome(input: {
  executionId: string;
  decisionId: string;
  interventionId: string;
  interventionType: ExecutionOutcome["interventionType"];
  before: Record<string, number>;
  after: Record<string, number>;
  expected: Record<string, number | [number, number]>;
  success: boolean;
  failureReason: string | null;
  rollbackState: ExecutionOutcome["rollbackState"];
  measuredAt: string;
  mode: ExecutionOutcome["mode"];
}): ExecutionOutcome {
  const predictionError: Record<string, number> = {};
  for (const [k, obs] of Object.entries(input.after)) {
    const exp = input.expected[k];
    if (exp === undefined) continue;
    if (Array.isArray(exp)) {
      const [lo, hi] = exp;
      if (obs < lo) predictionError[k] = obs - lo;
      else if (obs > hi) predictionError[k] = obs - hi;
      else predictionError[k] = 0;
    } else {
      predictionError[k] = obs - exp;
    }
  }

  return {
    executionId: input.executionId,
    decisionId: input.decisionId,
    interventionId: input.interventionId,
    interventionType: input.interventionType,
    beforeState: input.before,
    afterState: input.after,
    expectedOutcome: input.expected,
    observedOutcome: input.after,
    predictionError,
    success: input.success,
    failureReason: input.failureReason,
    rollbackState: input.rollbackState,
    measuredAt: input.measuredAt,
    mode: input.mode,
    productionMutation: "NONE",
  };
}

/** Map V9 execution outcome into V7 OutcomeMemoryRecord shape (in-memory). */
export function toOutcomeMemoryRecord(
  outcome: ExecutionOutcome,
  stateFingerprint: string
): OutcomeMemoryRecord {
  const cmp = compareOutcome({
    predicted: outcome.expectedOutcome,
    observed: outcome.observedOutcome,
    sufficientData: true,
  });
  return {
    outcomeId: `om_${stableHash(outcome.executionId)}`,
    decisionId: outcome.decisionId,
    decisionType: outcome.decisionId,
    stateFingerprint,
    measuredAt: outcome.measuredAt,
    status: outcome.success
      ? cmp.status === "PARTIAL"
        ? "PARTIAL"
        : "SUCCESS"
      : "FAILED",
    accuracy: cmp.accuracy,
    predicted: outcome.expectedOutcome,
    observed: outcome.observedOutcome,
    delta: Object.fromEntries(
      Object.keys(outcome.observedOutcome).map((k) => [
        k,
        (outcome.observedOutcome[k] ?? 0) - (outcome.beforeState[k] ?? 0),
      ])
    ),
    expectedRange: Object.fromEntries(
      Object.entries(outcome.expectedOutcome)
        .filter(([, v]) => Array.isArray(v))
        .map(([k, v]) => [k, v as [number, number]])
    ),
    confidence: outcome.success ? 0.7 : 0.4,
    measurementWindow: "post-execution",
    evidenceStrength: cmp.evidenceStrength,
    evidence: [
      `executionId=${outcome.executionId}`,
      `mode=${outcome.mode}`,
      `productionMutation=NONE`,
      cmp.explanation,
    ],
  };
}
