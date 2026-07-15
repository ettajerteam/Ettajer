import { PieChart } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { dashboardCard, dashboardCardPad, dashboardSubtitle, dashboardTitle } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import type { ReportsData } from "@/lib/reports";

const STATUS_COLORS: Record<string, string> = {
  pending: "#FF9500",
  processing: "#007AFF",
  shipped: "#5856D6",
  delivered: "#34C759",
  returned: "#FF3B30",
  cancelled: "#8E8E93",
};

interface ReportsOrdersBreakdownProps {
  ordersByStatus: ReportsData["ordersByStatus"];
}

export function ReportsOrdersBreakdown({ ordersByStatus }: ReportsOrdersBreakdownProps) {
  const maxCount = Math.max(...ordersByStatus.map((item) => item.count), 1);
  const totalOrders = ordersByStatus.reduce((sum, item) => sum + item.count, 0);
  const topStatus = ordersByStatus[0];

  return (
    <section className={cn(dashboardCard, dashboardCardPad, "ring-1 ring-neutral-200/60 dark:ring-white/10")}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <PieChart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className={dashboardTitle}>Orders by status</h2>
            <p className={dashboardSubtitle}>Distribution for this period</p>
          </div>
        </div>
        {topStatus ? (
          <div className="rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2 text-right dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">Most common</p>
            <p className="text-sm font-semibold capitalize text-neutral-900 dark:text-white">
              {topStatus.status}
            </p>
          </div>
        ) : null}
      </div>

      {ordersByStatus.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No orders in this period</p>
      ) : (
        <>
          <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/5">
            {ordersByStatus.map((item) => (
              <div
                key={item.status}
                style={{
                  width: `${(item.count / totalOrders) * 100}%`,
                  backgroundColor: STATUS_COLORS[item.status] ?? "#007AFF",
                }}
              />
            ))}
          </div>

          <ul className="space-y-3">
            {ordersByStatus.map((item) => {
              const color = STATUS_COLORS[item.status] ?? "#007AFF";
              const width = `${(item.count / maxCount) * 100}%`;

              return (
                <li key={item.status}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <OrderStatusBadge status={item.status as OrderStatus} />
                    <span className="text-xs text-neutral-500">
                      {item.count} · {item.share.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width, backgroundColor: color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
