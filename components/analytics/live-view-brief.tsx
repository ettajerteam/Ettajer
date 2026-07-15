"use client";

import { Radio, TrendingDown, TrendingUp } from "lucide-react";
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
    <div
      className={cn(
        "premium-card relative overflow-hidden px-4 py-3.5 ring-1 ring-neutral-200/60 dark:ring-white/10",
        hasActivity
          ? "bg-gradient-to-r from-[#007AFF]/[0.06] via-white to-white dark:from-[#007AFF]/10 dark:via-[#161616] dark:to-[#161616]"
          : ""
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/10">
            <Radio className="h-4 w-4 text-[#007AFF]" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {hasActivity
                ? `${data.activeVisitors} active visitors across ${data.visitorCountries.length} regions`
                : "Waiting for live store activity"}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {data.rangeLabel} · {data.ordersInRange} orders ·{" "}
              {formatCurrency(data.revenueInRange, data.currency)} revenue
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {changes.map((change) => (
                <span
                  key={change.label}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    change.value >= 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
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
          <div className="rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2 text-right dark:border-white/10 dark:bg-white/[0.03] sm:min-w-[180px]">
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">Top region</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{topRegion.name}</p>
            <p className="text-[11px] text-neutral-500">
              {topRegion.orders} orders · {formatCurrency(topRegion.revenue, data.currency)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
