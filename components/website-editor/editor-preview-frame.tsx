"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Globe, Maximize2, Minus, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeviceMode } from "@/lib/builder/types";

const ZOOM_LEVELS = [0.5, 0.75, 1] as const;
type ZoomLevel = (typeof ZOOM_LEVELS)[number] | "fit";

interface EditorPreviewFrameProps {
  previewUrl: string;
  previewPath: string;
  refreshKey: number;
  device: DeviceMode;
  iframeRef: RefObject<HTMLIFrameElement>;
  onRefresh: () => void;
  onFullscreen?: () => void;
  className?: string;
}

function PreviewSkeleton({ device }: { device: DeviceMode }) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="editor-shimmer h-8 w-2/5 rounded-lg" />
      <div className="editor-shimmer h-32 flex-1 rounded-lg" />
      <div className="grid grid-cols-3 gap-2">
        <div className="editor-shimmer h-16 rounded-lg" />
        <div className="editor-shimmer h-16 rounded-lg" />
        <div className="editor-shimmer h-16 rounded-lg" />
      </div>
      {device === "desktop" && <div className="editor-shimmer h-20 rounded-lg" />}
    </div>
  );
}

export function EditorPreviewFrame({
  previewUrl,
  previewPath,
  refreshKey,
  device,
  iframeRef,
  onRefresh,
  onFullscreen,
  className,
}: EditorPreviewFrameProps) {
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  const [debouncedUrl, setDebouncedUrl] = useState(previewUrl);
  const lastAppliedUrl = useRef(previewUrl);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setDebouncedUrl(previewUrl), 300);
    return () => window.clearTimeout(timer);
  }, [previewUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (debouncedUrl === lastAppliedUrl.current) return;
    lastAppliedUrl.current = debouncedUrl;
    iframe.src = debouncedUrl;
    setLoading(true);
  }, [debouncedUrl, iframeRef]);

  useEffect(() => {
    setLoading(true);
  }, [refreshKey]);

  const cycleZoom = useCallback((direction: "in" | "out") => {
    setZoom((current) => {
      if (current === "fit") return 1;
      const idx = ZOOM_LEVELS.indexOf(current);
      if (direction === "in") {
        return idx < ZOOM_LEVELS.length - 1 ? ZOOM_LEVELS[idx + 1] : current;
      }
      return idx > 0 ? ZOOM_LEVELS[idx - 1] : current;
    });
  }, []);

  const scale = zoom === "fit" ? 1 : zoom;
  const zoomLabel = zoom === "fit" ? "Fit" : `${Math.round(zoom * 100)}%`;

  return (
    <div className={cn("flex flex-1 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <p className="truncate font-mono text-[11px] text-neutral-500">{previewPath}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-neutral-500"
              onClick={() => cycleZoom("out")}
              disabled={zoom !== "fit" && zoom === ZOOM_LEVELS[0]}
              title="Zoom out"
              aria-label="Zoom out"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <button
              type="button"
              className="min-w-[3rem] px-1 text-center text-[11px] font-medium text-neutral-600"
              onClick={() => setZoom((z) => (z === "fit" ? 1 : "fit"))}
              title="Toggle fit to screen"
            >
              {zoomLabel}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-neutral-500"
              onClick={() => cycleZoom("in")}
              disabled={zoom !== "fit" && zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              title="Zoom in"
              aria-label="Zoom in"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md border-neutral-200"
            onClick={onRefresh}
            title="Refresh preview"
            aria-label="Refresh preview"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
          {onFullscreen && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-md border-neutral-200"
              onClick={onFullscreen}
              title="Fullscreen preview"
              aria-label="Fullscreen preview"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="editor-canvas-grid relative flex flex-1 items-start justify-center overflow-auto rounded-xl p-4 sm:p-6">
        <div
          className={cn(
            "relative transition-all duration-300",
            device === "mobile" ? "w-full max-w-[390px]" : device === "tablet" ? "w-full max-w-[768px]" : "w-full max-w-full flex-1"
          )}
        >
          {device !== "mobile" ? (
            <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/90 px-3 py-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="mx-auto flex min-w-0 max-w-xs flex-1 items-center justify-center rounded-md bg-white px-3 py-1">
                  <span className="truncate font-mono text-[10px] text-neutral-400">{previewPath}</span>
                </div>
              </div>
              <div className="relative min-h-[480px]">
                <div
                  className={cn(
                    "absolute inset-0 z-10 transition-opacity duration-300",
                    loading ? "opacity-100" : "pointer-events-none opacity-0"
                  )}
                >
                  <PreviewSkeleton device="desktop" />
                </div>
                <div
                  className="origin-top transition-transform duration-200"
                  style={{ transform: zoom === "fit" ? undefined : `scale(${scale})` }}
                >
                  <iframe
                    ref={iframeRef}
                    key={`editor-frame-${refreshKey}`}
                    src={debouncedUrl}
                    title="Website preview"
                    className="min-h-[480px] w-full border-0 bg-white"
                    onLoad={() => setLoading(false)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[2.5rem] border-[10px] border-neutral-800 bg-neutral-800 p-1 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)]">
              <div className="relative overflow-hidden rounded-[2rem] bg-white">
                <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-800" />
                <div className="relative aspect-[9/19] min-h-[520px]">
                  <div
                    className={cn(
                      "absolute inset-0 z-10 pt-6 transition-opacity duration-300",
                      loading ? "opacity-100" : "pointer-events-none opacity-0"
                    )}
                  >
                    <PreviewSkeleton device="mobile" />
                  </div>
                  <div
                    className="h-full w-full origin-top pt-6 transition-transform duration-200"
                    style={{ transform: zoom === "fit" ? undefined : `scale(${scale})` }}
                  >
                    <iframe
                      ref={iframeRef}
                      key={`editor-frame-${refreshKey}`}
                      src={debouncedUrl}
                      title="Website preview"
                      className="h-full w-full border-0 bg-white"
                      onLoad={() => setLoading(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
