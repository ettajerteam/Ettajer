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
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <AnalyticsSectionNav />

      <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
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
