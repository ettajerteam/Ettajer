"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { getProductImage } from "@/lib/storefront-assets";
import { ProductSectionShell } from "@/components/storefront/product-section-shell";
import { useProductPageZone } from "@/components/storefront/product-page-layout-context";
import type { ProductGallerySectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export function ProductGallerySection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductGallerySectionSettings;
  const zone = useProductPageZone();
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const inGallery = zone === "gallery";
  const layout = s.layout ?? "stack";
  const showThumbs = s.showThumbnails !== false && layout !== "single" && layout !== "carousel";
  const sideThumbs = layout === "side" || s.thumbPosition === "left";
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const images = product
    ? product.images.length > 0
      ? product.images
      : [getProductImage(store.theme, product.images, product.id)]
    : [];
  const imageCount = images.length;

  const goPrev = () => setActiveIndex((i) => (i - 1 + imageCount) % Math.max(imageCount, 1));
  const goNext = () => setActiveIndex((i) => (i + 1) % Math.max(imageCount, 1));

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft" && imageCount > 1) {
        setActiveIndex((i) => (i - 1 + imageCount) % imageCount);
      }
      if (e.key === "ArrowRight" && imageCount > 1) {
        setActiveIndex((i) => (i + 1) % imageCount);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, imageCount]);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  if (!product) {
    return (
      <ProductSectionShell>
        <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-neutral-100 text-sm text-neutral-400">
          Product gallery preview
        </div>
      </ProductSectionShell>
    );
  }

  const imageSrc = images[activeIndex] ?? images[0];
  const canNavigate = images.length > 1;

  const mainImage = (
    <div
      className={cn(
        "group relative overflow-hidden",
        inGallery
          ? "aspect-[4/5] w-full lg:aspect-[4/5] lg:min-h-0"
          : "aspect-[4/5] w-full sm:aspect-square",
        inGallery
          ? isModern
            ? "rounded-none"
            : "rounded-none lg:rounded-none"
          : isModern
            ? "rounded-sm bg-stone-100"
            : "rounded-3xl",
        isBold ? "bg-zinc-900" : "bg-neutral-100"
      )}
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null || !canNavigate) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) < 40) return;
        if (dx > 0) goPrev();
        else goNext();
      }}
    >
      <Image
        key={imageSrc}
        src={imageSrc}
        alt={product.title}
        fill
        className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.02]"
        priority
        sizes="(max-width: 1024px) 100vw, 55vw"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-70" />

      {canNavigate ? (
        <div className="absolute bottom-4 left-4 z-10 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium tabular-nums tracking-wide text-white/95 backdrop-blur-md">
          {activeIndex + 1} / {images.length}
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Zoom image"
        onClick={() => setLightboxOpen(true)}
        className={cn(
          "absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center bg-white/90 text-neutral-800 shadow-sm backdrop-blur-sm transition hover:bg-white",
          isModern ? "rounded-sm" : "rounded-full",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100",
          isBold && "bg-zinc-800/90 text-white hover:bg-zinc-800"
        )}
      >
        <ZoomIn className="h-4 w-4" />
      </button>

      {canNavigate ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={goPrev}
            className={cn(
              "absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-neutral-800 shadow-sm backdrop-blur-sm transition hover:bg-white",
              isModern ? "rounded-sm" : "rounded-full",
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={goNext}
            className={cn(
              "absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-white/90 text-neutral-800 shadow-sm backdrop-blur-sm transition hover:bg-white",
              isModern ? "rounded-sm" : "rounded-full",
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {layout === "carousel" && canNavigate ? (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {images.slice(0, 8).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                activeIndex === i ? "w-5 bg-white" : "w-1.5 bg-white/45"
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  const thumbs =
    showThumbs && images.length > 1 ? (
      <div
        className={cn(
          "flex gap-2.5 overflow-x-auto scrollbar-none",
          sideThumbs
            ? "flex-col overflow-y-auto overflow-x-hidden py-1"
            : inGallery
              ? "mt-0 gap-2 px-4 py-4 sm:px-5"
              : "mt-3 px-1"
        )}
      >
        {images.slice(0, 8).map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative shrink-0 overflow-hidden transition duration-200",
              sideThumbs ? "h-[4.75rem] w-[4.75rem]" : "h-[4.25rem] w-[4.25rem]",
              isModern ? "rounded-sm" : "rounded-2xl",
              activeIndex === i
                ? "opacity-100 ring-2 ring-[var(--store-primary)] ring-offset-2 ring-offset-transparent"
                : "opacity-60 ring-1 ring-black/5 hover:opacity-100"
            )}
          >
            <Image src={img} alt={`${product.title} view ${i + 1}`} fill className="object-cover" sizes="72px" />
          </button>
        ))}
      </div>
    ) : null;

  return (
    <ProductSectionShell>
      {sideThumbs && thumbs ? (
        <div className={cn("flex gap-3", inGallery && "p-4 sm:p-5")}>
          <div className="shrink-0">{thumbs}</div>
          <div className="min-w-0 flex-1 overflow-hidden rounded-2xl">{mainImage}</div>
        </div>
      ) : (
        <>
          {mainImage}
          {thumbs}
        </>
      )}

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Product image"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          {canNavigate ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <div
            className="relative h-[min(85vh,900px)] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={imageSrc}
              alt={product.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      ) : null}
    </ProductSectionShell>
  );
}
