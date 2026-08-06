"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleOff, Search, X } from "lucide-react";
import { MarketingIntegrationsBrief } from "@/components/marketing/marketing-integrations-brief";
import { MarketingPlatformTile } from "@/components/marketing/marketing-platform-tile";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { Button } from "@/components/ui/button";
import {
  MARKETING_PLATFORMS,
  countConnectedIntegrations,
  getIntegrationBrief,
  getPlatformStatus,
  type MarketingIntegrations,
} from "@/lib/marketing-integrations";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";

type StatusFilter = "all" | "live" | "setup" | "off";

interface MarketingIntegrationsClientProps {
  initialIntegrations: MarketingIntegrations;
}

const STATUS_ORDER = { live: 0, setup: 1, off: 2 } as const;

export function MarketingIntegrationsClient({
  initialIntegrations,
}: MarketingIntegrationsClientProps) {
  const router = useRouter();
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIntegrations(initialIntegrations);
  }, [initialIntegrations]);

  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [router]);

  const connectedCount = useMemo(
    () => countConnectedIntegrations(integrations),
    [integrations]
  );
  const brief = useMemo(() => getIntegrationBrief(integrations), [integrations]);
  const totalCount = MARKETING_PLATFORMS.length;

  const stats = useMemo(() => {
    let live = 0;
    let setup = 0;
    let off = 0;
    for (const platform of MARKETING_PLATFORMS) {
      const status = getPlatformStatus(integrations[platform.id]);
      if (status === "live") live += 1;
      else if (status === "setup") setup += 1;
      else off += 1;
    }
    return { live, setup, off, total: totalCount };
  }, [integrations, totalCount]);

  const filteredPlatforms = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MARKETING_PLATFORMS.filter((platform) => {
      const status = getPlatformStatus(integrations[platform.id]);
      if (filter !== "all" && status !== filter) return false;
      if (!q) return true;
      return (
        platform.name.toLowerCase().includes(q) ||
        platform.subtitle.toLowerCase().includes(q) ||
        platform.description.toLowerCase().includes(q)
      );
    }).sort((a, b) => {
      const statusA = getPlatformStatus(integrations[a.id]);
      const statusB = getPlatformStatus(integrations[b.id]);
      return STATUS_ORDER[statusA] - STATUS_ORDER[statusB];
    });
  }, [filter, integrations, search]);

  const hasFilters = filter !== "all" || Boolean(search.trim());
  const recommended = MARKETING_PLATFORMS.find(
    (platform) => getPlatformStatus(integrations[platform.id]) !== "live"
  );

  const filterItems: { id: StatusFilter; label: string; value: number }[] = [
    { id: "all", label: "Platforms", value: stats.total },
    { id: "live", label: "Connected", value: stats.live },
    { id: "setup", label: "In progress", value: stats.setup },
    { id: "off", label: "Not connected", value: stats.off },
  ];

  const clearFilters = () => {
    setFilter("all");
    setSearch("");
  };

  return (
    <div className={dashboardStack}>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {filterItems.map((stat) => {
          const active = filter === stat.id;
          return (
            <button
              key={stat.id}
              type="button"
              onClick={() => setFilter(stat.id)}
              className={cn(
                dashboardCard,
                "px-3.5 py-3 text-left transition-colors",
                active
                  ? "border-[#007AFF]/35 bg-[#007AFF]/[0.04]"
                  : "hover:bg-[#FAFAFA] dark:hover:bg-white/[0.03]"
              )}
            >
              <p className={dashboardKicker}>{stat.label}</p>
              <p className={cn(dashboardMetric, "mt-1 truncate")}>
                {stat.value.toLocaleString()}
              </p>
            </button>
          );
        })}
      </div>

      <MarketingIntegrationsBrief
        message={brief.message}
        tone={brief.tone}
        connectedCount={connectedCount}
        totalCount={totalCount}
        recommendedName={recommended?.name}
        recommendedHref={
          recommended ? `/dashboard/marketing/${recommended.id}` : undefined
        }
      />

      <div className={cn(dashboardCard, "overflow-hidden")}>
        <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={dashboardTitle}>
              Integrations
              <span className="ml-1.5 font-normal text-neutral-400">
                {filteredPlatforms.length}
              </span>
            </h2>
            <p className={dashboardSubtitle}>
              Ad pixels for storefront and checkout attribution
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className={dashboardPillGroup}>
              {(
                [
                  { id: "all", label: "All" },
                  { id: "live", label: "Live" },
                  { id: "setup", label: "Setup" },
                  { id: "off", label: "Off" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    dashboardPill,
                    filter === item.id ? dashboardPillActive : dashboardPillInactive
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search platforms…"
                className="h-7 w-40 rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-7 pr-7 text-[12px] outline-none focus:ring-1 focus:ring-[#007AFF]/30 sm:w-48 dark:border-white/10 dark:bg-white/[0.05]"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-1.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-neutral-400 hover:bg-black/[0.05]"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {filteredPlatforms.length === 0 ? (
          <ProductsEmptyState
            icon={CircleOff}
            title="No matches"
            description="Try another search or clear filters."
            action={
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            }
            embedded
          />
        ) : (
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            {filteredPlatforms.map((platform) => (
              <MarketingPlatformTile
                key={platform.id}
                platform={platform}
                link={integrations[platform.id]}
              />
            ))}
          </div>
        )}
      </div>

      {connectedCount === 0 && !hasFilters ? (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="grid gap-px bg-black/[0.04] dark:bg-white/[0.06] sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Pick a platform",
                body: "Start with Meta or Google if you’re already running ads there.",
              },
              {
                step: "02",
                title: "Paste your pixel ID",
                body: "Enable tracking, add the ID from the ad console, then save.",
              },
              {
                step: "03",
                title: "Verify events",
                body: "Browse your storefront and confirm hits in the platform’s events tool.",
              },
            ].map((tip) => (
              <div
                key={tip.step}
                className="bg-white px-4 py-3.5 dark:bg-[#1C1C1E]"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-300">
                  {tip.step}
                </p>
                <p className={cn(dashboardTitle, "mt-1.5")}>{tip.title}</p>
                <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
