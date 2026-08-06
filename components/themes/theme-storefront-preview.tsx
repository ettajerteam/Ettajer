"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorPreviewSkeleton } from "@/components/website-editor/editor-skeleton";
import { buildPreviewUrl, type PreviewPaths } from "@/lib/preview-engine";
import { dashboardCard } from "@/lib/dashboard-ui";
import type { StoreThemeSettings } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface ThemeStorefrontPreviewProps {
  storeSlug: string;
  draft: StoreThemeSettings;
  previewPaths?: PreviewPaths;
  refreshKey?: number;
}

/** Landscape desktop + phone on the right half, bottoms aligned. */
const DESKTOP_W = 560;
const DESKTOP_H = 300;
const MOBILE_W = 390;
const MOBILE_H = 844;
const PHONE_FRAME_W = 118;
const PHONE_FRAME_H = 228;
const STAGE_H = DESKTOP_H + 48;

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
  const [layout, setLayout] = useState({ scale: 0.28, x: 0, y: 0 });

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        const scale = Math.max(w / MOBILE_W, h / MOBILE_H);
        setLayout({
          scale,
          x: (w - MOBILE_W * scale) / 2,
          y: (h - MOBILE_H * scale) / 2,
        });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={shellRef} className="absolute inset-0 overflow-hidden bg-white">
      {loading ? <PreviewSkeleton /> : null}
      <div
        className="absolute origin-top-left"
        style={{
          left: layout.x,
          top: layout.y,
          width: MOBILE_W,
          height: MOBILE_H,
          transform: `scale(${layout.scale})`,
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

export function ThemeStorefrontPreview({
  storeSlug,
  draft,
  previewPaths,
  refreshKey = 0,
}: ThemeStorefrontPreviewProps) {
  const [loadingDesktop, setLoadingDesktop] = useState(true);
  const [loadingMobile, setLoadingMobile] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const accent = draft.primaryColor ?? "#007AFF";

  const desktopUrl = useMemo(
    () =>
      buildPreviewUrl(storeSlug, draft, "home", previewPaths, null, null, "desktop"),
    [storeSlug, draft, previewPaths]
  );

  const mobileUrl = useMemo(
    () =>
      buildPreviewUrl(storeSlug, draft, "home", previewPaths, null, null, "mobile"),
    [storeSlug, draft, previewPaths]
  );

  const [debouncedDesktop, setDebouncedDesktop] = useState(desktopUrl);
  const [debouncedMobile, setDebouncedMobile] = useState(mobileUrl);

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
    setIframeKey((k) => k + 1);
  }, [refreshKey]);

  const stageWidth = DESKTOP_W + Math.round(PHONE_FRAME_W * 0.35);
  const stageInnerH = DESKTOP_H;

  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div
        className="relative flex items-center justify-center overflow-hidden px-4 py-5"
        style={{
          height: STAGE_H,
          background: `
            radial-gradient(ellipse 55% 50% at 50% 55%, ${accent}12 0%, transparent 65%),
            linear-gradient(180deg, #F5F5F7 0%, #EEEEF0 100%)
          `,
        }}
      >
        <div
          className="relative"
          style={{ width: stageWidth, height: stageInnerH }}
        >
          <div
            className="pointer-events-none absolute bottom-0 left-[10%] right-[18%] h-5 rounded-[100%] bg-black/10 blur-lg dark:bg-black/25"
            aria-hidden
          />

          <div
            className="absolute bottom-0 left-0 z-0 overflow-hidden rounded-[12px] border border-black/[0.08] bg-white shadow-[0_16px_36px_-20px_rgba(15,23,42,0.4)] ring-1 ring-black/[0.03] dark:border-white/10 dark:ring-white/5"
            style={{ width: DESKTOP_W, height: DESKTOP_H }}
          >
            <div className="flex h-7 shrink-0 items-center gap-2 border-b border-black/[0.05] bg-[#FAFAFA] px-2.5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                <span className="h-2 w-2 rounded-full bg-[#28C840]" />
              </div>
              <div className="mx-auto flex h-5 min-w-0 flex-1 items-center justify-center rounded-md bg-white px-2 ring-1 ring-black/[0.06] dark:bg-white/[0.06] dark:ring-white/10">
                <span className="truncate font-mono text-[10px] text-neutral-400">
                  /store/{storeSlug}
                </span>
              </div>
            </div>
            <div className="relative overflow-hidden" style={{ height: "calc(100% - 1.75rem)" }}>
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

          <div
            className="absolute z-10"
            style={{
              width: PHONE_FRAME_W,
              height: PHONE_FRAME_H,
              bottom: 0,
              right: 0,
            }}
          >
            <div
              className="pointer-events-none absolute -inset-3 -z-10 rounded-full opacity-40 blur-xl"
              style={{ background: `${accent}30` }}
              aria-hidden
            />
            <div className="absolute -left-[2px] top-[18%] h-4 w-[2px] rounded-l-sm bg-neutral-700" />
            <div className="absolute -left-[2px] top-[28%] h-7 w-[2px] rounded-l-sm bg-neutral-700" />
            <div className="absolute -right-[2px] top-[30%] h-9 w-[2px] rounded-r-sm bg-neutral-700" />

            <div className="relative h-full overflow-hidden rounded-[20px] border-[3px] border-neutral-900 bg-neutral-950 shadow-[0_20px_40px_-14px_rgba(0,0,0,0.5)]">
              <div className="absolute left-1/2 top-1.5 z-20 flex -translate-x-1/2">
                <div className="flex h-3 w-12 items-center justify-end rounded-full bg-black px-1 ring-1 ring-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-800 ring-1 ring-neutral-600" />
                </div>
              </div>
              <div className="relative h-full overflow-hidden rounded-[16px] bg-white">
                <ScaledPhoneIframe
                  src={debouncedMobile}
                  iframeKey={`m-${refreshKey}-${iframeKey}-${debouncedMobile}`}
                  loading={loadingMobile}
                  onLoad={() => setLoadingMobile(false)}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-1 z-20 flex justify-center">
                  <span className="h-0.5 w-10 rounded-full bg-neutral-900/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
