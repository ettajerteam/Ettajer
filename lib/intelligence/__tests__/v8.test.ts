/**
 * Dr Sara V8 — Intervention Orchestration tests.
 */
import { describe, expect, it } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import {
  INTERVENTION_REGISTRY,
  decisionToInterventionType,
  getInterventionDef,
} from "@/lib/intelligence/interventions/registry";
import { planIntervention } from "@/lib/intelligence/interventions/planner";
import { evaluatePrerequisites } from "@/lib/intelligence/interventions/prerequisites";
import {
  calculateBlastRadius,
  evaluateSafety,
} from "@/lib/intelligence/interventions/safety";
import { evaluateRisk } from "@/lib/intelligence/interventions/risk";
import { evaluateApproval } from "@/lib/intelligence/interventions/approval";
import { buildRollbackPlan } from "@/lib/intelligence/interventions/rollback";
import { buildIdempotencyKey } from "@/lib/intelligence/interventions/execution-plan";
import {
  detectConflicts,
  detectDuplicate,
} from "@/lib/intelligence/interventions/conflicts-v8";
import { primaryStateFingerprint } from "@/lib/intelligence/memory/fingerprints";

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

function planFor(s: PlatformState, decisionId = "REVIEW_PENDING_COD") {
  return planIntervention({
    decisionId,
    decisionTitle: "Review pending COD",
    decisionScore: 100,
    decisionConfidence: 0.9,
    decisionRoute: "/admin/payments?focus=pending",
    whyThis: ["pendingRealOrders=12"],
    state: s,
    stateFingerprint: primaryStateFingerprint(s),
    twinHash: "testhash",
    dataQualityStatus: "OK",
    insufficientEvidence: false,
    expectedAfter: { pendingCOD: [4, 7] },
    baselineOverride: { pendingCOD: s.pendingRealOrders },
    cycleId: "c1",
  });
}

describe("V8 registry", () => {
  it("has core intervention types", () => {
    const types = INTERVENTION_REGISTRY.map((d) => d.type);
    expect(types).toContain("COD_VERIFICATION");
    expect(types).toContain("DNS_DIAGNOSIS");
    expect(types).toContain("SUPPORT_ESCALATION");
    expect(decisionToInterventionType("REVIEW_PENDING_COD")).toBe(
      "COD_VERIFICATION"
    );
    expect(getInterventionDef("COD_VERIFICATION")?.approvalRequirement).toBe(
      "REQUIRED"
    );
  });
});

describe("V8 planner + gates", () => {
  it("plans COD verification READY_FOR_APPROVAL", () => {
    const plan = planFor(liveOps());
    expect(plan.type).toBe("COD_VERIFICATION");
    expect(plan.status).toBe("READY_FOR_APPROVAL");
    expect(plan.executionMode).toBe("READY_FOR_APPROVAL");
    expect(plan.measurement.expectedAfter.pendingCOD).toEqual([4, 7]);
    expect(plan.execution.steps.some((s) => s.isExecutionBoundary)).toBe(true);
    expect(plan.approval.level).toBe("REQUIRED");
  });

  it("prerequisites fail when zero targets", () => {
    const pr = evaluatePrerequisites({
      type: "COD_VERIFICATION",
      state: state({ pendingRealOrders: 0 }),
    });
    expect(pr.some((p) => p.status === "FAIL")).toBe(true);
    const plan = planFor(state({ pendingRealOrders: 0, totalStores: 10 }));
    expect(plan.status).toBe("BLOCKED");
  });

  it("safety BLOCKED on insufficient data for mutable COD", () => {
    const plan = planIntervention({
      decisionId: "REVIEW_PENDING_COD",
      decisionTitle: "x",
      decisionScore: 50,
      decisionConfidence: 0.3,
      decisionRoute: "/admin/payments",
      whyThis: [],
      state: liveOps(),
      stateFingerprint: "COD_BACKLOG_HIGH",
      twinHash: "t",
      dataQualityStatus: "INSUFFICIENT",
      insufficientEvidence: true,
      cycleId: "x",
    });
    expect(plan.safetyLevel).toBe("BLOCKED");
    expect(plan.status).toBe("BLOCKED");
  });

  it("blast radius + risk + approval deterministic", () => {
    const s = liveOps();
    const def = getInterventionDef("COD_VERIFICATION")!;
    const blast = calculateBlastRadius({ def, state: s, targetCount: 12 });
    expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(blast.level);
    const risk = evaluateRisk({ def, blast, safetyLevel: "CAUTION" });
    expect(risk.overallRisk).toBeTruthy();
    const approval = evaluateApproval({
      def,
      safetyLevel: "CAUTION",
      risk,
      blast,
    });
    expect(approval.level).toBe("REQUIRED");
  });

  it("idempotency key stable", () => {
    const s = liveOps();
    const a = planFor(s);
    const b = planFor(s);
    expect(a.execution.idempotencyKey).toBe(b.execution.idempotencyKey);
    expect(a.interventionId).toBe(b.interventionId);
    const k = buildIdempotencyKey({
      interventionType: "COD_VERIFICATION",
      stateFingerprint: primaryStateFingerprint(s),
      decisionId: "REVIEW_PENDING_COD",
      targetCount: 12,
    });
    expect(a.execution.idempotencyKey).toBe(k);
  });

  it("duplicate detection", () => {
    const plan = planFor(liveOps());
    const dup = detectDuplicate({
      type: plan.type,
      idempotencyKey: plan.execution.idempotencyKey,
      active: [
        {
          interventionId: "existing",
          type: plan.type,
          status: "READY_FOR_APPROVAL",
          idempotencyKey: plan.execution.idempotencyKey,
        },
      ],
    });
    expect(dup.isDuplicate).toBe(true);
    const blocked = planIntervention({
      decisionId: "REVIEW_PENDING_COD",
      decisionTitle: "x",
      decisionScore: 100,
      decisionConfidence: 0.9,
      decisionRoute: "/admin/payments",
      whyThis: [],
      state: liveOps(),
      stateFingerprint: primaryStateFingerprint(liveOps()),
      twinHash: "t",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      activeInterventions: [
        {
          interventionId: "existing",
          type: "COD_VERIFICATION",
          status: "READY_FOR_APPROVAL",
          idempotencyKey: plan.execution.idempotencyKey,
        },
      ],
      cycleId: "d",
    });
    expect(["DUPLICATE", "ALREADY_IN_PROGRESS"]).toContain(blocked.status);
  });

  it("conflict detection", () => {
    const c = detectConflicts({
      type: "DNS_DIAGNOSIS",
      activeTypes: ["DOMAIN_DISCONNECT"],
    });
    expect(c.length).toBeGreaterThan(0);
    const plan = planIntervention({
      decisionId: "DIAGNOSE_DNS",
      decisionTitle: "Diagnose",
      decisionScore: 80,
      decisionConfidence: 0.8,
      decisionRoute: "/admin/domains",
      whyThis: [],
      state: liveOps(),
      stateFingerprint: primaryStateFingerprint(liveOps()),
      twinHash: "t",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      activeConflictTypes: ["DOMAIN_DISCONNECT"],
      cycleId: "cf",
    });
    expect(plan.status).toBe("BLOCKED");
    expect(plan.conflicts.length).toBeGreaterThan(0);
  });

  it("rollback + measurement + trace", () => {
    const def = getInterventionDef("COD_VERIFICATION")!;
    const rb = buildRollbackPlan(def);
    expect(rb.strategy).toBeTruthy();
    const plan = planFor(liveOps());
    expect(plan.trace.map((t) => t.stage)).toEqual([
      "DECISION",
      "INTERVENTION_SELECTED",
      "PREREQUISITES",
      "SAFETY",
      "RISK",
      "APPROVAL",
      "EXECUTION_PLAN",
      "ROLLBACK",
      "MEASUREMENT",
    ]);
    expect(plan.measurement.primaryMetric).toBe("pendingCOD");
  });

  it("merchant onboarding has elevated blast / approval", () => {
    const plan = planIntervention({
      decisionId: "NO_ACTION",
      decisionTitle: "noop",
      decisionScore: 1,
      decisionConfidence: 0.5,
      decisionRoute: "/admin/sara",
      whyThis: [],
      state: liveOps(),
      stateFingerprint: "x",
      twinHash: "t",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      cycleId: "n",
    });
    // force onboarding via type mapping override using MERCHANT path — use decision that maps poorly; call registry path via DIAGNOSE then separately
    const onboard = planIntervention({
      decisionId: "ACTIVATE_MID_TIER_MERCHANTS",
      decisionTitle: "Activate",
      decisionScore: 40,
      decisionConfidence: 0.5,
      decisionRoute: "/admin/activation",
      whyThis: [],
      state: liveOps(),
      stateFingerprint: primaryStateFingerprint(liveOps()),
      twinHash: "t",
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      cycleId: "a",
    });
    expect(onboard.approval.humanRequired).toBe(true);
    expect(plan.type).toBe("NO_ACTION");
  });
});

describe("V8 snapshot + compatibility", () => {
  it("version 10.0.0 with intervention plan", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    expect(snap.metadata.version).toBe("10.0.0");
    expect(snap.intervention?.type).toBe("COD_VERIFICATION");
    expect(snap.intervention?.status).toBe("READY_FOR_APPROVAL");
    expect(snap.intervention?.executionMode).not.toBe("AUTO_EXECUTE");
    expect(snap.autonomy.autoExecute).toBe(false);
    expect(snap.topAction).toBeTruthy();
    expect(snap.topScenario).toBeTruthy();
    expect(snap.decision?.topDecision).toBeTruthy();
    expect(snap.memory?.primaryFingerprint).toBeTruthy();
    expect(snap.learning?.learningTrace?.length).toBeGreaterThan(0);
  });

  it("deterministic repeated plans", () => {
    const s = liveOps();
    const a = buildDrSaraSnapshotFromState(s);
    const b = buildDrSaraSnapshotFromState(s);
    expect(a.intervention?.idempotencyKey).toBe(b.intervention?.idempotencyKey);
    expect(a.intervention?.interventionId).toBe(b.intervention?.interventionId);
    expect(JSON.stringify(a.intervention?.trace)).toBe(
      JSON.stringify(b.intervention?.trace)
    );
  });

  it("UI briefing still works", () => {
    const snap = buildDrSaraSnapshotFromState(liveOps());
    const briefing = snapshotToBriefing(snap);
    expect(briefing.pulse.score).toBe(snap.health.score);
  });

  it("no LLM / no prisma writes in V8 modules", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const dir = path.join(process.cwd(), "lib/intelligence/interventions");
    const v8Files = [
      "types.ts",
      "registry.ts",
      "planner.ts",
      "prerequisites.ts",
      "safety.ts",
      "approval.ts",
      "risk.ts",
      "rollback.ts",
      "execution-plan.ts",
      "measurement-plan.ts",
      "orchestrator.ts",
      "conflicts-v8.ts",
      "config.ts",
    ];
    for (const f of v8Files) {
      const text = fs.readFileSync(path.join(dir, f), "utf8");
      expect(text).not.toMatch(/openai|anthropic|@ai-sdk|langchain|embedding/i);
      expect(text).not.toMatch(/prisma\.(.*)(create|update|delete|upsert)/i);
    }
  });
});

describe("V8 adversarial", () => {
  it("insufficient evidence blocks", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({ totalStores: 0, pendingRealOrders: 0 })
    );
    // NO_ACTION or blocked — must not claim EXECUTION with mutation
    expect(snap.autonomy.autoExecute).toBe(false);
    if (snap.intervention) {
      expect(snap.intervention.executionMode).not.toMatch(/AUTO/);
    }
  });

  it("safety evaluate with empty targets", () => {
    const def = getInterventionDef("DNS_DIAGNOSIS")!;
    const s = state({ domainFailing: 0, totalStores: 5 });
    const blast = calculateBlastRadius({ def, state: s, targetCount: 0 });
    const safety = evaluateSafety({
      def,
      state: s,
      dataQualityStatus: "OK",
      insufficientEvidence: false,
      prerequisitesOk: false,
      blast,
      conflicts: [],
      isDuplicate: false,
      historicalReliability: "INSUFFICIENT",
    });
    expect(safety.level).toBe("BLOCKED");
  });
});
