"use client";

import type { LiveHourlyPoint } from "@/lib/live-view-types";
import { formatCurrency } from "@/lib/utils";

interface LiveHourlyChartProps {
  points: LiveHourlyPoint[];
  currency: string;
}

export function LiveHourlyChart({ points, currency }: LiveHourlyChartProps) {
  const maxOrders = Math.max(...points.map((point) => point.orders), 1);
  const totalOrders = points.reduce((sum, point) => sum + point.orders, 0);
  const totalRevenue = points.reduce((sum, point) => sum + point.revenue, 0);

  return (
    <section className="premium-card overflow-hidden ring-1 ring-neutral-200/60 dark:ring-white/10">
      <div className="flex items-center justify-between border-b border-neutral-200/80 bg-gradient-to-r from-white to-neutral-50/50 px-4 py-3.5 dark:border-white/10 dark:from-[#161616] dark:to-white/[0.02]">
        <div>
          <h3 className="text-base font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
            Activity trend
          </h3>
          <p className="text-xs text-neutral-500">Orders across the selected range</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">{totalOrders} orders</p>
          <p className="text-[11px] text-neutral-500">{formatCurrency(totalRevenue, currency)}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex h-36 items-end gap-1">
          {points.map((point, index) => {
            const height = `${Math.max((point.orders / maxOrders) * 100, point.orders > 0 ? 8 : 2)}%`;
            return (
              <div key={`${point.label}-${index}`} className="group flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="relative flex h-full w-full items-end justify-center">
                  <div
                    className="w-full max-w-[18px] rounded-t-md bg-gradient-to-t from-[#007AFF] to-[#60A5FA] transition-all duration-500 group-hover:from-[#0066DB] group-hover:to-[#38BDF8]"
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
