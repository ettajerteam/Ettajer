import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardCard, dashboardKicker, dashboardMetric } from "@/lib/dashboard-ui";

export interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

interface OrdersStatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export function OrdersStatGrid({ stats, columns = 4 }: OrdersStatGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2.5",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4"
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className={cn(dashboardCard, "p-3.5")}>
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] dark:bg-white/[0.06]">
              <stat.icon className="h-3.5 w-3.5 text-neutral-500" />
            </div>
            <div className="min-w-0">
              <p className={cn("truncate", dashboardKicker)}>{stat.label}</p>
              <p className={cn("mt-0.5 truncate", dashboardMetric)}>{stat.value}</p>
              {stat.hint ? (
                <p className="mt-0.5 truncate text-[10px] text-neutral-400">{stat.hint}</p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
