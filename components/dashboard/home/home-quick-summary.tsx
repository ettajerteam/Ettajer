import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { QuickSummaryItem } from "@/types/dashboard";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";
import { cn } from "@/lib/utils";

interface HomeQuickSummaryProps {
  items: QuickSummaryItem[];
}

function isUrgent(item: QuickSummaryItem): boolean {
  if (item.id === "pending-orders" || item.id === "low-stock") {
    const value = Number.parseInt(item.value.replace(/,/g, ""), 10);
    return value > 0;
  }
  return false;
}

export function HomeQuickSummary({ items }: HomeQuickSummaryProps) {
  return (
    <aside aria-label="Quick summary" className={cn(homeCard, homeCardPad)}>
      <h2 className={homeTitle}>Today</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const urgent = isUrgent(item);
          const row = (
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5",
                urgent
                  ? "border-amber-200/90 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5"
                  : "border-neutral-200/80 bg-neutral-50/50 dark:border-white/10 dark:bg-white/[0.02]"
              )}
            >
              <div>
                <p className={homeSubtitle}>{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-white">
                  {item.value}
                </p>
              </div>
              {item.href ? <ChevronRight className="h-3.5 w-3.5 text-neutral-400" /> : null}
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.id} href={item.href} className="block rounded-lg">
                {row}
              </Link>
            );
          }
          return <div key={item.id}>{row}</div>;
        })}
      </div>
    </aside>
  );
}
