"use client";

import type { HomeBrief } from "@/lib/home-insights";
import { useTimeOfDayGreeting } from "@/hooks/use-time-of-day-greeting";
import { homeHeading, homeSubtitle } from "./home-ui";
import { cn } from "@/lib/utils";

interface HomeOverviewStripProps {
  userName?: string;
  brief: HomeBrief;
  storeName: string;
}

export function HomeOverviewStrip({
  userName,
  brief,
  storeName,
}: HomeOverviewStripProps) {
  const greeting = useTimeOfDayGreeting();

  return (
    <section id="overview" className="scroll-mt-24">
      <div className="min-w-0">
        <h1 className={homeHeading}>
          {greeting}, {userName ?? storeName}
        </h1>
        <p className={cn("mt-1.5 max-w-lg whitespace-pre-line", homeSubtitle)}>
          {brief.subtitle}
        </p>
      </div>
    </section>
  );
}
