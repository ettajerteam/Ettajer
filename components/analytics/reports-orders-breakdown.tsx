import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import {
  dashboardCard,
  dashboardKicker,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
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
    <section className={cn(dashboardCard, "p-4")}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className={dashboardTitle}>Orders by status</h2>
          <p className={dashboardSubtitle}>Distribution for this period</p>
        </div>
        {topStatus ? (
          <div className="text-right">
            <p className={dashboardKicker}>Most common</p>
            <p className="mt-0.5 text-[12px] font-semibold capitalize text-neutral-900 dark:text-white">
              {topStatus.status}
            </p>
          </div>
        ) : null}
      </div>

      {ordersByStatus.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-neutral-400">
          No orders in this period
        </p>
      ) : (
        <>
          <div className="mb-3 flex h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/5">
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

          <ul className="space-y-2.5">
            {ordersByStatus.map((item) => {
              const color = STATUS_COLORS[item.status] ?? "#007AFF";
              const width = `${(item.count / maxCount) * 100}%`;

              return (
                <li key={item.status}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <OrderStatusBadge status={item.status as OrderStatus} />
                    <span className="text-[11px] tabular-nums text-neutral-400">
                      {item.count} · {item.share.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/5">
                    <div
                      className="h-full rounded-full"
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
