"use client";

import Link from "next/link";
import { ExternalLink, Store } from "lucide-react";
import { PlatformLogo } from "@/components/marketing/marketing-platform-logo";
import { Button } from "@/components/ui/button";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import {
  getPlatformStatus,
  getSetupProgress,
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
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  setup: {
    label: "Setup in progress",
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  off: {
    label: "Not enabled",
    chip: "bg-muted text-muted-foreground",
    dot: "bg-neutral-300 dark:bg-neutral-600",
  },
};

export function MarketingPlatformHeader({ platform, link, storeSlug }: MarketingPlatformHeaderProps) {
  const status = getPlatformStatus(link);
  const statusStyle = STATUS[status];
  const progress = getSetupProgress(link);

  return (
    <section
      className={cn(
        dashboardCard,
        dashboardCardPad,
        "relative overflow-hidden ring-1",
        status === "live" ? platform.ring : "ring-neutral-200/60 dark:ring-white/10"
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent", platform.glow)} />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <PlatformLogo platformId={platform.id as MarketingPlatformId} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">{platform.name}</h2>
              <span className="text-sm text-muted-foreground">{platform.subtitle}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  statusStyle.chip
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                {statusStyle.label}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{platform.longDescription}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {platform.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="rounded-full border border-border/80 bg-background/80 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:min-w-[220px]">
          <div className="rounded-xl border border-border/80 bg-background/80 px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Setup progress</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#007AFF] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{progress}%</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <a href={platform.consoleUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open console
              </a>
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg" asChild>
              <Link href={`/store/${storeSlug}`} target="_blank">
                <Store className="mr-1.5 h-3.5 w-3.5" />
                View store
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
