/**
 * Complete intelligence trace builder.
 */
import { TRACE_STAGES } from "@/lib/intelligence/os/config";
import type { TraceStep } from "@/lib/intelligence/os/types";
import { stableHash } from "@/lib/intelligence/execution/idempotency";

export function buildIntelligenceTrace(input: {
  cycleId: string;
  timestamp: string;
  stateFingerprint: string;
  stages: Partial<
    Record<
      (typeof TRACE_STAGES)[number],
      { result: string; reason: string; evidence?: string[]; inputs?: string[]; outputs?: string[] }
    >
  >;
}): TraceStep[] {
  const out: TraceStep[] = [];
  for (const stage of TRACE_STAGES) {
    const s = input.stages[stage];
    if (!s) continue;
    out.push({
      stage,
      timestamp: input.timestamp,
      id: `tr_${stableHash(`${input.cycleId}|${stage}`)}`,
      stateFingerprint: input.stateFingerprint,
      inputs: s.inputs ?? [],
      outputs: s.outputs ?? [],
      reason: s.reason,
      evidence: s.evidence ?? [],
      result: s.result,
    });
  }
  return out;
}
