"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { PlatformLogo } from "@/components/marketing/marketing-platform-logo";
import {
  dashboardCard,
  dashboardCardInteractive,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import {
  countEnabledTrackingEvents,
  getPlatformStatus,
  getSetupProgress,
  maskPixelId,
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
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
    action: "Manage",
  },
  setup: {
    label: "Finish setup",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
    action: "Complete setup",
  },
  off: {
    label: "Not connected",
    chip: "bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400",
    dot: "bg-neutral-300 dark:bg-neutral-600",
    action: "Set up",
  },
};

export function MarketingPlatformTile({ platform, link }: MarketingPlatformTileProps) {
  const status = getPlatformStatus(link);
  const statusStyle = STATUS_STYLES[status];
  const progress = getSetupProgress(link, platform.id);
  const eventsOn = countEnabledTrackingEvents(link);
  const maskedId = maskPixelId(link.pixelId);

  return (
    <Link
      href={`/dashboard/marketing/${platform.id}`}
      className={cn(
        dashboardCard,
        dashboardCardInteractive,
        "group flex flex-col overflow-hidden"
      )}
    >
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <PlatformLogo platformId={platform.id as MarketingPlatformId} size="sm" />
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
              statusStyle.chip
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
            {statusStyle.label}
          </span>
        </div>

        <div>
          <h4 className={dashboardTitle}>{platform.name}</h4>
          <p className={dashboardSubtitle}>{platform.subtitle}</p>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            {platform.description}
          </p>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-neutral-400">
            {maskedId ? (
              <span className="font-mono tabular-nums">{maskedId}</span>
            ) : (
              <span>No pixel ID</span>
            )}
            <span>·</span>
            <span>
              {eventsOn}/5 events
              {link.testMode ? " · Test mode" : ""}
            </span>
          </div>

          {status !== "off" ? (
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    status === "live" ? "bg-emerald-500" : "bg-[#007AFF]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-medium tabular-nums text-neutral-400">
                {progress}%
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {platform.benefits.slice(0, 2).map((benefit) => (
                <span
                  key={benefit}
                  className="rounded-md border border-black/[0.06] bg-[#F5F5F7]/80 px-1.5 py-0.5 text-[10px] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400"
                >
                  {benefit}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-black/[0.05] px-4 py-2.5 text-[12px] font-medium text-[#007AFF] dark:border-white/10">
        <span className="inline-flex items-center gap-1">
          {statusStyle.action}
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-[#007AFF]" />
      </div>
    </Link>
  );
}
