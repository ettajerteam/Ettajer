"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "lucide-react";
import { getBlock } from "@/lib/builder/block-registry";
import { useCentralBuilderStore } from "@/lib/builder/central-builder-store";
import { autoScrollStep, canvasEdgePanStep } from "@/lib/builder/canvas-interactions";
import { cn } from "@/lib/utils";

interface BuilderCanvasOverlayProps {
  panCapture: boolean;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

/** Parent-side overlay: drag ghost, pan capture over iframe, edge auto-scroll */
export function BuilderCanvasOverlay({
  panCapture,
  scrollContainerRef,
  viewportRef,
}: BuilderCanvasOverlayProps) {
  const drag = useCentralBuilderStore((s) => s.drag);
  const canvas = useCentralBuilderStore((s) => s.canvas);
  const { setPan, setIsPanning, panBy } = useCentralBuilderStore();

  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const autoScrollRaf = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const block = drag.blockId ? getBlock(drag.blockId) : null;

  useEffect(() => {
    if (!drag.active) {
      setGhostPos(null);
      if (autoScrollRaf.current) cancelAnimationFrame(autoScrollRaf.current);
      return;
    }

    const onMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      setGhostPos({ x: e.clientX, y: e.clientY });

      const tick = () => {
        autoScrollStep(pointerRef.current.x, pointerRef.current.y, scrollContainerRef.current);
        const viewport = viewportRef.current?.getBoundingClientRect();
        if (viewport) {
          canvasEdgePanStep(pointerRef.current.x, pointerRef.current.y, viewport, panBy);
        }
        autoScrollRaf.current = requestAnimationFrame(tick);
      };
      if (!autoScrollRaf.current) autoScrollRaf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (autoScrollRaf.current) {
        cancelAnimationFrame(autoScrollRaf.current);
        autoScrollRaf.current = null;
      }
    };
  }, [drag.active, scrollContainerRef, viewportRef, panBy]);

  const handlePanDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!panCapture || (e.button !== 0 && e.button !== 1)) return;
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: canvas.panX, panY: canvas.panY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [panCapture, canvas.panX, canvas.panY, setIsPanning]
  );

  const handlePanMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canvas.isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan(panStart.current.panX + dx, panStart.current.panY + dy);
    },
    [canvas.isPanning, setPan]
  );

  const handlePanUp = useCallback(() => {
    setIsPanning(false);
  }, [setIsPanning]);

  return (
    <>
      {panCapture && (
        <div
          className={cn(
            "absolute inset-0 z-20",
            "cursor-grab active:cursor-grabbing"
          )}
          aria-hidden
          onPointerDown={handlePanDown}
          onPointerMove={handlePanMove}
          onPointerUp={handlePanUp}
          onPointerLeave={handlePanUp}
        />
      )}

      {drag.active && ghostPos && block && (
        <div
          className="ettajer-builder-drag-ghost pointer-events-none fixed z-[10000]"
          style={{
            left: ghostPos.x,
            top: ghostPos.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-[#007AFF] bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
            <Box className="h-4 w-4 shrink-0 text-[#007AFF]" />
            <span className="text-xs font-semibold text-neutral-800">{block.name}</span>
          </div>
        </div>
      )}
    </>
  );
}
