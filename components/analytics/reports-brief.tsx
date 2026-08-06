import { Sparkles, TriangleAlert, TrendingUp } from "lucide-react";
import type { ReportBriefTone } from "@/lib/reports";
import {
  dashboardCard,
  dashboardKicker,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn, formatCurrency } from "@/lib/utils";

interface ReportsBriefProps {
  message: string;
  tone: ReportBriefTone;
  rangeLabel: string;
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  currency: string;
}

const TONE_STYLES: Record<
  ReportBriefTone,
  { icon: typeof TrendingUp; chip: string; label: string }
> = {
  positive: {
    icon: TrendingUp,
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    label: "Up",
  },
  attention: {
    icon: TriangleAlert,
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    label: "Watch",
  },
  neutral: {
    icon: Sparkles,
    chip: "bg-[#F5F5F7] text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300",
    label: "Steady",
  },
};

export function ReportsBrief({
  message,
  tone,
  rangeLabel,
  revenue,
  revenueChange,
  orders,
  ordersChange,
  currency,
}: ReportsBriefProps) {
  const style = TONE_STYLES[tone];
  const Icon = style.icon;

  return (
    <section className={cn(dashboardCard, "p-4")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              style.chip
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className={dashboardKicker}>{rangeLabel}</p>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  style.chip
                )}
              >
                {style.label}
              </span>
            </div>
            <p className={cn(dashboardTitle, "mt-1 leading-snug")}>{message}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:min-w-[260px]">
          <div className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <p className={dashboardKicker}>Revenue</p>
            <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-neutral-900 dark:text-white">
              {formatCurrency(revenue, currency)}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[11px] font-medium tabular-nums",
                revenueChange >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {revenueChange >= 0 ? "+" : ""}
              {revenueChange.toFixed(0)}%
            </p>
          </div>
          <div className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/80 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <p className={dashboardKicker}>Orders</p>
            <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-neutral-900 dark:text-white">
              {orders.toLocaleString()}
            </p>
            <p
              className={cn(
                "mt-0.5 text-[11px] font-medium tabular-nums",
                ordersChange >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {ordersChange >= 0 ? "+" : ""}
              {ordersChange.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
      <p className={cn(dashboardSubtitle, "mt-2 lg:hidden")}>vs previous period</p>
    </section>
  );
}
