/**
 * Dr Sara V3 — Intelligence OS deterministic tests.
 * Fixtures only — no randomness, no network.
 */
import { describe, expect, it } from "vitest";
import { detectAnomalies } from "@/lib/intelligence/anomalies/detect";
import { buildCausalHypotheses } from "@/lib/intelligence/causal/hypotheses";
import { INTELLIGENCE_SCORING_CONFIG } from "@/lib/intelligence/config/scoring";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { explainTopDecision } from "@/lib/intelligence/explainability/why-first";
import { buildForecastsV2 } from "@/lib/intelligence/forecasts/v2";
import { buildIntelligenceGraph } from "@/lib/intelligence/graph/model";
import {
  adaptiveActionScore,
  buildMerchantInterventions,
  buildPlatformInterventions,
  getTopIntervention,
  rankInterventions,
  scoreIntervention,
} from "@/lib/intelligence/interventions/engine";
import {
  buildMerchantIntelligenceProfile,
  scoreActivation,
  scoreChurnRisk,
  scoreCommerceReadiness,
  scoreFirstSaleProxy,
  scoreIntent,
} from "@/lib/intelligence/merchants/profile";
import {
  appendActionEvent,
  classifyBacklogOutcome,
  classifyOutcome,
  createRecommendedEvent,
} from "@/lib/intelligence/outcomes/lifecycle";
import {
  aggregateInterventionMemory,
  emptyInterventionMemory,
} from "@/lib/intelligence/outcomes/memory";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import { runQualityFirewall } from "@/lib/intelligence/quality/firewall";
import { evaluateRulesV3 } from "@/lib/intelligence/registry/v3";
import { buildRichSegments } from "@/lib/intelligence/segments/rich";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import {
  comparePeriods,
  detectAcceleration,
  detectAnomaly,
  previousFromChange,
} from "@/lib/intelligence/temporal";
import { buildTemporalTrends } from "@/lib/intelligence/forecasting";

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
    sparklines: {
      ...base.sparklines,
      ...partial.sparklines,
    },
    today: { ...base.today, ...partial.today },
    yesterday: { ...base.yesterday, ...partial.yesterday },
  };
}

const merchantBase = {
  merchantId: "m1",
  storeId: "s1",
  storeName: "Celiaram",
  hasStore: true,
  productCount: 3,
  activeProductCount: 3,
  realOrders: 0,
  recentLogin: true,
  hasCustomDomain: false,
  codConfigured: true,
};

describe("V3 temporal primitives", () => {
  it("comparePeriods computes delta and direction", () => {
    const t = comparePeriods(150, 100, { id: "gmv" });
    expect(t.deltaPct).toBe(50);
    expect(t.direction).toBe("up");
    expect(t.velocity).toBe(50);
  });

  it("comparePeriods handles zero denominator safely", () => {
    const t = comparePeriods(10, 0);
    expect(t.deltaPct).toBe(100);
    expect(t.direction).toBe("up");
  });

  it("comparePeriods flat within 5%", () => {
    expect(comparePeriods(102, 100).direction).toBe("flat");
  });

  it("detectAcceleration bands are deterministic", () => {
    expect(detectAcceleration(120)).toBe("strong");
    expect(detectAcceleration(25)).toBe("moderate");
    expect(detectAcceleration(8)).toBe("weak");
    expect(detectAcceleration(-30)).toBe("negative");
    expect(detectAcceleration(0)).toBe("none");
  });

  it("detectAnomaly flags order-of-magnitude jumps", () => {
    expect(detectAnomaly(10000, 10)).toBe(true);
    expect(detectAnomaly(11, 10)).toBe(false);
  });

  it("previousFromChange is reversible", () => {
    const prev = previousFromChange(120, 20);
    expect(Math.round(prev)).toBe(100);
  });

  it("buildTemporalTrends returns four metrics", () => {
    const trends = buildTemporalTrends(
      state({ realRevenue7d: 5000, revenueChange7d: 20, realOrders7d: 40 })
    );
    expect(trends).toHaveLength(4);
    expect(trends[0]!.id).toBe("gmv");
  });
});

describe("V3 causal hypotheses", () => {
  it("builds FIRST_SALE domain friction with soft language", () => {
    const h = buildCausalHypotheses(
      state({
        firstSaleCount: 128,
        firstSaleHighIntent: 103,
        liveStores: 40,
        firstSaleBottlenecks: { noCustomDomain: 128 } as PlatformState["firstSaleBottlenecks"],
      })
    );
    const domain = h.find((x) => x.ruleId === "CAUSAL_FIRST_SALE_DOMAIN_FRICTION");
    expect(domain).toBeTruthy();
    expect(domain!.hypothesis).toMatch(/may be contributing/i);
    expect(domain!.hypothesis).not.toMatch(/\bcauses\b/i);
    expect(domain!.confidence).toBeGreaterThan(0.5);
    expect(domain!.confidence).toBeLessThanOrEqual(
      INTELLIGENCE_SCORING_CONFIG.causal.max
    );
    expect(domain!.evidenceLines.length).toBeGreaterThanOrEqual(2);
  });

  it("does not invent causality without evidence", () => {
    expect(buildCausalHypotheses(state())).toHaveLength(0);
  });

  it("COD + support compound trust risk", () => {
    const h = buildCausalHypotheses(
      state({ pendingRealOrders: 12, openSupport: 4 })
    );
    expect(h.some((x) => x.ruleId === "CAUSAL_OPERATIONAL_TRUST_RISK")).toBe(
      true
    );
  });

  it("growth + concentration causal hypothesis", () => {
    const h = buildCausalHypotheses(
      state({ revenueChange7d: 40, top2SharePct: 67 })
    );
    expect(h.some((x) => x.ruleId === "CAUSAL_GROWTH_CONCENTRATION_RISK")).toBe(
      true
    );
  });

  it("confidence is deterministic for same inputs", () => {
    const s = state({
      firstSaleCount: 50,
      firstSaleBottlenecks: { noCustomDomain: 40 } as PlatformState["firstSaleBottlenecks"],
    });
    const a = buildCausalHypotheses(s)[0]!.confidence;
    const b = buildCausalHypotheses(s)[0]!.confidence;
    expect(a).toBe(b);
  });
});

describe("V3 merchant scoring", () => {
  it("intent score uses config weights and normalizes 0–100", () => {
    const s = scoreIntent(merchantBase);
    expect(s.score).toBeGreaterThan(0);
    expect(s.score).toBeLessThanOrEqual(100);
    expect(s.formula).toContain("recentActivity");
    expect(s.inputs.recentActivity).toBe(
      INTELLIGENCE_SCORING_CONFIG.intent.recentActivity
    );
  });

  it("activation score for empty store is lower", () => {
    const empty = scoreActivation({
      ...merchantBase,
      productCount: 0,
      activeProductCount: 0,
    });
    const ready = scoreActivation(merchantBase);
    expect(ready.score).toBeGreaterThan(empty.score);
  });

  it("commerce readiness penalizes missing COD", () => {
    const noCod = scoreCommerceReadiness({
      ...merchantBase,
      codConfigured: false,
    });
    const ok = scoreCommerceReadiness({
      ...merchantBase,
      codConfigured: true,
      hasCustomDomain: true,
    });
    expect(ok.score).toBeGreaterThan(noCod.score);
  });

  it("first-sale proxy is 0 after conversion", () => {
    expect(scoreFirstSaleProxy({ ...merchantBase, realOrders: 2 }).score).toBe(
      0
    );
  });

  it("churn risk rises when cold after orders", () => {
    const cold = scoreChurnRisk({
      ...merchantBase,
      realOrders: 5,
      recentLogin: false,
    });
    const hot = scoreChurnRisk({ ...merchantBase, realOrders: 5, recentLogin: true });
    expect(cold.score).toBeGreaterThan(hot.score);
  });

  it("builds full merchant intelligence profile", () => {
    const p = buildMerchantIntelligenceProfile(merchantBase);
    expect(p.lifecycleStage).toBe("FIRST_SALE_PENDING");
    expect(p.currentBottleneck).toBe("NO_DOMAIN");
    expect(p.intentScore.score).toBeGreaterThan(0);
    expect(p.interventionScore).toBeGreaterThan(0);
    expect(p.explainability).toContain("bottleneck=");
  });

  it("POWER lifecycle for high share merchants", () => {
    const p = buildMerchantIntelligenceProfile({
      ...merchantBase,
      realOrders: 20,
      realGmv: 9000,
      sharePct: 25,
    });
    expect(p.lifecycleStage).toBe("POWER");
  });

  it("EMPTY lifecycle for hot empty stores", () => {
    const p = buildMerchantIntelligenceProfile({
      ...merchantBase,
      productCount: 0,
      activeProductCount: 0,
      realOrders: 0,
      recentLogin: true,
    });
    expect(p.lifecycleStage).toBe("EMPTY");
  });
});

describe("V3 interventions + adaptive ranking", () => {
  it("scores interventions as product of factors", () => {
    const { score, calculation } = scoreIntervention({
      impact: 100,
      urgency: 100,
      confidence: 100,
      reversibility: 100,
      actionability: 100,
    });
    expect(score).toBe(100);
    expect(calculation).toContain("impact=");
  });

  it("platform COD intervention ranks as TOP_INTERVENTION", () => {
    const now = new Date("2026-08-26T12:00:00Z");
    const ranked = rankInterventions(
      buildPlatformInterventions(state({ pendingRealOrders: 12 }), now)
    );
    const top = getTopIntervention(ranked);
    expect(top?.type).toBe("COD_VERIFICATION");
    expect(top?.recommendedRoute).toContain("/admin/payments");
  });

  it("merchant first-sale assist points to real route", () => {
    const p = buildMerchantIntelligenceProfile(merchantBase);
    const ints = buildMerchantInterventions([p], new Date());
    expect(ints.some((i) => i.type === "DOMAIN_SETUP_ASSIST")).toBe(true);
    expect(ints.every((i) => i.recommendedRoute.startsWith("/admin/"))).toBe(
      true
    );
  });

  it("GROWTH_REINFORCEMENT for growing merchants", () => {
    const p = buildMerchantIntelligenceProfile({
      ...merchantBase,
      realOrders: 5,
      realGmv: 2000,
      hasCustomDomain: true,
    });
    const ints = buildMerchantInterventions([p], new Date());
    expect(ints.some((i) => i.type === "GROWTH_REINFORCEMENT")).toBe(true);
  });

  it("adaptive score leaves live score when history insufficient", () => {
    const a = adaptiveActionScore(80, null);
    expect(a.score).toBe(80);
    expect(a.note).toMatch(/Insufficient historical evidence/i);
  });

  it("adaptive score boosts higher historical success without overriding live", () => {
    const high = adaptiveActionScore(80, 0.72);
    const low = adaptiveActionScore(80, 0.31);
    expect(high.score).toBeGreaterThan(low.score);
    // Live floor: score stays near live
    expect(high.score).toBeGreaterThanOrEqual(
      Math.round(80 * INTELLIGENCE_SCORING_CONFIG.intervention.liveEvidenceFloor)
    );
  });

  it("historical success cannot invent data when memory empty", () => {
    expect(emptyInterventionMemory()).toHaveLength(0);
  });
});

describe("V3 action lifecycle + outcomes", () => {
  it("append-only history does not mutate prior events", () => {
    const ev = createRecommendedEvent({
      actionId: "a1",
      merchantId: null,
      type: "COD_VERIFICATION",
      ruleId: "INTERVENTION_COD_VERIFICATION",
      targetMetric: "pendingRealOrders",
      baselineValue: 12,
      now: new Date(),
      evidence: ["pending=12"],
    });
    const hist = appendActionEvent([], ev);
    const hist2 = appendActionEvent(hist, { ...ev, status: "EXECUTED" });
    expect(hist).toHaveLength(1);
    expect(hist2).toHaveLength(2);
    expect(hist[0]!.status).toBe("RECOMMENDED");
  });

  it("classifies SUCCESS when baseline 0 → observed > 0", () => {
    expect(
      classifyOutcome({ baseline: 0, observed: 1, sufficientData: true })
    ).toBe("SUCCESS");
  });

  it("classifies NO_EFFECT when no change", () => {
    expect(
      classifyOutcome({ baseline: 0, observed: 0, sufficientData: true })
    ).toBe("NO_EFFECT");
  });

  it("classifies INCONCLUSIVE without sufficient data", () => {
    expect(
      classifyOutcome({ baseline: 0, observed: 5, sufficientData: false })
    ).toBe("INCONCLUSIVE");
  });

  it("classifies PARTIAL_SUCCESS on partial improvement", () => {
    expect(
      classifyOutcome({ baseline: 10, observed: 14, sufficientData: true })
    ).toBe("PARTIAL_SUCCESS");
  });

  it("backlog SUCCESS when queue clears", () => {
    expect(
      classifyBacklogOutcome({
        baseline: 12,
        observed: 0,
        sufficientData: true,
      })
    ).toBe("SUCCESS");
  });

  it("backlog NEGATIVE when backlog grows", () => {
    expect(
      classifyBacklogOutcome({
        baseline: 5,
        observed: 12,
        sufficientData: true,
      })
    ).toBe("NEGATIVE");
  });

  it("memory aggregates real history only", () => {
    const stats = aggregateInterventionMemory([
      { type: "FIRST_SALE_ASSIST", outcome: "SUCCESS", impact: 1 },
      { type: "FIRST_SALE_ASSIST", outcome: "SUCCESS", impact: 1 },
      { type: "FIRST_SALE_ASSIST", outcome: "NO_EFFECT", impact: 0 },
      { type: "FIRST_SALE_ASSIST", outcome: "PARTIAL_SUCCESS", impact: 0.5 },
    ]);
    const first = stats.find((s) => s.type === "FIRST_SALE_ASSIST")!;
    expect(first.totalAttempts).toBe(4);
    expect(first.successes).toBe(2);
    expect(first.successRate).not.toBeNull();
    expect(first.note).toMatch(/Historically/);
  });

  it("memory returns insufficient evidence below 3 decided outcomes", () => {
    const stats = aggregateInterventionMemory([
      { type: "DNS_DIAGNOSIS", outcome: "SUCCESS" },
      { type: "DNS_DIAGNOSIS", outcome: "FAILED" },
    ]);
    expect(stats[0]!.successRate).toBeNull();
    expect(stats[0]!.note).toMatch(/Insufficient/);
  });
});

describe("V3 anomalies + forecasts + firewall", () => {
  it("detects COD backlog anomaly", () => {
    const a = detectAnomalies(state({ pendingRealOrders: 12 }), []);
    expect(a.some((x) => x.ruleId === "ANOMALY_COD_BACKLOG_ACCEL")).toBe(true);
  });

  it("detects DNS failure spike", () => {
    const a = detectAnomalies(state({ domainFailing: 4 }), []);
    expect(a.some((x) => x.ruleId === "ANOMALY_DNS_FAILURE_SPIKE")).toBe(true);
  });

  it("temporal anomaly includes baseline/observed/threshold", () => {
    const trends = [
      comparePeriods(1000, 100, { id: "gmv", label: "GMV" }),
    ];
    const a = detectAnomalies(state(), trends);
    const spike = a.find((x) => x.id === "anomaly-gmv");
    expect(spike?.baseline).toBe(100);
    expect(spike?.observed).toBe(1000);
    expect(spike?.threshold).toBe(
      INTELLIGENCE_SCORING_CONFIG.anomaly.pctChangeThreshold
    );
  });

  it("forecast unavailable when history insufficient", () => {
    const gate = runQualityFirewall(state());
    const f = buildForecastsV2(state({ realRevenue7d: 0, revenueChange7d: 0 }), gate);
    const gmv = f.find((x) => x.id === "forecast-gmv")!;
    expect(gmv.status).toBe("FORECAST_UNAVAILABLE");
    expect(gmv.unavailableReason).toBeTruthy();
  });

  it("forecast OK exposes confidence horizon baseline velocity", () => {
    const s = state({
      realRevenue7d: 5000,
      revenueChange7d: 20,
      sparklines: { revenue: [1, 2, 3, 4, 5], orders: [], signups: [] },
    });
    const f = buildForecastsV2(s, runQualityFirewall(s)).find(
      (x) => x.id === "forecast-gmv"
    )!;
    expect(f.status).toBe("OK");
    expect(f.horizon).toBe("7d");
    expect(f.confidence).toBeGreaterThan(0);
    expect(typeof f.velocity).toBe("number");
  });

  it("firewall blocks forecast on negative revenue", () => {
    const gate = runQualityFirewall(state({ totalRevenue: -1, realRevenue7d: -5 }));
    expect(gate.blockedOperations).toContain("forecast");
    expect(gate.warnings.length).toBeGreaterThan(0);
  });

  it("firewall blocks ranking on impossible concentration", () => {
    const gate = runQualityFirewall(state({ top2SharePct: 150 }));
    expect(gate.blockedOperations).toContain("ranking");
  });
});

describe("V3 segments + graph + explainability + registry", () => {
  it("rich segments are not mutually exclusive", () => {
    const segs = buildRichSegments(
      state({
        firstSaleCount: 128,
        firstSaleHighIntent: 103,
        domainFailing: 4,
        pendingRealOrders: 12,
        loggedInEmpty7d: 8,
      })
    );
    expect(segs.some((s) => s.id === "TECHNICAL_BLOCK")).toBe(true);
    expect(segs.some((s) => s.id === "OPERATIONAL_BLOCK")).toBe(true);
    expect(segs.some((s) => s.id === "HIGH_INTENT")).toBe(true);
  });

  it("intelligence graph links platform entities", () => {
    const g = buildIntelligenceGraph({
      signalIds: ["pending-cod"],
      diagnosisIds: ["OPERATIONAL_COD_BOTTLENECK"],
      bottleneckCodes: ["ORDER_VERIFICATION_DELAY"],
      interventionIds: ["int-platform-cod"],
      causalIds: ["causal-ops-trust"],
      merchantIds: ["m1", "m2"],
    });
    expect(g.nodes.length).toBeGreaterThan(3);
    expect(g.edges.some((e) => e.relation === "RECOMMENDS")).toBe(true);
  });

  it("why-first explains COD vs first-sale tradeoff", () => {
    const w = explainTopDecision({
      topLabel: "Review pending COD",
      topHref: "/admin/payments?focus=pending",
      topScore: 92,
      topReason: "Immediate operational impact",
      pendingRealOrders: 12,
      firstSaleCount: 128,
      domainFailing: 0,
      openSupport: 0,
      alternativeLabel: "Assist first-sale merchants",
      calculation: "impact×urgency…",
      ruleIds: ["pending-cod"],
      confidence: 0.95,
    });
    expect(w.whyNow).toMatch(/12/);
    expect(w.whyNotAlternative).toMatch(/128|First-sale|first-sale/i);
    expect(w.evidence.length).toBeGreaterThan(0);
  });

  it("registry V3 evaluates causal and intervention rules", () => {
    const r = evaluateRulesV3(
      state({
        pendingRealOrders: 12,
        firstSaleCount: 128,
        firstSaleBottlenecks: { noCustomDomain: 100 } as PlatformState["firstSaleBottlenecks"],
      })
    );
    expect(r.evaluated).toBeGreaterThanOrEqual(10);
    expect(r.fired).toContain("INTERVENTION_COD_VERIFICATION");
    expect(r.fired).toContain("CAUSAL_FIRST_SALE_DOMAIN_FRICTION");
  });
});

describe("V3 snapshot + UI adapter compatibility", () => {
    it("snapshot version is 5.0.0 with execution trace", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({ pendingRealOrders: 12, pendingRealGmv: 2000 })
    );
    expect(snap.metadata.version).toBe("7.0.0");
    expect(snap.executionTrace.rulesEvaluated).toBeGreaterThan(0);
    expect(snap.executionTrace.topAction).toBeTruthy();
    expect(snap.topIntervention?.type).toBe("COD_VERIFICATION");
    expect(snap.causalHypotheses).toBeDefined();
    expect(snap.anomalies).toBeDefined();
    expect(snap.interventions.length).toBeGreaterThan(0);
  });

  it("causal blocked when firewall rejects negative revenue", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({
        totalRevenue: -10,
        realRevenue7d: -5,
        firstSaleCount: 50,
        firstSaleBottlenecks: { noCustomDomain: 40 } as PlatformState["firstSaleBottlenecks"],
      })
    );
    expect(snap.causalHypotheses).toHaveLength(0);
    expect(snap.dataQualityWarnings.length).toBeGreaterThan(0);
  });

  it("snapshotToBriefing still produces UI briefing", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({ pendingRealOrders: 5, openSupport: 2 })
    );
    const briefing = snapshotToBriefing(snap);
    expect(briefing.pulse.score).toBe(snap.health.score);
    expect(briefing.actions.length).toBeGreaterThan(0);
  });

  it("empty platform does not crash V3", () => {
    const snap = buildDrSaraSnapshotFromState(state());
    expect(snap.metadata.version).toBe("7.0.0");
    expect(snap.executionTrace.signalsGenerated).toBeGreaterThanOrEqual(0);
  });

  it("single merchant concentration still works", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({
        concentration: [
          {
            id: "only",
            name: "Only",
            slug: "only",
            gmv: 1000,
            sharePct: 100,
            orders: 5,
          },
        ],
        top2SharePct: 100,
        realRevenue7d: 1000,
      })
    );
    expect(snap.merchantIntelligence.length).toBeGreaterThan(0);
  });

  it("same input → same V3 snapshot fields", () => {
    const s = state({
      pendingRealOrders: 8,
      firstSaleCount: 40,
      firstSaleBottlenecks: { noCustomDomain: 30 } as PlatformState["firstSaleBottlenecks"],
    });
    const a = buildDrSaraSnapshotFromState(s);
    const b = buildDrSaraSnapshotFromState(s);
    expect(a.topAction?.label).toBe(b.topAction?.label);
    expect(a.topIntervention?.type).toBe(b.topIntervention?.type);
    expect(a.registryFired).toEqual(b.registryFired);
    expect(a.causalHypotheses.map((c) => c.ruleId)).toEqual(
      b.causalHypotheses.map((c) => c.ruleId)
    );
  });
});
