"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditorPreviewSkeleton } from "@/components/website-editor/editor-skeleton";
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

const MOBILE_VIEWPORT_W = 390;
const MOBILE_VIEWPORT_H = 844;

function PreviewSkeleton({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-20 overflow-hidden",
        tone === "dark" ? "bg-neutral-950" : "bg-white"
      )}
    >
      <EditorPreviewSkeleton device="desktop" className="h-full min-h-full" />
    </div>
  );
}

function ScaledMobileIframe({
  src,
  iframeKey,
  onLoad,
  loading,
}: {
  src: string;
  iframeKey: string;
  onLoad: () => void;
  loading: boolean;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / MOBILE_VIEWPORT_W);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={shellRef} className="relative h-full w-full overflow-hidden bg-white">
      {loading && <PreviewSkeleton />}
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: MOBILE_VIEWPORT_W,
          height: MOBILE_VIEWPORT_H,
          transform: `scale(${scale})`,
        }}
      >
        <iframe
          key={iframeKey}
          src={src}
          title="Mobile store preview"
          className="h-full w-full border-0 bg-white"
          style={{ width: MOBILE_VIEWPORT_W, height: MOBILE_VIEWPORT_H }}
          onLoad={onLoad}
        />
      </div>
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

  const desktopUrl = useMemo(
    () =>
      buildPreviewUrl(
        storeSlug,
        draft,
        page,
        previewPaths,
        page === "home" ? homeLayout : null,
        null,
        "desktop",
      ),
    [storeSlug, draft, page, previewPaths, homeLayout],
  );

  const mobileUrl = useMemo(
    () =>
      buildPreviewUrl(
        storeSlug,
        draft,
        page,
        previewPaths,
        page === "home" ? homeLayout : null,
        null,
        "mobile",
      ),
    [storeSlug, draft, page, previewPaths, homeLayout],
  );

  const [debouncedDesktop, setDebouncedDesktop] = useState(desktopUrl);
  const [debouncedMobile, setDebouncedMobile] = useState(mobileUrl);

  const accent = draft.primaryColor ?? "#007AFF";
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
    const timer = window.setTimeout(() => {
      setDebouncedDesktop(desktopUrl);
      setDebouncedMobile(mobileUrl);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [desktopUrl, mobileUrl]);

  useEffect(() => {
    setLoadingDesktop(true);
    setLoadingMobile(true);
  }, [refreshKey]);

  function pageAvailable(p: PreviewPage) {
    if (p === "home") return true;
    if (p === "product") return true;
    if (p === "category") return !!previewPaths?.category;
    if (p === "collection") return true;
    return false;
  }

  return (
    <section
      className={cn(
        embedded ? "relative" : dashboardCard,
        "overflow-hidden",
        !embedded && "relative",
      )}
    >
      <div
        className={cn(
          dashboardCardPad,
          "relative border-b border-neutral-100",
          embedded && "pb-3",
        )}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={dashboardKicker}>Preview</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
                  isLoading
                    ? "bg-neutral-100 text-neutral-600"
                    : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isLoading ? "animate-pulse bg-neutral-400" : "bg-emerald-500",
                  )}
                />
                {isLoading ? "Updating" : "Ready"}
              </span>
            </div>
            <h2 className={cn(dashboardTitle, "mt-1")}>
              Desktop & mobile · {activePageLabel}
            </h2>
            <p className={cn(dashboardSubtitle, "mt-0.5")}>
              How customers see this page before you publish.
            </p>
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
                        ? cn(dashboardPillActive, "bg-neutral-900 text-white ring-0")
                        : available
                          ? dashboardPillInactive
                          : "cursor-not-allowed text-muted-foreground/35",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={handleRefresh}
                title="Refresh preview"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              </Button>
              {onFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={onFullscreen}
                  title="Fullscreen"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-8 rounded-md px-2.5" asChild>
                <Link href={debouncedDesktop} target="_blank">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Open
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 rounded-md px-2.5" asChild>
                <Link href={`/store/${storeSlug}`} target="_blank" rel="noopener noreferrer">
                  Live
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden bg-neutral-100",
          embedded ? "px-2 pb-6 pt-5 sm:px-4" : "px-4 pb-8 pt-6 sm:px-6 sm:pb-10 sm:pt-8",
        )}
      >

        <div className="relative mx-auto w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="relative"
          >
            {/* —— Laptop —— */}
            <div className="relative mx-auto w-full">
              {/* Lid */}
              <div className="relative overflow-hidden rounded-t-2xl border border-neutral-700/80 bg-gradient-to-b from-neutral-600 via-neutral-800 to-neutral-900 p-[10px] shadow-[0_40px_80px_-28px_rgba(15,23,42,0.55)] ring-1 ring-white/10 sm:rounded-t-[1.35rem] sm:p-3">
                {/* Camera notch */}
                <div className="absolute left-1/2 top-1.5 z-20 flex -translate-x-1/2 items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-950 ring-1 ring-neutral-600/80" />
                </div>

                {/* Browser chrome */}
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-neutral-950/40 px-2.5 py-1.5 ring-1 ring-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.25)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.25)]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[inset_0_-1px_1px_rgba(0,0,0,0.25)]" />
                  </div>
                  <div className="mx-auto flex min-w-0 max-w-md flex-1 items-center justify-center gap-1.5 rounded-md bg-neutral-800/90 px-3 py-1 ring-1 ring-white/5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/90" />
                    <span className="truncate font-mono text-[10px] text-neutral-400">
                      ettajer.com/store/{storeSlug}
                    </span>
                  </div>
                  <span className="hidden text-[9px] font-medium uppercase tracking-wider text-neutral-500 sm:inline">
                    Desktop
                  </span>
                </div>

                {/* Screen */}
                <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]">
                  {loadingDesktop && <PreviewSkeleton />}
                  <iframe
                    key={`desktop-${refreshKey}-${iframeKey}-${debouncedDesktop}`}
                    src={debouncedDesktop}
                    title="Desktop store preview"
                    className="absolute inset-0 h-full w-full border-0"
                    onLoad={() => setLoadingDesktop(false)}
                  />
                  {/* Glass glare */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
                </div>
              </div>

              {/* Hinge */}
              <div className="relative h-2.5 bg-gradient-to-b from-neutral-700 to-neutral-800">
                <div className="absolute inset-x-[18%] top-0 h-px bg-white/10" />
                <div className="absolute inset-x-[22%] bottom-0 h-px bg-black/40" />
              </div>

              {/* Base / palm rest */}
              <div className="relative mx-auto w-[108%] -translate-x-[3.7%]">
                <div className="h-3 rounded-b-xl bg-gradient-to-b from-neutral-700 via-neutral-800 to-neutral-900 shadow-[0_18px_36px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/30">
                  <div className="mx-auto h-full w-[18%] max-w-[120px] rounded-b-md bg-gradient-to-b from-neutral-600/40 to-transparent" />
                </div>
                {/* Desk reflection */}
                <div className="mx-auto mt-1 h-6 w-[92%] rounded-[100%] bg-black/20 blur-xl" />
              </div>
            </div>

            {/* —— Phone —— */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              className="absolute bottom-[6%] right-[2%] z-30 w-[30%] min-w-[118px] max-w-[168px] sm:right-[4%] sm:bottom-[8%] sm:max-w-[190px] lg:right-[6%] lg:max-w-[210px]"
            >
              {/* Soft phone glow */}
              <div
                className="pointer-events-none absolute -inset-6 -z-10 rounded-full blur-2xl"
                style={{ background: `${accent}33` }}
              />

              <div className="relative">
                {/* Side buttons */}
                <div className="absolute -left-[3px] top-[18%] h-7 w-[3px] rounded-l-sm bg-neutral-700" />
                <div className="absolute -left-[3px] top-[28%] h-10 w-[3px] rounded-l-sm bg-neutral-700" />
                <div className="absolute -left-[3px] top-[42%] h-10 w-[3px] rounded-l-sm bg-neutral-700" />
                <div className="absolute -right-[3px] top-[30%] h-14 w-[3px] rounded-r-sm bg-neutral-700" />

                {/* Body */}
                <div className="overflow-hidden rounded-[2rem] border-[3px] border-neutral-800 bg-neutral-950 p-[5px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] sm:rounded-[2.25rem] sm:border-[4px] sm:p-1.5">
                  {/* Inner bezel */}
                  <div className="relative overflow-hidden rounded-[1.55rem] bg-black sm:rounded-[1.75rem]">
                    {/* Dynamic Island */}
                    <div className="absolute left-1/2 top-2 z-30 flex -translate-x-1/2 items-center justify-center">
                      <div className="flex h-[18px] w-[72px] items-center justify-end rounded-full bg-black px-1.5 ring-1 ring-white/5 sm:h-5 sm:w-[84px]">
                        <span className="h-2 w-2 rounded-full bg-neutral-900 ring-1 ring-neutral-700" />
                      </div>
                    </div>

                    {/* Screen */}
                    <div className="relative aspect-[9/19.5] overflow-hidden bg-white">
                      <ScaledMobileIframe
                        src={debouncedMobile}
                        iframeKey={`mobile-${refreshKey}-${iframeKey}-${debouncedMobile}`}
                        loading={loadingMobile}
                        onLoad={() => setLoadingMobile(false)}
                      />
                      {/* Status / home fade */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8 bg-gradient-to-b from-black/20 to-transparent" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-20 flex justify-center">
                        <span className="h-1 w-16 rounded-full bg-neutral-900/80 sm:w-20" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone label */}
                <p className="mt-2 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Mobile
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
