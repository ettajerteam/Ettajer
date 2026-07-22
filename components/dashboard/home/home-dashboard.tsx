"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExecutiveDashboardData } from "@/types/dashboard";
import {
  deriveAttentionItems,
  deriveHomeBrief,
  getRangeLabel,
} from "@/lib/home-insights";
import { homePage } from "./home-ui";
import { HomeOverviewStrip } from "./home-overview-strip";
import { HomeAttentionBar } from "./home-attention-bar";
import { HomeKpiGrid } from "./home-kpi-grid";
import { HomeRevenueChart } from "./home-revenue-chart";
import { HomeQuickSummary } from "./home-quick-summary";
import { HomeRecentOrders } from "./home-recent-orders";
import { HomeInventoryOverview } from "./home-inventory-overview";
import { HomeTopProducts } from "./home-top-products";
import { HomeTrafficSources } from "./home-traffic-sources";
import { HomeSalesByDevice } from "./home-sales-by-device";
import { HomeActivityTimeline } from "./home-activity-timeline";
import { StoreWebsiteAccess } from "@/components/shared/store-website-access";

interface HomeDashboardProps {
  data: ExecutiveDashboardData;
  userName?: string;
  storeSlug: string;
}

export function HomeDashboard({ data, userName, storeSlug }: HomeDashboardProps) {
  const router = useRouter();
  const [, startRefresh] = useTransition();
  const [lastSyncedAt, setLastSyncedAt] = useState(data.lastUpdated);

  const brief = useMemo(() => deriveHomeBrief(data), [data]);
  const attentionItems = useMemo(() => deriveAttentionItems(data), [data]);
  const rangeLabel = useMemo(() => getRangeLabel(data.range), [data.range]);

  useEffect(() => {
    setLastSyncedAt(data.lastUpdated);
  }, [data.lastUpdated]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      startRefresh(() => {
        router.refresh();
        setLastSyncedAt(new Date().toISOString());
      });
    }, 5 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [router]);

  return (
    <div className={homePage}>
      <HomeOverviewStrip
        userName={userName}
        brief={brief}
        health={data.healthScore}
        storeName={data.storeName}
        lastUpdated={lastSyncedAt}
      />

      <StoreWebsiteAccess
        storeSlug={storeSlug}
        storeName={data.storeName}
        variant="card"
      />

      <HomeAttentionBar items={attentionItems} />

      <HomeKpiGrid kpis={data.homeKpis} rangeLabel={rangeLabel} />

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_240px]">
        <HomeRevenueChart
          trend={data.trend}
          previousTrend={data.previousTrend}
          currency={data.currency}
          range={data.range}
          totalRevenue={data.rawRevenue}
          revenueChange={data.kpis.revenue.change}
          suggestedGoal={data.suggestedGoal}
        />
        <HomeQuickSummary items={data.quickSummary} />
      </div>

      <HomeRecentOrders orders={data.homeOrders} currency={data.currency} />

      <div className="grid gap-4 lg:grid-cols-2">
        <HomeInventoryOverview
          totalProducts={data.counts.totalProducts}
          collectionCount={data.collectionCount}
          outOfStock={data.inventory.outOfStock}
          lowStock={data.inventory.lowStock}
          bestSellerName={data.bestSellerName}
          inventoryValue={data.inventory.inventoryValue}
          currency={data.currency}
        />
        <HomeTopProducts products={data.homeTopProducts} currency={data.currency} />
      </div>

      <div id="analytics" className="scroll-mt-24 grid gap-4 lg:grid-cols-2">
        <HomeTrafficSources sources={data.trafficSources} />
        <HomeSalesByDevice devices={data.salesByDevice} currency={data.currency} />
      </div>

      <HomeActivityTimeline events={data.activityTimeline.slice(0, 6)} />
    </div>
  );
}
