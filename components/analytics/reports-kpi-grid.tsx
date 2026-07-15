import type { LucideIcon } from "lucide-react";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Receipt,
  RefreshCcw,
} from "lucide-react";
import { dashboardCard, dashboardCardPad, dashboardMetric } from "@/lib/dashboard-ui";
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
  icon: LucideIcon;
  changeKey: keyof Pick<
    ReportsData,
    "revenueChange" | "ordersChange" | "aovChange" | "unitsChange" | "refundsChange"
  >;
  tone: "blue" | "emerald" | "sky" | "violet" | "amber";
  format: (value: number, currency: string) => string;
  invertChange?: boolean;
}[] = [
  {
    key: "revenue",
    label: "Revenue",
    icon: DollarSign,
    changeKey: "revenueChange",
    tone: "blue",
    format: (value, currency) => formatCurrency(value, currency),
  },
  {
    key: "orders",
    label: "Orders",
    icon: ShoppingBag,
    changeKey: "ordersChange",
    tone: "emerald",
    format: (value) => value.toLocaleString(),
  },
  {
    key: "averageOrderValue",
    label: "Avg. order",
    icon: Receipt,
    changeKey: "aovChange",
    tone: "sky",
    format: (value, currency) => formatCurrency(value, currency),
  },
  {
    key: "unitsSold",
    label: "Units sold",
    icon: Package,
    changeKey: "unitsChange",
    tone: "violet",
    format: (value) => value.toLocaleString(),
  },
  {
    key: "refundedOrders",
    label: "Refunds",
    icon: RefreshCcw,
    changeKey: "refundsChange",
    tone: "amber",
    format: (value) => value.toLocaleString(),
    invertChange: true,
  },
];

const TONE_STYLES = {
  blue: { icon: "bg-[#007AFF]/10 text-[#007AFF]", glow: "from-[#007AFF]/[0.08]", ring: "ring-[#007AFF]/10" },
  emerald: { icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", glow: "from-emerald-500/[0.07]", ring: "ring-emerald-500/10" },
  sky: { icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400", glow: "from-sky-500/[0.07]", ring: "ring-sky-500/10" },
  violet: { icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400", glow: "from-violet-500/[0.07]", ring: "ring-violet-500/10" },
  amber: { icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400", glow: "from-amber-500/[0.07]", ring: "ring-amber-500/10" },
};

export function ReportsKpiGrid({ data }: ReportsKpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {KPI_CONFIG.map((kpi) => {
        const Icon = kpi.icon;
        const value = data[kpi.key] as number;
        const change = data[kpi.changeKey] as number;
        const tone = TONE_STYLES[kpi.tone];
        const positive = kpi.invertChange ? change <= 0 : change >= 0;

        return (
          <article
            key={kpi.key}
            className={cn(dashboardCard, dashboardCardPad, "relative overflow-hidden ring-1", tone.ring)}
          >
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent", tone.glow)} />
            <div className="relative">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone.icon)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className={cn("mt-3 text-[11px] font-medium uppercase tracking-wide text-neutral-400")}>
                {kpi.label}
              </p>
              <p className={cn("mt-1", dashboardMetric)}>{kpi.format(value, data.currency)}</p>
              <span
                className={cn(
                  "mt-1.5 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  positive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                {formatPercentChange(change)} vs prev
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
