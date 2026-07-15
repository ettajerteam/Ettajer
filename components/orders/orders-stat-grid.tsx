import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardKicker } from "@/lib/dashboard-ui";

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
        "grid gap-3",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4"
      )}
    >
      {stats.map((stat) => (
        <div key={stat.label} className="premium-card premium-card-hover p-4">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]/10">
              <stat.icon className="h-4 w-4 text-[#007AFF]" />
            </div>
            <div className="min-w-0">
              <p className={cn("truncate", dashboardKicker)}>{stat.label}</p>
              <p className="mt-0.5 text-xl font-semibold tracking-[-0.02em] text-foreground">
                {stat.value}
              </p>
              {stat.hint ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.hint}</p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
