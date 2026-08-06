import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
} from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";
import type { ReportsData } from "@/lib/reports";
import { formatPercentChange } from "@/lib/live-view-utils";

interface ReportsKpiGridProps {
  data: ReportsData;
}

const KPI_CONFIG: {
  key: keyof Pick<
    ReportsData,
    "revenue" | "orders" | "averageOrderValue" | "unitsSold" | "refundedOrders"
  >;
  label: string;
  changeKey: keyof Pick<
    ReportsData,
    "revenueChange" | "ordersChange" | "aovChange" | "unitsChange" | "refundsChange"
  >;
  format: (value: number, currency: string) => string;
  invertChange?: boolean;
}[] = [
  {
    key: "revenue",
    label: "Revenue",
    changeKey: "revenueChange",
    format: (value, currency) => formatCurrency(value, currency),
  },
  {
    key: "orders",
    label: "Orders",
    changeKey: "ordersChange",
    format: (value) => value.toLocaleString(),
  },
  {
    key: "averageOrderValue",
    label: "Avg. order",
    changeKey: "aovChange",
    format: (value, currency) => formatCurrency(value, currency),
  },
  {
    key: "unitsSold",
    label: "Units sold",
    changeKey: "unitsChange",
    format: (value) => value.toLocaleString(),
  },
  {
    key: "refundedOrders",
    label: "Refunds",
    changeKey: "refundsChange",
    format: (value) => value.toLocaleString(),
    invertChange: true,
  },
];

export function ReportsKpiGrid({ data }: ReportsKpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
      {KPI_CONFIG.map((kpi) => {
        const value = data[kpi.key] as number;
        const change = data[kpi.changeKey] as number;
        const positive = kpi.invertChange ? change <= 0 : change >= 0;

        return (
          <article key={kpi.key} className={cn(dashboardCard, "px-3.5 py-3")}>
            <p className={dashboardKicker}>{kpi.label}</p>
            <p className={cn(dashboardMetric, "mt-1 truncate")}>
              {kpi.format(value, data.currency)}
            </p>
            <p
              className={cn(
                "mt-1 text-[10px] font-medium tabular-nums",
                positive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {formatPercentChange(change)} vs prev
            </p>
          </article>
        );
      })}
    </div>
  );
}
