import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { dashboardCard, dashboardCardPad, dashboardTitle } from "@/lib/dashboard-ui";

interface DashboardCardSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Standard dashboard card: header band + padded body (+ optional footer). */
export function DashboardCardSection({
  title,
  description,
  action,
  children,
  footer,
  className,
  bodyClassName,
}: DashboardCardSectionProps) {
  return (
    <section className={cn(dashboardCard, className)}>
      <div className={cn(dashboardCardPad, "border-b border-border/60")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={dashboardTitle}>{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <div className={cn(dashboardCardPad, "space-y-6", bodyClassName)}>{children}</div>
      {footer ? (
        <div className={cn(dashboardCardPad, "border-t border-border/70")}>{footer}</div>
      ) : null}
    </section>
  );
}
