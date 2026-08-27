/**
 * Deterministic hash helpers for V9 ids / idempotency (no random UUIDs).
 */
export function stableHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function buildApprovalId(parts: {
  decisionId: string;
  interventionId: string;
  stateFingerprint: string;
  twinHash: string;
}): string {
  return `ap9_${stableHash(
    [
      parts.decisionId,
      parts.interventionId,
      parts.stateFingerprint,
      parts.twinHash,
    ].join("|")
  )}`;
}

export function buildExecutionId(parts: {
  approvalId: string;
  idempotencyKey: string;
  mode: string;
}): string {
  return `ex9_${stableHash(
    [parts.approvalId, parts.idempotencyKey, parts.mode].join("|")
  )}`;
}

export function buildExecutionIdempotencyKey(parts: {
  decisionId: string;
  interventionType: string;
  targetCount: number;
  stateFingerprint: string;
  approvalId: string;
}): string {
  return `ix9_${stableHash(
    [
      parts.decisionId,
      parts.interventionType,
      String(parts.targetCount),
      parts.stateFingerprint,
      parts.approvalId,
    ].join("|")
  )}`;
}
