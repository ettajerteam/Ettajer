import { describe, expect, it } from "vitest";
import { scorePlatformHealth } from "@/lib/intelligence/scoring/health-score";
import { getPrioritySignals } from "@/lib/intelligence/signals/priorities";
import type { PlatformOverviewData } from "@/lib/admin/platform-stats";

function minimalOverview(
  overrides: Partial<PlatformOverviewData> = {}
): PlatformOverviewData {
  const base = {
    totalUsers: 100,
    activeUsers: 80,
    waitingUsers: 2,
    totalStores: 50,
    totalOrders: 40,
    realOrders: 30,
    testOrders: 10,
    totalRevenue: 22650,
    testRevenue: 0,
    newUsers24h: 1,
    newUsers7d: 5,
    newUsersPrev7d: 3,
    newStores7d: 2,
    realOrders7d: 8,
    realRevenue7d: 1200,
    changes: { users7d: 10, orders7d: 20, revenue7d: 50 },
    newMessages: 1,
    failedLogins24h: 0,
    recentUsers: [],
    recentMessages: [],
    recentOrders: [],
    topStores: [],
    totalProducts: 200,
    activeProducts: 150,
    liveStores: 40,
    domainsConnected: 6,
    domainsConnectedSuccess: 2,
    sparklines: { revenue: [], orders: [], signups: [], liveStores: [] },
    funnel: {
      totalStores: 50,
      noProducts: 19,
      draftOnly: 5,
      activeNoOrders: 128,
      hasOrders: 10,
    },
    hotEmptyCount: 8,
    loggedInEmpty7d: 8,
    insights: [],
    brief: { subtitle: "", tone: "neutral" as const },
    attentionItems: [
      {
        id: "pending-cod",
        count: 12,
        title: "COD orders pending verification",
        why: "Courier handoff may be delayed.",
        impact: "12 orders",
        href: "/admin/payments?focus=pending",
        cta: "Review orders",
        urgency: 10,
        priorityScore: 90,
        tier: "high" as const,
        tierLabel: "High priority",
        priorityReason: "COD handoff",
        reason: "Courier handoff may be delayed.",
      },
    ],
    attentionSentence: "12 pending COD need review.",
    health: {
      items: [],
      overall: "attention" as const,
      overallLabel: "Needs attention",
    },
    helpToday: [],
    firstSale: {
      count: 128,
      highIntentCount: 20,
      liveProductsPlatform: 150,
      bottlenecks: {},
    },
    liveFeed: [],
    pendingRealGmv: 500,
    testSharePct: 10,
    today: { orders: 0, revenue: 0, signups: 0 },
    yesterday: { orders: 0, revenue: 0, signups: 0 },
    unverifiedEmails: 0,
    pendingRealOrders: 12,
    processingRealOrders: 3,
    concentration: [
      {
        id: "a",
        name: "Store A",
        slug: "a",
        gmv: 10000,
        sharePct: 40,
        orders: 10,
      },
      {
        id: "b",
        name: "Store B",
        slug: "b",
        gmv: 6000,
        sharePct: 27,
        orders: 5,
      },
    ],
    concentrationRisk: {
      top2SharePct: 67,
      elevated: true,
      message: "Top 2 merchants · 67% of tracked GMV",
      why: "Revenue is concentrated.",
      recommended: "Activate mid-tier merchants.",
    },
  };
  return { ...base, ...overrides } as PlatformOverviewData;
}

describe("scorePlatformHealth", () => {
  it("returns a 0–100 score with five dimensions", () => {
    const pulse = scorePlatformHealth(minimalOverview());
    expect(pulse.score).toBeGreaterThanOrEqual(0);
    expect(pulse.score).toBeLessThanOrEqual(100);
    expect(pulse.dimensions).toHaveLength(5);
    expect(pulse.dimensions.map((d) => d.id)).toEqual([
      "operations",
      "activation",
      "revenue",
      "support",
      "technical",
    ]);
  });
});

describe("getPrioritySignals", () => {
  it("maps attention items with deterministic explanations", () => {
    const priorities = getPrioritySignals(minimalOverview(), 5);
    expect(priorities[0]?.severity).toBe("high");
    expect(priorities[0]?.explanation.source).toBe("deterministic");
    expect(priorities[0]?.explanation.rule).toContain("pendingRealOrders");
  });
});
