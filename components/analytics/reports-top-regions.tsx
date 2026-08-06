import { Globe2 } from "lucide-react";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import type { ReportsData } from "@/lib/reports";

interface ReportsTopRegionsProps {
  regions: ReportsData["topRegions"];
  currency: string;
}

export function ReportsTopRegions({ regions, currency }: ReportsTopRegionsProps) {
  const maxRevenue = Math.max(...regions.map((region) => region.revenue), 1);

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <h2 className={dashboardTitle}>Top regions</h2>
        <p className={dashboardSubtitle}>Revenue by shipping country</p>
      </div>

      {regions.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <Globe2 className="h-5 w-5 text-neutral-300" />
          <p className="mt-2 text-[12px] text-neutral-400">
            No regional data in this period
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-black/[0.04] dark:divide-white/5">
          {regions.map((region, index) => {
            const width = `${(region.revenue / maxRevenue) * 100}%`;

            return (
              <li key={region.code} className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] text-[10px] font-semibold text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-300">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                        {region.name}
                      </p>
                      <p className={dashboardSubtitle}>
                        {region.orders} orders · {region.share.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                    {formatCurrency(region.revenue, currency)}
                  </p>
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
    </section>
  );
}
