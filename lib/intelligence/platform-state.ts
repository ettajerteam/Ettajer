import type { PlatformOverviewData } from "@/lib/admin/platform-stats";
import type { PlatformState } from "@/lib/intelligence/engine-types";

/** Map overview → normalized PlatformState for the rule engine. */
export function toPlatformState(
  overview: PlatformOverviewData,
  now = new Date()
): PlatformState {
  const domainFailing = Math.max(
    0,
    overview.domainsConnected - overview.domainsConnectedSuccess
  );

  return {
    now,
    pendingRealOrders: overview.pendingRealOrders ?? 0,
    processingRealOrders: overview.processingRealOrders ?? 0,
    pendingRealGmv: overview.pendingRealGmv ?? 0,
    waitingUsers: overview.waitingUsers ?? 0,
    openSupport: overview.newMessages ?? 0,
    failedLogins24h: overview.failedLogins24h ?? 0,
    domainsConnected: overview.domainsConnected ?? 0,
    domainsConnectedSuccess: overview.domainsConnectedSuccess ?? 0,
    domainFailing,
    hotEmptyCount: overview.hotEmptyCount ?? 0,
    loggedInEmpty7d: overview.loggedInEmpty7d ?? 0,
    firstSaleCount: overview.firstSale?.count ?? overview.funnel?.activeNoOrders ?? 0,
    firstSaleHighIntent: overview.firstSale?.highIntentCount ?? 0,
    funnel: {
      totalStores: overview.funnel?.totalStores ?? overview.totalStores ?? 0,
      noProducts: overview.funnel?.noProducts ?? 0,
      draftOnly: overview.funnel?.draftOnly ?? 0,
      activeNoOrders: overview.funnel?.activeNoOrders ?? 0,
      hasOrders: overview.funnel?.hasOrders ?? 0,
    },
    realOrders: overview.realOrders ?? 0,
    realOrders7d: overview.realOrders7d ?? 0,
    totalRevenue: overview.totalRevenue ?? 0,
    realRevenue7d: overview.realRevenue7d ?? 0,
    revenueChange7d: overview.changes?.revenue7d ?? 0,
    ordersChange7d: overview.changes?.orders7d ?? 0,
    top2SharePct: overview.concentrationRisk?.top2SharePct ?? 0,
    concentrationElevated: Boolean(overview.concentrationRisk?.elevated),
    concentrationMessage: overview.concentrationRisk?.message ?? null,
    concentrationWhy: overview.concentrationRisk?.why ?? null,
    concentrationRecommended: overview.concentrationRisk?.recommended ?? null,
    concentration: (overview.concentration ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      gmv: c.gmv,
      sharePct: c.sharePct,
      orders: c.orders,
    })),
    firstSaleBottlenecks: {
      lowRecentActivity: overview.firstSale?.bottlenecks?.lowRecentActivity ?? 0,
      singleProduct: overview.firstSale?.bottlenecks?.singleProduct ?? 0,
      multiProductReady:
        overview.firstSale?.bottlenecks?.multiProductReady ?? 0,
      noCustomDomain: overview.firstSale?.bottlenecks?.noCustomDomain ?? 0,
      noCodConfigured: overview.firstSale?.bottlenecks?.noCodConfigured ?? 0,
    },
    helpToday: (overview.helpToday ?? []).map((h) => ({
      storeId: h.storeId,
      storeName: h.storeName,
      slug: h.slug,
      ownerId: h.ownerId,
      ownerName: h.ownerName,
      ownerEmail: h.ownerEmail,
      intent: h.intent,
      healthScore: h.healthScore,
    })),
    attentionSentence: overview.attentionSentence ?? "",
    liveStores: overview.liveStores ?? 0,
    totalStores: overview.totalStores ?? 0,
    newUsers7d: overview.newUsers7d ?? 0,
    usersChange7d: overview.changes?.users7d ?? 0,
    sparklines: {
      revenue: overview.sparklines?.revenue ?? [],
      orders: overview.sparklines?.orders ?? [],
      signups: overview.sparklines?.signups ?? [],
    },
    today: {
      orders: overview.today?.orders ?? 0,
      revenue: overview.today?.revenue ?? 0,
      signups: overview.today?.signups ?? 0,
    },
    yesterday: {
      orders: overview.yesterday?.orders ?? 0,
      revenue: overview.yesterday?.revenue ?? 0,
      signups: overview.yesterday?.signups ?? 0,
    },
    liveFeed: (overview.liveFeed ?? []).map((e) => ({
      id: e.id,
      category: e.category,
      title: e.title,
      detail: e.detail,
      href: e.href,
      createdAt:
        e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt),
    })),
  };
}

/** Minimal empty state — engine must not crash. */
export function emptyPlatformState(now = new Date()): PlatformState {
  return {
    now,
    pendingRealOrders: 0,
    processingRealOrders: 0,
    pendingRealGmv: 0,
    waitingUsers: 0,
    openSupport: 0,
    failedLogins24h: 0,
    domainsConnected: 0,
    domainsConnectedSuccess: 0,
    domainFailing: 0,
    hotEmptyCount: 0,
    loggedInEmpty7d: 0,
    firstSaleCount: 0,
    firstSaleHighIntent: 0,
    funnel: {
      totalStores: 0,
      noProducts: 0,
      draftOnly: 0,
      activeNoOrders: 0,
      hasOrders: 0,
    },
    realOrders: 0,
    realOrders7d: 0,
    totalRevenue: 0,
    realRevenue7d: 0,
    revenueChange7d: 0,
    ordersChange7d: 0,
    top2SharePct: 0,
    concentrationElevated: false,
    concentrationMessage: null,
    concentrationWhy: null,
    concentrationRecommended: null,
    concentration: [],
    firstSaleBottlenecks: {
      lowRecentActivity: 0,
      singleProduct: 0,
      multiProductReady: 0,
      noCustomDomain: 0,
      noCodConfigured: 0,
    },
    helpToday: [],
    attentionSentence: "",
    liveStores: 0,
    totalStores: 0,
    newUsers7d: 0,
    usersChange7d: 0,
    sparklines: { revenue: [], orders: [], signups: [] },
    today: { orders: 0, revenue: 0, signups: 0 },
    yesterday: { orders: 0, revenue: 0, signups: 0 },
    liveFeed: [],
  };
}
