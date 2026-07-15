import { Sparkles, TriangleAlert, TrendingUp } from "lucide-react";
import type { ReportBriefTone } from "@/lib/reports";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
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
  { icon: typeof TrendingUp; chip: string; text: string; glow: string }
> = {
  positive: {
    icon: TrendingUp,
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    glow: "from-emerald-500/[0.08]",
  },
  attention: {
    icon: TriangleAlert,
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    text: "text-amber-800 dark:text-amber-300",
    glow: "from-amber-500/[0.08]",
  },
  neutral: {
    icon: Sparkles,
    chip: "bg-[#007AFF]/10 text-[#007AFF]",
    text: "text-neutral-700 dark:text-neutral-200",
    glow: "from-[#007AFF]/[0.06]",
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
    <section
      className={cn(
        dashboardCard,
        dashboardCardPad,
        "relative overflow-hidden ring-1 ring-neutral-200/60 dark:ring-white/10"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent",
          style.glow
        )}
      />

      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", style.chip)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{rangeLabel}</p>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", style.chip)}>
                {tone}
              </span>
            </div>
            <p className={cn("mt-1 text-sm font-medium", style.text)}>{message}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]">
          <div className="rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">Revenue</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {formatCurrency(revenue, currency)}
            </p>
            <p className={cn("text-[11px] font-medium", revenueChange >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {revenueChange >= 0 ? "+" : ""}
              {revenueChange.toFixed(0)}%
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">Orders</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{orders.toLocaleString()}</p>
            <p className={cn("text-[11px] font-medium", ordersChange >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {ordersChange >= 0 ? "+" : ""}
              {ordersChange.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
