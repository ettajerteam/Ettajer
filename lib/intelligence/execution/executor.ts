/**
 * V9 Executor — registry-bound sandbox mutations only.
 * productionMutation is always NONE (no Prisma / no commerce writes).
 */
import type {
  ExecuteInterventionInput,
  ExecutionRecord,
  ExecutionResultStatus,
} from "@/lib/intelligence/execution/types";
import {
  getApproval,
  markApprovalLifecycle,
  refreshExpiry,
} from "@/lib/intelligence/execution/approval";
import { runGovernor, mapVerdictToStatus } from "@/lib/intelligence/execution/governor";
import { getHandler, getExecutionDef } from "@/lib/intelligence/execution/registry";
import { runSandboxTransaction } from "@/lib/intelligence/execution/transaction";
import { verifyExecution, metricsFromState } from "@/lib/intelligence/execution/verification";
import { describeRollback } from "@/lib/intelligence/execution/rollback";
import { buildExecutionOutcome, toOutcomeMemoryRecord } from "@/lib/intelligence/execution/outcome";
import { auditStep } from "@/lib/intelligence/execution/audit";
import { buildExecutionId } from "@/lib/intelligence/execution/idempotency";
import { recheckPreconditions } from "@/lib/intelligence/execution/preconditions";

/** In-memory execution ledger (deterministic, process-local). */
const executionsByKey = new Map<string, ExecutionRecord>();
const locks = new Set<string>();

export function resetExecutions(): void {
  executionsByKey.clear();
  locks.clear();
}

export function getExecutionByKey(key: string): ExecutionRecord | null {
  return executionsByKey.get(key) ?? null;
}

export function listExecutions(): ExecutionRecord[] {
  return [...executionsByKey.values()].sort((a, b) =>
    a.executionId.localeCompare(b.executionId)
  );
}

export function executeIntervention(
  input: ExecuteInterventionInput
): ExecutionRecord {
  const approvalRaw = getApproval(input.approvalId);
  const approval = approvalRaw
    ? refreshExpiry(approvalRaw, input.nowIso)
    : null;

  const ledgerKey = `${input.idempotencyKey}|${input.mode}`;
  const prior = executionsByKey.get(ledgerKey) ?? null;

  if (locks.has(ledgerKey)) {
    const blocked: ExecutionRecord = {
      executionId: buildExecutionId({
        approvalId: input.approvalId,
        idempotencyKey: input.idempotencyKey,
        mode: input.mode,
      }),
      approvalId: input.approvalId,
      interventionId: input.interventionId,
      interventionType: approval?.interventionType ?? "NO_ACTION",
      decisionId: approval?.decisionId ?? "UNKNOWN",
      idempotencyKey: input.idempotencyKey,
      mode: input.mode,
      status: "CONFLICT_ALREADY_EXECUTING",
      governor: {
        verdict: "CONFLICT_ALREADY_EXECUTING",
        checks: [
          {
            checkId: "lock",
            status: "FAIL",
            reason: "CONFLICT_ALREADY_EXECUTING",
          },
        ],
        reasons: ["CONFLICT_ALREADY_EXECUTING"],
      },
      preconditions: [],
      transaction: null,
      verification: null,
      outcome: null,
      auditTrace: [
        auditStep({
          stage: "GOVERNOR_CHECK",
          timestamp: input.nowIso,
          stateFingerprint: input.currentStateFingerprint,
          actor: input.actor.actorId,
          result: "CONFLICT_ALREADY_EXECUTING",
          reason: "Concurrent execution lock held.",
          identifiers: { ledgerKey },
        }),
      ],
      productionMutation: "NONE",
      startedAt: input.nowIso,
      finishedAt: input.nowIso,
    };
    return blocked;
  }

  if (prior && input.mode === "EXECUTE") {
    return {
      ...prior,
      status: "IDEMPOTENT_REPLAY",
      auditTrace: [
        ...prior.auditTrace,
        auditStep({
          stage: "EXECUTION",
          timestamp: input.nowIso,
          stateFingerprint: input.currentStateFingerprint,
          actor: input.actor.actorId,
          result: "IDEMPOTENT_REPLAY",
          reason: "Same idempotency key — returning prior result; no new mutation.",
          identifiers: { executionId: prior.executionId },
        }),
      ],
    };
  }

  const governor = runGovernor({
    approval,
    actor: input.actor,
    exec: input,
    alreadyExecuting: false,
    priorExecutionExists: Boolean(prior),
  });

  const executionId = buildExecutionId({
    approvalId: input.approvalId,
    idempotencyKey: input.idempotencyKey,
    mode: input.mode,
  });

  const trace = [
    auditStep({
      stage: "OBSERVE",
      timestamp: input.nowIso,
      stateFingerprint: input.currentStateFingerprint,
      actor: input.actor.actorId,
      result: "OK",
      reason: "Current platform state loaded for re-check.",
      identifiers: { cycleId: input.cycleId },
    }),
    auditStep({
      stage: "DECISION",
      timestamp: input.nowIso,
      stateFingerprint: input.currentStateFingerprint,
      actor: "system",
      result: approval?.decisionId ?? "none",
      reason: "Bound to approved decision.",
      identifiers: { decisionId: approval?.decisionId ?? "" },
    }),
    auditStep({
      stage: "PLAN",
      timestamp: input.nowIso,
      stateFingerprint: approval?.stateFingerprint ?? "",
      actor: "system",
      result: approval?.interventionType ?? "none",
      reason: "V8 plan snapshot bound to approval.",
      identifiers: { interventionId: input.interventionId },
    }),
    auditStep({
      stage: "APPROVAL",
      timestamp: input.nowIso,
      stateFingerprint: approval?.stateFingerprint ?? "",
      actor: approval?.approvedBy ?? "none",
      result: approval?.lifecycle ?? "MISSING",
      reason: approval ? approval.reasons.join("; ") : "No approval.",
      identifiers: { approvalId: input.approvalId },
    }),
  ];

  if (!approval || governor.verdict !== "PASS") {
    const status: ExecutionResultStatus =
      governor.verdict === "PASS"
        ? "BLOCKED"
        : mapVerdictToStatus(governor.verdict);
    const pre =
      approval != null
        ? recheckPreconditions({
            approval,
            currentState: input.currentState,
            currentStateFingerprint: input.currentStateFingerprint,
            currentTwinHash: input.currentTwinHash,
            dataQualityStatus: input.dataQualityStatus,
            insufficientEvidence: input.insufficientEvidence,
          }).checks
        : [];
    trace.push(
      auditStep({
        stage: "GOVERNOR_CHECK",
        timestamp: input.nowIso,
        stateFingerprint: input.currentStateFingerprint,
        actor: input.actor.actorId,
        result: governor.verdict,
        reason: governor.reasons.join("; "),
        identifiers: { executionId },
      })
    );
    const record: ExecutionRecord = {
      executionId,
      approvalId: input.approvalId,
      interventionId: input.interventionId,
      interventionType: approval?.interventionType ?? "NO_ACTION",
      decisionId: approval?.decisionId ?? "UNKNOWN",
      idempotencyKey: input.idempotencyKey,
      mode: input.mode,
      status: status === "EXECUTED" ? "BLOCKED" : status,
      governor,
      preconditions: pre,
      transaction: null,
      verification: null,
      outcome: null,
      auditTrace: trace,
      productionMutation: "NONE",
      startedAt: input.nowIso,
      finishedAt: input.nowIso,
    };
    if (governor.verdict === "IDEMPOTENT_REPLAY" && prior) {
      return { ...prior, status: "IDEMPOTENT_REPLAY" };
    }
    return record;
  }

  // PASS — proceed
  locks.add(ledgerKey);
  try {
    markApprovalLifecycle(approval.approvalId, "EXECUTING");
    const pre = recheckPreconditions({
      approval,
      currentState: input.currentState,
      currentStateFingerprint: input.currentStateFingerprint,
      currentTwinHash: input.currentTwinHash,
      dataQualityStatus: input.dataQualityStatus,
      insufficientEvidence: input.insufficientEvidence,
    });
    trace.push(
      auditStep({
        stage: "PRECONDITION_CHECK",
        timestamp: input.nowIso,
        stateFingerprint: input.currentStateFingerprint,
        actor: input.actor.actorId,
        result: pre.ok ? "PASS" : "FAIL",
        reason: pre.checks
          .filter((c) => c.status === "FAIL")
          .map((c) => c.reason)
          .join("; ") || "All preconditions PASS.",
        identifiers: { executionId },
      }),
      auditStep({
        stage: "GOVERNOR_CHECK",
        timestamp: input.nowIso,
        stateFingerprint: input.currentStateFingerprint,
        actor: input.actor.actorId,
        result: "PASS",
        reason: "Governor PASS.",
        identifiers: { executionId },
      })
    );

    const def = getExecutionDef(approval.interventionType);
    const handler = getHandler(approval.interventionType);
    if (!def || !handler) {
      markApprovalLifecycle(approval.approvalId, "FAILED");
      return {
        executionId,
        approvalId: input.approvalId,
        interventionId: input.interventionId,
        interventionType: approval.interventionType,
        decisionId: approval.decisionId,
        idempotencyKey: input.idempotencyKey,
        mode: input.mode,
        status: "BLOCKED",
        governor: {
          verdict: "UNREGISTERED",
          checks: [],
          reasons: ["Handler missing."],
        },
        preconditions: pre.checks,
        transaction: null,
        verification: null,
        outcome: null,
        auditTrace: trace,
        productionMutation: "NONE",
        startedAt: input.nowIso,
        finishedAt: input.nowIso,
      };
    }

    if (input.mode === "DRY_RUN") {
      // Validations only — zero sandbox mutation applied to ledger as committed
      const predicted = metricsFromState(input.currentState);
      const verification = verifyExecution({
        plan: approval.planSnapshot,
        before: input.currentState,
        after: input.currentState,
      });
      trace.push(
        auditStep({
          stage: "EXECUTION",
          timestamp: input.nowIso,
          stateFingerprint: input.currentStateFingerprint,
          actor: input.actor.actorId,
          result: "DRY_RUN_OK",
          reason: "DRY_RUN — zero production mutation; zero sandbox commit.",
          identifiers: { executionId },
        }),
        auditStep({
          stage: "VERIFICATION",
          timestamp: input.nowIso,
          stateFingerprint: input.currentStateFingerprint,
          actor: "system",
          result: "SKIPPED_DRY_RUN",
          reason: "Dry run does not mutate; verification is predictive only.",
          identifiers: {},
        }),
        auditStep({
          stage: "MEASUREMENT",
          timestamp: input.nowIso,
          stateFingerprint: input.currentStateFingerprint,
          actor: "system",
          result: "BASELINE",
          reason: JSON.stringify(predicted),
          identifiers: {},
        }),
        auditStep({
          stage: "OUTCOME",
          timestamp: input.nowIso,
          stateFingerprint: input.currentStateFingerprint,
          actor: "system",
          result: "DRY_RUN",
          reason: "productionMutation=NONE",
          identifiers: {},
        })
      );
      markApprovalLifecycle(approval.approvalId, "APPROVED");
      const outcome = buildExecutionOutcome({
        executionId,
        decisionId: approval.decisionId,
        interventionId: approval.interventionId,
        interventionType: approval.interventionType,
        before: predicted,
        after: predicted,
        expected: approval.planSnapshot.measurement.expectedAfter,
        success: true,
        failureReason: null,
        rollbackState: "NOT_NEEDED",
        measuredAt: input.nowIso,
        mode: "DRY_RUN",
      });
      const record: ExecutionRecord = {
        executionId,
        approvalId: input.approvalId,
        interventionId: input.interventionId,
        interventionType: approval.interventionType,
        decisionId: approval.decisionId,
        idempotencyKey: input.idempotencyKey,
        mode: "DRY_RUN",
        status: "DRY_RUN_OK",
        governor,
        preconditions: pre.checks,
        transaction: {
          committed: false,
          rolledBack: false,
          partialFailure: false,
          mutations: [],
          reason: "DRY_RUN — no mutations.",
        },
        verification: {
          ...verification,
          note: "DRY_RUN predictive verification.",
        },
        outcome,
        auditTrace: trace,
        productionMutation: "NONE",
        startedAt: input.nowIso,
        finishedAt: input.nowIso,
      };
      executionsByKey.set(ledgerKey, record);
      return record;
    }

    // EXECUTE — sandbox only
    const tx = runSandboxTransaction({
      state: input.currentState,
      handler,
      targetCount: approval.planSnapshot.target.count,
      baseline: approval.planSnapshot.measurement.baseline,
    });

    const rb = describeRollback(tx.result, approval.planSnapshot.rollback);
    let status: ExecutionResultStatus = "EXECUTED";
    let afterState = tx.state;

    if (tx.result.rolledBack) {
      status = "ROLLED_BACK";
      afterState = tx.snapshotBefore;
      markApprovalLifecycle(approval.approvalId, "ROLLED_BACK");
    } else if (tx.result.partialFailure) {
      status = "PARTIAL_FAILURE";
      markApprovalLifecycle(approval.approvalId, "FAILED");
    } else if (!tx.result.committed) {
      status = "FAILED";
      markApprovalLifecycle(approval.approvalId, "FAILED");
    } else {
      markApprovalLifecycle(approval.approvalId, "EXECUTED", {
        reasons: ["Sandbox execution committed."],
      });
    }

    const verification = verifyExecution({
      plan: approval.planSnapshot,
      before: tx.snapshotBefore,
      after: afterState,
    });

    const beforeMetrics = metricsFromState(tx.snapshotBefore);
    const afterMetrics = metricsFromState(afterState);
    const outcome = buildExecutionOutcome({
      executionId,
      decisionId: approval.decisionId,
      interventionId: approval.interventionId,
      interventionType: approval.interventionType,
      before: beforeMetrics,
      after: afterMetrics,
      expected: approval.planSnapshot.measurement.expectedAfter,
      success: status === "EXECUTED" && verification.businessSuccess,
      failureReason:
        status === "EXECUTED"
          ? verification.businessSuccess
            ? null
            : verification.note
          : tx.result.reason,
      rollbackState: rb.state,
      measuredAt: input.nowIso,
      mode: "EXECUTE",
    });

    // V7 memory-compatible side artifact (caller may persist; we do not write Prisma)
    void toOutcomeMemoryRecord(outcome, input.currentStateFingerprint);

    trace.push(
      auditStep({
        stage: "EXECUTION",
        timestamp: input.nowIso,
        stateFingerprint: input.currentStateFingerprint,
        actor: input.actor.actorId,
        result: status,
        reason: tx.result.reason,
        identifiers: { executionId, mutations: String(tx.result.mutations.length) },
      }),
      auditStep({
        stage: "VERIFICATION",
        timestamp: input.nowIso,
        stateFingerprint: input.currentStateFingerprint,
        actor: "system",
        result: verification.verified ? "PASS" : "FAIL",
        reason: verification.note,
        identifiers: {},
      }),
      auditStep({
        stage: "MEASUREMENT",
        timestamp: input.nowIso,
        stateFingerprint: input.currentStateFingerprint,
        actor: "system",
        result: JSON.stringify(afterMetrics),
        reason: `baseline=${JSON.stringify(beforeMetrics)}`,
        identifiers: {
          primary: approval.planSnapshot.measurement.primaryMetric,
        },
      }),
      auditStep({
        stage: "OUTCOME",
        timestamp: input.nowIso,
        stateFingerprint: input.currentStateFingerprint,
        actor: "system",
        result: outcome.success ? "SUCCESS" : "FAILED",
        reason: `productionMutation=NONE; rollback=${outcome.rollbackState}`,
        identifiers: { executionId },
      })
    );

    const record: ExecutionRecord = {
      executionId,
      approvalId: input.approvalId,
      interventionId: input.interventionId,
      interventionType: approval.interventionType,
      decisionId: approval.decisionId,
      idempotencyKey: input.idempotencyKey,
      mode: "EXECUTE",
      status,
      governor,
      preconditions: pre.checks,
      transaction: tx.result,
      verification,
      outcome,
      auditTrace: trace,
      productionMutation: "NONE",
      startedAt: input.nowIso,
      finishedAt: input.nowIso,
    };
    executionsByKey.set(ledgerKey, record);
    return record;
  } finally {
    locks.delete(ledgerKey);
  }
}
