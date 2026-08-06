import { prisma } from "@/lib/db";
import { getCountryName } from "@/lib/country-iso";
import { classifyReferrer } from "@/lib/store-analytics";

export interface RealVisitorStats {
  visitors: number;
  previousVisitors: number;
  liveNow: number;
  returningRate: number;
  bounceRate: number;
  avgSessionLabel: string;
  liveCities: { id: string; city: string; country: string; active: boolean }[];
  trafficSources: { id: string; label: string; value: number; percentage: number }[];
  salesByDevice: { id: string; label: string; value: number; percentage: number }[];
  topCountry: string;
  topCity: string;
  topDevice: string;
  topBrowser: string;
  topReferrer: string;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return "0m 00s";
  const totalSec = Math.round(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export async function getRealVisitorStats(
  storeId: string,
  rangeStart: Date,
  previousStart: Date,
  revenue = 0
): Promise<RealVisitorStats> {
  const now = new Date();
  const liveSince = new Date(now.getTime() - 5 * 60_000);

  const [rangeViews, previousViews, liveViews] = await Promise.all([
    prisma.storePageView.findMany({
      where: { storeId, createdAt: { gte: rangeStart } },
      select: {
        sessionId: true,
        path: true,
        referrer: true,
        utmSource: true,
        country: true,
        city: true,
        device: true,
        browser: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.storePageView.findMany({
      where: { storeId, createdAt: { gte: previousStart, lt: rangeStart } },
      select: { sessionId: true },
    }),
    prisma.storePageView.findMany({
      where: { storeId, createdAt: { gte: liveSince } },
      select: {
        sessionId: true,
        city: true,
        country: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const sessionIds = new Set(rangeViews.map((v) => v.sessionId));
  const previousSessionIds = new Set(previousViews.map((v) => v.sessionId));
  const visitors = sessionIds.size;
  const previousVisitors = previousSessionIds.size;

  const liveSessions = new Map<string, { city: string | null; country: string | null }>();
  for (const view of liveViews) {
    if (!liveSessions.has(view.sessionId)) {
      liveSessions.set(view.sessionId, { city: view.city, country: view.country });
    }
  }
  const liveNow = liveSessions.size;

  const liveCities = Array.from(liveSessions.entries())
    .map(([sessionId, meta], index) => ({
      id: `${sessionId}-${index}`,
      city: meta.city || "Unknown",
      country: meta.country ? getCountryName(meta.country) || meta.country : "—",
      active: true,
    }))
    .filter((item) => item.city !== "Unknown")
    .slice(0, 8);

  let returning = 0;
  if (visitors > 0) {
    const historicalReturning = await prisma.storePageView.findMany({
      where: {
        storeId,
        createdAt: { lt: rangeStart },
        sessionId: { in: Array.from(sessionIds) },
      },
      select: { sessionId: true },
      distinct: ["sessionId"],
    });
    returning = historicalReturning.length;
  }

  const returningRate = visitors > 0 ? Math.round((returning / visitors) * 100) : 0;

  const sessionsById = new Map<string, typeof rangeViews>();
  for (const view of rangeViews) {
    const list = sessionsById.get(view.sessionId) ?? [];
    list.push(view);
    sessionsById.set(view.sessionId, list);
  }

  let bounceCount = 0;
  let sessionDurationTotal = 0;
  let sessionDurationCount = 0;
  for (const views of Array.from(sessionsById.values())) {
    const uniquePaths = new Set(views.map((v) => v.path));
    if (uniquePaths.size <= 1 && views.length <= 2) bounceCount += 1;
    if (views.length >= 2) {
      const start = views[0]!.createdAt.getTime();
      const end = views[views.length - 1]!.createdAt.getTime();
      sessionDurationTotal += Math.max(end - start, 0);
      sessionDurationCount += 1;
    }
  }
  const bounceRate = visitors > 0 ? Math.round((bounceCount / visitors) * 100) : 0;
  const avgSessionLabel =
    sessionDurationCount > 0
      ? formatDuration(sessionDurationTotal / sessionDurationCount)
      : "0m 00s";

  const sourceCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const cityCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const browserCounts = new Map<string, number>();
  const referrerHostCounts = new Map<string, number>();

  const countedSessions = new Set<string>();
  for (const view of rangeViews) {
    if (countedSessions.has(view.sessionId)) continue;
    countedSessions.add(view.sessionId);

    const source = classifyReferrer(view.referrer, view.utmSource);
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);

    if (view.country) countryCounts.set(view.country, (countryCounts.get(view.country) ?? 0) + 1);
    if (view.city) cityCounts.set(view.city, (cityCounts.get(view.city) ?? 0) + 1);
    if (view.device) deviceCounts.set(view.device, (deviceCounts.get(view.device) ?? 0) + 1);
    if (view.browser) browserCounts.set(view.browser, (browserCounts.get(view.browser) ?? 0) + 1);

    if (view.referrer) {
      try {
        const host = new URL(view.referrer).hostname.replace(/^www\./, "");
        if (host) referrerHostCounts.set(host, (referrerHostCounts.get(host) ?? 0) + 1);
      } catch {
        /* ignore */
      }
    } else if (view.utmSource) {
      referrerHostCounts.set(view.utmSource, (referrerHostCounts.get(view.utmSource) ?? 0) + 1);
    }
  }

  const trafficSources = ["Organic", "Direct", "Social", "Ads", "Email", "Referral"]
    .map((label) => {
      const value = sourceCounts.get(label) ?? 0;
      return {
        id: label.toLowerCase(),
        label,
        value,
        percentage: visitors > 0 ? Math.round((value / visitors) * 100) : 0,
      };
    })
    .filter((item) => item.value > 0 || visitors === 0);

  // if empty and no visitors, keep zeroed defaults for UI
  if (trafficSources.length === 0) {
    trafficSources.push(
      { id: "direct", label: "Direct", value: 0, percentage: 0 },
      { id: "organic", label: "Organic", value: 0, percentage: 0 },
      { id: "social", label: "Social", value: 0, percentage: 0 }
    );
  }

  const deviceOrder = ["mobile", "desktop", "tablet"] as const;
  const salesByDevice = deviceOrder.map((id) => {
    const count = deviceCounts.get(id) ?? 0;
    const percentage = visitors > 0 ? Math.round((count / visitors) * 100) : 0;
    return {
      id,
      label: id[0]!.toUpperCase() + id.slice(1),
      value: revenue > 0 ? Math.round((revenue * percentage) / 100) : count,
      percentage,
    };
  });

  const topBy = (map: Map<string, number>, fallback: string) => {
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? fallback;
  };

  const topCountryCode = topBy(countryCounts, "MA");
  const topReferrerRaw = topBy(referrerHostCounts, "Direct");

  return {
    visitors,
    previousVisitors,
    liveNow,
    returningRate,
    bounceRate,
    avgSessionLabel,
    liveCities,
    trafficSources,
    salesByDevice,
    topCountry: getCountryName(topCountryCode) || topCountryCode,
    topCity: topBy(cityCounts, "—"),
    topDevice: (topBy(deviceCounts, "mobile") || "mobile").replace(/^\w/, (c) => c.toUpperCase()),
    topBrowser: topBy(browserCounts, "Chrome"),
    topReferrer: topReferrerRaw,
  };
}
