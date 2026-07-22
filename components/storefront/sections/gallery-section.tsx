"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { GallerySectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface GallerySectionProps {
  store: PublicStore;
  settings: GallerySectionSettings;
  previewDevice?: DeviceMode;
}

type GalleryImage = { url: string; alt: string };

function parseGalleryImages(settings: GallerySectionSettings): GalleryImage[] {
  const raw = settings.images;
  if (Array.isArray(raw)) {
    return raw
      .map((item, i) => {
        if (typeof item === "string") {
          const url = item.trim();
          return url ? { url, alt: `Gallery image ${i + 1}` } : null;
        }
        if (item && typeof item === "object" && typeof (item as { url?: string }).url === "string") {
          const url = (item as { url: string }).url.trim();
          if (!url) return null;
          const alt =
            typeof (item as { alt?: string }).alt === "string" && (item as { alt: string }).alt.trim()
              ? (item as { alt: string }).alt.trim()
              : `Frame ${i + 1}`;
          return { url, alt };
        }
        return null;
      })
      .filter((x): x is GalleryImage => Boolean(x));
  }
  if (typeof raw === "string") {
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((url, i) => ({ url, alt: `Frame ${i + 1}` }));
  }
  return [];
}

function aspectForIndex(i: number, layout: string): string {
  if (layout === "lookbook") {
    const pattern = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-[5/6]", "aspect-square"];
    return pattern[i % pattern.length];
  }
  if (layout === "masonry") {
    const pattern = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[3/4]"];
    return pattern[i % pattern.length];
  }
  return "aspect-[4/5]";
}

export function GallerySection({ settings, previewDevice }: GallerySectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const images = parseGalleryImages(settings);
  const layout = settings.layout ?? "grid";
  const columns = Math.min(4, Math.max(2, Number(deviceStyles.columns ?? settings.columns ?? 3) || 3));
  const gap = settings.gap ?? (layout === "lookbook" ? "0.5rem" : "0.75rem");
  const radius = visual.borderRadius ?? (layout === "lookbook" ? "0" : "0.25rem");
  const title = settings.title?.trim();
  const bg = visual.backgroundColor?.toLowerCase() ?? "";
  const isDarkBg = bg === "#0a0a0a" || bg === "#000" || bg === "#000000";
  const [lightbox, setLightbox] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const showPrev = useCallback(() => {
    setLightbox((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const showNext = useCallback(() => {
    setLightbox((i) => (i === null ? i : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, closeLightbox, showPrev, showNext]);

  if (images.length === 0) {
    return (
      <div
        className="mx-auto flex max-w-6xl items-center justify-center px-6 py-12"
        style={{
          padding: visual.padding,
          margin: visual.margin,
          backgroundColor: visual.backgroundColor,
        }}
      >
        <div className="flex h-48 w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-400">
          Add lookbook frames in the editor
        </div>
      </div>
    );
  }

  const frameButton = (img: GalleryImage, index: number, className?: string, aspect?: string) => (
    <button
      type="button"
      key={`${img.url}-${index}`}
      onClick={() => setLightbox(index)}
      className={cn(
        "group relative block w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
        className
      )}
      style={{ borderRadius: radius }}
      aria-label={`View ${img.alt}`}
    >
      <div className={cn("relative w-full overflow-hidden bg-neutral-100", aspect ?? aspectForIndex(index, layout))}>
        <Image
          src={img.url}
          alt={img.alt}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized={img.url.startsWith("http")}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </div>
      {img.alt && !img.alt.startsWith("Gallery") && !img.alt.startsWith("Frame") ? (
        <span className="mt-2 block text-[11px] tracking-wide text-neutral-400 opacity-0 transition group-hover:opacity-100 sm:opacity-100">
          {img.alt}
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      <section
        className="px-4 py-12 sm:px-6 sm:py-16"
        style={{
          padding: visual.padding,
          margin: visual.margin,
          backgroundColor: visual.backgroundColor,
        }}
      >
        <div className={cn("mx-auto", layout === "lookbook" ? "max-w-7xl" : "max-w-6xl")}>
          {title ? (
            <div className="mb-8 sm:mb-10">
              <p
                className={cn(
                  "mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]",
                  isDarkBg ? "text-white/40" : "text-neutral-400"
                )}
              >
                Lookbook
              </p>
              <h2
                className={cn(
                  "text-2xl font-semibold tracking-tight sm:text-3xl",
                  isDarkBg ? "text-white" : "text-neutral-900"
                )}
                style={{ color: visual.textColor, fontSize: deviceStyles.fontSize ?? visual.fontSize }}
              >
                {title}
              </h2>
            </div>
          ) : null}

          {layout === "carousel" ? (
            <div
              className="flex snap-x snap-mandatory overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ gap }}
            >
              {images.map((img, i) => (
                <div key={`${img.url}-${i}`} className="w-[min(78vw,22rem)] shrink-0 snap-center sm:w-80">
                  {frameButton(img, i, undefined, "aspect-[4/5]")}
                </div>
              ))}
            </div>
          ) : layout === "masonry" || layout === "lookbook" ? (
            <div
              className="columns-2 sm:columns-3"
              style={{
                columnCount: layout === "lookbook" ? Math.min(columns, 3) : columns,
                columnGap: gap,
              }}
            >
              {images.map((img, i) => (
                <div
                  key={`${img.url}-${i}`}
                  className="break-inside-avoid"
                  style={{ marginBottom: gap }}
                >
                  {frameButton(img, i)}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="grid"
              style={{
                gap,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {images.map((img, i) => frameButton(img, i, undefined, "aspect-[4/5]"))}
            </div>
          )}
        </div>
      </section>

      {lightbox !== null && images[lightbox] ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Lookbook lightbox"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close lightbox"
            onClick={closeLightbox}
          />
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
          <div className="relative z-[1] flex max-h-[85vh] w-full max-w-5xl flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-h-[78vh] sm:aspect-[4/5]">
              <Image
                src={images[lightbox].url}
                alt={images[lightbox].alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
                unoptimized={images[lightbox].url.startsWith("http")}
              />
            </div>
            <p className="mt-4 text-center text-[12px] tracking-wide text-white/60">
              {images[lightbox].alt}
              <span className="text-white/35">
                {" "}
                · {lightbox + 1} / {images.length}
              </span>
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
