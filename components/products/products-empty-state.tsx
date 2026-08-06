import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";

export interface ProductsEmptyTip {
  step: string;
  title: string;
  body: string;
}

interface ProductsEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  embedded?: boolean;
  tips?: ProductsEmptyTip[];
}

export function ProductsEmptyState({
  icon: Icon,
  title,
  description,
  action,
  embedded,
  tips,
}: ProductsEmptyStateProps) {
  const body = (
    <>
      <div className={cn("px-6 py-10 text-center sm:px-10", embedded ? "py-8" : "sm:py-12")}>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.06]">
          <Icon className="h-5 w-5 text-neutral-400" />
        </div>
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-neutral-400">
          {description}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>

      {tips && tips.length > 0 ? (
        <div className="grid gap-px border-t border-black/[0.05] bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.06] sm:grid-cols-3">
          {tips.map((tip) => (
            <div
              key={tip.step}
              className="bg-white px-5 py-4 text-left dark:bg-[#1C1C1E]"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-300">
                {tip.step}
              </p>
              <p className={cn(dashboardTitle, "mt-1.5")}>{tip.title}</p>
              <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>{tip.body}</p>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );

  if (embedded) return <div className="overflow-hidden">{body}</div>;

  return <div className={cn(dashboardCard, "overflow-hidden")}>{body}</div>;
}
