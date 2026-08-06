"use client";

import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";
import { PlatformLogo } from "@/components/marketing/marketing-platform-logo";
import { Button } from "@/components/ui/button";
import {
  dashboardCard,
  dashboardKicker,
  dashboardSubtitle,
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

interface MarketingPlatformHeaderProps {
  platform: MarketingPlatformConfig;
  link: MarketingPlatformLink;
  storeSlug: string;
}

const STATUS = {
  live: {
    label: "Live on storefront",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  setup: {
    label: "Setup in progress",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  off: {
    label: "Not enabled",
    chip: "bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-400",
    dot: "bg-neutral-300 dark:bg-neutral-600",
  },
};

export function MarketingPlatformHeader({
  platform,
  link,
  storeSlug,
}: MarketingPlatformHeaderProps) {
  const status = getPlatformStatus(link);
  const statusStyle = STATUS[status];
  const progress = getSetupProgress(link, platform.id);
  const eventsOn = countEnabledTrackingEvents(link);
  const maskedId = maskPixelId(link.pixelId);

  return (
    <section className={cn(dashboardCard, "p-4")}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <PlatformLogo platformId={platform.id as MarketingPlatformId} size="md" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {platform.name}
              </h2>
              <span className={dashboardSubtitle}>{platform.subtitle}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  statusStyle.chip
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                {statusStyle.label}
              </span>
              {link.testMode ? (
                <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  Test mode
                </span>
              ) : null}
            </div>
            <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {platform.longDescription}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-400">
              <span className="font-mono tabular-nums">
                {maskedId ?? "No pixel ID"}
              </span>
              <span>·</span>
              <span>{eventsOn}/5 events on</span>
              {platform.id === "meta" && link.accessToken ? (
                <>
                  <span>·</span>
                  <span>CAPI on</span>
                </>
              ) : null}
              {platform.id === "meta" && link.catalogId ? (
                <>
                  <span>·</span>
                  <span>Catalog linked</span>
                </>
              ) : null}
              {platform.id === "meta" &&
              (link.purchasersAudienceId || link.abandonersAudienceId) ? (
                <>
                  <span>·</span>
                  <span>Audiences synced</span>
                </>
              ) : null}
              {platform.id === "meta" && link.domainVerifiedAt ? (
                <>
                  <span>·</span>
                  <span>Domain verified</span>
                </>
              ) : null}
              {link.accountId ? (
                <>
                  <span>·</span>
                  <span className="truncate">Account linked</span>
                </>
              ) : null}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {platform.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="rounded-md border border-black/[0.06] bg-[#F5F5F7]/80 px-1.5 py-0.5 text-[10px] text-neutral-500 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[200px]">
          <div className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
            <p className={dashboardKicker}>Setup progress</p>
            <div className="mt-1.5 flex items-center gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    status === "live" ? "bg-emerald-500" : "bg-[#007AFF]"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                {progress}%
              </span>
            </div>
            <p className={cn(dashboardSubtitle, "mt-1.5")}>
              {status === "live"
                ? platform.id === "meta" && !link.catalogId
                  ? "Live — add Catalog ID when ready for Dynamic Ads"
                  : "Tracking is live on your storefront"
                : status === "setup"
                  ? platform.id === "meta"
                    ? "Connect Meta, review Events, then Catalog"
                    : "Add a valid pixel ID and save"
                  : "Enable tracking to get started"}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
              asChild
            >
              <a href={platform.consoleUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                Console
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
              asChild
            >
              <Link href={`/store/${storeSlug}`} target="_blank">
                <Store className="mr-1 h-3 w-3" />
                Store
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
