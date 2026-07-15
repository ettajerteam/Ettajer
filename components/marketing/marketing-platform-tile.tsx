"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { PlatformLogo } from "@/components/marketing/marketing-platform-logo";
import { dashboardCard } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import {
  getPlatformStatus,
  type MarketingPlatformConfig,
  type MarketingPlatformId,
  type MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformTileProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
}

const STATUS_STYLES = {
  live: {
    label: "Connected",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
    action: "Manage integration",
  },
  setup: {
    label: "Finish setup",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    action: "Complete setup",
  },
  off: {
    label: "Not connected",
    chip: "bg-muted text-muted-foreground",
    dot: "bg-neutral-300 dark:bg-neutral-600",
    action: "Set up now",
  },
};

export function MarketingPlatformTile({ platform, link }: MarketingPlatformTileProps) {
  const status = getPlatformStatus(link);
  const statusStyle = STATUS_STYLES[status];

  return (
    <Link
      href={`/dashboard/marketing/${platform.id}`}
      className={cn(
        dashboardCard,
        "group relative flex flex-col overflow-hidden ring-1 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        status === "live" ? platform.ring : "ring-neutral-200/60 hover:ring-[#007AFF]/25 dark:ring-white/10"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-60",
          platform.glow
        )}
      />

      <div className="relative flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <PlatformLogo platformId={platform.id as MarketingPlatformId} size="lg" />
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium",
              statusStyle.chip
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
            {statusStyle.label}
          </span>
        </div>

        <div>
          <h4 className="text-base font-semibold tracking-[-0.02em]">{platform.name}</h4>
          <p className="text-xs text-muted-foreground">{platform.subtitle}</p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {platform.description}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-1.5">
          {platform.benefits.slice(0, 2).map((benefit) => (
            <span
              key={benefit}
              className="rounded-full border border-border/70 bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {benefit}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between border-t border-border/70 bg-background/50 px-5 py-3 text-sm font-medium text-[#007AFF]">
        <span className="flex items-center gap-1.5">
          {statusStyle.action}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#007AFF]" />
      </div>
    </Link>
  );
}
