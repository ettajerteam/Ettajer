"use client";

import { AnalyticsSectionNav } from "@/components/analytics/analytics-section-nav";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LiveViewToolbarProps {
  rangeLabel: string;
  lastUpdated: string;
  refreshing: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function LiveViewToolbar({
  rangeLabel,
  lastUpdated,
  refreshing,
  onRefresh,
  onExport,
}: LiveViewToolbarProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <AnalyticsSectionNav />

      <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live · 15s
        </div>

        <p className="hidden text-[11px] text-neutral-400 lg:block" suppressHydrationWarning>
          {rangeLabel} · Updated {formatRelativeTime(lastUpdated)}
        </p>

        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
          onClick={onExport}
        >
          <Download className="mr-1 h-3 w-3" />
          Export
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("mr-1 h-3 w-3", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
