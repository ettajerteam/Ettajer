import { describe, expect, it } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import {
  measureActionOutcome,
  summarizeOutcomes,
} from "@/lib/intelligence/actions/outcomes";
import { detectPlatformBottlenecks } from "@/lib/intelligence/bottlenecks/platform";
import { correlateSignals } from "@/lib/intelligence/correlation";
import { assessDataQuality } from "@/lib/intelligence/data-quality";
import { diagnosePlatform } from "@/lib/intelligence/diagnosis";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { explainSignal } from "@/lib/intelligence/explainability/why";
import { buildForecasts, buildTemporalTrends } from "@/lib/intelligence/forecasting";
import {
  buildMerchantJourney,
  detectMerchantBottleneck,
  inferJourneyStage,
} from "@/lib/intelligence/merchants/journey";
import { emptyPlatformState } from "@/lib/intelligence/platform-state";
import {
  calculateExtendedPriority,
  getTopAction,
} from "@/lib/intelligence/prioritization/top-action";
import {
  getRecommendedActions,
  isValidAdminHref,
} from "@/lib/intelligence/recommendations/actions";
import { evaluateRegistry } from "@/lib/intelligence/registry/rules";
import { detectProactiveRisks } from "@/lib/intelligence/risks/proactive";
import { calculatePlatformHealth } from "@/lib/intelligence/scoring/health";
import {
  calculatePriority,
  prioritizeSignals,
} from "@/lib/intelligence/scoring/priority";
import { segmentForMerchantFacts } from "@/lib/intelligence/segments/merchants";
import { collectAllSignals } from "@/lib/intelligence/signals/collect";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import {
  comparePeriods,
  detectAcceleration,
  detectAnomaly,
  previousFromChange,
} from "@/lib/intelligence/temporal";
import { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";

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

describe("fixtures: healthy platform", () => {
  it("produces high health and no critical bottlenecks", () => {
    const snap = buildDrSaraSnapshotFromState(
      state({
        realOrders7d: 20,
        realRevenue7d: 5000,
        revenueChange7d: 10,
        liveStores: 40,
        totalStores: 50,
        funnel: {
          totalStores: 50,
          noProducts: 2,
          draftOnly: 1,
          activeNoOrders: 3,
          hasOrders: 40,
        },
      })
    );
    expect(snap.health.score).toBeGreaterThan(80);
    expect(snap.metadata.version).toBe("8.0.0");
    expect(snap.topAction).toBeNull();
  });
});

describe("fixtures: COD backlog", () => {
  it("pending COD creates high priority + TOP_ACTION", () => {
    const s = state({ pendingRealOrders: 12, pendingRealGmv: 2273 });
    const signals = collectAllSignals(s);
    expect(signals.some((x) => x.id === "pending-cod")).toBe(true);
    const actions = getRecommendedActions(s, signals);
    const top = getTopAction(signals, actions);
    expect(top?.action.href).toContain("/admin/payments");
    expect(top?.whyThisFirst.length).toBeGreaterThan(20);
  });
});

describe("fixtures: domain failures", () => {
  it("dns failure creates technical bottleneck", () => {
    const bn = detectPlatformBottlenecks(
      state({
        domainsConnected: 6,
        domainsConnectedSuccess: 2,
        domainFailing: 4,
      })
    );
    expect(bn.some((b) => b.code === "NO_DOMAIN")).toBe(true);
  });
});

describe("fixtures: first-sale bottleneck", () => {
  it("ranks FIRST_SALE with high intent", () => {
    const bn = detectPlatformBottlenecks(
      state({ firstSaleCount: 128, firstSaleHighIntent: 103 })
    );
    const fs = bn.find((b) => b.code === "NO_FIRST_ORDER");
    expect(fs?.highIntent).toBe(103);
    expect(fs?.confidence).toBeGreaterThanOrEqual(0.9);
  });
});

describe("fixtures: GMV concentration + rapid growth", () => {
  it("correlates growth with concentration", () => {
    const s = state({
      realRevenue7d: 15456,
      revenueChange7d: 1956,
      top2SharePct: 67,
      concentration: [
        { id: "a", name: "A", slug: "a", gmv: 10000, sharePct: 40, orders: 10 },
        { id: "b", name: "B", slug: "b", gmv: 6000, sharePct: 27, orders: 5 },
      ],
      firstSaleCount: 10,
      firstSaleHighIntent: 4,
    });
    const signals = collectAllSignals(s);
    const corr = correlateSignals(signals, s);
    expect(corr.some((c) => c.id === "corr-growth-concentrated")).toBe(true);
    const trends = buildTemporalTrends(s);
    const gmv = trends.find((t) => t.id === "gmv")!;
    expect(gmv.direction).toBe("up");
    expect(detectAcceleration(gmv.deltaPct)).toBe("strong");
  });
});

describe("fixtures: merchant churn risk", () => {
  it("detects proactive churn when orders drop sharply", () => {
    const s = state({
      realOrders7d: 4,
      ordersChange7d: -80,
      funnel: {
        totalStores: 50,
        noProducts: 5,
        draftOnly: 2,
        activeNoOrders: 10,
        hasOrders: 20,
      },
    });
    const temporal = buildTemporalTrends(s);
    const risks = detectProactiveRisks(s, collectAllSignals(s), temporal);
    expect(risks.some((r) => r.ruleId === "MERCHANT_CHURN_RISK")).toBe(true);
  });
});

describe("fixtures: support backlog", () => {
  it("opens support signal", () => {
    expect(
      collectAllSignals(state({ openSupport: 2 })).some(
        (s) => s.id === "support-backlog"
      )
    ).toBe(true);
  });
});

describe("fixtures: conflicting / insufficient / stale", () => {
  it("empty platform does not crash", () => {
    const snap = buildDrSaraSnapshotFromState(emptyPlatformState());
    expect(snap.health.score).toBeGreaterThanOrEqual(0);
    expect(snapshotToBriefing(snap).pulse.score).toBe(snap.health.score);
  });

  it("data quality warns on negative revenue", () => {
    const w = assessDataQuality({
      totalRevenue: -10,
      realRevenue7d: 0,
      pendingRealOrders: 0,
      pendingRealGmv: 0,
      top2SharePct: 10,
      domainsConnected: 1,
      domainsConnectedSuccess: 1,
    });
    expect(w.some((x) => x.id === "dq-negative-revenue")).toBe(true);
  });

  it("anomaly detection flags order-of-magnitude jumps", () => {
    expect(detectAnomaly(15456, 742)).toBe(true);
  });
});

describe("merchant journey + segmentation", () => {
  it("HOT and FIRST_SALE journeys", () => {
    expect(
      detectMerchantBottleneck({
        merchantId: "m1",
        hasStore: true,
        productCount: 0,
        activeProductCount: 0,
        realOrders: 0,
        recentLogin: true,
      })
    ).toBe("NO_PRODUCTS");
    expect(
      inferJourneyStage({
        merchantId: "m2",
        hasStore: true,
        productCount: 8,
        activeProductCount: 8,
        realOrders: 0,
        recentLogin: true,
        codConfigured: true,
      })
    ).toBe("STORE_PUBLISHED");
    const j = buildMerchantJourney({
      merchantId: "m2",
      hasStore: true,
      productCount: 8,
      activeProductCount: 8,
      realOrders: 0,
      recentLogin: true,
      hasCustomDomain: false,
      codConfigured: true,
    });
    expect(j.bottleneck).toBe("NO_DOMAIN");
    expect(j.dimensions.catalog).toBe(100);
    expect(j.evidence.length).toBeGreaterThan(0);
    expect(segmentForMerchantFacts({
      productCount: 0,
      realOrders: 0,
      loggedInWithinWindow: true,
      gmv: 0,
      sharePct: 0,
    })).toBe("HOT");
  });
});

describe("forecasting + temporal", () => {
  it("builds GMV forecast with basis", () => {
    const f = buildForecasts(
      state({ realRevenue7d: 15456, revenueChange7d: 1956, sparklines: { revenue: [100, 200, 800, 2000], orders: [], signups: [] } })
    );
    expect(f[0]?.statement.length).toBeGreaterThan(20);
    expect(f[0]?.basis.includes("current=")).toBe(true);
  });

  it("comparePeriods is deterministic", () => {
    const a = comparePeriods(100, 50, { id: "x" });
    const b = comparePeriods(100, 50, { id: "x" });
    expect(a).toEqual(b);
    expect(previousFromChange(15456, 1956)).toBeGreaterThan(0);
  });
});

describe("priority extended + action outcomes", () => {
  it("extended priority is deterministic", () => {
    const signal = collectAllSignals(state({ pendingRealOrders: 12 }))[0]!;
    const a = calculateExtendedPriority(signal);
    const b = calculateExtendedPriority(signal);
    expect(a.extendedScore).toBe(b.extendedScore);
  });

  it("measures action success when COD clears", () => {
    const measured = measureActionOutcome({
      action: {
        id: "1",
        type: "PENDING_COD",
        targetType: "platform",
        targetId: "platform",
        createdAt: new Date(),
        status: "recommended",
        expectedOutcome: "clear queue",
        metadata: { baselinePending: 12 },
      },
      observed: { pendingRealOrders: 0 },
    });
    expect(measured.outcome).toBe("SUCCESS");
    const summary = summarizeOutcomes([measured]);
    expect(summary.actionSuccessRate).toBe(1);

    const failed = measureActionOutcome({
      action: {
        id: "2",
        type: "PENDING_COD",
        targetType: "platform",
        targetId: "platform",
        createdAt: new Date(),
        status: "recommended",
        expectedOutcome: "clear queue",
        metadata: { baselinePending: 12 },
      },
      observed: { pendingRealOrders: 12 },
    });
    expect(failed.outcome).toBe("FAILURE");
  });
});

describe("registry + explainability + routes", () => {
  it("registry fires COD rule", () => {
    const fired = evaluateRegistry(state({ pendingRealOrders: 3 }));
    expect(fired.find((r) => r.id === "OPERATIONAL_COD_BOTTLENECK")?.fired).toBe(
      true
    );
  });

  it("explainability always has evidence", () => {
    const s = collectAllSignals(state({ pendingRealOrders: 2 }))[0]!;
    expect(explainSignal(s).evidence.length).toBeGreaterThan(0);
    expect(explainSignal(s).engine).toBe("deterministic intelligence");
  });

  it("recommendations map to valid admin routes", () => {
    const s = state({
      pendingRealOrders: 12,
      openSupport: 1,
      domainFailing: 4,
      domainsConnected: 6,
      domainsConnectedSuccess: 2,
    });
    for (const a of getRecommendedActions(s, collectAllSignals(s))) {
      expect(isValidAdminHref(a.href)).toBe(true);
    }
  });

  it("same input → same snapshot output", () => {
    const s = state({
      pendingRealOrders: 12,
      firstSaleCount: 128,
      firstSaleHighIntent: 8,
      top2SharePct: 67,
      revenueChange7d: 50,
      realRevenue7d: 1000,
      domainFailing: 4,
      domainsConnected: 6,
      domainsConnectedSuccess: 2,
      openSupport: 1,
    });
    const a = buildDrSaraSnapshotFromState(s);
    const b = buildDrSaraSnapshotFromState(s);
    expect(a.health.score).toBe(b.health.score);
    expect(a.priorities.map((p) => p.signalId)).toEqual(
      b.priorities.map((p) => p.signalId)
    );
    expect(a.topAction?.label).toBe(b.topAction?.label);
    expect(a.registryFired).toEqual(b.registryFired);
  });

  it("health changes when underlying values change", () => {
    expect(
      calculatePlatformHealth(state({ pendingRealOrders: 12 })).score
    ).toBeLessThan(calculatePlatformHealth(state()).score);
  });

  it("prioritizes COD above first-sale", () => {
    const priorities = prioritizeSignals(
      collectAllSignals(
        state({
          pendingRealOrders: 12,
          pendingRealGmv: 2000,
          firstSaleCount: 128,
          openSupport: 1,
        })
      ),
      5
    );
    expect(priorities[0]?.signalId).toBe("pending-cod");
    expect(calculatePriority(collectAllSignals(state({ pendingRealOrders: 12 }))[0]!).priorityScore).toBeGreaterThan(70);
  });

  it("concentration threshold from config", () => {
    const pct = Math.round(INTELLIGENCE_THRESHOLDS.revenueConcentrationHigh * 100);
    expect(
      collectAllSignals(state({ top2SharePct: pct + 1 })).some(
        (s) => s.id === "revenue-concentration"
      )
    ).toBe(true);
  });
});
