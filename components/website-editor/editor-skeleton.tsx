"use client";

import type { CSSProperties } from "react";
import type { DeviceMode } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

/** Soft shimmer bone for theme-editor loading states. */
export function EditorBone({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return <div className={cn("editor-bone", className)} style={style} aria-hidden />;
}

/** Full-screen editor chrome while the client bundle mounts. */
export function EditorShellSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-screen flex-col overflow-hidden bg-[#F5F5F7] text-neutral-900",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading website editor"
    >
      {/* Top bar */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-neutral-200/80 bg-white/90 px-3 backdrop-blur-md">
        <EditorBone className="h-7 w-7 rounded-lg" />
        <EditorBone className="hidden h-7 w-40 rounded-lg sm:block" />
        <div className="mx-auto flex items-center gap-1.5">
          <EditorBone className="h-7 w-16 rounded-full" />
          <EditorBone className="h-7 w-16 rounded-full" />
          <EditorBone className="h-7 w-16 rounded-full" />
        </div>
        <EditorBone className="ml-auto h-8 w-24 rounded-lg" />
        <EditorBone className="h-8 w-20 rounded-lg" />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Left rail */}
        <div className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-neutral-200/80 bg-white py-3 xl:flex">
          {Array.from({ length: 6 }).map((_, i) => (
            <EditorBone key={i} className="h-9 w-9 rounded-lg" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>

        {/* Left panel */}
        <div className="hidden w-80 shrink-0 flex-col gap-3 border-r border-neutral-200/80 bg-white p-3 xl:flex">
          <EditorBone className="h-4 w-16 rounded-md" />
          <EditorBone className="h-3 w-40 rounded-md" />
          <EditorBone className="mt-1 h-10 w-full rounded-xl" />
          <EditorBone className="h-8 w-full rounded-lg" />
          <div className="mt-2 flex gap-1.5">
            <EditorBone className="h-6 w-12 rounded-full" />
            <EditorBone className="h-6 w-16 rounded-full" />
            <EditorBone className="h-6 w-14 rounded-full" />
          </div>
          <div className="mt-2 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-2.5 rounded-xl border border-neutral-100 p-2">
                <EditorBone className="h-12 w-12 shrink-0 rounded-lg" style={{ animationDelay: `${i * 80}ms` }} />
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                  <EditorBone className="h-3.5 w-24 rounded-md" style={{ animationDelay: `${i * 80 + 40}ms` }} />
                  <EditorBone className="h-2.5 w-full rounded-md" style={{ animationDelay: `${i * 80 + 80}ms` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="relative flex min-w-0 flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_#EEF2FF_0%,_#F5F5F7_45%,_#F0F0F2_100%)]">
          <div className="flex items-center justify-center gap-2 border-b border-neutral-200/60 bg-white/50 px-3 py-2 backdrop-blur-sm">
            <EditorBone className="h-7 w-7 rounded-md" />
            <EditorBone className="h-7 w-7 rounded-md" />
            <EditorBone className="mx-2 h-5 w-px rounded-full bg-neutral-200" />
            <EditorBone className="h-7 w-20 rounded-full" />
          </div>
          <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden p-6 pt-8">
            <div className="editor-preview-frame w-full max-w-[920px] overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)]">
              <EditorPreviewSkeleton device="desktop" />
            </div>
          </div>
        </div>

        {/* Right inspector */}
        <div className="hidden w-[300px] shrink-0 flex-col gap-3 border-l border-neutral-200/80 bg-white p-3 xl:flex">
          <div className="flex items-center justify-between">
            <EditorBone className="h-4 w-28 rounded-md" />
            <EditorBone className="h-7 w-7 rounded-md" />
          </div>
          <div className="flex gap-1">
            <EditorBone className="h-7 flex-1 rounded-md" />
            <EditorBone className="h-7 flex-1 rounded-md" />
            <EditorBone className="h-7 flex-1 rounded-md" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5 rounded-xl border border-neutral-100 p-3">
              <EditorBone className="h-3 w-20 rounded-md" />
              <EditorBone className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading website editor</span>
    </div>
  );
}

/** Storefront-shaped preview placeholder inside the canvas. */
export function EditorPreviewSkeleton({
  device = "desktop",
  className,
}: {
  device?: DeviceMode;
  className?: string;
}) {
  const isMobile = device === "mobile";
  const isTablet = device === "tablet";

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[280px] flex-col overflow-hidden bg-white",
        className
      )}
      role="status"
      aria-label="Loading preview"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3">
        <EditorBone className="h-6 w-6 rounded-full" />
        {!isMobile ? (
          <>
            <EditorBone className="h-2.5 w-14 rounded-full" />
            <EditorBone className="h-2.5 w-12 rounded-full" />
            <EditorBone className="h-2.5 w-16 rounded-full" />
          </>
        ) : null}
        <EditorBone className="ml-auto h-7 w-7 rounded-lg" />
        {!isMobile ? <EditorBone className="h-7 w-16 rounded-lg" /> : null}
      </div>

      {/* Hero */}
      <div className={cn("relative px-4 pt-4", isMobile ? "pb-3" : "pb-5")}>
        <EditorBone
          className={cn(
            "w-full rounded-2xl",
            isMobile ? "h-36" : isTablet ? "h-44" : "h-52"
          )}
        />
        <div className="absolute inset-x-8 bottom-8 space-y-2">
          <EditorBone className="h-3 w-20 rounded-full bg-white/50" />
          <EditorBone className={cn("rounded-full bg-white/60", isMobile ? "h-4 w-2/3" : "h-5 w-1/2")} />
          <EditorBone className="h-2.5 w-2/5 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Content rows */}
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        <div className="flex items-center justify-between">
          <EditorBone className="h-3 w-24 rounded-full" />
          <EditorBone className="h-3 w-12 rounded-full" />
        </div>
        <div
          className={cn(
            "grid gap-2.5",
            isMobile ? "grid-cols-2" : isTablet ? "grid-cols-3" : "grid-cols-4"
          )}
        >
          {Array.from({ length: isMobile ? 2 : isTablet ? 3 : 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <EditorBone
                className={cn("w-full rounded-xl", isMobile ? "h-24" : "h-28")}
                style={{ animationDelay: `${i * 90}ms` }}
              />
              <EditorBone className="h-2.5 w-3/4 rounded-full" style={{ animationDelay: `${i * 90 + 40}ms` }} />
              <EditorBone className="h-2 w-1/2 rounded-full" style={{ animationDelay: `${i * 90 + 80}ms` }} />
            </div>
          ))}
        </div>
        {!isMobile ? (
          <div className="mt-auto grid grid-cols-3 gap-2 pt-2">
            <EditorBone className="h-14 rounded-xl" />
            <EditorBone className="h-14 rounded-xl" />
            <EditorBone className="h-14 rounded-xl" />
          </div>
        ) : null}
      </div>

      {/* Soft sweep overlay */}
      <div className="editor-bone-sweep pointer-events-none absolute inset-0" aria-hidden />
    </div>
  );
}

/** Compact list/card skeletons for side panels & pickers. */
export function EditorPanelListSkeleton({
  rows = 4,
  variant = "cards",
  className,
  label = "Loading",
}: {
  rows?: number;
  variant?: "cards" | "rows" | "chips" | "media";
  className?: string;
  label?: string;
}) {
  if (variant === "chips") {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)} role="status" aria-label={label}>
        {Array.from({ length: rows }).map((_, i) => (
          <EditorBone
            key={i}
            className="h-7 rounded-full"
            style={{ width: `${56 + (i % 3) * 18}px`, animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "media") {
    return (
      <div className={cn("grid grid-cols-3 gap-2", className)} role="status" aria-label={label}>
        {Array.from({ length: rows }).map((_, i) => (
          <EditorBone
            key={i}
            className="aspect-square rounded-xl"
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "rows") {
    return (
      <div className={cn("space-y-2", className)} role="status" aria-label={label}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <EditorBone className="h-8 w-8 shrink-0 rounded-lg" style={{ animationDelay: `${i * 50}ms` }} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <EditorBone className="h-3 w-2/3 rounded-full" style={{ animationDelay: `${i * 50 + 30}ms` }} />
              <EditorBone className="h-2 w-2/5 rounded-full" style={{ animationDelay: `${i * 50 + 60}ms` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)} role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-2.5 overflow-hidden rounded-xl border border-neutral-100/90 bg-white p-2"
        >
          <EditorBone
            className="h-12 w-12 shrink-0 rounded-lg"
            style={{ animationDelay: `${i * 70}ms` }}
          />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
            <EditorBone className="h-3.5 w-28 rounded-md" style={{ animationDelay: `${i * 70 + 35}ms` }} />
            <EditorBone className="h-2.5 w-full rounded-md" style={{ animationDelay: `${i * 70 + 70}ms` }} />
          </div>
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Inline control placeholder (selects, pickers). */
export function EditorControlSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-neutral-100 bg-white px-3 py-2.5",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <EditorBone className="h-4 w-4 rounded-md" />
      <EditorBone className="h-3 flex-1 rounded-full" />
      <EditorBone className="h-3 w-3 rounded-sm" />
    </div>
  );
}
