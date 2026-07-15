"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  Globe,
  Hand,
  Maximize2,
  Minus,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuilderCanvasOverlay } from "@/components/website-editor/builder-canvas-overlay";
import { useCentralBuilderStore, MIN_ZOOM, MAX_ZOOM } from "@/lib/builder/central-builder-store";
import { lerp, nearlyEqual, PAN_LERP, ZOOM_LERP } from "@/lib/builder/canvas-interactions";
import type { DeviceMode } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

interface BuilderCanvasProps {
  previewPath: string;
  device: DeviceMode;
  onRefresh: () => void;
  onFullscreen?: () => void;
  loading: boolean;
  children: ReactNode;
  className?: string;
}

const CANVAS_WIDTH: Record<DeviceMode, string> = {
  desktop: "w-[min(100%,960px)]",
  tablet: "w-[768px]",
  mobile: "w-[390px]",
};

const MOMENTUM_FRICTION = 0.92;
const MOMENTUM_MIN = 0.4;

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

export function BuilderCanvas({
  previewPath,
  device,
  onRefresh,
  onFullscreen,
  loading,
  children,
  className,
}: BuilderCanvasProps) {
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastPanPoint = useRef({ x: 0, y: 0, t: 0 });
  const momentumRaf = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const [tool, setTool] = useState<"select" | "hand">("select");
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [middlePan, setMiddlePan] = useState(false);
  const [, bumpRender] = useState(0);

  const { canvas, setZoom, zoomIn, zoomOut, zoomToFit, setPan, setIsPanning, resetView } =
    useCentralBuilderStore();

  const activeTool = tool === "hand" || spaceHeld ? "hand" : "select";
  const panCapture = (activeTool === "hand" || middlePan) && !loading;
  const isPanGesture = activeTool === "hand" || middlePan;

  const renderRef = useRef({
    zoom: canvas.zoom,
    panX: canvas.panX,
    panY: canvas.panY,
  });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const target = { zoom: canvas.zoom, panX: canvas.panX, panY: canvas.panY };
      const prev = renderRef.current;

      const nextZoom = lerp(prev.zoom, target.zoom, ZOOM_LERP);
      const nextPanX = canvas.isPanning ? target.panX : lerp(prev.panX, target.panX, PAN_LERP);
      const nextPanY = canvas.isPanning ? target.panY : lerp(prev.panY, target.panY, PAN_LERP);

      renderRef.current = { zoom: nextZoom, panX: nextPanX, panY: nextPanY };

      const world = worldRef.current;
      if (world) {
        world.style.transform = `translate(${nextPanX}px, ${nextPanY}px) scale(${nextZoom})`;
      }

      const done =
        nearlyEqual(nextZoom, target.zoom) &&
        nearlyEqual(nextPanX, target.panX) &&
        nearlyEqual(nextPanY, target.panY);

      if (!done) {
        raf = requestAnimationFrame(tick);
        bumpRender((n) => n + 1);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canvas.zoom, canvas.panX, canvas.panY, canvas.isPanning]);

  const stopMomentum = useCallback(() => {
    if (momentumRaf.current) {
      cancelAnimationFrame(momentumRaf.current);
      momentumRaf.current = null;
    }
    velocity.current = { x: 0, y: 0 };
  }, []);

  const startMomentum = useCallback(() => {
    stopMomentum();
    const step = () => {
      const { x, y } = velocity.current;
      if (Math.abs(x) < MOMENTUM_MIN && Math.abs(y) < MOMENTUM_MIN) {
        momentumRaf.current = null;
        return;
      }
      useCentralBuilderStore.getState().panBy(x, y);
      velocity.current = { x: x * MOMENTUM_FRICTION, y: y * MOMENTUM_FRICTION };
      momentumRaf.current = requestAnimationFrame(step);
    };
    momentumRaf.current = requestAnimationFrame(step);
  }, [stopMomentum]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "ettajer:middle-pan") return;
      if (event.data.active) {
        stopMomentum();
        setMiddlePan(true);
        setIsPanning(true);
        if (typeof event.data.clientX === "number" && typeof event.data.clientY === "number") {
          panStart.current = {
            x: event.data.clientX,
            y: event.data.clientY,
            panX: canvas.panX,
            panY: canvas.panY,
          };
          lastPanPoint.current = {
            x: event.data.clientX,
            y: event.data.clientY,
            t: performance.now(),
          };
        }
      } else {
        if (canvas.isPanning) startMomentum();
        setMiddlePan(false);
        setIsPanning(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [canvas.isPanning, canvas.panX, canvas.panY, setIsPanning, startMomentum, stopMomentum]);

  const handleWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        stopMomentum();
        const delta = e.deltaY > 0 ? -0.06 : 0.06;
        setZoom(canvas.zoom + delta);
        return;
      }
      if (isPanGesture || e.shiftKey || e.altKey) {
        e.preventDefault();
        stopMomentum();
        useCentralBuilderStore.getState().panBy(-e.deltaX, -e.deltaY);
      }
    },
    [isPanGesture, canvas.zoom, setZoom, stopMomentum]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const middleButton = e.button === 1;
      const primaryHand = activeTool === "hand" && e.button === 0;
      if (!middleButton && !primaryHand) return;
      e.preventDefault();
      stopMomentum();
      if (middleButton) setMiddlePan(true);
      setIsPanning(true);
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: canvas.panX,
        panY: canvas.panY,
      };
      lastPanPoint.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      velocity.current = { x: 0, y: 0 };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [activeTool, canvas.panX, canvas.panY, setIsPanning, stopMomentum]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canvas.isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan(panStart.current.panX + dx, panStart.current.panY + dy);

      const now = performance.now();
      const dt = Math.max(1, now - lastPanPoint.current.t);
      velocity.current = {
        x: ((e.clientX - lastPanPoint.current.x) / dt) * 16,
        y: ((e.clientY - lastPanPoint.current.y) / dt) * 16,
      };
      lastPanPoint.current = { x: e.clientX, y: e.clientY, t: now };
    },
    [canvas.isPanning, setPan]
  );

  const handlePointerUp = useCallback(() => {
    if (canvas.isPanning) startMomentum();
    setMiddlePan(false);
    setIsPanning(false);
  }, [canvas.isPanning, setIsPanning, startMomentum]);

  useEffect(() => {
    if (!canvas.isPanning) return;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan(panStart.current.panX + dx, panStart.current.panY + dy);

      const now = performance.now();
      const dt = Math.max(1, now - lastPanPoint.current.t);
      velocity.current = {
        x: ((e.clientX - lastPanPoint.current.x) / dt) * 16,
        y: ((e.clientY - lastPanPoint.current.y) / dt) * 16,
      };
      lastPanPoint.current = { x: e.clientX, y: e.clientY, t: now };
    };

    const onUp = () => handlePointerUp();

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [canvas.isPanning, handlePointerUp, setPan]);

  const zoomLabel = `${Math.round(canvas.zoom * 100)}%`;
  const isMobileFrame = device === "mobile";

  const previewContent = (
    <div className="relative min-h-0">
      <div
        className={cn(
          "absolute inset-0 z-10 transition-opacity duration-300",
          loading ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <PreviewSkeleton device={device} />
      </div>
      {children}
      <BuilderCanvasOverlay
        panCapture={panCapture}
        scrollContainerRef={scrollContainerRef}
        viewportRef={viewportRef}
      />
    </div>
  );

  return (
    <div className={cn("flex flex-1 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <p className="truncate font-mono text-[11px] text-neutral-500">{previewPath}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7 rounded-md", activeTool === "select" && "bg-neutral-100")}
              onClick={() => setTool("select")}
              title="Select"
              aria-label="Select tool"
            >
              <MousePointer2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7 rounded-md", activeTool === "hand" && "bg-neutral-100")}
              onClick={() => setTool("hand")}
              title="Pan — hold Space + drag, or middle-click"
              aria-label="Pan tool"
            >
              <Hand className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-neutral-200 bg-white p-0.5 shadow-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-neutral-500"
              onClick={zoomOut}
              disabled={canvas.zoom <= MIN_ZOOM}
              aria-label="Zoom out"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <button
              type="button"
              className="min-w-[3rem] px-1 text-center text-[11px] font-medium text-neutral-600"
              onClick={zoomToFit}
            >
              {zoomLabel}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-neutral-500"
              onClick={zoomIn}
              disabled={canvas.zoom >= MAX_ZOOM}
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
            onClick={resetView}
            aria-label="Reset view"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md border-neutral-200"
            onClick={onRefresh}
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
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div
        ref={viewportRef}
        className={cn(
          "builder-canvas-viewport relative flex-1 overflow-hidden rounded-xl border border-neutral-200/80",
          isPanGesture && "cursor-grab",
          canvas.isPanning && "cursor-grabbing"
        )}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={(e) => {
          if (isPanGesture) e.preventDefault();
        }}
      >
        <div ref={scrollContainerRef} className="builder-canvas-infinite absolute inset-0 overflow-auto">
          <div
            ref={worldRef}
            className="builder-canvas-world relative flex min-h-[calc(100%+6rem)] min-w-[calc(100%+6rem)] items-start justify-center p-10 sm:p-12"
            style={{
              transform: `translate(${canvas.panX}px, ${canvas.panY}px) scale(${canvas.zoom})`,
              transformOrigin: "center top",
              willChange: "transform",
            }}
          >
            <div className={cn("relative shrink-0", CANVAS_WIDTH[device])}>
              {!isMobileFrame ? (
                <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-[0_12px_40px_-16px_rgba(15,23,42,0.22)]">
                  <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/90 px-3 py-2">
                    <div className="flex shrink-0 gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="mx-auto flex min-w-0 max-w-[14rem] flex-1 justify-center rounded-md bg-white px-3 py-1 sm:max-w-xs">
                      <span className="truncate font-mono text-[10px] text-neutral-400">{previewPath}</span>
                    </div>
                    <div className="w-[52px] shrink-0" aria-hidden />
                  </div>
                  <div className="builder-preview-frame overflow-hidden">
                    {previewContent}
                  </div>
                </div>
              ) : (
                <div className="rounded-[2.5rem] border-[10px] border-neutral-800 bg-neutral-800 p-1 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)]">
                  <div className="relative overflow-hidden rounded-[2rem] bg-white">
                    <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-800" />
                    <div className="relative aspect-[9/19] min-h-[560px]">
                      <div
                        className={cn(
                          "absolute inset-0 z-10 pt-6 transition-opacity duration-300",
                          loading ? "opacity-100" : "pointer-events-none opacity-0"
                        )}
                      >
                        <PreviewSkeleton device="mobile" />
                      </div>
                      <div className="h-full w-full pt-6">{previewContent}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-neutral-200/80 bg-white/90 px-2 py-1 text-[10px] text-neutral-500 shadow-sm backdrop-blur-sm">
          {isPanGesture ? "Panning" : "Select"} · Ctrl+scroll zoom · Shift/Alt+scroll pan · Space/middle-click pan
        </div>
      </div>
    </div>
  );
}

export function BuilderCanvasIframe({
  iframeRef,
  refreshKey,
  previewUrl,
  onLoad,
}: {
  iframeRef: RefObject<HTMLIFrameElement>;
  refreshKey: number;
  previewUrl: string;
  onLoad: () => void;
}) {
  const [debouncedUrl, setDebouncedUrl] = useState(previewUrl);
  const lastAppliedUrl = useRef(previewUrl);
  const drag = useCentralBuilderStore((s) => s.drag);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedUrl(previewUrl), 300);
    return () => window.clearTimeout(timer);
  }, [previewUrl]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (debouncedUrl === lastAppliedUrl.current) return;
    lastAppliedUrl.current = debouncedUrl;
    iframe.src = debouncedUrl;
  }, [debouncedUrl, iframeRef, refreshKey]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      {
        type: "ettajer:drag-block",
        blockId: drag.blockId,
        blockName: drag.blockName,
        active: drag.active,
      },
      "*"
    );
  }, [drag.active, drag.blockId, drag.blockName, iframeRef, refreshKey]);

  return (
    <iframe
      ref={iframeRef}
      key={`builder-frame-${refreshKey}`}
      src={debouncedUrl}
      title="Website preview"
      className="block h-[min(72vh,900px)] min-h-[480px] w-full border-0 bg-white"
      onLoad={onLoad}
    />
  );
}
