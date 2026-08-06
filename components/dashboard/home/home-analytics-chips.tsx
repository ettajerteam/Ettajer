"use client";

import type { HomeAnalyticsChip } from "@/lib/home-insights";
import { homeCard, homeCardPad, homeStatCell, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";
import { cn } from "@/lib/utils";

interface HomeAnalyticsChipsProps {
  chips: HomeAnalyticsChip[];
}

export function HomeAnalyticsChips({ chips }: HomeAnalyticsChipsProps) {
  const t = useHomeCopy();
  return (
    <section className={cn(homeCard, homeCardPad)}>
      <h2 className={homeTitle}>{t.customerAnalytics}</h2>
      <p className={homeSubtitle}>{t.whereShoppers}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {chips.map((chip) => (
          <div key={chip.id} className={homeStatCell}>
            <p className="text-[10px] font-medium text-neutral-400">{chip.label}</p>
            <p className="mt-0.5 text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              {chip.value}
              {chip.detail ? <span className="ml-1">{chip.detail}</span> : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
