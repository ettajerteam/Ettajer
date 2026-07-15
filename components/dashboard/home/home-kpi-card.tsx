"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { HomeKpiCardData } from "@/types/dashboard";
import { getKpiStatus } from "@/lib/home-insights";
import { HomeSparkline } from "./home-sparkline";
import { HomeMetricBadge } from "./home-metric-badge";
import { homeCard, homeCardPad, homeMetric, homeKicker } from "./home-ui";
import { cn } from "@/lib/utils";

interface HomeKpiCardProps {
  data: HomeKpiCardData;
  icon: LucideIcon;
}

export function HomeKpiCard({ data, icon: Icon }: HomeKpiCardProps) {
  const status = getKpiStatus(data.change, data.id);

  const content = (
    <article
      className={cn(
        homeCard,
        homeCardPad,
        "premium-card-hover transition-colors"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            status === "up" && "bg-emerald-50 text-emerald-600",
            status === "down" && "bg-red-50 text-red-600",
            status === "alert" && "bg-amber-50 text-amber-600",
            status === "neutral" && "bg-neutral-100 text-neutral-600 dark:bg-white/5"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <HomeSparkline
          points={data.sparkline}
          color={status === "down" || status === "alert" ? "#FF9500" : "#007AFF"}
        />
      </div>
      <p className={cn("mt-2", homeKicker)}>{data.label}</p>
      <p className={cn("mt-1", homeMetric)}>{data.value}</p>
      <div className="mt-2">
        <HomeMetricBadge value={data.change} label={data.changeLabel} />
      </div>
    </article>
  );

  if (data.href) {
    return (
      <Link
        href={data.href}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
      >
        {content}
      </Link>
    );
  }

  return content;
}
