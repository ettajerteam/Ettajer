"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildPreviewUrl, type PreviewPage, type PreviewPaths } from "@/lib/preview-engine";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { StoreThemeSettings } from "@/types/storefront";
import type { HomeLayout } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

interface ThemeDevicePreviewProps {
  storeSlug: string;
  draft: StoreThemeSettings;
  previewPaths?: PreviewPaths;
  refreshKey?: number;
  onFullscreen?: () => void;
  embedded?: boolean;
  homeLayout?: HomeLayout | null;
  selectedSectionId?: string | null;
}

const PREVIEW_PAGES: { id: PreviewPage; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "product", label: "Product" },
  { id: "category", label: "Category" },
  { id: "collection", label: "Collection" },
];

function PreviewSkeleton() {
  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-neutral-200/80 px-3 py-2.5 dark:border-white/10">
          <div className="premium-skeleton h-2 w-16" />
          <div className="premium-skeleton h-2 w-12" />
          <div className="premium-skeleton ml-auto h-2 w-8" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="premium-skeleton h-1/3 w-full" />
          <div className="grid flex-1 grid-cols-3 gap-2">
            <div className="premium-skeleton h-full" />
            <div className="premium-skeleton h-full" />
            <div className="premium-skeleton h-full" />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5" />
    </div>
  );
}

export function ThemeDevicePreview({
  storeSlug,
  draft,
  previewPaths,
  refreshKey = 0,
  onFullscreen,
  embedded = false,
  homeLayout,
}: ThemeDevicePreviewProps) {
  const [loadingDesktop, setLoadingDesktop] = useState(true);
  const [loadingMobile, setLoadingMobile] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [page, setPage] = useState<PreviewPage>("home");

  const previewUrl = useMemo(
    () => buildPreviewUrl(storeSlug, draft, page, previewPaths, page === "home" ? homeLayout : null),
    [storeSlug, draft, page, previewPaths, homeLayout]
  );

  const [debouncedUrl, setDebouncedUrl] = useState(previewUrl);

  const accent = draft.primaryColor ?? "#007AFF";
  const secondary = draft.secondaryColor ?? "#111111";
  const isLoading = loadingDesktop || loadingMobile;
  const activePageLabel = PREVIEW_PAGES.find((p) => p.id === page)?.label ?? "Home";

  const handleRefresh = useCallback(() => {
    setLoadingDesktop(true);
    setLoadingMobile(true);
    setIframeKey((k) => k + 1);
  }, []);

  useEffect(() => {
    setLoadingDesktop(true);
    setLoadingMobile(true);
    const timer = window.setTimeout(() => setDebouncedUrl(previewUrl), 350);
    return () => window.clearTimeout(timer);
  }, [previewUrl]);

  useEffect(() => {
    setLoadingDesktop(true);
    setLoadingMobile(true);
  }, [refreshKey]);

  function pageAvailable(p: PreviewPage) {
    if (p === "home") return true;
    if (p === "product") return !!previewPaths?.product;
    if (p === "category") return !!previewPaths?.category;
    if (p === "collection") return !!previewPaths?.collection;
    return false;
  }

  return (
    <section
      className={cn(
        embedded ? "relative" : dashboardCard,
        "overflow-hidden",
        !embedded && "relative"
      )}
    >
      <div
        className={cn(
          dashboardCardPad,
          "relative border-b border-border/60",
          embedded && "border-b border-border/50 pb-3"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(ellipse 70% 80% at 0% 0%, ${accent}18, transparent 55%), radial-gradient(ellipse 50% 60% at 100% 0%, ${secondary}12, transparent 50%)`,
          }}
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={dashboardKicker}>Live preview</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-emerald-500",
                    isLoading ? "animate-pulse" : "animate-[pulse_2.5s_ease-in-out_infinite]"
                  )}
                />
                {isLoading ? "Syncing" : "Live"}
              </span>
            </div>
            <h2 className={cn("mt-1.5", dashboardTitle)}>Your storefront</h2>
            <p className={cn("mt-1 max-w-md", dashboardSubtitle)}>
              Desktop and mobile — exactly how customers will see your store on{" "}
              <span className="font-medium text-foreground">{activePageLabel}</span>.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Brand
              </span>
              <span
                className="h-5 w-5 rounded-full border border-white/20 shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: accent }}
                title="Primary color"
              />
              <span
                className="h-5 w-5 rounded-full border border-white/20 shadow-sm ring-1 ring-black/5"
                style={{ backgroundColor: secondary }}
                title="Secondary color"
              />
              <span className="rounded-md bg-muted/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {draft.font ?? "Inter"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <div className={cn(dashboardPillGroup, "flex-wrap")}>
              {PREVIEW_PAGES.map((p) => {
                const available = pageAvailable(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!available}
                    onClick={() => setPage(p.id)}
                    className={cn(
                      dashboardPill,
                      page === p.id
                        ? cn(dashboardPillActive, "premium-glow-blue bg-[#007AFF] text-white ring-0")
                        : available
                          ? dashboardPillInactive
                          : "cursor-not-allowed text-muted-foreground/35"
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="premium-card flex items-center gap-0.5 p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={handleRefresh}
                title="Refresh preview"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              </Button>
              {onFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={onFullscreen}
                  title="Fullscreen"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 rounded-lg px-2.5" asChild>
                <Link href={debouncedUrl} target="_blank">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open store
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden",
          embedded ? "px-2 pb-5 pt-4 sm:px-4" : "px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 120%, ${accent}14, transparent 55%)`,
          }}
        />

        <div className="relative mx-auto w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="relative"
          >
            {/* Desktop — CSS frame, no image assets */}
            <div className="overflow-hidden rounded-2xl border border-zinc-700/80 bg-gradient-to-b from-zinc-700 to-zinc-900 p-2 shadow-[0_28px_56px_-20px_rgba(15,23,42,0.45)] ring-1 ring-black/20 dark:from-zinc-800 dark:to-zinc-950">
              <div className="flex items-center gap-2 px-2 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-[10px] font-medium text-zinc-400">Desktop</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-white ring-1 ring-black/10">
                {loadingDesktop && <PreviewSkeleton />}
                <iframe
                  key={`desktop-${refreshKey}-${iframeKey}-${debouncedUrl}`}
                  src={debouncedUrl}
                  title="Desktop store preview"
                  className="absolute inset-0 h-full w-full border-0"
                  onLoad={() => setLoadingDesktop(false)}
                />
              </div>
              <div className="mx-auto mt-3 h-1.5 w-28 rounded-full bg-zinc-600/80" />
            </div>

            {/* Phone — smaller, above desktop, CSS frame + shadow */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
              className="absolute z-30 right-[5%] bottom-[14%] w-[26%] min-w-[100px] max-w-[132px] sm:right-[7%] sm:bottom-[16%] sm:max-w-[148px]"
            >
              <div className="overflow-hidden rounded-[1.75rem] border-[3px] border-zinc-700 bg-zinc-900 p-1 shadow-[0_24px_48px_-6px_rgba(0,0,0,0.65)] ring-1 ring-white/10 dark:border-zinc-600">
                <div className="mx-auto mb-1 mt-0.5 h-3 w-12 rounded-full bg-zinc-950" />
                <div className="relative aspect-[9/19] overflow-hidden rounded-[1.25rem] bg-white">
                  {loadingMobile && <PreviewSkeleton />}
                  <iframe
                    key={`mobile-${refreshKey}-${iframeKey}-${debouncedUrl}`}
                    src={debouncedUrl}
                    title="Mobile store preview"
                    className="absolute inset-0 h-full w-full border-0"
                    onLoad={() => setLoadingMobile(false)}
                  />
                </div>
                <div className="mx-auto mb-0.5 mt-1 h-0.5 w-10 rounded-full bg-zinc-500" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
