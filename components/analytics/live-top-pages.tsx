"use client";

import {
  dashboardCard,
  dashboardKicker,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import type { LiveViewData } from "@/lib/live-view-types";
import { Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveTopPagesProps {
  pages: LiveViewData["topPages"];
  refreshing: boolean;
}

export function LiveTopPages({ pages, refreshing }: LiveTopPagesProps) {
  const maxPageViews = Math.max(...pages.map((page) => page.views), 1);
  const totalViews = pages.reduce((sum, page) => sum + page.views, 0);

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div>
          <h3 className={dashboardTitle}>Top pages</h3>
          <p className={dashboardSubtitle}>Where shoppers are right now</p>
        </div>
        <div className="text-right">
          <p className={dashboardKicker}>Views</p>
          <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
            {totalViews.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="p-0">
        {refreshing ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-md" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <p className="px-4 py-10 text-center text-[12px] text-neutral-400">
            No page traffic yet
          </p>
        ) : (
          <ul className="divide-y divide-black/[0.04] dark:divide-white/5">
            {pages.map((page, index) => {
              const width = `${(page.views / maxPageViews) * 100}%`;
              const share =
                totalViews > 0 ? Math.round((page.views / totalViews) * 100) : 0;

              return (
                <li key={page.page} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] text-[10px] font-semibold text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-300">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                          {page.page}
                        </p>
                        <p className={dashboardSubtitle}>{share}% of live traffic</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[12px] font-medium tabular-nums text-neutral-600 dark:text-neutral-300">
                      {page.views}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#007AFF]"
                      style={{ width }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-start gap-2 border-t border-black/[0.05] px-4 py-3 text-[11px] text-neutral-400 dark:border-white/10">
          <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-300" />
          <p>
            Traffic is estimated from live sessions and checkout activity in the
            selected range.
          </p>
        </div>
      </div>
    </section>
  );
}
