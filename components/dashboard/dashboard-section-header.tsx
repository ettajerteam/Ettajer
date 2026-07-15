import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { dashboardTitle } from "@/lib/dashboard-ui";

interface DashboardSectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Flat section divider — not a card. Use above grids or sibling cards. */
export function DashboardSectionHeader({
  title,
  description,
  action,
  className,
}: DashboardSectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 border-t border-border/40 pt-6", className)}>
      <div className="min-w-0">
        <h2 className={dashboardTitle}>{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
