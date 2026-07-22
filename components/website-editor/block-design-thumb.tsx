"use client";

import type { BlockDesignThumbKind } from "@/lib/builder/block-design-presets";
import { cn } from "@/lib/utils";

interface BlockDesignThumbProps {
  kind: BlockDesignThumbKind;
  className?: string;
  /** Real product photos for visual demos */
  images?: string[];
}

export function BlockDesignThumb({ kind, className, images }: BlockDesignThumbProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-neutral-100",
        className
      )}
    >
      <ThumbArt kind={kind} images={images} />
    </div>
  );
}

function Photo({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return <div className={cn("bg-neutral-300", className)} aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("object-cover", className)} loading="lazy" />
  );
}

function ThumbArt({ kind, images = [] }: { kind: BlockDesignThumbKind; images?: string[] }) {
  const img = (i: number) => images[i % Math.max(images.length, 1)];

  switch (kind) {
    case "hero-stack":
      return (
        <div className="flex h-full flex-col gap-1.5 p-2">
          <div className="h-[42%] rounded-md bg-neutral-300/90" />
          <div className="mx-auto mt-1 h-2 w-2/3 rounded-sm bg-neutral-400" />
          <div className="mx-auto h-1.5 w-1/2 rounded-sm bg-neutral-300" />
          <div className="mx-auto mt-1 h-4 w-16 rounded-md bg-[#007AFF]/70" />
        </div>
      );
    case "hero-split":
      return (
        <div className="flex h-full gap-1.5 p-2">
          <div className="flex flex-1 flex-col justify-center gap-1.5 pr-1">
            <div className="h-2 w-4/5 rounded-sm bg-neutral-400" />
            <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
            <div className="h-1.5 w-3/5 rounded-sm bg-neutral-300" />
            <div className="mt-1 h-4 w-14 rounded-md bg-[#007AFF]/70" />
          </div>
          <div className="flex-1 rounded-md bg-neutral-300/90" />
        </div>
      );
    case "hero-editorial":
      return (
        <div className="flex h-full flex-col gap-1.5 p-2">
          <div className="h-1.5 w-12 rounded-sm bg-[#007AFF]/50" />
          <div className="h-2 w-3/4 rounded-sm bg-neutral-400" />
          <div className="mt-auto h-[55%] rounded-md bg-neutral-300/90" />
        </div>
      );
    case "hero-overlay":
      return (
        <div className="relative h-full p-2">
          <div className="absolute inset-2 rounded-md bg-neutral-400/80" />
          <div className="relative flex h-full flex-col justify-end gap-1 p-2">
            <div className="h-2 w-1/2 rounded-sm bg-white/90" />
            <div className="h-1.5 w-2/3 rounded-sm bg-white/60" />
            <div className="mt-1 h-4 w-14 rounded-md bg-white/90" />
          </div>
        </div>
      );
    case "hero-minimal":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 p-3">
          <div className="h-1 w-10 rounded-sm bg-[#007AFF]/50" />
          <div className="h-2.5 w-2/3 rounded-sm bg-neutral-400" />
          <div className="h-1.5 w-1/2 rounded-sm bg-neutral-300" />
          <div className="mt-1 flex gap-1">
            <div className="h-4 w-14 rounded-md bg-[#007AFF]/70" />
            <div className="h-4 w-12 rounded-md border border-neutral-300 bg-white" />
          </div>
        </div>
      );
    case "gallery-grid":
      return (
        <div className="grid h-full grid-cols-3 gap-1 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-sm bg-neutral-300" />
          ))}
        </div>
      );
    case "gallery-masonry":
      return (
        <div className="grid h-full grid-cols-3 gap-1 p-2">
          <div className="row-span-2 rounded-sm bg-neutral-300" />
          <div className="rounded-sm bg-neutral-400" />
          <div className="rounded-sm bg-neutral-300" />
          <div className="rounded-sm bg-neutral-400" />
          <div className="rounded-sm bg-neutral-300" />
        </div>
      );
    case "gallery-carousel":
      return (
        <div className="flex h-full items-center gap-1.5 overflow-hidden p-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[70%] w-[42%] shrink-0 rounded-md bg-neutral-300" />
          ))}
        </div>
      );
    case "gallery-dense":
      return (
        <div className="grid h-full grid-cols-4 gap-0.5 p-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-[2px] bg-neutral-300" />
          ))}
        </div>
      );
    case "image-contained":
      return (
        <div className="flex h-full items-center justify-center p-3">
          <div className="h-full w-4/5 rounded-md bg-neutral-300" />
        </div>
      );
    case "image-editorial":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <div className="h-[70%] rounded-md bg-neutral-300" />
          <div className="h-1.5 w-1/3 rounded-sm bg-neutral-400" />
        </div>
      );
    case "image-cinematic":
      return <div className="h-full bg-neutral-400" />;
    case "text-default":
    case "text-intro":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-3">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-400" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-5/6 rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-2/3 rounded-sm bg-neutral-300" />
        </div>
      );
    case "text-strip":
      return (
        <div className="flex h-full items-center gap-2 p-2">
          <div className="h-8 flex-1 rounded-md bg-neutral-300" />
          <div className="h-6 w-12 rounded-md bg-[#007AFF]/60" />
        </div>
      );
    case "text-quotes":
      return (
        <div className="flex h-full flex-col justify-center gap-2 p-3">
          <div className="h-2 w-4 rounded-sm bg-[#007AFF]/40" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-4/5 rounded-sm bg-neutral-300" />
        </div>
      );
    case "text-newsletter":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-400" />
          <div className="flex w-full gap-1">
            <div className="h-5 flex-1 rounded-md bg-white ring-1 ring-neutral-200" />
            <div className="h-5 w-10 rounded-md bg-[#007AFF]/70" />
          </div>
        </div>
      );
    case "text-stats":
      return (
        <div className="grid h-full grid-cols-3 gap-2 p-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1">
              <div className="h-3 w-8 rounded-sm bg-neutral-400" />
              <div className="h-1.5 w-10 rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "cta-dark":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-neutral-800 p-3">
          <div className="h-2 w-1/2 rounded-sm bg-white/80" />
          <div className="h-4 w-16 rounded-md bg-white/90" />
        </div>
      );
    case "cta-light":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-400" />
          <div className="h-4 w-16 rounded-md bg-[#007AFF]/70" />
        </div>
      );
    case "cta-accent":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#007AFF]/15 p-3">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-500" />
          <div className="h-4 w-16 rounded-md bg-[#007AFF]" />
        </div>
      );
    case "cta-split":
      return (
        <div className="flex h-full flex-col justify-center gap-2 bg-neutral-800 p-3">
          <div className="h-2 w-2/3 rounded-sm bg-white/80" />
          <div className="h-1.5 w-1/2 rounded-sm bg-white/50" />
          <div className="mt-1 h-4 w-16 rounded-md bg-white/90" />
        </div>
      );
    case "features-grid":
      return (
        <div className="grid h-full grid-cols-3 gap-1.5 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1 rounded-md border border-neutral-200 bg-white p-1.5">
              <div className="h-4 w-4 rounded-sm bg-[#007AFF]/40" />
              <div className="h-1 w-full rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "features-compact":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#007AFF]/50" />
              <div className="h-1.5 flex-1 rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "features-row":
      return (
        <div className="flex h-full items-center gap-1.5 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1 rounded-md bg-white p-1.5 ring-1 ring-neutral-200">
              <div className="h-3 w-3 rounded-full bg-[#007AFF]/40" />
              <div className="h-1 w-full rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "testimonials":
      return (
        <div className="flex h-full items-center gap-2 p-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-1 flex-col gap-1 rounded-md border border-neutral-200 bg-white p-2">
              <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
              <div className="h-1.5 w-2/3 rounded-sm bg-neutral-300" />
              <div className="mt-1 h-2 w-8 rounded-full bg-neutral-400" />
            </div>
          ))}
        </div>
      );
    case "testimonials-spotlight":
      return (
        <div className="flex h-full flex-col gap-1.5 p-2">
          <div className="flex flex-1 flex-col justify-center gap-1 rounded-md border border-neutral-200 bg-white p-2">
            <div className="h-2 w-full rounded-sm bg-neutral-300" />
            <div className="h-2 w-4/5 rounded-sm bg-neutral-300" />
            <div className="mt-1 h-2 w-10 rounded-full bg-neutral-400" />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-md border border-neutral-200 bg-white p-1.5">
                <div className="h-1 w-full rounded-sm bg-neutral-300" />
              </div>
            ))}
          </div>
        </div>
      );
    case "testimonials-carousel":
      return (
        <div className="flex h-full items-stretch gap-1.5 overflow-hidden p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex w-[42%] shrink-0 flex-col gap-1 rounded-md border border-neutral-200 bg-white p-1.5">
              <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
              <div className="h-1.5 w-2/3 rounded-sm bg-neutral-300" />
              <div className="mt-auto h-2 w-8 rounded-full bg-neutral-400" />
            </div>
          ))}
        </div>
      );
    case "testimonials-minimal":
      return (
        <div className="grid h-full grid-cols-3 gap-2 p-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1">
              <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
              <div className="h-1.5 w-4/5 rounded-sm bg-neutral-300" />
              <div className="mt-1 h-1.5 w-8 rounded-sm bg-neutral-400" />
            </div>
          ))}
        </div>
      );
    case "faq":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-2 py-1.5">
              <div className="h-1.5 w-2/3 rounded-sm bg-neutral-400" />
              <div className="h-2 w-2 rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "faq-columns":
      return (
        <div className="grid h-full grid-cols-2 gap-1.5 p-2">
          {[1, 2].map((col) => (
            <div key={col} className="flex flex-col gap-1">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-md border border-neutral-200 bg-white px-1.5 py-1">
                  <div className="h-1 w-full rounded-sm bg-neutral-400" />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    case "faq-stacked":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-md border border-neutral-200 bg-white p-1.5">
              <div className="h-1.5 w-2/3 rounded-sm bg-neutral-400" />
              <div className="mt-1 h-1 w-full rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "products-grid":
      return (
        <div className="grid h-full grid-cols-4 gap-1.5 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex min-h-0 flex-col gap-1">
              <Photo src={img(i)} alt="" className="aspect-[3/4] w-full rounded-sm" />
              <div className="h-1 w-full rounded-sm bg-neutral-400/80" />
              <div className="h-1 w-1/2 rounded-sm bg-[#007AFF]/50" />
            </div>
          ))}
        </div>
      );
    case "products-featured":
      return (
        <div className="grid h-full grid-cols-2 gap-1.5 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-md border border-neutral-200 bg-white">
              <Photo src={img(i)} alt="" className="aspect-[4/5] w-full" />
            </div>
          ))}
        </div>
      );
    case "products-carousel":
      return (
        <div className="flex h-full items-stretch gap-1.5 overflow-hidden p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex w-[40%] shrink-0 flex-col gap-1">
              <Photo src={img(i)} alt="" className="min-h-0 flex-1 rounded-md" />
              <div className="h-1 w-full rounded-sm bg-neutral-400/80" />
            </div>
          ))}
        </div>
      );
    case "products-list":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-1.5">
              <Photo src={img(i)} alt="" className="h-9 w-9 shrink-0 rounded-sm" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="h-1.5 w-2/3 rounded-sm bg-neutral-400" />
                <div className="h-1 w-1/3 rounded-sm bg-[#007AFF]/50" />
              </div>
              <div className="h-4 w-8 shrink-0 rounded-full bg-neutral-200" />
            </div>
          ))}
        </div>
      );
    case "products-dense":
      return (
        <div className="grid h-full grid-cols-2 gap-1 p-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-md">
              <Photo src={img(i)} alt="" className="aspect-square w-full" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                <div className="h-1 w-2/3 rounded-sm bg-white/85" />
              </div>
            </div>
          ))}
        </div>
      );
    case "products-spotlight":
      return (
        <div className="grid h-full grid-cols-2 gap-1.5 p-2">
          <Photo src={img(0)} alt="" className="row-span-2 h-full min-h-0 rounded-md" />
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Photo key={i} src={img(i + 1)} alt="" className="aspect-square w-full rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "products-compact":
      return (
        <div className="grid h-full grid-cols-3 gap-1.5 p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex min-h-0 flex-col gap-1">
              <Photo src={img(i)} alt="" className="min-h-0 flex-1 rounded-md" />
              <div className="h-1 w-full rounded-sm bg-neutral-400/80" />
            </div>
          ))}
        </div>
      );
    case "products-large":
      return (
        <div className="grid h-full grid-cols-2 gap-2 p-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-md">
              <Photo src={img(i)} alt="" className="h-full w-full" />
              <div className="absolute inset-x-2 bottom-2 h-4 rounded-full bg-white/90" />
            </div>
          ))}
        </div>
      );
    case "collections":
      return (
        <div className="grid h-full grid-cols-3 gap-1.5 p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-md">
              <Photo src={img(i)} alt="" className="h-full w-full" />
              <div className="absolute inset-x-1 bottom-1 h-1.5 rounded-sm bg-white/85" />
            </div>
          ))}
        </div>
      );
    case "collections-carousel":
      return (
        <div className="flex h-full items-stretch gap-1.5 overflow-hidden p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative w-[40%] shrink-0 overflow-hidden rounded-md">
              <Photo src={img(i)} alt="" className="h-full w-full" />
              <div className="absolute inset-x-1 bottom-1 h-1 rounded-sm bg-white/85" />
            </div>
          ))}
        </div>
      );
    case "collections-editorial":
      return (
        <div className="grid h-full grid-cols-2 gap-1.5 p-2">
          <div className="relative overflow-hidden rounded-md">
            <Photo src={img(0)} alt="" className="h-full w-full" />
            <div className="absolute inset-x-1 bottom-1 h-1.5 rounded-sm bg-white/85" />
          </div>
          <div className="grid grid-rows-2 gap-1.5">
            {[1, 2].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-md">
                <Photo src={img(i)} alt="" className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>
      );
    case "collections-mosaic":
      return (
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-1 p-2">
          <div className="relative row-span-2 overflow-hidden rounded-md">
            <Photo src={img(0)} alt="" className="h-full w-full" />
          </div>
          <div className="relative col-span-2 overflow-hidden rounded-md">
            <Photo src={img(1)} alt="" className="h-full w-full" />
          </div>
          <div className="relative overflow-hidden rounded-md">
            <Photo src={img(2)} alt="" className="h-full w-full" />
          </div>
          <div className="relative overflow-hidden rounded-md bg-neutral-300" />
        </div>
      );
    case "collections-list":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-1">
              <Photo src={img(i)} alt="" className="h-7 w-10 shrink-0 rounded-sm" />
              <div className="h-1.5 flex-1 rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "video":
      return (
        <div className="relative flex h-full items-center justify-center p-3">
          <div className="aspect-video w-full rounded-md bg-neutral-400/80" />
          <div className="absolute h-7 w-7 rounded-full bg-white/90 shadow-sm" />
        </div>
      );
    case "contact":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-3">
          <div className="mx-auto h-2 w-1/3 rounded-sm bg-neutral-400" />
          <div className="h-4 rounded-md bg-white ring-1 ring-neutral-200" />
          <div className="h-4 rounded-md bg-white ring-1 ring-neutral-200" />
          <div className="h-8 rounded-md bg-white ring-1 ring-neutral-200" />
          <div className="mx-auto mt-1 h-4 w-20 rounded-md bg-[#007AFF]/70" />
        </div>
      );
    case "countdown":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-400" />
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex h-8 w-8 flex-col items-center justify-center rounded-md bg-neutral-800">
                <div className="h-2 w-4 rounded-sm bg-white/80" />
              </div>
            ))}
          </div>
          <div className="h-4 w-16 rounded-md bg-[#007AFF]/70" />
        </div>
      );
    case "logo-wall":
      return (
        <div className="grid h-full grid-cols-4 gap-2 p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center rounded-md bg-white ring-1 ring-neutral-200">
              <div className="h-2 w-8 rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "spacer":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
          <div className="h-px w-full bg-neutral-200" />
          <div className="h-6 w-px border-l border-dashed border-neutral-300" />
          <div className="h-px w-full bg-neutral-200" />
        </div>
      );
    case "divider":
      return (
        <div className="flex h-full items-center px-4">
          <div className="h-px w-full bg-neutral-400" />
        </div>
      );
    case "columns":
      return (
        <div className="grid h-full grid-cols-3 gap-1.5 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1 rounded-md border border-neutral-200 bg-white p-1.5">
              <div className="h-1.5 w-2/3 rounded-sm bg-neutral-400" />
              <div className="h-1 w-full rounded-sm bg-neutral-300" />
              <div className="h-1 w-4/5 rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "columns-cards":
      return (
        <div className="grid h-full grid-cols-3 gap-1 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1 rounded-md border border-neutral-300 bg-neutral-50 p-1.5">
              <div className="h-1.5 w-3/4 rounded-sm bg-neutral-400" />
              <div className="h-1 w-full rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "columns-media":
      return (
        <div className="grid h-full grid-cols-3 gap-1 p-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <Photo src={img(i)} alt="" className="aspect-[4/5] w-full rounded-sm" />
              <div className="h-1 w-2/3 rounded-sm bg-neutral-400" />
              <div className="h-1 w-full rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "columns-cta":
      return (
        <div className="grid h-full grid-cols-3 gap-1 p-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-md bg-neutral-100 p-1.5">
              <div className="h-1.5 w-2/3 rounded-sm bg-neutral-400" />
              <div className="h-1 w-full rounded-sm bg-neutral-300" />
              <div className="mt-auto h-3 w-full rounded-sm bg-[#007AFF]/70" />
            </div>
          ))}
        </div>
      );
    case "search":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
          <div className="h-2 w-1/3 rounded-sm bg-neutral-400" />
          <div className="flex w-full gap-1">
            <div className="h-6 flex-1 rounded-md bg-white ring-1 ring-neutral-200" />
            <div className="h-6 w-12 rounded-md bg-[#007AFF]/70" />
          </div>
        </div>
      );
    case "embed":
      return (
        <div className="flex h-full items-center justify-center p-3">
          <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-100">
            <div className="h-4 w-4 rounded-sm bg-neutral-300" />
          </div>
        </div>
      );
    case "footer":
      return (
        <div className="flex h-full flex-col justify-end gap-1.5 bg-neutral-100 p-2">
          <div className="flex gap-2">
            <div className="h-1.5 w-8 rounded-sm bg-neutral-400" />
            <div className="h-1.5 w-8 rounded-sm bg-neutral-300" />
            <div className="h-1.5 w-8 rounded-sm bg-neutral-300" />
          </div>
          <div className="h-1 w-1/3 rounded-sm bg-neutral-300" />
        </div>
      );
    case "product-card":
      return (
        <div className="flex h-full items-center justify-center gap-2 p-2">
          <Photo src={img(0)} alt="" className="h-[85%] w-[45%] rounded-md" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-2 w-3/4 rounded-sm bg-neutral-400" />
            <div className="h-1.5 w-1/2 rounded-sm bg-[#007AFF]/50" />
            <div className="mt-1 h-4 w-16 rounded-md bg-[#007AFF]/70" />
          </div>
        </div>
      );
    case "pdp-gallery-stack":
      return (
        <div className="flex h-full flex-col gap-1 p-2">
          <Photo src={img(0)} alt="" className="h-[70%] w-full rounded-md" />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <Photo key={i} src={img(i)} alt="" className="h-5 flex-1 rounded-sm" />
            ))}
          </div>
        </div>
      );
    case "pdp-gallery-side":
      return (
        <div className="flex h-full gap-1 p-2">
          <div className="flex w-4 flex-col gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 rounded-[2px] bg-neutral-300" />
            ))}
          </div>
          <Photo src={img(0)} alt="" className="flex-1 rounded-md" />
        </div>
      );
    case "pdp-gallery-carousel":
      return (
        <div className="relative flex h-full items-center justify-center p-2">
          <Photo src={img(0)} alt="" className="h-full w-full rounded-md" />
          <div className="absolute bottom-3 flex gap-1">
            <div className="h-1 w-1 rounded-full bg-white" />
            <div className="h-1 w-1 rounded-full bg-white/50" />
            <div className="h-1 w-1 rounded-full bg-white/50" />
          </div>
        </div>
      );
    case "pdp-info":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-3">
          <div className="h-1 w-10 rounded-sm bg-neutral-300" />
          <div className="h-2.5 w-4/5 rounded-sm bg-neutral-400" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-3/4 rounded-sm bg-neutral-300" />
        </div>
      );
    case "pdp-price":
      return (
        <div className="flex h-full items-center gap-2 p-3">
          <div className="h-3 w-14 rounded-sm bg-[#007AFF]/70" />
          <div className="h-2 w-10 rounded-sm bg-neutral-300 line-through" />
        </div>
      );
    case "pdp-variants":
      return (
        <div className="flex h-full flex-col justify-center gap-2 p-3">
          <div className="h-1 w-8 rounded-sm bg-neutral-300" />
          <div className="flex gap-1">
            <div className="h-5 w-8 rounded-md border border-neutral-300" />
            <div className="h-5 w-8 rounded-md bg-neutral-300" />
            <div className="h-5 w-8 rounded-md border border-neutral-300" />
          </div>
        </div>
      );
    case "pdp-buy":
      return (
        <div className="flex h-full items-center justify-center p-3">
          <div className="h-6 w-24 rounded-md bg-[#007AFF]/80" />
        </div>
      );
    case "pdp-reviews":
      return (
        <div className="grid h-full grid-cols-2 gap-1.5 p-2">
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-1 rounded-md border border-neutral-200 p-1.5">
              <div className="h-1.5 w-10 rounded-sm bg-amber-300/80" />
              <div className="h-1 w-full rounded-sm bg-neutral-300" />
              <div className="h-1 w-2/3 rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "pdp-faq":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-3">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-400" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-4/5 rounded-sm bg-neutral-300" />
        </div>
      );
    case "pdp-related":
      return (
        <div className="grid h-full grid-cols-4 gap-1 p-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <Photo src={img(i)} alt="" className="aspect-[3/4] w-full rounded-sm" />
              <div className="h-1 w-full rounded-sm bg-neutral-300" />
            </div>
          ))}
        </div>
      );
    case "collection-banner-hero":
      return (
        <div className="relative h-full p-1.5">
          <Photo src={img(0)} alt="" className="absolute inset-1.5 rounded-md" />
          <div className="relative flex h-full flex-col justify-end p-2">
            <div className="h-1 w-8 rounded-sm bg-white/70" />
            <div className="mt-1 h-2 w-1/2 rounded-sm bg-white" />
          </div>
        </div>
      );
    case "collection-banner-split":
      return (
        <div className="flex h-full gap-1 p-2">
          <Photo src={img(0)} alt="" className="flex-1 rounded-md" />
          <div className="flex flex-1 flex-col justify-center gap-1.5 rounded-md bg-neutral-100 px-2">
            <div className="h-1 w-8 rounded-sm bg-neutral-300" />
            <div className="h-2 w-3/4 rounded-sm bg-neutral-400" />
          </div>
        </div>
      );
    case "collection-banner-minimal":
      return (
        <div className="relative flex h-full items-center p-3">
          <div className="absolute inset-x-3 inset-y-[35%] rounded-md bg-neutral-400/80" />
          <div className="relative h-2 w-1/3 rounded-sm bg-white" />
        </div>
      );
    case "collection-desc":
      return (
        <div className="flex h-full flex-col justify-center gap-1.5 p-3">
          <div className="h-2.5 w-2/3 rounded-sm bg-neutral-400" />
          <div className="h-1.5 w-full rounded-sm bg-neutral-300" />
          <div className="h-1.5 w-4/5 rounded-sm bg-neutral-300" />
        </div>
      );
    case "collection-filters":
      return (
        <div className="flex h-full flex-wrap content-center gap-1 p-3">
          <div className="h-4 w-10 rounded-full bg-[#007AFF]/70" />
          <div className="h-4 w-12 rounded-full border border-neutral-300" />
          <div className="h-4 w-14 rounded-full border border-neutral-300" />
        </div>
      );
    case "collection-grid":
      return (
        <div className="grid h-full grid-cols-3 gap-1 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Photo key={i} src={img(i)} alt="" className="rounded-sm" />
          ))}
        </div>
      );
    case "collection-newsletter":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 rounded-md border border-neutral-200 m-2 p-2">
          <div className="h-2 w-1/2 rounded-sm bg-neutral-400" />
          <div className="h-1.5 w-3/4 rounded-sm bg-neutral-300" />
          <div className="mt-1 h-4 w-20 rounded-md bg-[#007AFF]/70" />
        </div>
      );
    case "collection-pagination":
      return (
        <div className="flex h-full items-center justify-center gap-1 p-3">
          <div className="h-5 w-5 rounded-md border border-neutral-300" />
          <div className="h-5 w-5 rounded-md bg-neutral-800" />
          <div className="h-5 w-5 rounded-md border border-neutral-300" />
          <div className="h-5 w-5 rounded-md border border-neutral-300" />
        </div>
      );
    default:
      return (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 rounded-lg bg-neutral-300" />
        </div>
      );
  }
}
