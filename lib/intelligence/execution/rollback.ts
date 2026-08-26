/**
 * Rollback helpers for V9 sandbox executions.
 */
import type { TransactionResult } from "@/lib/intelligence/execution/types";
import type { RollbackPlan } from "@/lib/intelligence/interventions/types";

export function describeRollback(
  tx: TransactionResult | null,
  planRollback: RollbackPlan
): {
  state: "NONE" | "APPLIED" | "IMPOSSIBLE" | "NOT_NEEDED";
  note: string;
} {
  if (!tx) return { state: "NONE", note: "No transaction." };
  if (tx.committed) return { state: "NOT_NEEDED", note: "Committed successfully." };
  if (tx.rolledBack) return { state: "APPLIED", note: tx.reason };
  if (tx.partialFailure) {
    return {
      state: planRollback.possible ? "IMPOSSIBLE" : "IMPOSSIBLE",
      note: tx.reason,
    };
  }
  return { state: "NONE", note: tx.reason };
}
