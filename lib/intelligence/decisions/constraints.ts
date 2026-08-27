/**
 * Explicit constraint evaluation — PASS / WARN / BLOCK.
 * V6 never silently ignores constraints.
 */
import { isValidAdminHref } from "@/lib/intelligence/recommendations/actions";
import type { DecisionCandidate } from "@/lib/intelligence/decisions/types";
import type { DecisionConstraintResult } from "@/lib/intelligence/decisions/types";
import { DECISION_THRESHOLDS } from "@/lib/intelligence/decisions/config";

export function evaluateConstraints(input: {
  candidate: DecisionCandidate;
  dataQualityStatus: "OK" | "DEGRADED" | "INSUFFICIENT";
  scenarioAvailable: boolean;
  insufficientEvidence: boolean;
}): DecisionConstraintResult[] {
  const { candidate } = input;
  const results: DecisionConstraintResult[] = [];

  // Data quality
  if (input.dataQualityStatus === "INSUFFICIENT" || input.insufficientEvidence) {
    results.push({
      constraintId: "INSUFFICIENT_EVIDENCE",
      status: candidate.id === "NO_ACTION" ? "WARN" : "BLOCK",
      reason:
        "Platform sample / evidence is insufficient for a confident operational decision.",
      evidence: [
        `dataQualityStatus=${input.dataQualityStatus}`,
        `insufficientEvidence=${input.insufficientEvidence}`,
      ],
    });
  } else if (input.dataQualityStatus === "DEGRADED") {
    results.push({
      constraintId: "DEGRADED_DATA_QUALITY",
      status: "WARN",
      reason: "Data quality degraded — decision confidence must be capped.",
      evidence: [`cap=${DECISION_THRESHOLDS.degradedConfidenceCap}`],
    });
  } else {
    results.push({
      constraintId: "DATA_QUALITY_OK",
      status: "PASS",
      reason: "Data quality firewall reports OK.",
      evidence: ["status=OK"],
    });
  }

  // Route validity
  if (candidate.id !== "NO_ACTION") {
    if (!candidate.route || !isValidAdminHref(candidate.route)) {
      results.push({
        constraintId: "MISSING_OR_INVALID_ROUTE",
        status: "BLOCK",
        reason: "Candidate lacks a valid existing admin route.",
        evidence: [`route=${candidate.route || "(empty)"}`],
      });
    } else {
      results.push({
        constraintId: "ROUTE_VALID",
        status: "PASS",
        reason: "Route maps to an existing admin surface.",
        evidence: [`route=${candidate.route}`],
      });
    }
  }

  // Unknown / empty target
  if (
    candidate.id !== "NO_ACTION" &&
    candidate.affectedCount <= 0 &&
    candidate.domain !== "baseline"
  ) {
    results.push({
      constraintId: "UNKNOWN_TARGET",
      status: "BLOCK",
      reason: "Affected count is zero — no concrete target to act on.",
      evidence: [`affectedCount=${candidate.affectedCount}`],
    });
  }

  // Destructive / financial — V6 never auto-executes; mark financial review
  if (
    candidate.id === "REVIEW_PENDING_COD" ||
    candidate.domain === "operations"
  ) {
    results.push({
      constraintId: "FINANCIAL_ACTION_REQUIRES_APPROVAL",
      status: "WARN",
      reason:
        "Operational/financial review remains human-approved. V6 recommends only (mode=RECOMMENDED).",
      evidence: ["mode=RECOMMENDED", "execution=V7"],
    });
  }

  // Irreversibility
  if (candidate.reversibility < 0.35 && candidate.id !== "NO_ACTION") {
    results.push({
      constraintId: "LOW_REVERSIBILITY",
      status: "WARN",
      reason: "Action has low reversibility — prefer reversible alternatives when scores are close.",
      evidence: [`reversibility=${candidate.reversibility}`],
    });
  }

  // High uncertainty without scenario
  if (
    !input.scenarioAvailable &&
    candidate.id !== "NO_ACTION" &&
    candidate.confidence < 0.4
  ) {
    results.push({
      constraintId: "SCENARIO_SIMULATION_UNAVAILABLE",
      status: "WARN",
      reason: "No matching V5 scenario support — decision confidence reduced.",
      evidence: ["scenarioAvailable=false"],
    });
  }

  // High uncertainty flag
  if (candidate.confidence < 0.35 && candidate.id !== "NO_ACTION") {
    results.push({
      constraintId: "HIGH_UNCERTAINTY",
      status: "WARN",
      reason: "Candidate confidence is low.",
      evidence: [`confidence=${candidate.confidence}`],
    });
  }

  // Always at least one result
  if (results.length === 0) {
    results.push({
      constraintId: "NO_CONSTRAINTS",
      status: "PASS",
      reason: "No blocking or warning constraints fired.",
      evidence: [],
    });
  }

  return results;
}

export function isBlocked(constraints: DecisionConstraintResult[]): boolean {
  return constraints.some((c) => c.status === "BLOCK");
}

export function hasWarn(constraints: DecisionConstraintResult[]): boolean {
  return constraints.some((c) => c.status === "WARN");
}
