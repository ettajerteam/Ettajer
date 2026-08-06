"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import {
  createCatalogFeedToken,
  getMetaCatalogFeedUrl,
} from "@/lib/meta-product-feed";
import { getPinterestCatalogFeedUrl } from "@/lib/pinterest-product-feed";
import { cn } from "@/lib/utils";
import type {
  MarketingPlatformId,
  MarketingPlatformLink,
} from "@/lib/marketing-integrations";

interface MarketingPlatformCatalogPanelProps {
  platformId: Extract<MarketingPlatformId, "meta" | "pinterest">;
  link: MarketingPlatformLink;
  storeSlug: string;
  onChange: (patch: Partial<MarketingPlatformLink>) => void;
}

interface CatalogStats {
  activeProducts: number;
  eligibleProducts: number;
  feedUrl: string;
  hasFeedKey: boolean;
  catalogId: string | null;
  pixelConnected: boolean;
  capiEnabled: boolean;
}

const META_SETUP_STEPS = [
  "Open Meta Commerce Manager and create (or select) a product catalog.",
  "Add a data source → Scheduled feed → paste the feed URL below.",
  "Set fetch frequency (hourly or daily). Product IDs match Pixel content_ids.",
  "Paste your Catalog ID here so setup progress stays in sync.",
];

const PINTEREST_SETUP_STEPS = [
  "Open Pinterest Business → Catalogs and create (or select) a retail catalog.",
  "Add a data source → paste the feed URL below (TSV format).",
  "Choose country/language for Morocco (or your market). Pinterest refreshes about daily.",
  "Optional: paste Catalog ID here so setup progress stays in sync.",
];

export function MarketingPlatformCatalogPanel({
  platformId,
  link,
  storeSlug,
  onChange,
}: MarketingPlatformCatalogPanelProps) {
  const isPinterest = platformId === "pinterest";
  const [stats, setStats] = useState<CatalogStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const feedUrl = useMemo(
    () =>
      isPinterest
        ? getPinterestCatalogFeedUrl(storeSlug, link.catalogFeedToken)
        : getMetaCatalogFeedUrl(storeSlug, link.catalogFeedToken),
    [isPinterest, storeSlug, link.catalogFeedToken]
  );

  const statsEndpoint = isPinterest
    ? "/api/marketing/pinterest/catalog-stats"
    : "/api/marketing/meta/catalog-stats";

  const accentClass = isPinterest
    ? "bg-[#E60023]/10 text-[#E60023]"
    : "bg-[#1877F2]/10 text-[#1877F2]";

  const setupSteps = isPinterest ? PINTEREST_SETUP_STEPS : META_SETUP_STEPS;
  const consoleUrl = isPinterest
    ? "https://www.pinterest.com/business/catalogs/"
    : "https://business.facebook.com/commerce";
  const consoleLabel = isPinterest
    ? "Open Pinterest Catalogs"
    : "Open Commerce Manager";

  async function loadStats() {
    setLoadingStats(true);
    try {
      const res = await fetch(statsEndpoint);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to load catalog stats");
      setStats({
        activeProducts: data.activeProducts ?? 0,
        eligibleProducts: data.eligibleProducts ?? 0,
        feedUrl: data.feedUrl ?? feedUrl,
        hasFeedKey: Boolean(data.hasFeedKey),
        catalogId: data.catalogId ?? null,
        pixelConnected: Boolean(data.pixelConnected),
        capiEnabled: Boolean(data.capiEnabled),
      });
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    storeSlug,
    link.catalogFeedToken,
    link.catalogId,
    link.pixelId,
    link.accessToken,
    link.accountId,
    platformId,
  ]);

  async function copyFeedUrl() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      toast.success("Feed URL copied");
    } catch {
      toast.error("Could not copy — select the URL manually");
    }
  }

  function ensureFeedKey() {
    if (link.catalogFeedToken) return;
    onChange({ catalogFeedToken: createCatalogFeedToken() });
    toast.message("Feed key generated — save to lock the URL");
  }

  function rotateFeedKey() {
    onChange({ catalogFeedToken: createCatalogFeedToken() });
    toast.message(
      isPinterest
        ? "New feed key generated — update Pinterest data source after you save"
        : "New feed key generated — update Commerce Manager after you save"
    );
  }

  function clearFeedKey() {
    onChange({ catalogFeedToken: null });
    toast.message("Feed key removed — URL is open (save to apply)");
  }

  const checklist = [
    {
      ok: Boolean(link.pixelId),
      label: isPinterest ? "Tag connected" : "Pixel connected",
      hint: "Connect on the Connection tab",
    },
    {
      ok: (stats?.eligibleProducts ?? 0) > 0,
      label: "Products ready for feed",
      hint: "Need active products with images",
    },
    {
      ok: Boolean(link.catalogId),
      label: "Catalog ID saved",
      hint: "Optional but recommended",
    },
    {
      ok: isPinterest
        ? Boolean(link.accessToken && link.accountId)
        : Boolean(link.accessToken),
      label: "CAPI credentials present",
      hint: isPinterest
        ? "Ad account + Conversion token improve match"
        : "Improves Dynamic Ads match",
    },
  ];

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md",
                accentClass
              )}
            >
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h3 className={dashboardTitle}>Product catalog feed</h3>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                {isPinterest ? (
                  <>
                    Sync storefront products to Pinterest as product Pins for
                    shopping ads. IDs match Tag{" "}
                    <span className="font-mono">product_ids</span>.
                  </>
                ) : (
                  <>
                    Sync storefront products to Meta for Dynamic Ads and
                    Advantage+ shopping. IDs match Pixel{" "}
                    <span className="font-mono">content_ids</span>.
                  </>
                )}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-[11px] text-neutral-500"
            onClick={() => void loadStats()}
            disabled={loadingStats}
          >
            {loadingStats ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              label: "In feed",
              value: loadingStats ? "…" : String(stats?.eligibleProducts ?? "—"),
            },
            {
              label: "Active products",
              value: loadingStats ? "…" : String(stats?.activeProducts ?? "—"),
            },
            {
              label: "Feed key",
              value: link.catalogFeedToken ? "On" : "Off",
            },
            {
              label: "Catalog ID",
              value: link.catalogId ? "Saved" : "Missing",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                {item.label}
              </p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[10px] border border-black/[0.05] px-3 py-3 dark:border-white/10">
          <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
            Catalog readiness
          </p>
          <ul className="mt-2 space-y-1.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-[12px]">
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                    item.ok
                      ? "bg-emerald-500 text-white"
                      : "bg-[#F5F5F7] text-neutral-400 dark:bg-white/[0.08]"
                  )}
                >
                  <Check className="h-2.5 w-2.5" />
                </span>
                <span>
                  <span
                    className={cn(
                      "font-medium",
                      item.ok
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-500"
                    )}
                  >
                    {item.label}
                  </span>
                  {!item.ok ? (
                    <span className="text-neutral-400"> — {item.hint}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[11px] font-medium text-neutral-500">
            Scheduled feed URL
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              readOnly
              value={feedUrl}
              className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[11px] dark:border-white/10 dark:bg-white/[0.05]"
              onFocus={(e) => e.target.select()}
            />
            <div className="flex shrink-0 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
                onClick={copyFeedUrl}
              >
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
                asChild
              >
                <a href={feedUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open
                </a>
              </Button>
            </div>
          </div>
          <p className={dashboardSubtitle}>
            {isPinterest
              ? "TSV feed of eligible products. Paste into Pinterest Catalogs as a hosted data source."
              : "TSV feed of eligible products. Meta refreshes on your schedule — no manual upload."}
          </p>
        </div>

        <div className="rounded-[10px] border border-black/[0.05] px-3 py-3 dark:border-white/10">
          <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
            Feed access key
          </p>
          <p className={cn(dashboardSubtitle, "mt-1 leading-relaxed")}>
            Optional. When set,{" "}
            {isPinterest ? "Pinterest" : "Meta"} must fetch the URL that includes{" "}
            <span className="font-mono">?key=…</span>.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {link.catalogFeedToken ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
                  onClick={rotateFeedKey}
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Rotate key
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
                  onClick={clearFeedKey}
                >
                  Remove key
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
                onClick={ensureFeedKey}
              >
                Generate feed key
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`${platformId}-catalog-id`}
            className="text-[11px] font-medium text-neutral-500"
          >
            {isPinterest ? "Pinterest catalog ID" : "Meta catalog ID"}
          </Label>
          <Input
            id={`${platformId}-catalog-id`}
            value={link.catalogId ?? ""}
            onChange={(e) => onChange({ catalogId: e.target.value.trim() || null })}
            placeholder="e.g. 123456789012345"
            className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] font-mono text-[12px] dark:border-white/10 dark:bg-white/[0.05]"
          />
          <p className={dashboardSubtitle}>
            {isPinterest
              ? "From Pinterest Business → Catalogs → catalog settings."
              : "From Commerce Manager → Catalog settings."}
          </p>
        </div>

        <div className="rounded-[10px] border border-dashed border-black/[0.08] px-3 py-3 dark:border-white/10">
          <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
            {isPinterest
              ? "Connect in Pinterest Catalogs"
              : "Connect in Commerce Manager"}
          </p>
          <ol className="mt-2 space-y-1.5">
            {setupSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-2 text-[12px] leading-relaxed text-neutral-500 dark:text-neutral-400"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[10px] font-medium text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-8 rounded-md border-black/[0.06] px-2.5 text-[12px] dark:border-white/10"
            asChild
          >
            <a href={consoleUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              {consoleLabel}
            </a>
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-[10px] bg-[#F5F5F7] px-3 py-2.5 dark:bg-white/[0.05]">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            Included: active products with at least one image and Online Store
            visibility. Drafts and archived products are skipped. Sale price maps
            from compare-at when lower than price.
            {isPinterest
              ? " Pinterest Catalogs availability depends on your Business account region."
              : null}
          </p>
        </div>
      </div>
    </section>
  );
}
