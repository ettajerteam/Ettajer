"use client";

import { Separator } from "@/components/ui/separator";
import { dashboardKicker } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface EditorPanelSectionProps {
  label: string;
  description?: string;
  count?: number;
  action?: React.ReactNode;
  divider?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function EditorPanelSection({
  label,
  description,
  count,
  action,
  divider = false,
  children,
  className,
}: EditorPanelSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      {divider ? <Separator className="bg-neutral-100" /> : null}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={dashboardKicker}>{label}</p>
          {description ? (
            <p className="mt-0.5 text-[11px] text-neutral-400">{description}</p>
          ) : null}
        </div>
        {count != null ? (
          <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-neutral-500">
            {count}
          </span>
        ) : null}
        {action}
      </div>
      {children}
    </section>
  );
}
