import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { dashboardCard } from "@/lib/dashboard-ui";

interface OrdersEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function OrdersEmptyState({ icon: Icon, title, description, action }: OrdersEmptyStateProps) {
  return (
    <div className={cn(dashboardCard, "px-6 py-12 text-center")}>
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F5F7] dark:bg-white/[0.06]">
        <Icon className="h-5 w-5 text-neutral-400" />
      </div>
      <h3 className="text-[14px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
        {title}
      </h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-neutral-400">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
