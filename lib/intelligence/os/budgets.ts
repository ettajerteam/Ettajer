/**
 * Deterministic resource / risk budgets.
 */
import { OS_CONFIG } from "@/lib/intelligence/os/config";
import type { BudgetStatus } from "@/lib/intelligence/os/types";

export function evaluateBudgets(input: {
  plannedRisks: string[];
  plannedBlast: string[];
  plannedContacts: number;
  plannedExecutions: number;
}): { budgets: BudgetStatus[]; exceeded: boolean; reasons: string[] } {
  const B = OS_CONFIG.budgets;
  let riskUsed = 0;
  for (const r of input.plannedRisks) {
    riskUsed += OS_CONFIG.riskCost[r] ?? 2;
  }
  let blastUsed = 0;
  for (const b of input.plannedBlast) {
    blastUsed += OS_CONFIG.blastCost[b] ?? 2;
  }

  const budgets: BudgetStatus[] = [
    mk("executionSlots", B.executionSlots, input.plannedExecutions),
    mk("merchantContact", B.merchantContact, input.plannedContacts),
    mk("operationalCapacity", B.operationalCapacity, input.plannedContacts + input.plannedExecutions * 5),
    mk("riskUnits", B.riskUnits, riskUsed),
    mk("blastRadiusUnits", B.blastRadiusUnits, blastUsed),
  ];

  const reasons: string[] = [];
  for (const b of budgets) {
    if (b.status === "EXCEEDED") {
      reasons.push(`Budget ${b.budgetId} exceeded (${b.used}/${b.limit}).`);
    }
  }
  return { budgets, exceeded: reasons.length > 0, reasons };
}

function mk(id: string, limit: number, used: number): BudgetStatus {
  const remaining = limit - used;
  return {
    budgetId: id,
    limit,
    used,
    remaining,
    status: remaining < 0 ? "EXCEEDED" : remaining <= limit * 0.15 ? "NEAR" : "OK",
  };
}
