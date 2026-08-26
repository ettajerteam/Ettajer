/**
 * Safety gate + blast radius — deterministic.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { INTERVENTION_THRESHOLDS as T } from "@/lib/intelligence/interventions/config";
import type { RegistryInterventionDef } from "@/lib/intelligence/interventions/types";
import type {
  BlastRadius,
  BlastRadiusLevel,
  SafetyCheckResult,
  SafetyLevel,
} from "@/lib/intelligence/interventions/types";

export function calculateBlastRadius(input: {
  def: RegistryInterventionDef;
  state: PlatformState;
  targetCount: number;
}): BlastRadius {
  const { state, targetCount, def } = input;
  let affectedOrders = 0;
  let affectedDomains = 0;
  let affectedMerchants = 0;
  let affectedRevenue = 0;

  if (def.type === "COD_VERIFICATION") {
    affectedOrders = state.pendingRealOrders;
    affectedRevenue = state.pendingRealGmv;
    affectedMerchants = Math.min(state.pendingRealOrders, state.totalStores);
  } else if (def.type === "DNS_DIAGNOSIS") {
    affectedDomains = state.domainFailing;
    affectedMerchants = state.domainFailing;
  } else if (def.type === "SUPPORT_ESCALATION") {
    affectedMerchants = state.openSupport;
  } else if (
    def.type === "FIRST_SALE_ASSISTANCE" ||
    def.type === "ACTIVATION_OUTREACH"
  ) {
    affectedMerchants = targetCount;
  } else if (def.type === "MERCHANT_ONBOARDING") {
    affectedMerchants = 100;
  } else if (def.type === "REVENUE_CONCENTRATION_REVIEW") {
    affectedMerchants = Math.max(2, state.concentration.length);
    affectedRevenue = state.realRevenue7d;
  }

  const level = classifyBlast(
    targetCount,
    affectedRevenue,
    def.type === "MERCHANT_ONBOARDING"
  );

  return {
    targetCount,
    affectedMerchants,
    affectedOrders,
    affectedDomains,
    affectedRevenue,
    level,
    note: `Blast radius ${level} for ${def.type} (targets=${targetCount}).`,
  };
}

function classifyBlast(
  count: number,
  revenue: number,
  platformWide: boolean
): BlastRadiusLevel {
  if (platformWide || count >= T.blastHigh || revenue >= T.revenueBlastHigh) {
    return "CRITICAL";
  }
  if (count >= T.blastMedium || revenue >= T.revenueBlastMedium) return "HIGH";
  if (count >= T.blastLow) return "MEDIUM";
  return "LOW";
}

export function evaluateSafety(input: {
  def: RegistryInterventionDef;
  state: PlatformState;
  dataQualityStatus: "OK" | "DEGRADED" | "INSUFFICIENT";
  insufficientEvidence: boolean;
  prerequisitesOk: boolean;
  blast: BlastRadius;
  conflicts: string[];
  isDuplicate: boolean;
  historicalReliability: string;
}): { checks: SafetyCheckResult[]; level: SafetyLevel } {
  const checks: SafetyCheckResult[] = [];

  const add = (
    checkId: string,
    status: SafetyCheckResult["status"],
    reason: string,
    evidence: string[] = []
  ) => {
    checks.push({ checkId, status, reason, evidence });
  };

  if (!input.prerequisitesOk) {
    add("PREREQUISITES", "FAIL", "One or more prerequisites failed.");
  } else {
    add("PREREQUISITES", "PASS", "Prerequisites satisfied.");
  }

  if (input.dataQualityStatus === "INSUFFICIENT" || input.insufficientEvidence) {
    add(
      "DATA_QUALITY",
      input.def.type === "NO_ACTION" ? "WARN" : "FAIL",
      "Insufficient evidence / data quality for safe intervention planning.",
      [`status=${input.dataQualityStatus}`]
    );
  } else if (input.dataQualityStatus === "DEGRADED") {
    add("DATA_QUALITY", "WARN", "Data quality degraded — caution.", []);
  } else {
    add("DATA_QUALITY", "PASS", "Data quality OK.", []);
  }

  if (input.blast.targetCount <= 0 && input.def.type !== "NO_ACTION") {
    add("TARGET_VALIDITY", "FAIL", "No valid targets.", [
      `targetCount=${input.blast.targetCount}`,
    ]);
  } else {
    add("TARGET_VALIDITY", "PASS", "Targets present or NO_ACTION.", []);
  }

  if (input.conflicts.length > 0) {
    add("CONFLICTING_INTERVENTION", "FAIL", "Conflicting intervention detected.", [
      ...input.conflicts,
    ]);
  } else {
    add("CONFLICTING_INTERVENTION", "PASS", "No conflicts.", []);
  }

  if (input.isDuplicate) {
    add("DUPLICATE_INTERVENTION", "FAIL", "Duplicate / already in progress.", []);
  } else {
    add("DUPLICATE_INTERVENTION", "PASS", "No active duplicate.", []);
  }

  if (input.def.mutable && input.def.reversibility === "NONE") {
    add(
      "DESTRUCTIVE_IRREVERSIBLE",
      "FAIL",
      "Mutable intervention with no rollback.",
      []
    );
  } else if (input.def.mutable) {
    add(
      "PRODUCTION_MUTATION_RISK",
      "WARN",
      "Plan describes a mutable boundary — V8 will NOT execute. Human approval required.",
      ["executionMode≠AUTO_EXECUTE"]
    );
  } else {
    add("PRODUCTION_MUTATION_RISK", "PASS", "Non-mutating / review-oriented.", []);
  }

  if (
    input.blast.level === "CRITICAL" ||
    input.blast.level === "HIGH"
  ) {
    add(
      "BLAST_RADIUS",
      "WARN",
      `Blast radius ${input.blast.level} — elevated approval required.`,
      [`level=${input.blast.level}`]
    );
  } else {
    add("BLAST_RADIUS", "PASS", `Blast radius ${input.blast.level}.`, []);
  }

  add(
    "AUTHORIZATION",
    "PASS",
    "V8 does not grant authorization — plans remain RECOMMENDATION_ONLY / READY_FOR_APPROVAL.",
    ["autoExecute=false"]
  );

  const failed = checks.some((c) => c.status === "FAIL");
  const warned = checks.some((c) => c.status === "WARN");
  const level: SafetyLevel = failed ? "BLOCKED" : warned ? "CAUTION" : "SAFE";

  return { checks, level };
}
