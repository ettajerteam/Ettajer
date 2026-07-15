"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { GlobePulse } from "@/components/analytics/live-globe-canvas";
import { LiveActivityFeed } from "@/components/analytics/live-activity-feed";
import { LiveHourlyChart } from "@/components/analytics/live-hourly-chart";
import { LiveRecentOrders } from "@/components/analytics/live-recent-orders";
import { LiveTopPages } from "@/components/analytics/live-top-pages";
import { LiveViewBrief } from "@/components/analytics/live-view-brief";
import { LiveViewStats } from "@/components/analytics/live-view-stats";
import { LiveViewToolbar } from "@/components/analytics/live-view-toolbar";
import { Activity, DollarSign, ShoppingCart, Users } from "lucide-react";
import { exportRegionsCsv } from "@/lib/live-view-utils";
import { formatCurrency } from "@/lib/utils";
import type { LiveViewData } from "@/lib/live-view-types";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const LiveWorldMap = dynamic(
  () =>
    import("@/components/analytics/live-world-map").then((mod) => ({
      default: mod.LiveWorldMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="premium-card flex h-[440px] flex-col items-center justify-center gap-3 overflow-hidden ring-1 ring-neutral-200/60 dark:ring-white/10">
        <div className="h-28 w-28 animate-pulse rounded-full bg-gradient-to-br from-sky-500/20 to-[#007AFF]/10" />
        <p className="text-sm text-neutral-500">Loading live globe…</p>
      </div>
    ),
  }
);

export function LiveViewClient({ initial }: { initial: LiveViewData }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());
  const [focusCode, setFocusCode] = useState<string | null>(null);
  const [pulses, setPulses] = useState<GlobePulse[]>([]);
  const [autoFocus, setAutoFocus] = useState(true);
  const [refreshing, startRefresh] = useTransition();
  const isInitialRef = useRef(true);
  const knownOrderIdsRef = useRef(new Set(initial.recentOrders.map((order) => order.id)));

  const fetchLiveView = useCallback(async (range = data.range) => {
    const response = await fetch(`/api/live-view?range=${range}`);
    const next = (await response.json()) as LiveViewData;
    if (!response.ok) return null;
    return next;
  }, [data.range]);

  const applyNewOrders = useCallback((next: LiveViewData) => {
    if (isInitialRef.current) {
      isInitialRef.current = false;
      knownOrderIdsRef.current = new Set(next.recentOrders.map((order) => order.id));
      return;
    }

    const freshOrders = next.recentOrders.filter(
      (order) => !knownOrderIdsRef.current.has(order.id) && order.countryCode
    );

    if (freshOrders.length > 0) {
      setPulses((current) => [
        ...current,
        ...freshOrders.map((order) => ({
          id: order.id,
          code: order.countryCode!,
        })),
      ]);

      if (autoFocus) {
        setFocusCode(freshOrders[0].countryCode);
      }

      for (const order of freshOrders) {
        toast.success(`New order from ${order.countryName ?? "abroad"}`, {
          description: `#${order.orderNumber} · ${formatCurrency(order.total, next.currency)}`,
        });
      }
    }

    knownOrderIdsRef.current = new Set(next.recentOrders.map((order) => order.id));
  }, [autoFocus]);

  const pollLiveView = useCallback(async () => {
    const next = await fetchLiveView(data.range);
    if (!next) return;
    applyNewOrders(next);
    setData(next);
    setLastUpdated(new Date().toISOString());
  }, [applyNewOrders, fetchLiveView, data.range]);

  useEffect(() => {
    const interval = setInterval(() => {
      startRefresh(pollLiveView);
    }, 15000);
    return () => clearInterval(interval);
  }, [pollLiveView]);

  useEffect(() => {
    setData(initial);
    setLastUpdated(new Date().toISOString());
    isInitialRef.current = true;
    knownOrderIdsRef.current = new Set(initial.recentOrders.map((order) => order.id));
    setPulses([]);
    setFocusCode(null);
  }, [initial]);

  function handleRefresh() {
    startRefresh(async () => {
      const next = await fetchLiveView();
      if (!next) return;
      applyNewOrders(next);
      setData(next);
      setLastUpdated(new Date().toISOString());
      router.refresh();
    });
  }

  function handleExport() {
    exportRegionsCsv(data.visitorCountries, data.currency);
    toast.success("Regions exported");
  }

  const stats = [
    {
      icon: Users,
      label: "Active visitors",
      value: data.activeVisitors.toLocaleString(),
      hint: "Estimated live sessions",
      tone: "sky" as const,
      change: data.comparison.visitorsChange,
    },
    {
      icon: ShoppingCart,
      label: "Open carts",
      value: data.cartsOpen.toLocaleString(),
      hint: "Abandoned in last hour",
      tone: "violet" as const,
    },
    {
      icon: Activity,
      label: `Orders (${data.range === 1 ? "1h" : data.range === 168 ? "7d" : "24h"})`,
      value: data.ordersInRange.toLocaleString(),
      hint: `${data.ordersLastHour} in the last hour`,
      tone: "emerald" as const,
      change: data.comparison.ordersChange,
    },
    {
      icon: DollarSign,
      label: "Revenue",
      value: formatCurrency(data.revenueInRange, data.currency),
      hint: data.rangeLabel,
      tone: "blue" as const,
      change: data.comparison.revenueChange,
    },
  ];

  return (
    <div className="space-y-4">
      <LiveViewToolbar
        rangeLabel={data.rangeLabel}
        lastUpdated={lastUpdated}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <LiveViewBrief data={data} />

      <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
        <div>
          <Label htmlFor="auto-focus" className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
            Auto-focus globe on new orders
          </Label>
          <p className="text-[11px] text-neutral-500">Fly to the country when a live order arrives</p>
        </div>
        <Switch id="auto-focus" checked={autoFocus} onCheckedChange={setAutoFocus} />
      </div>

      <LiveViewStats stats={stats} />

      <LiveWorldMap
        countries={data.visitorCountries}
        currency={data.currency}
        range={data.range}
        pulses={pulses}
        focusCode={focusCode}
        onFocusCountry={setFocusCode}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <LiveHourlyChart points={data.hourlyTrend} currency={data.currency} />
        <LiveActivityFeed
          events={data.activityFeed}
          currency={data.currency}
          focusCode={focusCode}
          onFocusCountry={setFocusCode}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LiveRecentOrders
          orders={data.recentOrders}
          currency={data.currency}
          focusCode={focusCode}
          refreshing={refreshing}
          onFocusOrder={setFocusCode}
        />
        <LiveTopPages pages={data.topPages} refreshing={refreshing} />
      </div>
    </div>
  );
}
