"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Maximize2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditorPreviewSkeleton } from "@/components/website-editor/editor-skeleton";
import { buildPreviewUrl, type PreviewPage, type PreviewPaths } from "@/lib/preview-engine";
import {
  dashboardCard,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
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

const STAGE_H = 380;
const MOBILE_W = 390;
const MOBILE_H = 844;
const PHONE_FRAME_W = 132;

const textBtn =
  "h-7 rounded-md px-2 text-[11px] font-medium text-neutral-500 hover:bg-transparent hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white";

function PreviewSkeleton() {
  return (
    <div className="absolute inset-0 z-20 overflow-hidden bg-white">
      <EditorPreviewSkeleton device="desktop" className="h-full min-h-full" />
    </div>
  );
}

function ScaledPhoneIframe({
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
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        setScale(Math.min(w / MOBILE_W, h / MOBILE_H));
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={shellRef} className="relative h-full w-full overflow-hidden bg-white">
      {loading ? <PreviewSkeleton /> : null}
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: MOBILE_W,
          height: MOBILE_H,
          transform: `scale(${scale})`,
        }}
      >
        <iframe
          key={iframeKey}
          src={src}
          title="Mobile store preview"
          className="pointer-events-none h-full w-full border-0 bg-white"
          style={{ width: MOBILE_W, height: MOBILE_H }}
          scrolling="no"
          onLoad={onLoad}
        />
      </div>
    </div>
  );
}

/** Fixed dual preview: desktop ~half + small phone beside — no stage scroll. */
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
        "desktop"
      ),
    [storeSlug, draft, page, previewPaths, homeLayout]
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
        "mobile"
      ),
    [storeSlug, draft, page, previewPaths, homeLayout]
  );

  const [debouncedDesktop, setDebouncedDesktop] = useState(desktopUrl);
  const [debouncedMobile, setDebouncedMobile] = useState(mobileUrl);
  const loading = loadingDesktop || loadingMobile;

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
    }, 280);
    return () => window.clearTimeout(timer);
  }, [desktopUrl, mobileUrl]);

  useEffect(() => {
    setLoadingDesktop(true);
    setLoadingMobile(true);
  }, [refreshKey]);

  function pageAvailable(p: PreviewPage) {
    if (p === "category") return !!previewPaths?.category;
    return true;
  }

  return (
    <section
      className={cn(
        embedded ? "relative" : dashboardCard,
        "overflow-hidden font-[family-name:var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif]"
      )}
    >
      <div className="flex flex-col gap-2 border-b border-black/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div className="flex items-center gap-2">
          <h2 className={dashboardTitle}>Preview</h2>
          <span className="text-[10px] text-neutral-400">{loading ? "Updating…" : "Ready"}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className={dashboardPillGroup}>
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
                      ? dashboardPillActive
                      : available
                        ? dashboardPillInactive
                        : "cursor-not-allowed text-neutral-300"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md text-neutral-500"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
          {onFullscreen ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-neutral-500"
              onClick={onFullscreen}
              title="Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          <Button variant="ghost" className={textBtn} asChild>
            <Link href={debouncedDesktop} target="_blank">
              <ExternalLink className="mr-1 h-3 w-3" />
              Open
            </Link>
          </Button>
        </div>
      </div>

      {/* Fixed stage — no scroll */}
      <div
        className="flex items-center justify-center gap-4 overflow-hidden bg-[#F5F5F7] px-4 py-4 dark:bg-white/[0.02] sm:gap-5 sm:px-6"
        style={{ height: STAGE_H }}
      >
        {/* Desktop ~ half */}
        <div
          className="relative h-full min-w-0 flex-1 overflow-hidden rounded-[10px] border border-black/[0.06] bg-white dark:border-white/10"
          style={{ maxWidth: "65%" }}
        >
          <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-black/[0.05] bg-[#FAFAFA] px-2.5 dark:border-white/10 dark:bg-white/[0.04]">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            <span className="ml-1 truncate font-mono text-[10px] text-neutral-400">
              /store/{storeSlug}
            </span>
          </div>
          <div className="relative overflow-hidden" style={{ height: `calc(100% - 1.75rem)` }}>
            {loadingDesktop ? <PreviewSkeleton /> : null}
            <iframe
              key={`d-${refreshKey}-${iframeKey}-${debouncedDesktop}`}
              src={debouncedDesktop}
              title="Desktop store preview"
              className="absolute inset-0 h-full w-full border-0"
              scrolling="no"
              onLoad={() => setLoadingDesktop(false)}
            />
          </div>
        </div>

        {/* Small phone */}
        <div
          className="relative h-full shrink-0 overflow-hidden rounded-[18px] border-[3px] border-neutral-800 bg-neutral-900 shadow-sm"
          style={{ width: PHONE_FRAME_W }}
        >
          <div className="absolute left-1/2 top-1.5 z-10 h-1 w-8 -translate-x-1/2 rounded-full bg-neutral-700" />
          <div className="h-full overflow-hidden rounded-[14px] bg-white pt-3">
            <ScaledPhoneIframe
              src={debouncedMobile}
              iframeKey={`m-${refreshKey}-${iframeKey}-${debouncedMobile}`}
              loading={loadingMobile}
              onLoad={() => setLoadingMobile(false)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
