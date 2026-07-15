"use client";

import Link from "next/link";
import type { HealthScore } from "@/types/dashboard";
import type { HomeBrief } from "@/lib/home-insights";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { homeCard, homeCardPad, homeHeading, homeSubtitle } from "./home-ui";
import { cn } from "@/lib/utils";

interface HomeOverviewStripProps {
  userName?: string;
  brief: HomeBrief;
  health: HealthScore;
  storeName: string;
  lastUpdated: string;
}

const GRADE_COLORS: Record<HealthScore["grade"], string> = {
  A: "#34C759",
  B: "#007AFF",
  C: "#FF9500",
  D: "#FF3B30",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeOverviewStrip({
  userName,
  brief,
  health,
  storeName,
  lastUpdated,
}: HomeOverviewStripProps) {
  return (
    <section
      id="overview"
      className={cn(
        homeCard,
        homeCardPad,
        "scroll-mt-24 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      )}
    >
      <div className="min-w-0">
        <h1 className={homeHeading}>
          {getGreeting()}, {userName ?? "there"}
        </h1>
        <p
          className={cn(
            "mt-1 line-clamp-2 text-sm",
            brief.tone === "positive" && "text-emerald-700 dark:text-emerald-400",
            brief.tone === "attention" && "text-amber-700 dark:text-amber-400",
            brief.tone === "neutral" && homeSubtitle
          )}
        >
          {brief.subtitle}
        </p>
        <p className={cn("mt-1", homeSubtitle)}>
          {storeName} · updated {formatRelativeTime(lastUpdated)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200/90 bg-neutral-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: GRADE_COLORS[health.grade] }}
          >
            {health.grade}
          </span>
          <div>
            <p className="text-xs font-medium text-neutral-900 dark:text-white">{health.label}</p>
            <p className="text-[11px] text-neutral-500">{health.score}/100</p>
          </div>
        </div>
        <Link
          href="/dashboard/analytics/reports"
          className="rounded-lg border border-neutral-200/90 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/5"
        >
          Report
        </Link>
      </div>
    </section>
  );
}
