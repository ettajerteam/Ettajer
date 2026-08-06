"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { HomeKpiCardData } from "@/types/dashboard";
import { getKpiStatus } from "@/lib/home-insights";
import { HomeSparkline } from "./home-sparkline";
import { HomeMetricBadge } from "./home-metric-badge";
import { homeAccent, homeCard, homeCardPad, homeKicker } from "./home-ui";
import { cn } from "@/lib/utils";

interface HomeKpiCardProps {
  data: HomeKpiCardData;
  icon: LucideIcon;
}

export function HomeKpiCard({ data, icon: Icon }: HomeKpiCardProps) {
  const status = getKpiStatus(data.change, data.id);
  const sparkColor =
    status === "down" || status === "alert" ? "#86868B" : homeAccent;

  const content = (
    <article className={cn(homeCard, homeCardPad, "h-full")}>
      <div className="flex items-start justify-between gap-2">
        <Icon className="h-3.5 w-3.5 text-neutral-400" aria-hidden />
        <HomeSparkline points={data.sparkline} color={sparkColor} />
      </div>
      <p className={cn("mt-3", homeKicker)}>{data.label}</p>
      <p className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
        {data.value}
      </p>
      <div className="mt-1.5">
        <HomeMetricBadge value={data.change} label={data.changeLabel} />
      </div>
    </article>
  );

  if (data.href) {
    return (
      <Link
        href={data.href}
        className="block rounded-[12px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/30"
      >
        {content}
      </Link>
    );
  }

  return content;
}
