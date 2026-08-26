/**
 * Dr Sara V4 — control-loop deterministic tests.
 */
import { describe, expect, it } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import { getAutonomyPolicy, mayAutoExecute } from "@/lib/intelligence/cycle/autonomy";
import { resolveInterventionConflicts } from "@/lib/intelligence/decision/conflicts";
import {
  buildScoreComponents,
  historicalEffectivenessFor,
  scoreDecisionV4,
} from "@/lib/intelligence/decision/score-components";
import { runSecondaryDiagnosis } from "@/lib/intelligence/diagnosis/secondary";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { explainDecisionV4 } from "@/lib/intelligence/explainability/v4";
import {
  buildPlatformInterventions,
  scoreIntervention,
} from "@/lib/intelligence/interventions/engine";
import {
  activeChainsFor,
  COD_CLEARANCE_CHAIN,
  nextChainStep,
} from "@/lib/intelligence/interventions/chains";
import {
  appendIntervention,
  appendObservation,
  appendOutcome,
  getActiveCooldown,
  memoryFromSerializable,
  recomputeRulePerformance,
} from "@/lib/intelligence/memory/store";
import {
  emptyIntelligenceMemory,
  type IntelligenceObservation,
} from "@/lib/intelligence/memory/types";
import {
  effectivenessScore,
  expectedTargetFor,
  measureAgainstExpectation,
} from "@/lib/intelligence/measurement/outcomes";
import {
  detectNegativeSignals,
  expandOpportunities,
} from "@/lib/intelligence/opportunities/expand";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import {
  captureDimensionSnapshot,
  comparePlatformStates,
} from "@/lib/intelligence/platform/transitions";
import { runQualityFirewallV2 } from "@/lib/intelligence/quality/firewall-v2";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { createTraceBuilder } from "@/lib/intelligence/trace/stages";
import {
  detectEarlyWarnings,
  shouldSuppressIntervention,
} from "@/lib/intelligence/warnings/early";
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";

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

function obs(
  cycleId: string,
  metrics: Partial<IntelligenceObservation["metrics"]>,
  at: string
): IntelligenceObservation {
  const s = state(metrics as Partial<PlatformState>);
  return {
    observationId: `obs-${cycleId}`,
    cycleId,
    observedAt: new Date(at),
    metrics: {
      pendingRealOrders: s.pendingRealOrders,
      pendingRealGmv: s.pendingRealGmv,
      openSupport: s.openSupport,
      domainFailing: s.domainFailing,
      firstSaleCount: s.firstSaleCount,
      realRevenue7d: s.realRevenue7d,
      realOrders7d: s.realOrders7d,
      revenueChange7d: s.revenueChange7d,
      ordersChange7d: s.ordersChange7d,
    },
    dimensions: captureDimensionSnapshot(s),
  };
}

describe("V4 measurement + effectiveness", () => {
  it("measures SUCCESS when expected clearance met", () => {
    const r = measureAgainstExpectation({
      interventionId: "i1",
      metric: "pendingRealOrders",
      direction: "lower_is_better",
      baseline: 12,
      expected: 6,
      observed: 5,
      sufficientData: true,
      measuredAt: new Date(),
    });
    expect(r.classification).toBe("SUCCESS");
    expect(r.impactRealized).toBeGreaterThanOrEqual(1);
  });

  it("measures PARTIAL when half of expected realized", () => {
    const r = measureAgainstExpectation({
      interventionId: "i1",
      metric: "pendingRealOrders",
      direction: "lower_is_better",
      baseline: 12,
      expected: 6,
      observed: 9,
      sufficientData: true,
      measuredAt: new Date(),
    });
    expect(r.classification).toBe("PARTIAL");
    expect(r.expectedVsActual).toMatch(/Expected reduction/);
  });

  it("measures FAILED when backlog worsens", () => {
    const r = measureAgainstExpectation({
      interventionId: "i1",
      metric: "pendingRealOrders",
      direction: "lower_is_better",
      baseline: 12,
      expected: 6,
      observed: 15,
      sufficientData: true,
      measuredAt: new Date(),
    });
    expect(r.classification).toBe("FAILED");
  });

  it("returns INCONCLUSIVE without sufficient data", () => {
    expect(
      measureAgainstExpectation({
        interventionId: "i1",
        metric: "pendingRealOrders",
        direction: "lower_is_better",
        baseline: 12,
        expected: 6,
        observed: 5,
        sufficientData: false,
        measuredAt: new Date(),
      }).classification
    ).toBe("INCONCLUSIVE");
  });

  it("expectedTargetFor COD uses clearance ratio", () => {
    const t = expectedTargetFor("COD_VERIFICATION", { pendingRealOrders: 12 });
    expect(t.pendingRealOrders).toBe(
      Math.round(12 * (1 - C.outcome.expectedCodClearanceRatio))
    );
  });

  it("effectivenessScore is deterministic", () => {
    const a = effectivenessScore({
      expectedImpact: 0.7,
      observedImpact: 0.8,
      confidence: 1,
      timeToResultHours: 4,
      reversibility: 0.95,
      actionability: 1,
      historicalSuccessRate: 0.91,
    });
    const b = effectivenessScore({
      expectedImpact: 0.7,
      observedImpact: 0.8,
      confidence: 1,
      timeToResultHours: 4,
      reversibility: 0.95,
      actionability: 1,
      historicalSuccessRate: 0.91,
    });
    expect(a.score).toBe(b.score);
    expect(a.formula).toContain("observed");
  });
});

describe("V4 decision scoreComponents", () => {
  it("exposes all V4 components", () => {
    const c = buildScoreComponents({
      impact: 0.92,
      urgency: 1,
      confidence: 0.94,
      reversibility: 0.95,
      actionability: 1,
      historicalEffectiveness: 0.91,
      timeSensitivity: 0.88,
      evidenceQuality: 1,
    });
    expect(c.historicalEffectiveness).toBe(0.91);
    expect(c.timeSensitivity).toBe(0.88);
    expect(c.evidenceQuality).toBe(1);
  });

  it("live evidence dominates historical", () => {
    const base = buildScoreComponents({
      impact: 1,
      urgency: 1,
      confidence: 1,
      reversibility: 1,
      actionability: 1,
      timeSensitivity: 1,
      evidenceQuality: 1,
      historicalEffectiveness: 0.3,
    });
    const high = buildScoreComponents({
      ...base,
      historicalEffectiveness: 0.95,
    });
    const lowScore = scoreDecisionV4(base).score;
    const highScore = scoreDecisionV4(high).score;
    expect(highScore).toBeGreaterThan(lowScore);
    // Still near live floor
    expect(lowScore).toBeGreaterThan(70);
  });

  it("whyThisActionWon mentions alternative", () => {
    const c = buildScoreComponents({
      impact: 0.9,
      urgency: 1,
      confidence: 1,
      reversibility: 1,
      actionability: 1,
    });
    const d = scoreDecisionV4(c, { alternativeLabel: "First-sale assist" });
    expect(d.whyThisActionWon).toMatch(/First-sale/);
  });

  it("historicalEffectiveness defaults when insufficient", () => {
    const h = historicalEffectivenessFor("COD_VERIFICATION", []);
    expect(h.note).toMatch(/Insufficient/);
    expect(h.value).toBe(C.decisionV4.historicalEffectivenessDefault);
  });
});

describe("V4 conflicts + chains", () => {
  it("blocks activation when domain assist present for same merchant", () => {
    const now = new Date();
    const list = [
      {
        id: "dns-1",
        merchantId: "m1",
        type: "DOMAIN_SETUP_ASSIST" as const,
        priority: 50,
        urgency: 80,
        impact: 60,
        confidence: 80,
        reversibility: 70,
        actionability: 80,
        timeSensitivity: 70,
        reason: "dns",
        evidence: [],
        expectedOutcome: "dns ok",
        targetMetric: "domain",
        recommendedRoute: "/admin/domains",
        createdAt: now,
        expiresAt: now,
      },
      {
        id: "act-1",
        merchantId: "m1",
        type: "ACTIVATION_OUTREACH" as const,
        priority: 40,
        urgency: 50,
        impact: 50,
        confidence: 70,
        reversibility: 60,
        actionability: 70,
        timeSensitivity: 50,
        reason: "empty",
        evidence: [],
        expectedOutcome: "products",
        targetMetric: "productCount",
        recommendedRoute: "/admin/activation",
        createdAt: now,
        expiresAt: now,
      },
    ];
    const r = resolveInterventionConflicts(list);
    expect(r.blocked.some((b) => b.intervention.type === "ACTIVATION_OUTREACH")).toBe(
      true
    );
    expect(r.dependencyGraph.some((e) => e.relation === "BLOCKS")).toBe(true);
  });

  it("dedupes duplicate platform interventions", () => {
    const now = new Date();
    const twin = buildPlatformInterventions(
      state({ pendingRealOrders: 5 }),
      now
    );
    const r = resolveInterventionConflicts([...twin, ...twin]);
    expect(r.blocked.length).toBeGreaterThan(0);
  });

  it("COD clearance chain next step", () => {
    expect(nextChainStep(COD_CLEARANCE_CHAIN, [])?.action).toBe("COD_BACKLOG");
    expect(
      nextChainStep(COD_CLEARANCE_CHAIN, ["COD_BACKLOG"])?.action
    ).toBe("COD_VERIFICATION");
  });

  it("activeChainsFor depends on live evidence", () => {
    expect(activeChainsFor({ domainFailing: 0, pendingRealOrders: 0 })).toHaveLength(
      0
    );
    expect(
      activeChainsFor({ domainFailing: 2, pendingRealOrders: 5 }).length
    ).toBe(2);
  });
});

describe("V4 early warning + recovery + cooldown", () => {
  it("detects escalating COD from history", () => {
    const history = [
      obs("c1", { pendingRealOrders: 5 }, "2026-08-26T08:00:00Z"),
      obs("c2", { pendingRealOrders: 7 }, "2026-08-26T10:00:00Z"),
      obs("c3", { pendingRealOrders: 10 }, "2026-08-26T11:00:00Z"),
    ];
    const w = detectEarlyWarnings(state({ pendingRealOrders: 12 }), history);
    const cod = w.find((x) => x.metric === "pendingRealOrders")!;
    expect(["ESCALATING", "CRITICAL", "RISING"]).toContain(cod.state);
  });

  it("detects recovering COD", () => {
    const history = [
      obs("c1", { pendingRealOrders: 12 }, "2026-08-26T08:00:00Z"),
      obs("c2", { pendingRealOrders: 9 }, "2026-08-26T10:00:00Z"),
    ];
    const w = detectEarlyWarnings(state({ pendingRealOrders: 5 }), history);
    const cod = w.find((x) => x.metric === "pendingRealOrders")!;
    expect(cod.state).toBe("RECOVERING");
    expect(cod.recoveryScore).toBeGreaterThan(0);
  });

  it("suppresses COD recommendation while recovering", () => {
    const s = shouldSuppressIntervention({
      type: "COD_VERIFICATION",
      warnings: [
        {
          id: "ew",
          metric: "pendingRealOrders",
          state: "RECOVERING",
          current: 5,
          previous: 12,
          velocity: -7,
          acceleration: 0,
          recoveryScore: 0.5,
          recoveryVelocity: 7,
          ruleId: "EARLY_WARNING_COD",
          evidence: [],
          confidence: 0.9,
        },
      ],
      cooldownActive: false,
    });
    expect(s.suppress).toBe(true);
  });

  it("cooldown blocks retrigger until expiry", () => {
    const now = new Date("2026-08-26T12:00:00Z");
    let mem = emptyIntelligenceMemory();
    mem = appendIntervention(mem, {
      interventionId: "i1",
      ruleId: "COD",
      diagnosisId: null,
      targetType: "platform",
      targetId: "platform",
      action: "COD_VERIFICATION",
      type: "COD_VERIFICATION",
      createdAt: now,
      executedAt: now,
      measuredAt: null,
      baseline: { pendingRealOrders: 12 },
      expected: { pendingRealOrders: 6 },
      observed: null,
      expectedOutcome: "clear",
      confidence: 1,
      predictedImpact: 0.5,
      reversibility: 0.95,
      actionability: 1,
      status: "EXECUTED",
      cooldownUntil: new Date("2026-08-26T12:30:00Z"),
      chainId: null,
      stepIndex: 0,
    });
    expect(getActiveCooldown(mem, "COD_VERIFICATION", now).active).toBe(true);
    expect(
      getActiveCooldown(
        mem,
        "COD_VERIFICATION",
        new Date("2026-08-26T13:00:00Z")
      ).active
    ).toBe(false);
  });
});

describe("V4 memory + transitions + secondary", () => {
  it("recomputes rule performance from outcomes", () => {
    let mem = emptyIntelligenceMemory();
    mem = appendIntervention(mem, {
      interventionId: "i1",
      ruleId: "R1",
      diagnosisId: null,
      targetType: "platform",
      targetId: "platform",
      action: "COD_VERIFICATION",
      type: "COD_VERIFICATION",
      createdAt: new Date(),
      executedAt: new Date(),
      measuredAt: new Date(),
      baseline: {},
      expected: {},
      observed: {},
      expectedOutcome: "x",
      confidence: 1,
      predictedImpact: 1,
      reversibility: 1,
      actionability: 1,
      status: "MEASURED",
      cooldownUntil: null,
      chainId: null,
      stepIndex: 0,
    });
    for (let i = 0; i < 3; i++) {
      mem = appendOutcome(mem, {
        outcomeId: `o${i}`,
        interventionId: "i1",
        measuredAt: new Date(),
        absoluteDelta: {},
        relativeDelta: {},
        classification: i < 2 ? "SUCCESS" : "FAILED",
        impactRealized: i < 2 ? 1 : 0,
        impactMissed: i < 2 ? 0 : 1,
        expectedVsActual: "x",
        evidence: [],
      });
    }
    const perf = recomputeRulePerformance(mem);
    expect(perf[0]!.successRate).not.toBeNull();
    expect(perf[0]!.note).toMatch(/Historically/);
  });

  it("memoryFromSerializable restores dates", () => {
    const mem = memoryFromSerializable({
      observations: [
        {
          observationId: "o",
          cycleId: "c",
          observedAt: "2026-08-26T12:00:00Z" as unknown as Date,
          metrics: {
            pendingRealOrders: 1,
            pendingRealGmv: 0,
            openSupport: 0,
            domainFailing: 0,
            firstSaleCount: 0,
            realRevenue7d: 0,
            realOrders7d: 0,
            revenueChange7d: 0,
            ordersChange7d: 0,
          },
          dimensions: {
            OPERATIONS: 80,
            ACTIVATION: 80,
            REVENUE: 80,
            SUPPORT: 80,
            TECHNICAL: 80,
            TRUST: 80,
          },
        },
      ],
      lastCycleId: "c",
    });
    expect(mem.observations[0]!.observedAt instanceof Date).toBe(true);
  });

  it("state transitions IMPROVED when dimensions rise", () => {
    const prev = obs("c0", { pendingRealOrders: 12 }, "2026-08-26T08:00:00Z");
    // Force degraded ops dimension on prev
    prev.dimensions.OPERATIONS = 40;
    const curDims = { ...prev.dimensions, OPERATIONS: 70 };
    const t = comparePlatformStates(prev, {
      cycleId: "c1",
      dimensions: curDims,
    });
    expect(t.overall).toBe("IMPROVED");
    expect(
      t.dimensions.find((d) => d.dimension === "OPERATIONS")?.label
    ).toBe("IMPROVED");
  });

  it("secondary diagnosis finds deepest bottleneck", () => {
    const r = runSecondaryDiagnosis(
      {
        merchantId: "m1",
        hasStore: true,
        productCount: 3,
        activeProductCount: 3,
        realOrders: 0,
        recentLogin: true,
        hasCustomDomain: false,
        codConfigured: true,
      },
      "NO_FIRST_ORDER"
    );
    expect(r.deepestBottleneck).toBe("NO_DOMAIN");
    expect(r.checks.length).toBeGreaterThan(5);
  });

  it("secondary diagnosis never invents traffic", () => {
    const r = runSecondaryDiagnosis(
      {
        merchantId: "m1",
        hasStore: true,
        productCount: 1,
        activeProductCount: 1,
        realOrders: 0,
        recentLogin: true,
      },
      "NO_FIRST_ORDER"
    );
    const traffic = r.checks.find((c) => c.check === "CHECK_TRAFFIC")!;
    expect(traffic.evidence.value).toBe("INSUFFICIENT_EVIDENCE");
  });
});

describe("V4 quality + opportunities + autonomy + trace", () => {
  it("firewall V2 marks insufficient evidence on empty platform", () => {
    const g = runQualityFirewallV2(state({ totalStores: 0 }));
    expect(g.insufficientEvidence).toBe(true);
    expect(g.blockedOperations).toContain("diagnosis");
  });

  it("expandOpportunities adds rising GMV when evidenced", () => {
    const ops = expandOpportunities(
      state({ revenueChange7d: 40, realOrders7d: 20, concentration: [] })
    );
    expect(ops.some((o) => o.ruleId === "OPPORTUNITY_RISING_GMV")).toBe(true);
  });

  it("negative signals require real metrics", () => {
    const n = detectNegativeSignals(
      state({
        firstSaleCount: 10,
        firstSaleBottlenecks: {
          lowRecentActivity: 0,
          singleProduct: 0,
          multiProductReady: 0,
          noCustomDomain: 0,
          noCodConfigured: 4,
        },
      })
    );
    expect(n.some((x) => x.ruleId === "NEGATIVE_CHECKOUT_FRICTION")).toBe(true);
  });

  it("autonomy defaults to RECOMMEND without auto-execute", () => {
    const p = getAutonomyPolicy();
    expect(p.level).toBe(1);
    expect(p.autoExecute).toBe(false);
    expect(mayAutoExecute("COD_VERIFICATION", p).allowed).toBe(false);
  });

  it("execution trace records stages", () => {
    const b = createTraceBuilder("c1");
    b.stage("OBSERVE", "ok", 1);
    b.stage("DETECT", "signals", 3);
    const t = b.build({
      topAction: "COD",
      warnings: 0,
      rulesEvaluated: 10,
      rulesFired: 4,
      signalsGenerated: 3,
      diagnoses: 2,
      interventions: 2,
      blockedInterventions: 0,
      learningUpdate: null,
    });
    expect(t.stages.map((s) => s.stage)).toEqual(["OBSERVE", "DETECT"]);
  });

  it("explainability V4 answers required questions", () => {
    const e = explainDecisionV4({
      decision: "Review pending COD",
      whatHappened: "12 pending",
      whyItMatters: "trust",
      evidence: ["pending=12"],
      whatNext: "verify",
      whyThisAction: "highest score",
      historicalNote: "Insufficient historical evidence.",
      expected: "halve backlog",
      measureIn: "24h",
      ifFails: "secondary",
      confidence: 0.9,
      ruleIds: ["COD"],
    });
    expect(e.whatHappenedLastTime).toMatch(/Insufficient/);
    expect(e.ifFails).toBe("secondary");
  });
});

describe("V4 snapshot compatibility", () => {
  it("version is 4.0.0 with V4 fields", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({ pendingRealOrders: 12, pendingRealGmv: 2000, totalStores: 50 })
    );
    expect(snap.metadata.version).toBe("9.0.0");
    expect(snap.earlyWarnings.length).toBeGreaterThan(0);
    expect(snap.executionTraceV4?.stages.length).toBeGreaterThan(5);
    expect(snap.autonomy.level).toBe(1);
    expect(snap.decisionV4.scoreComponents).toBeTruthy();
    expect(snap.explainabilityV4?.decision).toBeTruthy();
  });

  it("suppresses COD when memory shows recovery path", () => {
    const history = [
      obs("c1", { pendingRealOrders: 12 }, "2026-08-26T08:00:00Z"),
      obs("c2", { pendingRealOrders: 8 }, "2026-08-26T10:00:00Z"),
    ];
    let mem = emptyIntelligenceMemory();
    for (const h of history) mem = appendObservation(mem, h);
    const snap = buildDrSaraSnapshotFromState(
      state({ pendingRealOrders: 4, totalStores: 40 }),
      { memory: mem }
    );
    const recovering = snap.recovery.some((r) => r.state === "RECOVERING");
    expect(recovering).toBe(true);
  });

  it("UI briefing still works", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({ pendingRealOrders: 5, totalStores: 20 })
    );
    const briefing = snapshotToBriefing(snap);
    expect(briefing.pulse.score).toBe(snap.health.score);
    expect(briefing.actions[0]?.label).toBeTruthy();
  });

  it("empty platform insufficient evidence does not crash", () => {
    const snap = buildDrSaraSnapshotFromState(state({ totalStores: 0 }));
    expect(snap.dataQualityV2.insufficientEvidence).toBe(true);
    expect(snap.metadata.version).toBe("9.0.0");
  });

  it("same input → same V4 top action", () => {
    const s = state({ pendingRealOrders: 8, totalStores: 30 });
    const a = buildDrSaraSnapshotFromState(s);
    const b = buildDrSaraSnapshotFromState(s);
    expect(a.topAction?.label).toBe(b.topAction?.label);
    expect(a.topIntervention?.type).toBe(b.topIntervention?.type);
  });
});
