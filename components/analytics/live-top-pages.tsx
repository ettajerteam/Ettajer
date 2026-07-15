"use client";

import { dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import type { LiveViewData } from "@/lib/live-view-types";
import { Globe, TrendingUp } from "lucide-react";

interface LiveTopPagesProps {
  pages: LiveViewData["topPages"];
  refreshing: boolean;
}

export function LiveTopPages({ pages, refreshing }: LiveTopPagesProps) {
  const maxPageViews = Math.max(...pages.map((page) => page.views), 1);
  const totalViews = pages.reduce((sum, page) => sum + page.views, 0);

  return (
    <section className="premium-card overflow-hidden ring-1 ring-neutral-200/60 dark:ring-white/10">
      <div className="border-b border-neutral-200/80 bg-gradient-to-r from-white to-neutral-50/50 px-4 py-3.5 dark:border-white/10 dark:from-[#161616] dark:to-white/[0.02]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className={dashboardTitle}>Top pages</h3>
            <p className={dashboardSubtitle}>Where shoppers are right now</p>
          </div>
          <div className="rounded-lg border border-neutral-200/80 bg-white/70 px-2.5 py-1.5 text-right dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">Views</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {totalViews.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {refreshing ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="premium-skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {pages.map((page, index) => {
              const width = `${(page.views / maxPageViews) * 100}%`;
              const share = Math.round((page.views / totalViews) * 100);

              return (
                <li
                  key={page.page}
                  className="rounded-xl border border-transparent bg-neutral-50/50 p-3 transition-colors hover:border-neutral-200/80 hover:bg-white dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[10px] font-bold text-[#007AFF]">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                          {page.page}
                        </p>
                        <p className="text-[10px] text-neutral-400">{share}% of live traffic</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      {page.views}
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#007AFF] transition-all duration-500"
                      style={{ width }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-neutral-200/80 bg-gradient-to-r from-neutral-50/80 to-white/50 px-3.5 py-3 text-xs text-neutral-500 dark:border-white/10 dark:from-white/[0.02] dark:to-transparent">
          <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#007AFF]/70" />
          <p>Traffic is estimated from live sessions and checkout activity in the selected range.</p>
        </div>
      </div>
    </section>
  );
}
