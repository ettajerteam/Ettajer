"use client";

import { Radio, TrendingDown, TrendingUp } from "lucide-react";
import {
  dashboardCard,
  dashboardKicker,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import { formatPercentChange } from "@/lib/live-view-utils";
import type { LiveViewData } from "@/lib/live-view-types";

interface LiveViewBriefProps {
  data: LiveViewData;
}

export function LiveViewBrief({ data }: LiveViewBriefProps) {
  const topRegion = data.visitorCountries[0];
  const hasActivity = data.ordersInRange > 0 || data.cartsOpen > 0;
  const changes = [
    { label: "Orders", value: data.comparison.ordersChange },
    { label: "Revenue", value: data.comparison.revenueChange },
    { label: "Regions", value: data.comparison.regionsChange },
  ];

  return (
    <section className={cn(dashboardCard, "p-4")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] dark:bg-white/[0.08]">
            <Radio className="h-3.5 w-3.5 text-[#007AFF]" />
          </div>
          <div className="min-w-0">
            <p className={dashboardTitle}>
              {hasActivity
                ? `${data.activeVisitors} active visitors across ${data.visitorCountries.length} regions`
                : "Waiting for live store activity"}
            </p>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              {data.rangeLabel} · {data.ordersInRange} orders ·{" "}
              {formatCurrency(data.revenueInRange, data.currency)} revenue
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {changes.map((change) => (
                <span
                  key={change.label}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                    change.value >= 0
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                  )}
                >
                  {change.value >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {change.label} {formatPercentChange(change.value)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {topRegion ? (
          <div className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/80 px-3 py-2 text-right dark:border-white/10 dark:bg-white/[0.04] sm:min-w-[160px]">
            <p className={dashboardKicker}>Top region</p>
            <p className="mt-0.5 text-[13px] font-semibold text-neutral-900 dark:text-white">
              {topRegion.name}
            </p>
            <p className={dashboardSubtitle}>
              {topRegion.orders} orders ·{" "}
              {formatCurrency(topRegion.revenue, data.currency)}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
