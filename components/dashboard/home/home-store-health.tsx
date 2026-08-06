"use client";

import type { HomeStoreHealthItem } from "@/lib/home-insights";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";
import { cn } from "@/lib/utils";

interface HomeStoreHealthProps {
  items: HomeStoreHealthItem[];
}

export function HomeStoreHealth({ items }: HomeStoreHealthProps) {
  const t = useHomeCopy();
  return (
    <section className={cn(homeCard, homeCardPad, "h-full")}>
      <h2 className={homeTitle}>{t.storeHealth}</h2>
      <p className={homeSubtitle}>{t.operationalReadiness}</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-neutral-600 dark:text-neutral-300">{item.label}</span>
            {typeof item.score === "number" ? (
              <div className="flex min-w-[120px] items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-neutral-900 dark:bg-white"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[12px] font-semibold text-neutral-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ) : (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  item.ready
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-neutral-100 text-neutral-600"
                )}
              >
                {item.value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
