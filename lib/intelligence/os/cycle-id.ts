/**
 * Deterministic cycle id — no wall-clock seeding / no random IDs.
 */
import { stableHash } from "@/lib/intelligence/execution/idempotency";

export function buildCycleId(input: {
  stateFingerprint: string;
  twinHash: string;
  /** Explicit cycle timestamp ISO — metadata only, not a nondeterministic seed */
  cycleTimestampIso: string;
}): string {
  return `c10_${stableHash(
    [input.stateFingerprint, input.twinHash, input.cycleTimestampIso].join("|")
  )}`;
}
