import { prisma } from "@/lib/db";
import { securityFailedLoginWhere } from "@/lib/auth/login-failure-reasons";
import { USER_STATUS } from "@/lib/founder/constants";
import {
  SUPPORT_MESSAGE_DIRECTION,
  SUPPORT_MESSAGE_STATUS,
} from "@/lib/admin/constants";
import { getPlatformAppErrors } from "@/lib/admin/platform-errors";
import { getAdminAuditLog } from "@/lib/admin/audit";
import { getPlatformMessages as loadSupportMessages } from "@/lib/admin/support-inbox";
import { checkDomainDns } from "@/lib/domains/dns-check";
import { normalizeCustomDomain } from "@/lib/storefront-urls";
import { orderInclude, serializeOrderDetail } from "@/lib/orders";
import { getActivationGap } from "@/lib/admin/activation-stats";
import {
  deriveAdminInsights,
  pctChange,
  type AdminAnalyticsRange,
  type AdminIntelligenceInput,
  type AdminTrendPoint,
} from "@/lib/admin/platform-intelligence";
import {
  buildAttentionQueue,
  buildAttentionSentence,
} from "@/lib/admin/attention-queue";
import { derivePlatformHealth } from "@/lib/admin/platform-health";
import {
  activationTemperature,
  healthFromActivationRow,
  temperatureLabel,
} from "@/lib/admin/merchant-health";
import { isResendConfigured } from "@/lib/resend";
import { parsePaymentGateways } from "@/lib/store-settings";

export type AdminOverviewBrief = {
  subtitle: string;
  tone: "positive" | "neutral" | "attention";
};

export function deriveAdminOverviewBrief(input: {
  waitingUsers: number;
  openSupport: number;
  failedLogins24h: number;
  revenueChange7d: number;
  newUsers24h: number;
  hotEmptyCount: number;
  activatedPct: number;
  pendingRealOrders?: number;
}): AdminOverviewBrief {
  if (input.waitingUsers > 0) {
    return {
      tone: "attention",
      subtitle: `${input.waitingUsers} merchant${input.waitingUsers === 1 ? "" : "s"} waiting for activation — clear the queue before they go cold.`,
    };
  }
  if (input.failedLogins24h >= 10) {
    return {
      tone: "attention",
      subtitle: `${input.failedLogins24h} failed logins in the last 24h — check errors for auth or attack noise.`,
    };
  }
  if ((input.pendingRealOrders ?? 0) >= 5) {
    return {
      tone: "attention",
      subtitle: `${input.pendingRealOrders} real orders still pending verification — COD backlog slows courier handoff.`,
    };
  }
  if (input.openSupport > 0) {
    return {
      tone: "attention",
      subtitle: `${input.openSupport} open support thread${input.openSupport === 1 ? "" : "s"} need${input.openSupport === 1 ? "s" : ""} a reply.`,
    };
  }
  if (input.hotEmptyCount > 0 && input.activatedPct < 20) {
    return {
      tone: "neutral",
      subtitle: `${input.hotEmptyCount} empty stores are warm — nudge first product before they churn. Only ${input.activatedPct}% of stores have a real sale.`,
    };
  }
  if (input.revenueChange7d >= 20) {
    return {
      tone: "positive",
      subtitle: `Real GMV is up ${input.revenueChange7d}% vs last week${input.newUsers24h > 0 ? ` · +${input.newUsers24h} signup${input.newUsers24h === 1 ? "" : "s"} today` : ""}.`,
    };
  }
  if (input.revenueChange7d <= -15) {
    return {
      tone: "attention",
      subtitle: `Real GMV dipped ${Math.abs(input.revenueChange7d)}% vs last week — check payments and top stores.`,
    };
  }
  return {
    tone: "neutral",
    subtitle:
      "Platform pulse — real GMV, merchant growth, support, and storefront health in one place.",
  };
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function emptyDaySeries(start: Date, end: Date): Map<string, AdminTrendPoint> {
  const map = new Map<string, AdminTrendPoint>();
  let cursor = Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate()
  );
  const endUtc = Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate()
  );
  while (cursor <= endUtc) {
    const key = new Date(cursor).toISOString().slice(0, 10);
    map.set(key, { date: key, revenue: 0, orders: 0, signups: 0 });
    cursor += 24 * 60 * 60 * 1000;
  }
  return map;
}

/** Domains saved on stores that resolve correctly (DNS points to Ettajer). */
async function countDomainsConnectedSuccess(): Promise<{
  domainsConnected: number;
  domainsConnectedSuccess: number;
}> {
  const rows = await prisma.storeSettings.findMany({
    where: { customDomain: { not: null } },
    select: { customDomain: true },
  });

  const domains = rows
    .map((row) => normalizeCustomDomain(row.customDomain))
    .filter((d): d is string => Boolean(d));

  if (domains.length === 0) {
    return { domainsConnected: 0, domainsConnectedSuccess: 0 };
  }

  const checks = await Promise.all(
    domains.map(async (domain) => {
      try {
        const dns = await checkDomainDns(domain);
        return dns.ok;
      } catch {
        return false;
      }
    })
  );

  return {
    domainsConnected: domains.length,
    domainsConnectedSuccess: checks.filter(Boolean).length,
  };
}

export async function getPlatformOverview() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sparkStart = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);

  const realUserWhere = {
    NOT: { email: { endsWith: "@example.com" as const } },
  };

  const [
    totalUsers,
    activeUsers,
    waitingUsers,
    totalStores,
    realOrders,
    testOrders,
    realRevenueAgg,
    testRevenueAgg,
    newUsers24h,
    newUsers7d,
    newUsersPrev7d,
    newStores7d,
    realOrders7d,
    realOrdersPrev7d,
    realRevenue7d,
    realRevenuePrev7d,
    newMessages,
    failedLogins24h,
    recentUsers,
    recentMessages,
    recentOrders,
    totalProducts,
    activeProducts,
    liveStores,
    domainStats,
    realByStore,
    stores,
    sparkOrders,
    sparkSignups,
    activation,
  ] = await Promise.all([
    prisma.user.count({ where: realUserWhere }),
    prisma.user.count({ where: { status: USER_STATUS.ACTIVE, ...realUserWhere } }),
    prisma.user.count({ where: { status: USER_STATUS.WAITING, ...realUserWhere } }),
    prisma.store.count(),
    prisma.order.count({ where: { isTest: false } }),
    prisma.order.count({ where: { isTest: true } }),
    prisma.order.aggregate({ where: { isTest: false }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { isTest: true }, _sum: { total: true } }),
    prisma.user.count({ where: { createdAt: { gte: dayAgo }, ...realUserWhere } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo }, ...realUserWhere } }),
    prisma.user.count({
      where: {
        createdAt: { gte: prevWeekStart, lt: weekAgo },
        ...realUserWhere,
      },
    }),
    prisma.store.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.order.count({ where: { isTest: false, createdAt: { gte: weekAgo } } }),
    prisma.order.count({
      where: { isTest: false, createdAt: { gte: prevWeekStart, lt: weekAgo } },
    }),
    prisma.order.aggregate({
      where: { isTest: false, createdAt: { gte: weekAgo } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { isTest: false, createdAt: { gte: prevWeekStart, lt: weekAgo } },
      _sum: { total: true },
    }),
    prisma.supportMessage.count({
      where: {
        status: {
          in: [SUPPORT_MESSAGE_STATUS.NEW, SUPPORT_MESSAGE_STATUS.REVIEWING],
        },
        NOT: { direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND },
      },
    }),
    prisma.loginAttempt.count({
      where: securityFailedLoginWhere({ createdAt: { gte: dayAgo } }),
    }),
    prisma.user.findMany({
      where: realUserWhere,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        founderNumber: true,
        role: true,
        createdAt: true,
        _count: { select: { stores: true } },
      },
    }),
    prisma.supportMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      where: {
        NOT: { direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        isTest: true,
        total: true,
        customerName: true,
        customerEmail: true,
        createdAt: true,
        store: { select: { id: true, name: true, slug: true, currency: true } },
      },
    }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.store.count({
      where: { products: { some: { status: "active" } } },
    }),
    countDomainsConnectedSuccess(),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { isTest: false },
      _count: true,
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 6,
    }),
    prisma.store.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
        primaryColor: true,
        logo: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.order.findMany({
      where: { isTest: false, createdAt: { gte: sparkStart } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: sparkStart }, ...realUserWhere },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    getActivationGap(),
  ]);

  const storeMap = new Map(stores.map((s) => [s.id, s]));
  const topStores = realByStore
    .map((row) => {
      const store = storeMap.get(row.storeId);
      if (!store) return null;
      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        currency: store.currency,
        primaryColor: store.primaryColor,
        logo: store.logo,
        ownerName: store.user.name,
        ownerEmail: store.user.email,
        realOrders: row._count,
        realGmv: row._sum.total ?? 0,
      };
    })
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const sparkMap = emptyDaySeries(sparkStart, now);
  for (const order of sparkOrders) {
    const key = utcDayKey(order.createdAt);
    const point = sparkMap.get(key);
    if (!point) continue;
    point.orders += 1;
    point.revenue += order.total;
  }
  for (const user of sparkSignups) {
    const key = utcDayKey(user.createdAt);
    const point = sparkMap.get(key);
    if (!point) continue;
    point.signups += 1;
  }
  const sparkSeries = [...sparkMap.values()];

  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);

  const [
    todayOrders,
    yesterdayOrders,
    todaySignups,
    yesterdaySignups,
    unverifiedEmails,
    pendingRealOrders,
    processingRealOrders,
    pendingRealGmvAgg,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { isTest: false, createdAt: { gte: startOfToday } },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: {
        isTest: false,
        createdAt: { gte: startOfYesterday, lt: startOfToday },
      },
      select: { total: true },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfToday }, ...realUserWhere },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: startOfYesterday, lt: startOfToday },
        ...realUserWhere,
      },
    }),
    prisma.user.count({
      where: { emailVerified: null, ...realUserWhere },
    }),
    prisma.order.count({
      where: { isTest: false, status: "pending" },
    }),
    prisma.order.count({
      where: { isTest: false, status: "processing" },
    }),
    prisma.order.aggregate({
      where: { isTest: false, status: "pending" },
      _sum: { total: true },
    }),
  ]);

  const today = {
    revenue: todayOrders.reduce((sum, o) => sum + o.total, 0),
    orders: todayOrders.length,
    signups: todaySignups,
  };
  const yesterday = {
    revenue: yesterdayOrders.reduce((sum, o) => sum + o.total, 0),
    orders: yesterdayOrders.length,
    signups: yesterdaySignups,
  };

  const revenue7d = realRevenue7d._sum.total ?? 0;
  const revenuePrev7d = realRevenuePrev7d._sum.total ?? 0;
  const totalRevenue = realRevenueAgg._sum.total ?? 0;
  const topStoreSharePct =
    totalRevenue > 0 && topStores[0]
      ? Math.round((topStores[0].realGmv / totalRevenue) * 100)
      : 0;
  const testSharePct =
    realOrders + testOrders > 0
      ? Math.round((testOrders / (realOrders + testOrders)) * 100)
      : 0;
  const aov7d = realOrders7d > 0 ? revenue7d / realOrders7d : 0;
  const aovPrev7d =
    realOrdersPrev7d > 0 ? revenuePrev7d / realOrdersPrev7d : 0;
  const pendingRealGmv = pendingRealGmvAgg._sum.total ?? 0;

  const insights = deriveAdminInsights({
    range: 7,
    revenue: revenue7d,
    revenuePrev: revenuePrev7d,
    orders: realOrders7d,
    ordersPrev: realOrdersPrev7d,
    signups: newUsers7d,
    signupsPrev: newUsersPrev7d,
    aov: aov7d,
    aovPrev: aovPrev7d,
    testSharePct,
    waitingUsers,
    openSupport: newMessages,
    failedLogins24h,
    domainsConnected: domainStats.domainsConnected,
    domainsConnectedSuccess: domainStats.domainsConnectedSuccess,
    topStoreSharePct,
    topStoreName: topStores[0]?.name ?? null,
    funnel: activation.funnel,
    hotEmptyCount: activation.hotEmptyCount,
    loggedInEmpty7d: activation.loggedInEmpty7d,
  });

  const brief = deriveAdminOverviewBrief({
    waitingUsers,
    openSupport: newMessages,
    failedLogins24h,
    revenueChange7d: pctChange(revenue7d, revenuePrev7d),
    newUsers24h,
    hotEmptyCount: activation.hotEmptyCount,
    activatedPct:
      activation.funnel.totalStores > 0
        ? Math.round(
            (activation.funnel.hasOrders / activation.funnel.totalStores) * 100
          )
        : 0,
    pendingRealOrders,
  });

  const attentionItems = buildAttentionQueue({
    pendingRealOrders,
    waitingUsers,
    hotEmptyCount: activation.hotEmptyCount,
    loggedInEmpty7d: activation.loggedInEmpty7d,
    activeNoOrders: activation.funnel.activeNoOrders,
    domainsConnected: domainStats.domainsConnected,
    domainsConnectedSuccess: domainStats.domainsConnectedSuccess,
    openSupport: newMessages,
    failedLogins24h,
    processingRealOrders,
    pendingRealGmv,
  });
  const attentionSentence = buildAttentionSentence(attentionItems);

  const health = derivePlatformHealth({
    pendingRealOrders,
    realOrders7d,
    liveStores,
    totalStores,
    domainsConnected: domainStats.domainsConnected,
    domainsConnectedSuccess: domainStats.domainsConnectedSuccess,
    failedLogins24h,
    openSupport: newMessages,
    emailConfigured: isResendConfigured(),
  });

  const helpToday = activation.hotEmpty.slice(0, 8).map((row) => {
    const healthScore = healthFromActivationRow(row);
    const temp = activationTemperature(row.lastLoginAt, row.createdAt);
    return {
      storeId: row.storeId,
      storeName: row.storeName,
      slug: row.slug,
      ownerId: row.ownerId,
      ownerName: row.ownerName,
      ownerEmail: row.ownerEmail,
      intent: temp === "hot" ? "HIGH" : temp === "warm" ? "MEDIUM" : "LOW",
      intentReasons: [
        row.lastLoginAt ? "Logged in recently" : null,
        "Store exists",
        row.activeProducts + row.draftProducts === 0 ? "No products" : null,
      ].filter(Boolean) as string[],
      healthScore: healthScore.score,
      healthBand: healthScore.bandLabel,
      temperature: temperatureLabel(temp),
    };
  });

  const firstSaleHot = activation.activeNoOrders.filter((r) => {
    const t = activationTemperature(r.lastLoginAt, r.createdAt);
    return t === "hot" || t === "warm";
  });

  const listedIds = activation.activeNoOrders.map((r) => r.storeId);
  const listedSettings =
    listedIds.length > 0
      ? await prisma.storeSettings.findMany({
          where: { storeId: { in: listedIds } },
          select: {
            storeId: true,
            customDomain: true,
            paymentGateways: true,
          },
        })
      : [];
  const settingsByStore = new Map(
    listedSettings.map((s) => [s.storeId, s] as const)
  );
  let noCustomDomain = 0;
  let noCodConfigured = 0;
  for (const row of activation.activeNoOrders) {
    const settings = settingsByStore.get(row.storeId);
    if (!settings?.customDomain) noCustomDomain += 1;
    const gateways = parsePaymentGateways(settings?.paymentGateways);
    if (!gateways.cashOnDelivery) noCodConfigured += 1;
  }

  const firstSaleBottlenecks = {
    lowRecentActivity: activation.activeNoOrders.filter((r) => {
      const t = activationTemperature(r.lastLoginAt, r.createdAt);
      return t === "cold";
    }).length,
    singleProduct: activation.activeNoOrders.filter(
      (r) => r.activeProducts === 1
    ).length,
    multiProductReady: activation.activeNoOrders.filter(
      (r) => r.activeProducts >= 3
    ).length,
    noCustomDomain,
    noCodConfigured,
  };

  const recentStores = await prisma.store.findMany({
    where: { user: realUserWhere },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  const liveFeed: {
    id: string;
    category: string;
    title: string;
    detail: string;
    href: string;
    createdAt: Date;
  }[] = [];
  for (const o of recentOrders.slice(0, 6)) {
    if (o.isTest) continue;
    liveFeed.push({
      id: `order-${o.id}`,
      category: "commerce",
      title: `${o.store.name} received an order`,
      detail: `${Math.round(o.total).toLocaleString("en-US")} ${o.store.currency}`,
      href: `/admin/orders/${o.id}`,
      createdAt: o.createdAt,
    });
  }
  for (const u of recentUsers.slice(0, 4)) {
    liveFeed.push({
      id: `user-${u.id}`,
      category: "merchants",
      title: "New merchant joined",
      detail: u.name || u.email,
      href: `/admin/users/${u.id}`,
      createdAt: u.createdAt,
    });
  }
  for (const s of recentStores) {
    liveFeed.push({
      id: `store-${s.id}`,
      category: "stores",
      title: "Store created",
      detail: `${s.name} · ${s.user.name || s.user.email}`,
      href: `/admin/stores/${s.id}`,
      createdAt: s.createdAt,
    });
  }
  for (const m of recentMessages.slice(0, 3)) {
    liveFeed.push({
      id: `support-${m.id}`,
      category: "support",
      title: m.topic || "Support message",
      detail: m.name || m.email,
      href: "/admin/messages",
      createdAt: m.createdAt,
    });
  }
  liveFeed.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const top2SharePct =
    totalRevenue > 0
      ? Math.round(
          (topStores.slice(0, 2).reduce((s, t) => s + t.realGmv, 0) /
            totalRevenue) *
            100
        )
      : 0;

  return {
    totalUsers,
    activeUsers,
    waitingUsers,
    totalStores,
    totalOrders: realOrders + testOrders,
    realOrders,
    testOrders,
    totalRevenue,
    testRevenue: testRevenueAgg._sum.total ?? 0,
    newUsers24h,
    newUsers7d,
    newUsersPrev7d,
    newStores7d,
    realOrders7d,
    realRevenue7d: revenue7d,
    changes: {
      users7d: pctChange(newUsers7d, newUsersPrev7d),
      orders7d: pctChange(realOrders7d, realOrdersPrev7d),
      revenue7d: pctChange(revenue7d, revenuePrev7d),
    },
    newMessages,
    failedLogins24h,
    recentUsers,
    recentMessages,
    recentOrders,
    topStores,
    totalProducts,
    activeProducts,
    liveStores,
    domainsConnected: domainStats.domainsConnected,
    domainsConnectedSuccess: domainStats.domainsConnectedSuccess,
    sparklines: {
      revenue: sparkSeries.map((p) => p.revenue),
      orders: sparkSeries.map((p) => p.orders),
      signups: sparkSeries.map((p) => p.signups),
      liveStores: sparkSeries.map(() => liveStores),
    },
    funnel: activation.funnel,
    hotEmptyCount: activation.hotEmptyCount,
    loggedInEmpty7d: activation.loggedInEmpty7d,
    insights: insights.slice(0, 6),
    brief,
    attentionItems,
    attentionSentence,
    health,
    helpToday,
    firstSale: {
      count: activation.funnel.activeNoOrders,
      highIntentCount: firstSaleHot.length,
      liveProductsPlatform: activeProducts,
      bottlenecks: firstSaleBottlenecks,
    },
    liveFeed: liveFeed.slice(0, 8),
    pendingRealGmv,
    testSharePct,
    today,
    yesterday,
    unverifiedEmails,
    pendingRealOrders,
    processingRealOrders,
    concentration: topStores.slice(0, 5).map((store) => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      gmv: store.realGmv,
      sharePct:
        totalRevenue > 0
          ? Math.round((store.realGmv / totalRevenue) * 100)
          : 0,
      orders: store.realOrders,
    })),
    concentrationRisk: {
      top2SharePct,
      elevated: top2SharePct >= 50,
      message:
        top2SharePct >= 50
          ? `Top 2 merchants · ${top2SharePct}% of tracked GMV`
          : top2SharePct > 0
            ? `Top 2 merchants generate ${top2SharePct}% of tracked GMV.`
            : null,
      why:
        top2SharePct >= 50
          ? "Revenue is currently concentrated in a small number of merchants."
          : null,
      recommended:
        top2SharePct >= 50
          ? "Increase the number of mid-tier merchants generating their first real sales."
          : null,
    },
  };
}

export type PlatformOverviewData = Awaited<
  ReturnType<typeof getPlatformOverview>
>;


export async function getPlatformUsers() {
  return prisma.user.findMany({
    where: {
      NOT: { email: { endsWith: "@example.com" } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      status: true,
      role: true,
      founderNumber: true,
      emailVerified: true,
      lastLoginAt: true,
      lastLoginIp: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      createdAt: true,
      stores: {
        select: {
          id: true,
          _count: { select: { products: true, orders: true } },
        },
      },
      _count: { select: { stores: true, loginAttempts: true } },
    },
  });
}

/** Full admin profile for a single user (stores, logins, support, sessions). */
export async function getPlatformUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      status: true,
      role: true,
      founderNumber: true,
      emailVerified: true,
      marketingEmails: true,
      termsAcceptedAt: true,
      passwordChangedAt: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      lastLoginAt: true,
      lastLoginIp: true,
      createdAt: true,
      updatedAt: true,
      passwordHash: true,
      stores: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          businessModel: true,
          category: true,
          language: true,
          phone: true,
          contactEmail: true,
          websiteTemplateId: true,
          createdAt: true,
          updatedAt: true,
          settings: { select: { customDomain: true } },
          _count: {
            select: {
              products: true,
              orders: true,
              categories: true,
              collections: true,
            },
          },
        },
      },
      accounts: {
        select: {
          id: true,
          provider: true,
          type: true,
          providerAccountId: true,
        },
      },
      sessions: {
        orderBy: { expires: "desc" },
        take: 10,
        select: {
          id: true,
          expires: true,
          sessionToken: true,
        },
      },
      loginAttempts: {
        orderBy: { createdAt: "desc" },
        take: 25,
        select: {
          id: true,
          email: true,
          action: true,
          success: true,
          reason: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          stores: true,
          loginAttempts: true,
          sessions: true,
          accounts: true,
        },
      },
    },
  });

  if (!user) return null;

  const supportMessages = await prisma.supportMessage.findMany({
    where: { email: { equals: user.email, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      topic: true,
      message: true,
      direction: true,
      status: true,
      createdAt: true,
    },
  });

  const storeIds = user.stores.map((s) => s.id);
  const [orderAgg, testOrderAgg] =
    storeIds.length > 0
      ? await Promise.all([
          prisma.order.aggregate({
            where: { storeId: { in: storeIds }, isTest: false },
            _sum: { total: true },
            _count: true,
          }),
          prisma.order.aggregate({
            where: { storeId: { in: storeIds }, isTest: true },
            _sum: { total: true },
            _count: true,
          }),
        ])
      : [
          { _sum: { total: null as number | null }, _count: 0 },
          { _sum: { total: null as number | null }, _count: 0 },
        ];

  const productCount =
    storeIds.length > 0
      ? await prisma.product.count({ where: { storeId: { in: storeIds } } })
      : 0;

  const { passwordHash, sessions, ...safeUser } = user;

  return {
    ...safeUser,
    hasPassword: Boolean(passwordHash),
    sessions: sessions.map((s) => ({
      id: s.id,
      expires: s.expires,
      // Never expose raw session tokens — show a short fingerprint only
      tokenHint: `${s.sessionToken.slice(0, 6)}…`,
    })),
    supportMessages,
    stats: {
      storeCount: user._count.stores,
      productCount,
      orderCount: orderAgg._count,
      orderRevenue: orderAgg._sum.total ?? 0,
      testOrderCount: testOrderAgg._count,
      testOrderRevenue: testOrderAgg._sum.total ?? 0,
      loginAttemptCount: user._count.loginAttempts,
      sessionCount: user._count.sessions,
      accountCount: user._count.accounts,
    },
  };
}

export async function getPlatformStores() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      category: true,
      primaryColor: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          founderNumber: true,
          status: true,
        },
      },
      _count: { select: { products: true, orders: true, customers: true } },
    },
  });

  if (stores.length === 0) return [];

  const storeIds = stores.map((s) => s.id);
  const [realByStore, testByStore, lastOrderByStore] = await Promise.all([
    prisma.order.groupBy({
      by: ["storeId"],
      where: { storeId: { in: storeIds }, isTest: false },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { storeId: { in: storeIds }, isTest: true },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { storeId: { in: storeIds } },
      _max: { createdAt: true },
    }),
  ]);

  const realMap = new Map(
    realByStore.map((r) => [
      r.storeId,
      { count: r._count, gmv: r._sum.total ?? 0 },
    ])
  );
  const testMap = new Map(
    testByStore.map((r) => [
      r.storeId,
      { count: r._count, gmv: r._sum.total ?? 0 },
    ])
  );
  const lastOrderMap = new Map(
    lastOrderByStore.map((r) => [r.storeId, r._max.createdAt])
  );

  return stores.map((store) => {
    const real = realMap.get(store.id) ?? { count: 0, gmv: 0 };
    const test = testMap.get(store.id) ?? { count: 0, gmv: 0 };
    return {
      ...store,
      lastOrderAt: lastOrderMap.get(store.id) ?? null,
      orderStats: {
        realOrders: real.count,
        realGmv: real.gmv,
        testOrders: test.count,
        testGmv: test.gmv,
        totalOrders: real.count + test.count,
      },
    };
  });
}


export async function getPlatformStoreDetail(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      category: true,
      businessModel: true,
      currency: true,
      language: true,
      contactEmail: true,
      phone: true,
      address: true,
      primaryColor: true,
      theme: true,
      websiteTemplateId: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          status: true,
          role: true,
          founderNumber: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
      settings: {
        select: {
          customDomain: true,
          domainPrimary: true,
          paymentGateways: true,
        },
      },
      _count: {
        select: {
          products: true,
          customers: true,
          categories: true,
          collections: true,
        },
      },
    },
  });

  if (!store) return null;

  const [
    realAgg,
    testAgg,
    ordersByStatus,
    recentOrders,
    activeProducts,
    draftProducts,
    firstRealOrder,
    firstProduct,
    firstDelivery,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { storeId, isTest: false },
      _count: true,
      _sum: { total: true },
      _avg: { total: true },
    }),
    prisma.order.aggregate({
      where: { storeId, isTest: true },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { storeId },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        isTest: true,
        paymentMethod: true,
        paymentStatus: true,
        total: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        createdAt: true,
      },
    }),
    prisma.product.count({ where: { storeId, status: "active" } }),
    prisma.product.count({
      where: { storeId, status: { not: "active" } },
    }),
    prisma.order.findFirst({
      where: { storeId, isTest: false },
      orderBy: { createdAt: "asc" },
      select: { id: true, createdAt: true, status: true },
    }),
    prisma.product.findFirst({
      where: { storeId },
      orderBy: { createdAt: "asc" },
      select: { id: true, createdAt: true, status: true },
    }),
    prisma.order.findFirst({
      where: { storeId, isTest: false, status: "delivered" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ]);

  return {
    ...store,
    stats: {
      products: store._count.products,
      activeProducts,
      draftProducts,
      customers: store._count.customers,
      categories: store._count.categories,
      collections: store._count.collections,
      realOrders: realAgg._count,
      realGmv: realAgg._sum.total ?? 0,
      avgRealOrder: realAgg._avg.total ?? 0,
      testOrders: testAgg._count,
      testGmv: testAgg._sum.total ?? 0,
      totalOrders: realAgg._count + testAgg._count,
    },
    lifecycle: {
      accountCreatedAt: store.user.createdAt,
      storeCreatedAt: store.createdAt,
      themeConfigured: Boolean(store.primaryColor || store.theme || store.websiteTemplateId),
      firstProductAt: firstProduct?.createdAt ?? null,
      firstProductPublished: firstProduct?.status === "active",
      hasPublishedProducts: activeProducts > 0,
      firstRealOrderAt: firstRealOrder?.createdAt ?? null,
      firstDeliveryAt: firstDelivery?.createdAt ?? null,
    },
    ordersByStatus,
    orders: recentOrders,
  };
}

export async function getPlatformOrderDetail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      ...orderInclude,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          logo: true,
          primaryColor: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              founderNumber: true,
              status: true,
            },
          },
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          tags: true,
          language: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      },
    },
  });

  if (!order) return null;

  const detail = serializeOrderDetail(order);
  return {
    ...detail,
    isTest: order.isTest,
    store: order.store,
    customerRecord: order.customer,
  };
}

export async function getPlatformProductDetail(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      comparePrice: true,
      costPrice: true,
      inventory: true,
      sku: true,
      barcode: true,
      status: true,
      productType: true,
      copyrightOwner: true,
      copyrightNotice: true,
      images: true,
      digitalFiles: true,
      variants: true,
      reviews: true,
      details: true,
      seo: true,
      commerce: true,
      tags: true,
      ticketPrinterId: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true, slug: true } },
      collections: { select: { id: true, name: true, slug: true }, take: 20 },
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          currency: true,
          primaryColor: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              founderNumber: true,
              status: true,
            },
          },
        },
      },
      _count: { select: { orders: true } },
    },
  });

  if (!product) return null;

  const [realAgg, testAgg, recentLines] = await Promise.all([
    prisma.orderItem.aggregate({
      where: { productId, order: { isTest: false } },
      _sum: { quantity: true },
      _count: true,
    }),
    prisma.orderItem.aggregate({
      where: { productId, order: { isTest: true } },
      _sum: { quantity: true },
      _count: true,
    }),
    prisma.orderItem.findMany({
      where: { productId },
      orderBy: { order: { createdAt: "desc" } },
      take: 30,
      select: {
        id: true,
        quantity: true,
        price: true,
        variant: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            isTest: true,
            customerName: true,
            customerEmail: true,
            createdAt: true,
          },
        },
      },
    }),
  ]);

  return {
    ...product,
    stats: {
      orderLines: product._count.orders,
      realLines: realAgg._count,
      realUnits: realAgg._sum.quantity ?? 0,
      testLines: testAgg._count,
      testUnits: testAgg._sum.quantity ?? 0,
    },
    recentLines,
  };
}

export async function getPlatformMessages() {
  return loadSupportMessages();
}

export async function getPlatformAnalytics(range: AdminAnalyticsRange = 30) {
  const now = new Date();
  const rangeMs = range * 24 * 60 * 60 * 1000;
  const rangeStart = new Date(now.getTime() - rangeMs);
  const prevStart = new Date(now.getTime() - 2 * rangeMs);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const realUserWhere = {
    NOT: { email: { endsWith: "@example.com" as const } },
  };

  const [
    ordersInRange,
    ordersPrev,
    signupsInRange,
    signupsPrevCount,
    ordersByStatus,
    realOrderCount,
    testOrderCount,
    storeCount,
    productCount,
    customerCount,
    waitingUsers,
    openSupport,
    failedLogins24h,
    domainStats,
    topStoreRows,
    activation,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { isTest: false, createdAt: { gte: rangeStart } },
      select: { total: true, createdAt: true, storeId: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: {
        isTest: false,
        createdAt: { gte: prevStart, lt: rangeStart },
      },
      select: { total: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: rangeStart }, ...realUserWhere },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: prevStart, lt: rangeStart },
        ...realUserWhere,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { isTest: false },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.count({ where: { isTest: false } }),
    prisma.order.count({ where: { isTest: true } }),
    prisma.store.count(),
    prisma.product.count(),
    prisma.customer.count(),
    prisma.user.count({
      where: { status: USER_STATUS.WAITING, ...realUserWhere },
    }),
    prisma.supportMessage.count({
      where: {
        status: {
          in: [SUPPORT_MESSAGE_STATUS.NEW, SUPPORT_MESSAGE_STATUS.REVIEWING],
        },
        NOT: { direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND },
      },
    }),
    prisma.loginAttempt.count({
      where: securityFailedLoginWhere({ createdAt: { gte: dayAgo } }),
    }),
    countDomainsConnectedSuccess(),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { isTest: false, createdAt: { gte: rangeStart } },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: "desc" } },
      take: 8,
    }),
    getActivationGap(),
  ]);

  const seriesMap = emptyDaySeries(rangeStart, now);
  for (const order of ordersInRange) {
    const key = utcDayKey(order.createdAt);
    const point = seriesMap.get(key);
    if (!point) continue;
    point.orders += 1;
    point.revenue += order.total;
  }
  for (const user of signupsInRange) {
    const key = utcDayKey(user.createdAt);
    const point = seriesMap.get(key);
    if (!point) continue;
    point.signups += 1;
  }
  const series = [...seriesMap.values()];

  const revenue = ordersInRange.reduce((sum, o) => sum + o.total, 0);
  const revenuePrev = ordersPrev.reduce((sum, o) => sum + o.total, 0);
  const orders = ordersInRange.length;
  const ordersPrevCount = ordersPrev.length;
  const signups = signupsInRange.length;
  const aov = orders > 0 ? revenue / orders : 0;
  const aovPrev = ordersPrevCount > 0 ? revenuePrev / ordersPrevCount : 0;
  const testSharePct =
    realOrderCount + testOrderCount > 0
      ? Math.round((testOrderCount / (realOrderCount + testOrderCount)) * 100)
      : 0;

  const topStoreIds = topStoreRows.map((row) => row.storeId);
  const topStoreMeta = topStoreIds.length
    ? await prisma.store.findMany({
        where: { id: { in: topStoreIds } },
        select: { id: true, name: true, slug: true, currency: true },
      })
    : [];
  const topMetaMap = new Map(topStoreMeta.map((s) => [s.id, s]));
  const topStoresInRange = topStoreRows
    .map((row) => {
      const store = topMetaMap.get(row.storeId);
      if (!store) return null;
      const gmv = row._sum.total ?? 0;
      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        currency: store.currency,
        gmv,
        orders: row._count,
        sharePct: revenue > 0 ? Math.round((gmv / revenue) * 100) : 0,
      };
    })
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const topStoreName = topStoresInRange[0]?.name ?? null;
  const topStoreSharePct = topStoresInRange[0]?.sharePct ?? 0;

  const insightInput: AdminIntelligenceInput = {
    range,
    revenue,
    revenuePrev,
    orders,
    ordersPrev: ordersPrevCount,
    signups,
    signupsPrev: signupsPrevCount,
    aov,
    aovPrev,
    testSharePct,
    waitingUsers,
    openSupport,
    failedLogins24h,
    domainsConnected: domainStats.domainsConnected,
    domainsConnectedSuccess: domainStats.domainsConnectedSuccess,
    topStoreSharePct,
    topStoreName,
    funnel: activation.funnel,
    hotEmptyCount: activation.hotEmptyCount,
    loggedInEmpty7d: activation.loggedInEmpty7d,
  };

  return {
    range,
    ranges: [7, 30, 90] as const,
    series,
    totals: {
      revenue,
      revenuePrev,
      revenueChange: pctChange(revenue, revenuePrev),
      orders,
      ordersPrev: ordersPrevCount,
      ordersChange: pctChange(orders, ordersPrevCount),
      signups,
      signupsPrev: signupsPrevCount,
      signupsChange: pctChange(signups, signupsPrevCount),
      aov,
      aovPrev,
      aovChange: pctChange(aov, aovPrev),
      customers: customerCount,
      stores: storeCount,
      products: productCount,
      realOrders: realOrderCount,
      testOrders: testOrderCount,
      testSharePct,
    },
    ordersByStatus: ordersByStatus
      .map((row) => ({
        status: row.status,
        count: row._count,
        revenue: row._sum.total ?? 0,
      }))
      .sort((a, b) => b.revenue - a.revenue),
    funnel: activation.funnel,
    signals: {
      waitingUsers,
      openSupport,
      failedLogins24h,
      domainsConnected: domainStats.domainsConnected,
      domainsConnectedSuccess: domainStats.domainsConnectedSuccess,
      topStoreName,
      topStoreSharePct,
      hotEmptyCount: activation.hotEmptyCount,
      loggedInEmpty7d: activation.loggedInEmpty7d,
    },
    topStoresInRange,
    insights: deriveAdminInsights(insightInput),
  };
}

export type PlatformAnalyticsData = Awaited<
  ReturnType<typeof getPlatformAnalytics>
>;


export async function getPlatformErrors() {
  const [loginErrors, appErrors] = await Promise.all([
    prisma.loginAttempt.findMany({
      where: securityFailedLoginWhere(),
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        email: true,
        action: true,
        reason: true,
        ipAddress: true,
        createdAt: true,
        user: { select: { name: true, founderNumber: true } },
      },
    }),
    getPlatformAppErrors(50),
  ]);

  return { loginErrors, appErrors };
}

export async function getPlatformActivity() {
  return getAdminAuditLog(100);
}

export async function getPlatformPayments() {
  const [
    ordersByStatus,
    testOrdersByStatus,
    recentOrders,
    realRevenue,
    testRevenue,
    realByStore,
    testByStore,
    stores,
  ] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: { isTest: false },
      _count: true,
      _sum: { total: true, subtotal: true, shipping: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { isTest: true },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        isTest: true,
        paymentMethod: true,
        total: true,
        customerName: true,
        customerEmail: true,
        createdAt: true,
        store: { select: { id: true, name: true, slug: true, currency: true } },
      },
    }),
    prisma.order.aggregate({
      where: { isTest: false },
      _sum: { total: true },
      _avg: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { isTest: true },
      _sum: { total: true },
      _avg: { total: true },
      _count: true,
    }),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { isTest: false },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ["storeId"],
      where: { isTest: true },
      _count: true,
      _sum: { total: true },
    }),
    prisma.store.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        currency: true,
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  const realMap = new Map(
    realByStore.map((r) => [
      r.storeId,
      { count: r._count, gmv: r._sum.total ?? 0 },
    ])
  );
  const testMap = new Map(
    testByStore.map((r) => [
      r.storeId,
      { count: r._count, gmv: r._sum.total ?? 0 },
    ])
  );

  const ordersByStore = stores
    .map((store) => {
      const real = realMap.get(store.id) ?? { count: 0, gmv: 0 };
      const test = testMap.get(store.id) ?? { count: 0, gmv: 0 };
      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        currency: store.currency,
        ownerName: store.user.name,
        ownerEmail: store.user.email,
        realOrders: real.count,
        realGmv: real.gmv,
        testOrders: test.count,
        testGmv: test.gmv,
        totalOrders: real.count + test.count,
      };
    })
    .filter((s) => s.totalOrders > 0)
    .sort((a, b) => b.realGmv - a.realGmv || b.totalOrders - a.totalOrders);

  return {
    ordersByStatus,
    testOrdersByStatus,
    recentOrders,
    totalRevenue: realRevenue,
    testRevenue,
    ordersByStore,
  };
}

/** Domain health center — DNS verified via checkDomainDns only. */
export async function getPlatformDomains() {
  const rows = await prisma.storeSettings.findMany({
    where: { customDomain: { not: null } },
    select: {
      customDomain: true,
      domainPrimary: true,
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const domains = await Promise.all(
    rows.map(async (row) => {
      const domain = normalizeCustomDomain(row.customDomain);
      if (!domain) {
        return null;
      }
      let dnsOk = false;
      let dnsDetail = "DNS check unavailable";
      try {
        const result = await checkDomainDns(domain);
        dnsOk = result.ok;
        dnsDetail = result.detail;
      } catch {
        dnsOk = false;
        dnsDetail = "DNS lookup failed";
      }
      return {
        domain,
        domainPrimary: row.domainPrimary,
        dnsOk,
        dnsDetail,
        storeId: row.store.id,
        storeName: row.store.name,
        slug: row.store.slug,
        ownerId: row.store.user.id,
        ownerName: row.store.user.name,
        ownerEmail: row.store.user.email,
      };
    })
  );

  const list = domains.filter((d): d is NonNullable<typeof d> => Boolean(d));
  const failing = list.filter((d) => !d.dnsOk).length;
  return {
    domains: list.sort((a, b) => Number(a.dnsOk) - Number(b.dnsOk) || a.domain.localeCompare(b.domain)),
    total: list.length,
    ok: list.length - failing,
    failing,
  };
}

export type PlatformLiveEventCategory =
  | "all"
  | "commerce"
  | "merchants"
  | "stores"
  | "support"
  | "errors"
  | "domains";

export type PlatformLiveEvent = {
  id: string;
  category: Exclude<PlatformLiveEventCategory, "all">;
  title: string;
  detail: string;
  href: string;
  createdAt: Date;
};

/** Live platform stream from real recent entities (not fabricated). */
export async function getPlatformLiveFeed(limit = 40): Promise<PlatformLiveEvent[]> {
  const realUserWhere = {
    NOT: { email: { endsWith: "@example.com" as const } },
  };
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [orders, users, messages, loginFails] = await Promise.all([
    prisma.order.findMany({
      where: { isTest: false },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,
        store: { select: { id: true, name: true } },
      },
    }),
    prisma.user.findMany({
      where: realUserWhere,
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.supportMessage.findMany({
      where: { NOT: { direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND } },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        topic: true,
        email: true,
        createdAt: true,
        status: true,
      },
    }),
    prisma.loginAttempt.findMany({
      where: securityFailedLoginWhere({ createdAt: { gte: dayAgo } }),
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, email: true, reason: true, createdAt: true },
    }),
  ]);

  const events: PlatformLiveEvent[] = [];

  for (const o of orders) {
    events.push({
      id: `order-${o.id}`,
      category: "commerce",
      title: `${o.store.name} received an order`,
      detail: `${Math.round(o.total).toLocaleString()} MAD · #${o.orderNumber}`,
      href: `/admin/orders/${o.id}`,
      createdAt: o.createdAt,
    });
  }
  for (const u of users) {
    events.push({
      id: `user-${u.id}`,
      category: "merchants",
      title: "New merchant joined",
      detail: u.name || u.email,
      href: `/admin/users/${u.id}`,
      createdAt: u.createdAt,
    });
  }
  for (const m of messages) {
    events.push({
      id: `support-${m.id}`,
      category: "support",
      title: m.topic || "Support message",
      detail: `${m.email} · ${m.status}`,
      href: "/admin/messages",
      createdAt: m.createdAt,
    });
  }
  for (const f of loginFails) {
    events.push({
      id: `login-${f.id}`,
      category: "errors",
      title: "Failed login",
      detail: `${f.email}${f.reason ? ` · ${f.reason}` : ""}`,
      href: "/admin/errors",
      createdAt: f.createdAt,
    });
  }

  return events
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

/** Lightweight admin search for the command palette. */
export async function searchPlatformAdmin(query: string) {
  const q = query.trim();
  const lower = q.toLowerCase();

  const shortcuts: {
    id: string;
    label: string;
    hint: string;
    href: string;
    group: string;
  }[] = [];

  if (
    lower.includes("pending") ||
    lower.includes("cod") ||
    (lower.includes("order") && lower.includes("pending"))
  ) {
    const pending = await prisma.order.count({
      where: { isTest: false, status: "pending" },
    });
    shortcuts.push({
      id: "shortcut-pending",
      label: `${pending} pending COD order${pending === 1 ? "" : "s"}`,
      hint: "Payments · verify backlog",
      href: "/admin/payments?focus=pending",
      group: "Payments",
    });
  }

  const wantsActivationShortcut =
    lower.includes("empty") ||
    lower.includes("activation") ||
    lower.includes("hot empty") ||
    lower.includes("first sale") ||
    lower.includes("listed") ||
    lower.includes("zero sale") ||
    lower.includes("no sale");

  if (wantsActivationShortcut) {
    const gap = await getActivationGap();
    if (
      lower.includes("empty") ||
      lower.includes("activation") ||
      lower.includes("hot empty")
    ) {
      shortcuts.push({
        id: "shortcut-empty",
        label: `${gap.hotEmptyCount} hot empty store${gap.hotEmptyCount === 1 ? "" : "s"}`,
        hint: `${gap.funnel.noProducts} empty total · Activation`,
        href: "/admin/activation?stage=empty",
        group: "Activation",
      });
    }
    if (
      lower.includes("first sale") ||
      lower.includes("listed") ||
      lower.includes("zero sale") ||
      lower.includes("no sale")
    ) {
      shortcuts.push({
        id: "shortcut-listed",
        label: `${gap.funnel.activeNoOrders} first-sale target${gap.funnel.activeNoOrders === 1 ? "" : "s"}`,
        hint: "Listed · zero real orders",
        href: "/admin/activation?stage=listed",
        group: "Activation",
      });
    }
  }
  if (lower.includes("domain") || lower.includes("dns")) {
    shortcuts.push({
      id: "shortcut-domains",
      label: "Domain health",
      hint: "DNS diagnosis",
      href: "/admin/domains",
      group: "Domains",
    });
  }
  if (
    lower.includes("support") ||
    lower.includes("inbox") ||
    lower.includes("message")
  ) {
    shortcuts.push({
      id: "shortcut-support",
      label: "Support inbox",
      hint: "Open threads",
      href: "/admin/messages",
      group: "Support",
    });
  }

  if (q.length < 2) {
    return { users: [], stores: [], orders: [], shortcuts };
  }

  const realUserWhere = {
    NOT: { email: { endsWith: "@example.com" as const } },
  };

  const [users, stores, orders] = await Promise.all([
    prisma.user.findMany({
      where: {
        AND: [
          realUserWhere,
          {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        _count: { select: { stores: true } },
      },
    }),
    prisma.store.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        user: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            orders: { where: { isTest: false } },
          },
        },
      },
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q, mode: "insensitive" } },
          { customerEmail: { contains: q, mode: "insensitive" } },
          { customerName: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        store: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    users,
    stores: stores.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      ownerId: s.user.id,
      ownerName: s.user.name,
      ownerEmail: s.user.email,
      realOrders: s._count.orders,
    })),
    orders,
    shortcuts,
  };
}
