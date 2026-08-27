/**
 * Portfolio conflict detection — fail closed on BLOCK severity.
 */
import type { ConflictResult } from "@/lib/intelligence/os/types";
import { listDependencyEdges } from "@/lib/intelligence/os/dependencies";

export function detectPortfolioConflicts(input: {
  interventionTypes: string[];
  openSupport: number;
  supportCapacityThreshold?: number;
}): ConflictResult {
  const conflicts: ConflictResult["conflicts"] = [];
  const types = [...new Set(input.interventionTypes)].sort();
  const threshold = input.supportCapacityThreshold ?? 5;

  for (const e of listDependencyEdges()) {
    if (e.relation !== "CONFLICTS_WITH") continue;
    if (types.includes(e.from) && types.includes(e.to)) {
      const severity =
        e.from === "MERCHANT_ONBOARDING" &&
        e.to === "SUPPORT_ESCALATION" &&
        input.openSupport >= threshold
          ? "BLOCK"
          : "WARN";
      conflicts.push({
        a: e.from,
        b: e.to,
        severity,
        reason: e.reason,
      });
    }
  }

  // Same-type duplicates
  const counts = new Map<string, number>();
  for (const t of input.interventionTypes) {
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  for (const [t, n] of [...counts.entries()].sort()) {
    if (n > 1) {
      conflicts.push({
        a: t,
        b: t,
        severity: "BLOCK",
        reason: `Duplicate intervention type ${t} (${n}×) in portfolio.`,
      });
    }
  }

  // Onboarding + high support without escalation capacity
  if (
    types.includes("MERCHANT_ONBOARDING") &&
    input.openSupport >= threshold &&
    !types.includes("SUPPORT_ESCALATION")
  ) {
    conflicts.push({
      a: "MERCHANT_ONBOARDING",
      b: "SUPPORT_CAPACITY",
      severity: "WARN",
      reason: "Onboarding while support backlog elevated — capacity risk.",
    });
  }

  conflicts.sort((a, b) => `${a.a}:${a.b}`.localeCompare(`${b.a}:${b.b}`));
  return {
    status: conflicts.some((c) => c.severity === "BLOCK")
      ? "CONFLICT"
      : conflicts.length
        ? "CONFLICT"
        : "NO_CONFLICT",
    conflicts,
  };
}
