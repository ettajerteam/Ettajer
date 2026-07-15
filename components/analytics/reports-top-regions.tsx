import { Globe2 } from "lucide-react";
import { dashboardCard, dashboardCardPad, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import type { ReportsData } from "@/lib/reports";

interface ReportsTopRegionsProps {
  regions: ReportsData["topRegions"];
  currency: string;
}

export function ReportsTopRegions({ regions, currency }: ReportsTopRegionsProps) {
  const maxRevenue = Math.max(...regions.map((region) => region.revenue), 1);

  return (
    <section className={cn(dashboardCard, dashboardCardPad, "ring-1 ring-neutral-200/60 dark:ring-white/10")}>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#007AFF]/10">
          <Globe2 className="h-4 w-4 text-[#007AFF]" />
        </div>
        <div>
          <h2 className={dashboardTitle}>Top regions</h2>
          <p className={dashboardSubtitle}>Revenue by shipping country</p>
        </div>
      </div>

      {regions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No regional data in this period</p>
      ) : (
        <ul className="space-y-2">
          {regions.map((region, index) => {
            const width = `${(region.revenue / maxRevenue) * 100}%`;

            return (
              <li
                key={region.code}
                className="rounded-xl border border-transparent bg-neutral-50/70 px-3 py-2.5 dark:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-bold text-neutral-500 shadow-sm dark:bg-white/10">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {region.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {region.orders} orders · {region.share.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(region.revenue, currency)}
                  </p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200/80 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#007AFF]"
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
