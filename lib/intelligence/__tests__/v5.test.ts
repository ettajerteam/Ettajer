/**
 * Dr Sara V5 — Digital Twin & Scenario Intelligence tests.
 */
import { describe, expect, it } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import {
  cacheSize,
  getCachedScenarios,
  invalidateScenarioCache,
  scenarioCacheKey,
  setCachedScenarios,
} from "@/lib/intelligence/cache/scenario-cache";
import { buildCounterfactuals } from "@/lib/intelligence/counterfactual/engine";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import {
  buildMerchantTwin,
  generateMerchantScenarios,
} from "@/lib/intelligence/merchants/twin";
import { buildMerchantIntelligenceProfile } from "@/lib/intelligence/merchants/profile";
import { emptyIntelligenceMemory } from "@/lib/intelligence/memory/types";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import { buildActivationPortfolios } from "@/lib/intelligence/portfolio/simulate";
import {
  simulateDrSaraScenario,
  simulateFromPartial,
} from "@/lib/intelligence/scenarios/api";
import {
  calculateInterventionAdvantage,
  rankScenarios,
} from "@/lib/intelligence/scenarios/rank";
import {
  generateScenarios,
  simulateIntervention,
  simulateNoAction,
} from "@/lib/intelligence/scenarios/simulate";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { assessDecisionStability } from "@/lib/intelligence/stability/decision";
import {
  buildStateTrajectory,
  simulateEscalationRisk,
  simulateRecovery,
} from "@/lib/intelligence/trajectory/forecast";
import { buildPlatformDigitalTwin } from "@/lib/intelligence/twin/build";
import { buildStateGraph } from "@/lib/intelligence/twin/state-graph";
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

describe("V5 digital twin", () => {
  it("builds twin from platform state without inventing metrics", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({
        pendingRealOrders: 12,
        pendingRealGmv: 2272.98,
        domainFailing: 4,
        totalStores: 50,
      }),
      sourceSnapshotId: "snap-1",
    });
    expect(twin.metrics.pendingCOD).toBe(12);
    expect(twin.metrics.pendingGMV).toBe(2272.98);
    expect(twin.metrics.domainFailures).toBe(4);
    expect(twin.health.operationsHealth).toBeGreaterThanOrEqual(0);
    expect(twin.twinHash).toBeTruthy();
    expect(twin.constraints.operationsCapacity).toBe(
      C.twin.defaultOperationsCapacity
    );
  });

  it("twin hash is deterministic", () => {
    const s = state({ pendingRealOrders: 5, totalStores: 10 });
    const a = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "x" });
    const b = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "x" });
    expect(a.twinHash).toBe(b.twinHash);
  });

  it("state graph marks causal vs correlation", () => {
    const edges = buildStateGraph(
      state({
        domainFailing: 2,
        firstSaleCount: 10,
        firstSaleBottlenecks: {
          lowRecentActivity: 0,
          singleProduct: 0,
          multiProductReady: 0,
          noCustomDomain: 8,
          noCodConfigured: 0,
        },
      })
    );
    expect(edges.some((e) => e.kind === "CAUSAL_SUPPORTED")).toBe(true);
    expect(edges.some((e) => e.kind === "CORRELATION_ONLY")).toBe(true);
    expect(edges.every((e) => e.ruleId)).toBeTruthy();
  });
});

describe("V5 scenarios + no-action + advantage", () => {
  it("always generates NO_ACTION baseline", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ pendingRealOrders: 12, totalStores: 40 }),
      sourceSnapshotId: "s",
    });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: ["COD_VERIFICATION"],
      performance: [],
      domainFailing: 0,
      recoveringCOD: false,
      velocity: { pendingCOD: 2, support: 0, dns: 0 },
    });
    expect(scenarios.some((s) => s.kind === "NO_ACTION")).toBe(true);
  });

  it("COD simulation returns historical deterministic range", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ pendingRealOrders: 12, totalStores: 40 }),
      sourceSnapshotId: "s",
    });
    const sc = simulateIntervention({
      twin,
      type: "COD_VERIFICATION",
      performance: [],
    });
    expect(sc.metrics.pendingCOD?.expectedAfter[0]).toBeLessThan(12);
    expect(sc.assumptions.some((a) => /not an AI prediction/i.test(a))).toBe(
      true
    );
    expect(sc.evidence.some((e) => /historical deterministic range/.test(e))).toBe(
      true
    );
  });

  it("no-action rising backlog vs intervention advantage", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ pendingRealOrders: 12, totalStores: 40 }),
      sourceSnapshotId: "s",
    });
    const no = simulateNoAction(twin, { pendingCOD: 3, support: 0, dns: 0 });
    const yes = simulateIntervention({
      twin,
      type: "COD_VERIFICATION",
      performance: [],
    });
    const adv = calculateInterventionAdvantage(yes, no);
    expect(adv.advantage).toBeGreaterThan(0);
    expect(adv.formula).toContain("expectedImpact");
  });

  it("ranks COD above blocked activation when DNS failing", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({
        pendingRealOrders: 12,
        domainFailing: 4,
        totalStores: 40,
      }),
      sourceSnapshotId: "s",
    });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: [
        "COD_VERIFICATION",
        "ACTIVATION_OUTREACH",
        "DNS_DIAGNOSIS",
      ],
      performance: [],
      domainFailing: 4,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 0, dns: 1 },
    });
    const ranked = rankScenarios({ scenarios });
    expect(ranked.topScenario?.scenario.intervention).not.toBe(
      "ACTIVATION_OUTREACH"
    );
    expect(
      scenarios.some(
        (s) =>
          s.blockedFactors.includes("DOMAIN_FAILURE prerequisite")
      )
    ).toBe(true);
  });

  it("chained domain→activation scenario exists when DNS failing", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ domainFailing: 3, totalStores: 20 }),
      sourceSnapshotId: "s",
    });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: ["FIX_DOMAIN"],
      performance: [],
      domainFailing: 3,
      recoveringCOD: false,
      velocity: { pendingCOD: 0, support: 0, dns: 1 },
    });
    expect(scenarios.some((s) => s.kind === "CHAINED_INTERVENTION")).toBe(true);
  });

  it("marks OVERLAPPING_EFFECT for COD+support combo", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({
        pendingRealOrders: 8,
        openSupport: 3,
        totalStores: 20,
      }),
      sourceSnapshotId: "s",
    });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: ["COD_VERIFICATION", "SUPPORT_ESCALATION"],
      performance: [],
      domainFailing: 0,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 1, dns: 0 },
    });
    const combo = scenarios.find((s) => s.scenarioId === "sc-cod-plus-support");
    expect(combo?.overlappingEffects.some((o) => /OVERLAPPING_EFFECT/.test(o))).toBe(
      true
    );
  });

  it("same inputs → same scenario ranking", () => {
    const s = state({ pendingRealOrders: 10, domainFailing: 2, totalStores: 30 });
    const twin = buildPlatformDigitalTwin({ state: s, sourceSnapshotId: "z" });
    const args = {
      twin,
      candidateInterventions: ["COD_VERIFICATION", "DNS_DIAGNOSIS"],
      performance: [] as [],
      domainFailing: 2,
      recoveringCOD: false,
      velocity: { pendingCOD: 1, support: 0, dns: 1 },
    };
    const a = rankScenarios({ scenarios: generateScenarios(args) });
    const b = rankScenarios({ scenarios: generateScenarios(args) });
    expect(a.topScenario?.scenario.scenarioId).toBe(
      b.topScenario?.scenario.scenarioId
    );
    expect(a.ranked.map((r) => r.score)).toEqual(b.ranked.map((r) => r.score));
  });
});

describe("V5 counterfactual + what-if API", () => {
  it("withholds counterfactual without history", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ pendingRealOrders: 12, totalStores: 20 }),
      sourceSnapshotId: "s",
    });
    const cfs = buildCounterfactuals({ twin, performance: [] });
    expect(cfs.some((c) => c.evidenceStrength === "INSUFFICIENT")).toBe(true);
  });

  it("simulateDrSaraScenario never auto-executes", () => {
    const r = simulateFromPartial("COD_VERIFICATION", {
      pendingRealOrders: 12,
      totalStores: 40,
    });
    expect(r.autoExecute).toBe(false);
    expect(r.baseline.kind).toBe("NO_ACTION");
    expect(r.scenario.intervention).toBe("COD_VERIFICATION");
    expect(r.advantage.advantage).toBeGreaterThan(0);
  });

  it("simulate blocks activation when domain failing", () => {
    const r = simulateDrSaraScenario({
      intervention: "ACTIVATION_OUTREACH",
      state: state({ domainFailing: 4, totalStores: 20 }),
    });
    expect(r.dependencies).toContain("DOMAIN_FAILURE prerequisite");
  });
});

describe("V5 merchant twin + portfolio + capacity", () => {
  it("merchant twin recommends domain assist when constrained", () => {
    const p = buildMerchantIntelligenceProfile({
      merchantId: "m1",
      storeName: "X",
      hasStore: true,
      productCount: 3,
      activeProductCount: 3,
      realOrders: 0,
      recentLogin: true,
      hasCustomDomain: false,
      codConfigured: true,
    });
    const twin = buildMerchantTwin(p);
    const sc = generateMerchantScenarios(twin);
    expect(sc.scenarios.length).toBeLessThanOrEqual(
      C.twin.maxScenariosPerMerchant
    );
    expect(sc.recommended).toBe("DOMAIN_SETUP_ASSIST");
  });

  it("portfolio respects capacity", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({
        firstSaleCount: 128,
        firstSaleHighIntent: 103,
        totalStores: 200,
      }),
      sourceSnapshotId: "s",
    });
    const portfolios = buildActivationPortfolios(twin);
    expect(portfolios.length).toBe(C.twin.maxPortfolioSizes.length);
    for (const p of portfolios) {
      expect(p.selectedSize).toBeLessThanOrEqual(p.capacityLimit);
      expect(p.note).toMatch(/candidates|capacity|Pool/i);
    }
  });
});

describe("V5 trajectory + recovery + escalation", () => {
  it("builds range trajectory not fake precision", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ pendingRealOrders: 12, totalStores: 40 }),
      sourceSnapshotId: "s",
    });
    const t = buildStateTrajectory({
      twin,
      velocity: { pendingCOD: 3, operationsHealth: -2 },
    });
    const cod = t.find((x) => x.dimension === "pendingCOD")!;
    expect(cod.points[0]!.range[0]).toBeLessThanOrEqual(cod.points[0]!.range[1]);
    expect(cod.method).toBe("deterministic_velocity_extrapolation");
  });

  it("escalation risk from positive velocity", () => {
    const e = simulateEscalationRisk({ pendingCOD: 12, velocityPerDay: 3 });
    expect(e.escalationRisk).toBe(true);
    expect(e.at72).toBe(21);
  });

  it("recovery on track", () => {
    const r = simulateRecovery({ series: [12, 9, 6, 4] });
    expect(r.onTrack).toBe(true);
    expect(r.expectedResolutionSteps).toBeGreaterThan(0);
  });
});

describe("V5 stability + cache", () => {
  it("detects decision change with reason", () => {
    const d = assessDecisionStability({
      history: [
        {
          cycleId: "c1",
          topAction: "Review pending COD",
          topScenario: "COD_VERIFICATION",
          at: new Date(),
        },
      ],
      currentTopAction: "Diagnose domains",
      currentTopScenario: "FIX_DOMAIN",
      evidence: [
        "COD backlog is recovering.",
        "DNS failure severity increased.",
      ],
    });
    expect(d.changed).toBe(true);
    expect(d.changeReason).toMatch(/changed/);
    expect(d.stability).toBe("CHANGED");
  });

  it("detects oscillating decisions", () => {
    const d = assessDecisionStability({
      history: [
        {
          cycleId: "1",
          topAction: "A",
          topScenario: "A",
          at: new Date(),
        },
        {
          cycleId: "2",
          topAction: "B",
          topScenario: "B",
          at: new Date(),
        },
      ],
      currentTopAction: "C",
      currentTopScenario: "C",
      evidence: [],
    });
    expect(d.stability).toBe("OSCILLATING");
  });

  it("scenario cache hit/invalidate", () => {
    invalidateScenarioCache();
    const key = scenarioCacheKey({
      twinHash: "abc",
      scenarioLabel: "all",
      evidenceFingerprint: "1",
    });
    setCachedScenarios(key, [
      simulateNoAction(
        buildPlatformDigitalTwin({
          state: state({ totalStores: 5 }),
          sourceSnapshotId: "c",
        }),
        { pendingCOD: 0, support: 0, dns: 0 }
      ),
    ]);
    expect(getCachedScenarios(key)?.length).toBe(1);
    expect(cacheSize()).toBeGreaterThan(0);
    invalidateScenarioCache("abc");
    expect(getCachedScenarios(key)).toBeNull();
  });
});

describe("V5 snapshot contract", () => {
  it("version 5.0.0 with twin + scenarios + autoExecute false", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({
        pendingRealOrders: 12,
        pendingRealGmv: 2000,
        domainFailing: 4,
        totalStores: 50,
      })
    );
    expect(snap.metadata.version).toBe("5.0.0");
    expect(snap.digitalTwin?.metrics.pendingCOD).toBe(12);
    expect(snap.scenarios.some((s) => s.kind === "NO_ACTION")).toBe(true);
    expect(snap.topScenario).toBeTruthy();
    expect(snap.autonomy.autoExecute).toBe(false);
    expect(snap.stateTrajectory.length).toBeGreaterThan(0);
    expect(snap.uncertainty.assumptionCount).toBeGreaterThan(0);
  });

  it("UI briefing still works", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({ pendingRealOrders: 5, totalStores: 20 })
    );
    const briefing = snapshotToBriefing(snap);
    expect(briefing.pulse.score).toBe(snap.health.score);
  });

  it("identical state → identical top scenario", () => {
    const s = state({
      pendingRealOrders: 9,
      openSupport: 2,
      totalStores: 30,
    });
    const a = buildDrSaraSnapshotFromState(s);
    const b = buildDrSaraSnapshotFromState(s);
    expect(a.topScenario?.scenarioId).toBe(b.topScenario?.scenarioId);
    expect(a.digitalTwin?.twinHash).toBe(b.digitalTwin?.twinHash);
  });
});

describe("V5 cascading + recovery scenario + uncertainty", () => {
  it("DNS fix cascades EXPECTED_OPPORTUNITY not guaranteed orders", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ domainFailing: 4, totalStores: 20 }),
      sourceSnapshotId: "s",
    });
    const sc = simulateIntervention({
      twin,
      type: "FIX_DOMAIN",
      performance: [],
    });
    expect(
      sc.cascadingEffects.every(
        (c) => !/GUARANTEED_ORDER|will happen/i.test(c)
      )
    ).toBe(true);
    expect(sc.cascadingEffects.some((c) => /EXPECTED_OPPORTUNITY/.test(c))).toBe(
      true
    );
  });

  it("recovery scenario generated when COD recovering", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ pendingRealOrders: 4, totalStores: 20 }),
      sourceSnapshotId: "s",
    });
    const scenarios = generateScenarios({
      twin,
      candidateInterventions: ["COD_VERIFICATION"],
      performance: [],
      domainFailing: 0,
      recoveringCOD: true,
      velocity: { pendingCOD: -3, support: 0, dns: 0 },
    });
    expect(scenarios.some((s) => s.kind === "RECOVERY_SCENARIO")).toBe(true);
  });

  it("support escalation simulation range", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ openSupport: 5, totalStores: 20 }),
      sourceSnapshotId: "s",
    });
    const sc = simulateIntervention({
      twin,
      type: "SUPPORT_ESCALATION",
      performance: [],
    });
    expect(sc.metrics.supportBacklog?.direction).toBe("down");
  });

  it("first-sale assist does not invent order counts", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ firstSaleCount: 50, totalStores: 80 }),
      sourceSnapshotId: "s",
    });
    const sc = simulateIntervention({
      twin,
      type: "FIRST_SALE_ASSIST",
      performance: [],
    });
    expect(sc.assumptions.some((a) => /do not guarantee orders/i.test(a))).toBe(
      true
    );
  });

  it("uncertainty rises with confidence penalty", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({ totalRevenue: -1, realRevenue7d: -1, totalStores: 10 })
    );
    expect(snap.uncertainty.dataQualityPenalty).toBeGreaterThan(0);
  });

  it("escalation at24/48/72 are deterministic", () => {
    const a = simulateEscalationRisk({ pendingCOD: 12, velocityPerDay: 3 });
    const b = simulateEscalationRisk({ pendingCOD: 12, velocityPerDay: 3 });
    expect(a).toEqual(b);
    expect(a.at24).toBe(15);
    expect(a.at48).toBe(18);
  });

  it("zero velocity no escalation", () => {
    expect(
      simulateEscalationRisk({ pendingCOD: 5, velocityPerDay: 0 }).escalationRisk
    ).toBe(false);
  });

  it("recovery insufficient series", () => {
    expect(simulateRecovery({ series: [5] }).onTrack).toBe(false);
  });

  it("recovery resolved at zero", () => {
    expect(simulateRecovery({ series: [3, 0] }).onTrack).toBe(true);
  });

  it("decision stable when unchanged", () => {
    const d = assessDecisionStability({
      history: [
        {
          cycleId: "1",
          topAction: "Review pending COD",
          topScenario: "COD_VERIFICATION",
          at: new Date(),
        },
      ],
      currentTopAction: "Review pending COD",
      currentTopScenario: "COD_VERIFICATION",
      evidence: [],
    });
    expect(d.changed).toBe(false);
    expect(d.stability).toBe("STABLE");
  });

  it("twin health vector includes trust", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ pendingRealOrders: 0, openSupport: 0, totalStores: 10 }),
      sourceSnapshotId: "s",
    });
    expect(twin.health.trustHealth).toBeGreaterThanOrEqual(80);
  });

  it("portfolio top 10 selected ≤ 10", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({
        firstSaleHighIntent: 103,
        firstSaleCount: 128,
        totalStores: 200,
      }),
      sourceSnapshotId: "s",
    });
    const p = buildActivationPortfolios(twin).find((x) =>
      x.label.includes("Top 10")
    )!;
    expect(p.selectedSize).toBeLessThanOrEqual(10);
  });

  it("merchant scenarios max 3", () => {
    const p = buildMerchantIntelligenceProfile({
      merchantId: "m2",
      hasStore: true,
      productCount: 0,
      activeProductCount: 0,
      realOrders: 0,
      recentLogin: true,
    });
    expect(generateMerchantScenarios(buildMerchantTwin(p)).scenarios).toHaveLength(
      Math.min(3, C.twin.maxScenariosPerMerchant)
    );
  });

  it("graph edge DOMAIN blocks activation when failing", () => {
    const edges = buildStateGraph(state({ domainFailing: 1, totalStores: 5 }));
    expect(
      edges.some((e) => e.from === "DOMAIN_FAILURE" && e.to === "ACTIVATION")
    ).toBe(true);
  });

  it("simulate DNS diagnosis", () => {
    const r = simulateFromPartial("DNS_DIAGNOSIS", {
      domainFailing: 4,
      totalStores: 20,
    });
    expect(r.deltas.domainFailures).toMatch(/→/);
  });

  it("rank exposes scoreComponents including advantage", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ pendingRealOrders: 12, totalStores: 20 }),
      sourceSnapshotId: "s",
    });
    const ranked = rankScenarios({
      scenarios: generateScenarios({
        twin,
        candidateInterventions: ["COD_VERIFICATION"],
        performance: [],
        domainFailing: 0,
        recoveringCOD: false,
        velocity: { pendingCOD: 1, support: 0, dns: 0 },
      }),
    });
    expect(ranked.topScenario?.scoreComponents.interventionAdvantage).toBeDefined();
    expect(ranked.topScenario?.scoreComponents.riskReduction).toBeDefined();
  });

  it("snapshot includes counterfactuals array", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({ pendingRealOrders: 12, totalStores: 20 })
    );
    expect(Array.isArray(snap.counterfactuals)).toBe(true);
  });

  it("snapshot portfolio notes capacity", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({
        firstSaleCount: 128,
        firstSaleHighIntent: 103,
        totalStores: 200,
      })
    );
    expect(snap.portfolioScenarios[0]?.note).toMatch(/capacity|Pool|candidates/i);
  });

  it("empty memory → insufficient counterfactual strength", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({ domainFailing: 2, totalStores: 10 }),
      sourceSnapshotId: "s",
    });
    const cfs = buildCounterfactuals({
      twin,
      performance: emptyIntelligenceMemory().rulePerformance,
    });
    expect(cfs.every((c) => c.evidenceStrength === "INSUFFICIENT")).toBe(true);
  });

  it("whyNotChosen set for non-top scenarios", () => {
    const twin = buildPlatformDigitalTwin({
      state: state({
        pendingRealOrders: 12,
        domainFailing: 4,
        totalStores: 40,
      }),
      sourceSnapshotId: "s",
    });
    const ranked = rankScenarios({
      scenarios: generateScenarios({
        twin,
        candidateInterventions: [
          "COD_VERIFICATION",
          "DNS_DIAGNOSIS",
          "ACTIVATION_OUTREACH",
        ],
        performance: [],
        domainFailing: 4,
        recoveringCOD: false,
        velocity: { pendingCOD: 1, support: 0, dns: 1 },
      }),
    });
    if (ranked.ranked.length > 1) {
      expect(ranked.ranked[1]!.whyNotChosen).toBeTruthy();
    }
  });
});
