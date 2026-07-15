"use client";

import { AnalyticsSectionNav } from "@/components/analytics/analytics-section-nav";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportsToolbarProps {
  rangeLabel: string;
  lastUpdated: string;
  refreshing: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function ReportsToolbar({
  rangeLabel,
  lastUpdated,
  refreshing,
  onRefresh,
  onExport,
}: ReportsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <AnalyticsSectionNav />

      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
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
