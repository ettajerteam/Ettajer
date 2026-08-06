import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import { formatPercentChange } from "@/lib/live-view-utils";

interface LiveStat {
  label: string;
  value: string;
  hint?: string;
  change?: number;
}

interface LiveViewStatsProps {
  stats: LiveStat[];
}

export function LiveViewStats({ stats }: LiveViewStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className={cn(dashboardCard, "px-3.5 py-3")}>
          <p className={dashboardKicker}>{stat.label}</p>
          <p className={cn(dashboardMetric, "mt-1 truncate")}>{stat.value}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {stat.hint ? (
              <p className="text-[10px] text-neutral-400">{stat.hint}</p>
            ) : null}
            {typeof stat.change === "number" ? (
              <span
                className={cn(
                  "text-[10px] font-medium tabular-nums",
                  stat.change >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {formatPercentChange(stat.change)} vs prior
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
