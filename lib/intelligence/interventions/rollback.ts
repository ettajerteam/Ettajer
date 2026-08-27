/**
 * Rollback plans — never claim rollback when impossible.
 */
import type {
  RegistryInterventionDef,
  RollbackPlan,
} from "@/lib/intelligence/interventions/types";

export function buildRollbackPlan(def: RegistryInterventionDef): RollbackPlan {
  if (def.type === "NO_ACTION") {
    return {
      possible: true,
      reversibility: "HIGH",
      strategy: "N/A — no mutation.",
      limitations: [],
    };
  }

  if (!def.mutable) {
    return {
      possible: true,
      reversibility: def.reversibility,
      strategy: def.rollbackStrategy,
      limitations: [
        "Review/outreach plans are non-mutating at V8 boundary; cancel future queues if any.",
      ],
    };
  }

  if (def.reversibility === "NONE" || def.reversibility === "LOW") {
    return {
      possible: def.reversibility !== "NONE",
      reversibility: def.reversibility,
      strategy: def.rollbackStrategy,
      limitations: [
        "Rollback may be incomplete for already-applied changes.",
        "Do not claim full restore without evidence.",
      ],
    };
  }

  return {
    possible: true,
    reversibility: def.reversibility,
    strategy: def.rollbackStrategy,
    limitations: ["Stop further steps; restore prior config only if recorded."],
  };
}
