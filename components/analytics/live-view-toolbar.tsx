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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <AnalyticsSectionNav />

      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 to-white/80 px-3 py-1.5 text-[11px] font-medium text-emerald-700 shadow-sm dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-transparent dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Live stream · 15s
        </div>

        <div className="hidden rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-1.5 text-[11px] text-neutral-500 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] lg:block">
          {rangeLabel} · Updated {formatRelativeTime(lastUpdated)}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-neutral-200/80 bg-white/80 text-xs shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
          onClick={onExport}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-neutral-200/80 bg-white/80 text-xs shadow-sm dark:border-white/10 dark:bg-white/[0.03]"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </div>
  );
}
