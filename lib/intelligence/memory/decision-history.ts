/**
 * Decision history helpers — in-memory / fixture only (no Prisma writes).
 */
import type { DecisionMemoryRecord } from "@/lib/intelligence/memory/v7-types";

export function emptyDecisionHistory(): DecisionMemoryRecord[] {
  return [];
}

export function summarizeDecisionHistory(records: DecisionMemoryRecord[]): {
  totalRecords: number;
  byType: Record<string, number>;
} {
  const byType: Record<string, number> = {};
  for (const r of records) {
    byType[r.decisionType] = (byType[r.decisionType] ?? 0) + 1;
  }
  return { totalRecords: records.length, byType };
}

export function decisionsOfType(
  records: DecisionMemoryRecord[],
  decisionType: string
): DecisionMemoryRecord[] {
  return records.filter((r) => r.decisionType === decisionType);
}

/** Build a memory record from a live decision — caller supplies ids; no auto-persist. */
export function buildDecisionMemoryRecord(input: {
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
}): DecisionMemoryRecord {
  return {
    ...input,
    mode: "RECOMMENDED",
    executionStatus: "RECOMMENDED",
    outcomeStatus: "PENDING",
  };
}
