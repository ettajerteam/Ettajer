/**
 * Dr Sara V9 — Controlled Execution & Governance tests.
 */
import { describe, expect, it, beforeEach } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { planIntervention } from "@/lib/intelligence/interventions/planner";
import { primaryStateFingerprint } from "@/lib/intelligence/memory/fingerprints";
import {
  EXECUTION_REGISTRY,
  getExecutionDef,
  adminActor,
  resetExecutionEngine,
  requestApproval,
  approve,
  reject,
  executeIntervention,
  runGovernedExecution,
  setKillSwitch,
  getKillSwitch,
  runSandboxTransaction,
  getHandler,
  toOutcomeMemoryRecord,
  buildExecutionIdempotencyKey,
} from "@/lib/intelligence/execution/index";
import type { Actor } from "@/lib/intelligence/execution/types";

function state(partial: Partial<PlatformState> = {}): PlatformState {
  const base = emptyPlatformState(new Date("2026-08-26T12:00:00Z"));
  return {
    ...base,
    ...partial,
    funnel: { ...base.funnel, ...partial.funnel },
    firstSaleBottlenecks: {
      ...base.firstSaleBottlenecks,
      ...partial.firstSaleBottlenecks,
    },
    sparklines: { ...base.sparklines, ...partial.sparklines },
    today: { ...base.today, ...partial.today },
    yesterday: { ...base.yesterday, ...partial.yesterday },
  };
}

function liveOps() {
  return state({
    pendingRealOrders: 12,
    pendingRealGmv: 2272.98,
    openSupport: 1,
    domainFailing: 4,
    firstSaleCount: 128,
    firstSaleHighIntent: 103,
    hotEmptyCount: 5,
    top2SharePct: 67,
    concentrationElevated: true,
    totalStores: 50,
  });
}

const NOW = "2026-08-26T12:00:00.000Z";

function planFor(s: PlatformState) {
  return planIntervention({
    decisionId: "REVIEW_PENDING_COD",
    decisionTitle: "Review pending COD",
    decisionScore: 100,
    decisionConfidence: 0.9,
    decisionRoute: "/admin/payments?focus=pending",
    whyThis: ["pendingRealOrders=12"],
    state: s,
    stateFingerprint: primaryStateFingerprint(s),
    twinHash: "twin-test",
    dataQualityStatus: "OK",
    insufficientEvidence: false,
    expectedAfter: { pendingCOD: [4, 7] },
    baselineOverride: { pendingCOD: s.pendingRealOrders },
    cycleId: "c-v9",
  });
}

beforeEach(() => {
  resetExecutionEngine();
});

describe("V9 registry", () => {
  it("registers required intervention types", () => {
    const types = EXECUTION_REGISTRY.map((d) => d.interventionType);
    expect(types).toContain("COD_VERIFICATION");
    expect(types).toContain("DNS_DIAGNOSIS");
    expect(getExecutionDef("COD_VERIFICATION")?.requiresApproval).toBe(true);
    expect(getExecutionDef("COD_VERIFICATION")?.productionMutationAllowed).toBe(
      false
    );
  });

  it("unregistered interventions cannot execute", () => {
    expect(getExecutionDef("NOT_A_REAL_TYPE")).toBeNull();
  });
});

describe("V9 approval + authorization", () => {
  it("requires approval before execute", () => {
    const s = liveOps();
    const plan = planFor(s);
    const actor = adminActor();
    const { approval } = requestApproval({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: ["DECISION"],
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      actor,
      nowIso: NOW,
    });
    expect(approval.lifecycle).toBe("READY_FOR_APPROVAL");

    setKillSwitch("ENABLED");
    const blocked = executeIntervention({
      interventionId: plan.interventionId,
      approvalId: approval.approvalId,
      idempotencyKey: plan.execution.idempotencyKey,
      mode: "EXECUTE",
      actor,
      currentState: s,
      currentStateFingerprint: primaryStateFingerprint(s),
      currentTwinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      nowIso: NOW,
      cycleId: "c1",
    });
    expect(blocked.status).toBe("BLOCKED");
  });

  it("approves then executes in sandbox", () => {
    const s = liveOps();
    const plan = planFor(s);
    const { approval, execution } = runGovernedExecution({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: ["DECISION"],
      state: s,
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      actor: adminActor(),
      nowIso: NOW,
      mode: "EXECUTE",
      enableKillSwitch: true,
      cycleId: "c1",
    });
    expect(approval.lifecycle).toBe("EXECUTED");
    expect(execution.status).toBe("EXECUTED");
    expect(execution.productionMutation).toBe("NONE");
    expect(execution.outcome?.afterState.pendingCOD).toBe(5);
    expect(execution.verification?.verified).toBe(true);
  });

  it("rejects approval", () => {
    const s = liveOps();
    const plan = planFor(s);
    const actor = adminActor();
    const { approval } = requestApproval({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      actor,
      nowIso: NOW,
    });
    const rejected = reject({
      approvalId: approval.approvalId,
      actor,
      nowIso: NOW,
      reason: "Not now",
    });
    expect(rejected.lifecycle).toBe("REJECTED");
    setKillSwitch("ENABLED");
    const ex = executeIntervention({
      interventionId: plan.interventionId,
      approvalId: approval.approvalId,
      idempotencyKey: plan.execution.idempotencyKey,
      mode: "EXECUTE",
      actor,
      currentState: s,
      currentStateFingerprint: primaryStateFingerprint(s),
      currentTwinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      nowIso: NOW,
      cycleId: "c1",
    });
    expect(ex.status).toBe("BLOCKED");
  });

  it("expires approval", () => {
    const s = liveOps();
    const plan = planFor(s);
    const actor = adminActor();
    const { approval } = requestApproval({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      actor,
      nowIso: NOW,
      ttlMs: 1000,
    });
    approve({ approvalId: approval.approvalId, actor, nowIso: NOW });
    setKillSwitch("ENABLED");
    const ex = executeIntervention({
      interventionId: plan.interventionId,
      approvalId: approval.approvalId,
      idempotencyKey: plan.execution.idempotencyKey,
      mode: "EXECUTE",
      actor,
      currentState: s,
      currentStateFingerprint: primaryStateFingerprint(s),
      currentTwinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      nowIso: "2026-08-26T12:00:05.000Z",
      cycleId: "c1",
    });
    expect(ex.status).toBe("APPROVAL_EXPIRED");
  });

  it("blocks invalid actor", () => {
    const s = liveOps();
    const plan = planFor(s);
    const viewer: Actor = {
      actorId: "v1",
      role: "viewer",
      permissions: [],
    };
    const { approval } = requestApproval({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      actor: adminActor(),
      nowIso: NOW,
    });
    approve({
      approvalId: approval.approvalId,
      actor: adminActor(),
      nowIso: NOW,
    });
    setKillSwitch("ENABLED");
    const ex = executeIntervention({
      interventionId: plan.interventionId,
      approvalId: approval.approvalId,
      idempotencyKey: plan.execution.idempotencyKey,
      mode: "EXECUTE",
      actor: viewer,
      currentState: s,
      currentStateFingerprint: primaryStateFingerprint(s),
      currentTwinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      nowIso: NOW,
      cycleId: "c1",
    });
    expect(ex.status).toBe("BLOCKED");
    expect(ex.governor.verdict).toBe("UNAUTHORIZED");
  });
});

describe("V9 preconditions + kill switch + idempotency", () => {
  it("blocks state fingerprint / material metric mismatch", () => {
    const s = liveOps();
    const plan = planFor(s);
    const actor = adminActor();
    const { approval } = requestApproval({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      actor,
      nowIso: NOW,
    });
    approve({ approvalId: approval.approvalId, actor, nowIso: NOW });
    setKillSwitch("ENABLED");
    const changed = { ...s, pendingRealOrders: 31 };
    const ex = executeIntervention({
      interventionId: plan.interventionId,
      approvalId: approval.approvalId,
      idempotencyKey: plan.execution.idempotencyKey,
      mode: "EXECUTE",
      actor,
      currentState: changed,
      currentStateFingerprint: primaryStateFingerprint(changed),
      currentTwinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      nowIso: NOW,
      cycleId: "c1",
    });
    expect(ex.status).toBe("PRECONDITION_FAILED");
  });

  it("blocks twinHash mismatch", () => {
    const s = liveOps();
    const plan = planFor(s);
    const actor = adminActor();
    const { approval } = requestApproval({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      actor,
      nowIso: NOW,
    });
    approve({ approvalId: approval.approvalId, actor, nowIso: NOW });
    setKillSwitch("ENABLED");
    const ex = executeIntervention({
      interventionId: plan.interventionId,
      approvalId: approval.approvalId,
      idempotencyKey: plan.execution.idempotencyKey,
      mode: "EXECUTE",
      actor,
      currentState: s,
      currentStateFingerprint: primaryStateFingerprint(s),
      currentTwinHash: "twin-OTHER",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      nowIso: NOW,
      cycleId: "c1",
    });
    expect(ex.status).toBe("PRECONDITION_FAILED");
  });

  it("kill switch disables execute", () => {
    expect(getKillSwitch()).toBe("DISABLED");
    const s = liveOps();
    const plan = planFor(s);
    const { execution } = runGovernedExecution({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      state: s,
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      actor: adminActor(),
      nowIso: NOW,
      mode: "EXECUTE",
      enableKillSwitch: false,
      cycleId: "c1",
    });
    expect(execution.status).toBe("BLOCKED");
    expect(execution.governor.verdict).toBe("KILL_SWITCH");
  });

  it("idempotent double execute mutates once", () => {
    const s = liveOps();
    const plan = planFor(s);
    const actor = adminActor();
    const fp = primaryStateFingerprint(s);
    const { approval } = requestApproval({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      stateFingerprint: fp,
      twinHash: "twin-test",
      actor,
      nowIso: NOW,
    });
    approve({ approvalId: approval.approvalId, actor, nowIso: NOW });
    setKillSwitch("ENABLED");
    const input = {
      interventionId: plan.interventionId,
      approvalId: approval.approvalId,
      idempotencyKey: plan.execution.idempotencyKey,
      mode: "EXECUTE" as const,
      actor,
      currentState: s,
      currentStateFingerprint: fp,
      currentTwinHash: "twin-test",
      dataQualityStatus: "OK" as const,
      insufficientEvidence: false,
      nowIso: NOW,
      cycleId: "c1",
    };
    const a = executeIntervention(input);
    const b = executeIntervention(input);
    expect(a.status).toBe("EXECUTED");
    expect(b.status).toBe("IDEMPOTENT_REPLAY");
    expect(a.executionId).toBe(b.executionId);
    expect(a.outcome?.afterState.pendingCOD).toBe(5);
  });

  it("dry run has zero mutations", () => {
    const s = liveOps();
    const plan = planFor(s);
    const { execution } = runGovernedExecution({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      state: s,
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      actor: adminActor(),
      nowIso: NOW,
      mode: "DRY_RUN",
      enableKillSwitch: true,
      cycleId: "c1",
    });
    expect(execution.status).toBe("DRY_RUN_OK");
    expect(execution.transaction?.mutations).toEqual([]);
    expect(execution.productionMutation).toBe("NONE");
    expect(s.pendingRealOrders).toBe(12);
  });
});

describe("V9 transaction / verification / outcome / audit", () => {
  it("rolls back on forced failure", () => {
    const s = liveOps();
    const handler = getHandler("COD_VERIFICATION")!;
    const tx = runSandboxTransaction({
      state: s,
      handler,
      targetCount: 12,
      baseline: { pendingCOD: 12 },
      failAfter: 1,
    });
    expect(tx.result.rolledBack).toBe(true);
    expect(tx.state.pendingRealOrders).toBe(12);
  });

  it("produces V7-compatible outcome memory", () => {
    const s = liveOps();
    const plan = planFor(s);
    const { execution, outcomeMemory } = runGovernedExecution({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      state: s,
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      actor: adminActor(),
      nowIso: NOW,
      mode: "EXECUTE",
      enableKillSwitch: true,
      cycleId: "c1",
    });
    expect(outcomeMemory).toBeTruthy();
    expect(outcomeMemory!.decisionId).toBe("REVIEW_PENDING_COD");
    expect(
      outcomeMemory!.evidence.some((e) => e.includes("productionMutation=NONE"))
    ).toBe(true);
  });

  it("audit trace contains required stages", () => {
    const s = liveOps();
    const plan = planFor(s);
    const { execution } = runGovernedExecution({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      state: s,
      stateFingerprint: primaryStateFingerprint(s),
      twinHash: "twin-test",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      actor: adminActor(),
      nowIso: NOW,
      mode: "EXECUTE",
      enableKillSwitch: true,
      cycleId: "c1",
    });
    const stages = execution.auditTrace.map((t) => t.stage);
    for (const s of [
      "OBSERVE",
      "DECISION",
      "PLAN",
      "APPROVAL",
      "PRECONDITION_CHECK",
      "GOVERNOR_CHECK",
      "EXECUTION",
      "VERIFICATION",
      "MEASUREMENT",
      "OUTCOME",
    ]) {
      expect(stages).toContain(s);
    }
  });

  it("deterministic idempotency keys", () => {
    const a = buildExecutionIdempotencyKey({
      decisionId: "REVIEW_PENDING_COD",
      interventionType: "COD_VERIFICATION",
      targetCount: 12,
      stateFingerprint: "fp",
      approvalId: "ap",
    });
    const b = buildExecutionIdempotencyKey({
      decisionId: "REVIEW_PENDING_COD",
      interventionType: "COD_VERIFICATION",
      targetCount: 12,
      stateFingerprint: "fp",
      approvalId: "ap",
    });
    expect(a).toBe(b);
  });
});

describe("V9 snapshot + compatibility", () => {
  it("version 10.0.0 with execution slice", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    expect(snap.metadata.version).toBe("10.0.0");
    expect(snap.intervention?.type).toBe("COD_VERIFICATION");
    expect(snap.execution?.autoExecute).toBe(false);
    expect(snap.execution?.modeDefault).toBe("DRY_RUN");
    expect(snap.execution?.outcome?.productionMutation).toBe("NONE");
    expect(snap.autonomy.autoExecute).toBe(false);
    expect(snap.topAction).toBeTruthy();
    expect(snap.decision?.topDecision).toBeTruthy();
    expect(snap.memory?.primaryFingerprint).toBeTruthy();
  });

  it("UI briefing still works", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const briefing = snapshotToBriefing(snap);
    expect(briefing.pulse.score).toBe(snap.health.score);
  });

  it("no LLM / no prisma in V9 modules", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "lib/intelligence/execution");
    const files = fs.readdirSync(dir).filter((f: string) => f.endsWith(".ts"));
    for (const f of files) {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      expect(text).not.toMatch(/openai|anthropic|@ai-sdk|langchain|embedding/i);
      expect(text).not.toMatch(/prisma\.(.*)(create|update|delete|upsert)/i);
      expect(text).not.toMatch(/Math\.random|Date\.now|randomUUID/);
    }
  });

  it("insufficient data blocks execute", () => {
    const s = liveOps();
    const plan = planFor(s);
    const actor = adminActor();
    const fp = primaryStateFingerprint(s);
    const { approval } = requestApproval({
      plan,
      decisionId: "REVIEW_PENDING_COD",
      decisionTrace: [],
      stateFingerprint: fp,
      twinHash: "twin-test",
      actor,
      nowIso: NOW,
    });
    approve({ approvalId: approval.approvalId, actor, nowIso: NOW });
    setKillSwitch("ENABLED");
    const ex = executeIntervention({
      interventionId: plan.interventionId,
      approvalId: approval.approvalId,
      idempotencyKey: plan.execution.idempotencyKey,
      mode: "EXECUTE",
      actor,
      currentState: s,
      currentStateFingerprint: fp,
      currentTwinHash: "twin-test",
      dataQualityStatus: "INSUFFICIENT",
      insufficientEvidence: true,
      nowIso: NOW,
      cycleId: "c1",
    });
    expect(ex.status).toBe("PRECONDITION_FAILED");
  });
});
