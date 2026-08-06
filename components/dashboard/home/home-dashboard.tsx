"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Megaphone,
  Package,
  Users,
} from "lucide-react";
import type { ExecutiveDashboardData, HomeKpiCardData } from "@/types/dashboard";
import {
  deriveAiInsights,
  deriveAnalyticsChips,
  deriveCustomerStats,
  deriveFloatingQuickActions,
  deriveInventoryStats,
  deriveLiveVisitors,
  deriveMarketingStats,
  deriveRecommendedTasks,
  deriveRevenueBreakdown,
  deriveStoreHealth,
  deriveVisitorStats,
  deriveHomeBrief,
  enrichActivityFeed,
  getRangeLabel,
  type HomeLiveCity,
} from "@/lib/home-insights";
import { getHomeCopy } from "@/lib/dashboard/home-i18n";
import { formatCurrency } from "@/lib/utils";
import { homePage } from "./home-ui";
import { HomeI18nProvider, useHomeCopy } from "./home-i18n";
import { HomeOverviewStrip } from "./home-overview-strip";
import { HomeAiInsights } from "./home-ai-insights";
import { HomeKpiGrid } from "./home-kpi-grid";
import { HomeRevenueChart } from "./home-revenue-chart";
import { HomeStatGrid } from "./home-stat-grid";
import { HomeRecentOrders } from "./home-recent-orders";
import { HomeLiveVisitors } from "./home-live-visitors";
import { HomeTopProducts } from "./home-top-products";
import { HomeAnalyticsChips } from "./home-analytics-chips";
import { HomeTrafficSources } from "./home-traffic-sources";
import { HomeSalesByDevice } from "./home-sales-by-device";
import { HomeStoreHealth } from "./home-store-health";
import { HomeActivityTimeline } from "./home-activity-timeline";
import { HomeRecommendedTasks } from "./home-recommended-tasks";
import { HomeNewsSidebar } from "./home-news-sidebar";
import { HomeQuickActions } from "./home-quick-actions";
import { HomeFirstSaleRail } from "./home-first-sale-rail";
import { StoreWebsiteAccess } from "@/components/shared/store-website-access";

interface HomeDashboardProps {
  data: ExecutiveDashboardData;
  userName?: string;
  storeSlug: string;
  locale?: string;
  launchMode?: boolean;
}

function buildPrimaryKpis(data: ExecutiveDashboardData): HomeKpiCardData[] {
  const spark = data.homeKpis.find((k) => k.id === "revenue")?.sparkline ?? [];
  const ordersSpark = data.homeKpis.find((k) => k.id === "orders")?.sparkline ?? spark;
  const visitorsKpi = data.homeKpis.find((k) => k.id === "visitors");
  const customers = data.catalogExtras.uniqueCustomerCount;

  return [
    data.homeKpis.find((k) => k.id === "revenue") ?? {
      id: "revenue",
      label: "Revenue",
      value: formatCurrency(data.rawRevenue, data.currency),
      change: data.kpis.revenue.change,
      changeLabel: getRangeLabel(data.range),
      sparkline: spark,
      href: "/dashboard/analytics/reports",
    },
    data.homeKpis.find((k) => k.id === "orders") ?? {
      id: "orders",
      label: "Orders",
      value: "0",
      change: 0,
      changeLabel: getRangeLabel(data.range),
      sparkline: ordersSpark,
      href: "/dashboard/orders",
    },
    visitorsKpi ?? {
      id: "visitors",
      label: "Visitors",
      value: data.visitors.toLocaleString(),
      change: data.visitorsChange,
      changeLabel: "period",
      sparkline: spark,
      href: "/dashboard/analytics/live",
    },
    {
      id: "customers",
      label: "Customers",
      value: customers.toLocaleString(),
      change:
        customers > 0
          ? Math.round((data.catalogExtras.newCustomersToday / Math.max(customers, 1)) * 100)
          : 0,
      changeLabel: "new today",
      sparkline: ordersSpark,
      href: "/dashboard/customers",
    },
  ];
}

function HomeDashboardInner({
  data,
  userName,
  storeSlug,
  launchMode = false,
}: Omit<HomeDashboardProps, "locale">) {
  const t = useHomeCopy();
  const router = useRouter();
  const [, startRefresh] = useTransition();
  const initialLive = useMemo(() => deriveLiveVisitors(data), [data]);
  const [liveCities, setLiveCities] = useState<HomeLiveCity[]>(initialLive.cities);
  const [liveCount, setLiveCount] = useState(initialLive.activeCount);

  const brief = useMemo(() => deriveHomeBrief(data), [data]);
  const aiInsight = useMemo(() => deriveAiInsights(data), [data]);
  const rangeLabel = useMemo(() => getRangeLabel(data.range), [data.range]);
  const primaryKpis = useMemo(() => buildPrimaryKpis(data), [data]);
  const revenueBreakdown = useMemo(() => deriveRevenueBreakdown(data), [data]);
  const visitorStats = useMemo(() => {
    const base = deriveVisitorStats(data);
    return base.map((item) =>
      item.id === "live" ? { ...item, value: liveCount.toLocaleString() } : item
    );
  }, [data, liveCount]);
  const inventoryStats = useMemo(() => deriveInventoryStats(data), [data]);
  const marketingStats = useMemo(() => deriveMarketingStats(data), [data]);
  const customerStats = useMemo(() => deriveCustomerStats(data), [data]);
  const analyticsChips = useMemo(() => deriveAnalyticsChips(data), [data]);
  const storeHealth = useMemo(() => deriveStoreHealth(data), [data]);
  const tasks = useMemo(() => deriveRecommendedTasks(data), [data]);
  const floatingActions = useMemo(() => deriveFloatingQuickActions(), []);
  const activity = useMemo(
    () => enrichActivityFeed(data, data.activityTimeline),
    [data]
  );

  useEffect(() => {
    setLiveCities(initialLive.cities);
    setLiveCount(initialLive.activeCount);
  }, [initialLive]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      startRefresh(() => {
        router.refresh();
      });
    }, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function refreshLive() {
      try {
        const res = await fetch("/api/live-view?range=24", { cache: "no-store" });
        if (!res.ok) return;
        const payload = (await res.json()) as {
          activeVisitors?: number;
          liveCities?: HomeLiveCity[];
        };
        if (cancelled) return;
        setLiveCount(payload.activeVisitors ?? 0);
        if (Array.isArray(payload.liveCities)) {
          setLiveCities(payload.liveCities);
        }
      } catch {
        /* ignore */
      }
    }

    void refreshLive();
    const timer = window.setInterval(() => void refreshLive(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const hasOrders =
    data.homeOrders.length > 0 || data.counts.completedOrders > 0;
  const showFirstSaleRail = !hasOrders;

  return (
    <div className={homePage}>
      <HomeOverviewStrip
        userName={userName}
        brief={brief}
        storeName={data.storeName}
      />

      {showFirstSaleRail ? (
        <HomeFirstSaleRail
          storeSlug={storeSlug}
          storeName={data.storeName}
          productCount={data.counts.totalProducts}
          hasOrders={hasOrders}
          highlight={launchMode || data.counts.totalProducts === 0}
        />
      ) : null}

      <HomeAiInsights insight={aiInsight} />

      <HomeKpiGrid kpis={primaryKpis} rangeLabel={rangeLabel} />

      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <HomeRevenueChart
          trend={data.trend}
          previousTrend={data.previousTrend}
          currency={data.currency}
          range={data.range}
          totalRevenue={data.rawRevenue}
          revenueChange={data.kpis.revenue.change}
          suggestedGoal={data.suggestedGoal}
        />
        <div className="space-y-2.5">
          <HomeStatGrid
            title={t.revenueBreakdown}
            description={rangeLabel}
            icon={DollarSign}
            items={revenueBreakdown}
            columns={2}
          />
          <HomeStatGrid
            title={t.visitors}
            description={t.trafficQuality}
            icon={Users}
            items={visitorStats}
            columns={2}
          />
        </div>
      </div>

      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <HomeRecentOrders
          orders={data.homeOrders}
          currency={data.currency}
          storeSlug={storeSlug}
        />
        <HomeLiveVisitors cities={liveCities} activeCount={liveCount} />
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2">
        <HomeStatGrid
          title={t.inventory}
          description={t.catalogStock}
          icon={Package}
          items={inventoryStats}
          columns={3}
        />
        <HomeStatGrid
          title={t.marketing}
          description={t.campaignsRecovery}
          icon={Megaphone}
          items={marketingStats}
          columns={2}
        />
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2">
        <HomeTopProducts products={data.homeTopProducts} currency={data.currency} />
        <HomeStatGrid
          title={t.customers}
          description={t.audienceValue}
          icon={Users}
          items={customerStats}
          columns={2}
        />
      </div>

      <HomeAnalyticsChips chips={analyticsChips} />

      <div id="analytics" className="scroll-mt-24 grid gap-2.5 lg:grid-cols-2">
        <HomeTrafficSources sources={data.trafficSources} />
        <HomeSalesByDevice devices={data.salesByDevice} currency={data.currency} />
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2">
        <HomeStoreHealth items={storeHealth} />
        <HomeActivityTimeline events={activity} />
      </div>

      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <HomeRecommendedTasks tasks={tasks.tasks} completion={tasks.completion} />
        <HomeNewsSidebar />
      </div>

      <HomeQuickActions actions={floatingActions} />

      <StoreWebsiteAccess
        storeSlug={storeSlug}
        storeName={data.storeName}
        variant="card"
        labels={{
          yourWebsite: t.yourWebsite,
          liveStorefront: t.liveStorefront,
          openLiveStore: t.openLiveStore,
          copyLink: t.copyLink,
          copied: t.copied,
          shareWhatsApp: t.shareWhatsApp,
        }}
      />
    </div>
  );
}

export function HomeDashboard({
  data,
  userName,
  storeSlug,
  locale,
  launchMode,
}: HomeDashboardProps) {
  const copy = useMemo(() => getHomeCopy(locale), [locale]);
  return (
    <HomeI18nProvider copy={copy}>
      <HomeDashboardInner
        data={data}
        userName={userName}
        storeSlug={storeSlug}
        launchMode={launchMode}
      />
    </HomeI18nProvider>
  );
}
