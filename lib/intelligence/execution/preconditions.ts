/**
 * Precondition re-check — compare live state vs approval snapshot.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type {
  ApprovalRecord,
  PreconditionCheck,
} from "@/lib/intelligence/execution/types";
import { EXECUTION_CONFIG } from "@/lib/intelligence/execution/config";
import { evaluatePrerequisites } from "@/lib/intelligence/interventions/prerequisites";
import { getInterventionDef } from "@/lib/intelligence/interventions/registry";
import {
  calculateBlastRadius,
  evaluateSafety,
} from "@/lib/intelligence/interventions/safety";
import { evaluateRisk } from "@/lib/intelligence/interventions/risk";
import { BLAST_RANK } from "@/lib/intelligence/execution/config";

export function recheckPreconditions(input: {
  approval: ApprovalRecord;
  currentState: PlatformState;
  currentStateFingerprint: string;
  currentTwinHash: string;
  dataQualityStatus: "OK" | "DEGRADED" | "INSUFFICIENT";
  insufficientEvidence: boolean;
}): { ok: boolean; checks: PreconditionCheck[] } {
  const checks: PreconditionCheck[] = [];
  const plan = input.approval.planSnapshot;
  const def = getInterventionDef(plan.type);

  if (input.currentStateFingerprint !== input.approval.stateFingerprint) {
    checks.push({
      checkId: "state_fingerprint",
      status: "FAIL",
      reason: "State fingerprint mismatch — re-plan/re-approval required.",
      before: input.approval.stateFingerprint,
      after: input.currentStateFingerprint,
    });
  } else {
    checks.push({
      checkId: "state_fingerprint",
      status: "PASS",
      reason: "State fingerprint matches approval.",
    });
  }

  if (input.currentTwinHash !== input.approval.twinHash) {
    checks.push({
      checkId: "twin_hash",
      status: "FAIL",
      reason: "Twin hash mismatch — digital twin changed.",
      before: input.approval.twinHash,
      after: input.currentTwinHash,
    });
  } else {
    checks.push({
      checkId: "twin_hash",
      status: "PASS",
      reason: "Twin hash matches approval.",
    });
  }

  if (input.dataQualityStatus === "INSUFFICIENT" || input.insufficientEvidence) {
    checks.push({
      checkId: "data_quality",
      status: "FAIL",
      reason: `Data quality ${input.dataQualityStatus} — cannot execute safely.`,
    });
  } else {
    checks.push({
      checkId: "data_quality",
      status: "PASS",
      reason: `Data quality ${input.dataQualityStatus}.`,
    });
  }

  // Material metric drift for COD — always fail on abs delta (fingerprints may be bucketed)
  const approvedPending =
    plan.measurement.baseline.pendingCOD ??
    plan.target.count;
  const livePending = input.currentState.pendingRealOrders;
  const delta = Math.abs(livePending - approvedPending);
  if (plan.type === "COD_VERIFICATION") {
    if (livePending === 0) {
      checks.push({
        checkId: "pending_cod_material",
        status: "FAIL",
        reason: "pendingCOD is 0 — prerequisite failed.",
        before: approvedPending,
        after: livePending,
      });
    } else if (delta >= EXECUTION_CONFIG.materialChange.pendingCODAbs) {
      checks.push({
        checkId: "pending_cod_material",
        status: "FAIL",
        reason: `pendingCOD changed materially: approved=${approvedPending} live=${livePending}. Re-plan/re-approval required.`,
        before: approvedPending,
        after: livePending,
      });
    } else {
      checks.push({
        checkId: "pending_cod_material",
        status: "PASS",
        reason: `pendingCOD stable at ${livePending}.`,
        before: approvedPending,
        after: livePending,
      });
    }
  }

  if (def) {
    const prereq = evaluatePrerequisites({
      type: plan.type,
      state: input.currentState,
    });
    for (const p of prereq) {
      checks.push({
        checkId: `prereq_${p.prerequisiteId}`,
        status: p.status === "PASS" ? "PASS" : "FAIL",
        reason: p.reason,
      });
    }

    const blastForSafety = calculateBlastRadius({
      def,
      state: input.currentState,
      targetCount: Math.max(plan.target.count, 1),
    });
    const prereqOk = prereq.every((p) => p.status === "PASS");
    const safety = evaluateSafety({
      def,
      state: input.currentState,
      dataQualityStatus: input.dataQualityStatus,
      insufficientEvidence: input.insufficientEvidence,
      prerequisitesOk: prereqOk,
      blast: blastForSafety,
      conflicts: [],
      isDuplicate: false,
      historicalReliability: "INSUFFICIENT",
    });
    if (safety.level === "BLOCKED") {
      checks.push({
        checkId: "safety_recheck",
        status: "FAIL",
        reason: `Safety BLOCKED on re-check.`,
      });
    } else {
      checks.push({
        checkId: "safety_recheck",
        status: "PASS",
        reason: `Safety ${safety.level}.`,
      });
    }

    const blast = calculateBlastRadius({
      def,
      state: input.currentState,
      targetCount: plan.target.count,
    });
    const risk = evaluateRisk({
      def,
      blast,
      safetyLevel: safety.level,
    });
    if (
      (BLAST_RANK[risk.overallRisk] ?? 0) >
      (BLAST_RANK[input.approval.riskSnapshot] ?? 0) + 1
    ) {
      checks.push({
        checkId: "risk_escalation",
        status: "FAIL",
        reason: `Risk escalated ${input.approval.riskSnapshot} → ${risk.overallRisk}.`,
      });
    } else {
      checks.push({
        checkId: "risk_escalation",
        status: "PASS",
        reason: `Risk ${risk.overallRisk} within tolerance of ${input.approval.riskSnapshot}.`,
      });
    }
  } else {
    checks.push({
      checkId: "registry",
      status: "FAIL",
      reason: "Intervention definition missing.",
    });
  }

  const ok = checks.every((c) => c.status === "PASS");
  return { ok, checks };
}
