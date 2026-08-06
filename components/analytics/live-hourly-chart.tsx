"use client";

import type { LiveHourlyPoint } from "@/lib/live-view-types";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";

interface LiveHourlyChartProps {
  points: LiveHourlyPoint[];
  currency: string;
}

export function LiveHourlyChart({ points, currency }: LiveHourlyChartProps) {
  const maxOrders = Math.max(...points.map((point) => point.orders), 1);
  const totalOrders = points.reduce((sum, point) => sum + point.orders, 0);
  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div>
          <h3 className={dashboardTitle}>Activity trend</h3>
          <p className={dashboardSubtitle}>Orders across the selected range</p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
            {totalOrders} orders
          </p>
          <p className={dashboardSubtitle}>{formatCurrency(totalRevenue, currency)}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex h-32 items-end gap-1">
          {points.map((point, index) => {
            const height = `${Math.max(
              (point.orders / maxOrders) * 100,
              point.orders > 0 ? 8 : 2
            )}%`;
            return (
              <div
                key={`${point.label}-${index}`}
                className="group flex min-w-0 flex-1 flex-col items-center gap-1.5"
              >
                <div className="relative flex h-full w-full items-end justify-center">
                  <div
                    className="w-full max-w-[14px] rounded-t-sm bg-[#007AFF] transition-colors group-hover:bg-[#0071EB]"
                    style={{ height }}
                    title={`${point.label}: ${point.orders} orders`}
                  />
                </div>
                <span className="w-full truncate text-center text-[9px] text-neutral-400">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
