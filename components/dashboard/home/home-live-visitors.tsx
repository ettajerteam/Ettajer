"use client";

import { MapPin } from "lucide-react";
import type { HomeLiveCity } from "@/lib/home-insights";
import { homeCard, homeCardPad, homeIconWrap, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";
import { cn } from "@/lib/utils";

interface HomeLiveVisitorsProps {
  cities: HomeLiveCity[];
  activeCount: number;
}

export function HomeLiveVisitors({ cities, activeCount }: HomeLiveVisitorsProps) {
  const t = useHomeCopy();
  return (
    <section className={cn(homeCard, homeCardPad, "h-full")}>
      <div className="flex items-center gap-2.5">
        <span className={homeIconWrap}>
          <MapPin className="h-4 w-4" />
        </span>
        <div>
          <h2 className={homeTitle}>{t.liveVisitors}</h2>
          <p className={homeSubtitle}>{t.activeRightNow(activeCount)}</p>
        </div>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 via-white to-neutral-50 p-4 dark:from-white/[0.06] dark:via-transparent dark:to-white/[0.02]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgba(16,185,129,0.18), transparent 42%), radial-gradient(circle at 70% 55%, rgba(29,29,31,0.08), transparent 40%)",
          }}
        />
        {cities.length === 0 ? (
          <p className="relative py-8 text-center text-[13px] text-neutral-500">
            {t.noLiveVisitors}
          </p>
        ) : (
          <ul className="relative space-y-3">
            {cities.map((city) => (
              <li key={city.id} className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-neutral-900 dark:text-white">
                    {city.city}
                  </p>
                  <p className="text-[12px] text-neutral-500">{city.country}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
