import { describe, expect, it } from "vitest";
import { snapshotToBriefing } from "@/lib/intelligence/adapt-briefing";
import { correlateSignals } from "@/lib/intelligence/correlation";
import { diagnosePlatform } from "@/lib/intelligence/diagnosis";
import { explainPriority, explainSignal } from "@/lib/intelligence/explainability/why";
import {
  emptyPlatformState,
} from "@/lib/intelligence/platform-state";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import {
  getRecommendedActions,
  isValidAdminHref,
} from "@/lib/intelligence/recommendations/actions";
import { calculatePlatformHealth } from "@/lib/intelligence/scoring/health";
import {
  calculatePriority,
  prioritizeSignals,
} from "@/lib/intelligence/scoring/priority";
import { segmentForMerchantFacts } from "@/lib/intelligence/segments/merchants";
import { collectAllSignals } from "@/lib/intelligence/signals/collect";
import { buildDrSaraSnapshotFromState } from "@/lib/intelligence/snapshot";
import { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";

function state(partial: Partial<PlatformState> = {}): PlatformState {
  return {
    ...emptyPlatformState(new Date("2026-08-26T12:00:00Z")),
    ...partial,
    funnel: {
      ...emptyPlatformState().funnel,
      ...partial.funnel,
    },
    firstSaleBottlenecks: {
      ...emptyPlatformState().firstSaleBottlenecks,
      ...partial.firstSaleBottlenecks,
    },
  };
}

describe("signal engine", () => {
  it("1. pending COD creates high priority signal", () => {
    const signals = collectAllSignals(
      state({ pendingRealOrders: 12, pendingRealGmv: 2273 })
    );
    const pending = signals.find((s) => s.id === "pending-cod");
    expect(pending).toBeTruthy();
    expect(pending!.severity).toMatch(/high|critical/);
    expect(pending!.evidence.length).toBeGreaterThan(0);
    expect(pending!.ruleId).toContain("pending_real_cod");
  });

  it("5. unanswered support thread creates support signal", () => {
    const signals = collectAllSignals(state({ openSupport: 1 }));
    expect(signals.some((s) => s.id === "support-backlog")).toBe(true);
  });

  it("4. unhealthy custom domain creates technical risk", () => {
    const signals = collectAllSignals(
      state({
        domainsConnected: 6,
        domainsConnectedSuccess: 2,
        domainFailing: 4,
      })
    );
    const dns = signals.find((s) => s.id === "dns-failure");
    expect(dns).toBeTruthy();
    expect(dns!.category).toBe("technical");
  });

  it("6. revenue concentration > threshold creates risk", () => {
    const pct = Math.round(INTELLIGENCE_THRESHOLDS.revenueConcentrationHigh * 100);
    const signals = collectAllSignals(
      state({
        top2SharePct: pct + 7,
        concentration: [
          {
            id: "a",
            name: "A",
            slug: "a",
            gmv: 10000,
            sharePct: 40,
            orders: 10,
          },
          {
            id: "b",
            name: "B",
            slug: "b",
            gmv: 6000,
            sharePct: 27,
            orders: 5,
          },
        ],
      })
    );
    expect(signals.some((s) => s.id === "revenue-concentration")).toBe(true);
  });

  it("7. positive GMV momentum creates positive signal", () => {
    const signals = collectAllSignals(
      state({
        revenueChange7d: INTELLIGENCE_THRESHOLDS.revenueMomentumPositive + 10,
        realRevenue7d: 15000,
        totalRevenue: 22000,
      })
    );
    const mom = signals.find((s) => s.id === "revenue-momentum");
    expect(mom?.severity).toBe("positive");
  });
});

describe("merchant segmentation", () => {
  it("2. zero-product active merchant becomes HOT", () => {
    expect(
      segmentForMerchantFacts({
        productCount: 0,
        realOrders: 0,
        loggedInWithinWindow: true,
        gmv: 0,
        sharePct: 0,
      })
    ).toBe("HOT");
  });

  it("3. live products + zero orders becomes FIRST_SALE", () => {
    expect(
      segmentForMerchantFacts({
        productCount: 3,
        realOrders: 0,
        loggedInWithinWindow: false,
        gmv: 0,
        sharePct: 0,
      })
    ).toBe("FIRST_SALE");
  });
});

describe("priority & health", () => {
  it("8. priority scoring is deterministic", () => {
    const signals = collectAllSignals(state({ pendingRealOrders: 12 }));
    const pending = signals.find((s) => s.id === "pending-cod")!;
    const a = calculatePriority(pending);
    const b = calculatePriority(pending);
    expect(a.priorityScore).toBe(b.priorityScore);
    expect(a.calculation).toBe(b.calculation);
  });

  it("9. health score changes when underlying values change", () => {
    const healthy = calculatePlatformHealth(state());
    const stressed = calculatePlatformHealth(
      state({
        pendingRealOrders: 12,
        domainFailing: 4,
        domainsConnected: 6,
        domainsConnectedSuccess: 2,
        openSupport: 5,
        firstSaleCount: 128,
        top2SharePct: 67,
      })
    );
    expect(stressed.score).toBeLessThan(healthy.score);
    expect(stressed.score).not.toBe(40); // not hardcoded — derived
    expect(healthy.score).toBeGreaterThan(80);
  });
});

describe("explainability & recommendations", () => {
  it("10. explainability always contains evidence", () => {
    const signals = collectAllSignals(state({ pendingRealOrders: 3 }));
    const pending = signals.find((s) => s.id === "pending-cod")!;
    const why = explainSignal(pending);
    expect(why.evidence.length).toBeGreaterThan(0);
    expect(why.engine).toBe("deterministic intelligence");
    expect(why.source).toBe("live platform data");
    const prio = explainPriority(calculatePriority(pending));
    expect(prio.evidence.length).toBeGreaterThan(0);
  });

  it("11. recommendations map to valid admin routes", () => {
    const s = state({
      pendingRealOrders: 12,
      openSupport: 1,
      domainFailing: 4,
      domainsConnected: 6,
      domainsConnectedSuccess: 2,
      firstSaleCount: 10,
    });
    const signals = collectAllSignals(s);
    const actions = getRecommendedActions(s, signals);
    expect(actions.length).toBeGreaterThan(0);
    for (const a of actions) {
      expect(isValidAdminHref(a.href)).toBe(true);
      expect(a.type).toBe("navigation");
    }
  });
});

describe("engine resilience", () => {
  it("12. empty platform does not crash the engine", () => {
    const snapshot = buildDrSaraSnapshotFromState(emptyPlatformState());
    expect(snapshot.health.score).toBeGreaterThanOrEqual(0);
    expect(snapshot.signals).toEqual([]);
    expect(snapshot.priorities).toEqual([]);
    const briefing = snapshotToBriefing(snapshot);
    expect(briefing.pulse.score).toBe(snapshot.health.score);
  });

  it("13. missing optional data does not crash the engine", () => {
    const s = state({
      concentration: [],
      helpToday: [],
      attentionSentence: "",
      firstSaleBottlenecks: {
        lowRecentActivity: 0,
        singleProduct: 0,
        multiProductReady: 0,
        noCustomDomain: 0,
        noCodConfigured: 0,
      },
    });
    expect(() => buildDrSaraSnapshotFromState(s)).not.toThrow();
  });
});

describe("correlation & diagnosis", () => {
  it("correlates first-sale gap when high-intent merchants exist", () => {
    const s = state({
      firstSaleCount: 128,
      firstSaleHighIntent: 8,
      liveStores: 40,
    });
    const signals = collectAllSignals(s);
    const corr = correlateSignals(signals, s);
    expect(corr.some((c) => c.id === "corr-first-sale-gap")).toBe(true);
    const diagnoses = diagnosePlatform(s, signals, corr);
    expect(
      diagnoses.some((d) => d.diagnosisId === "FIRST_SALE_BOTTLENECK")
    ).toBe(true);
  });

  it("prioritizes pending COD above first-sale opportunity", () => {
    const s = state({
      pendingRealOrders: 12,
      pendingRealGmv: 2000,
      firstSaleCount: 128,
      openSupport: 1,
    });
    const priorities = prioritizeSignals(collectAllSignals(s), 5);
    expect(priorities[0]?.signalId).toBe("pending-cod");
  });
});
