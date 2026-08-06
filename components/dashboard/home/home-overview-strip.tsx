"use client";

import type { HomeBrief } from "@/lib/home-insights";
import { homeHeading, homeSubtitle } from "./home-ui";
import { cn } from "@/lib/utils";

interface HomeOverviewStripProps {
  userName?: string;
  brief: HomeBrief;
  storeName: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeOverviewStrip({
  userName,
  brief,
  storeName,
}: HomeOverviewStripProps) {
  return (
    <section id="overview" className="scroll-mt-24">
      <div className="min-w-0">
        <h1 className={homeHeading}>
          {getGreeting()}, {userName ?? storeName}
        </h1>
        <p className={cn("mt-1.5 max-w-lg whitespace-pre-line", homeSubtitle)}>
          {brief.subtitle}
        </p>
      </div>
    </section>
  );
}
