import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { ImageSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { resolveStoreNavHref } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

interface ImageSectionProps {
  store: PublicStore;
  settings: ImageSectionSettings;
  previewDevice?: DeviceMode;
}

function objectFitClass(fit: ImageSectionSettings["objectFit"]): string {
  if (fit === "contain") return "object-contain";
  if (fit === "fill") return "object-fill";
  return "object-cover";
}

export function ImageSection({ store, settings, previewDevice }: ImageSectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const imageUrl = settings.imageUrl?.trim();
  const alignment = deviceStyles.alignment ?? settings.alignment ?? "center";
  const layout = settings.layout ?? "contained";
  const fit = objectFitClass(settings.objectFit);
  const caption = settings.caption?.trim();
  const linkUrl = settings.linkUrl?.trim();
  const href = linkUrl ? resolveStoreNavHref(store.slug, linkUrl) : null;

  if (!imageUrl) {
    return (
      <div
        className="mx-auto flex max-w-6xl items-center justify-center px-6 py-12"
        style={{
          padding: visual.padding,
          margin: visual.margin,
          backgroundColor: visual.backgroundColor,
        }}
      >
        <div className="flex h-48 w-full max-w-2xl items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-sm text-neutral-400">
          Add an image in the editor
        </div>
      </div>
    );
  }

  const alt = settings.alt?.trim() || "Store image";

  const wrapLink = (node: ReactNode) =>
    href ? (
      <Link href={href} className="block">
        {node}
      </Link>
    ) : (
      <>{node}</>
    );

  const captionEl = caption ? (
    <p
      className={cn(
        "mt-3 text-sm text-neutral-500",
        alignment === "center" && "text-center",
        alignment === "right" && "text-right"
      )}
    >
      {caption}
    </p>
  ) : null;

  if (layout === "cinematic") {
    return (
      <div
        style={{
          padding: visual.padding,
          margin: visual.margin,
          backgroundColor: visual.backgroundColor,
        }}
      >
        {wrapLink(
          <div className="relative min-h-[55vh] w-full overflow-hidden md:min-h-[72vh]">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className={cn(fit, "object-center")}
              sizes="100vw"
              unoptimized={imageUrl.startsWith("http")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        )}
        {caption ? (
          <p className="mx-auto max-w-6xl px-6 py-4 text-center text-[12px] tracking-wide text-neutral-400 sm:text-left sm:text-[13px]">
            {caption}
          </p>
        ) : null}
      </div>
    );
  }

  if (layout === "editorial") {
    return (
      <div
        className="px-4 sm:px-6"
        style={{
          padding: visual.padding,
          margin: visual.margin,
          backgroundColor: visual.backgroundColor,
        }}
      >
        <div className="relative mx-auto max-w-7xl overflow-hidden">
          {wrapLink(
            <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] md:aspect-[21/9]">
              <Image
                src={imageUrl}
                alt={alt}
                fill
                className={cn(fit, "object-center")}
                sizes="(max-width: 768px) 100vw, 1400px"
                unoptimized={imageUrl.startsWith("http")}
              />
            </div>
          )}
          {captionEl}
        </div>
      </div>
    );
  }

  const width = visual.width ?? "100%";
  const borderRadius = visual.borderRadius ?? "0.5rem";

  return (
    <div
      className="mx-auto max-w-6xl px-6"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
        textAlign: alignment,
      }}
    >
      {wrapLink(
        <div
          className={cn(
            "relative inline-block overflow-hidden",
            alignment === "center" && "mx-auto",
            alignment === "right" && "ml-auto"
          )}
          style={{ width, maxWidth: "100%" }}
        >
          <div className="relative aspect-[16/9] w-full min-h-[12rem]" style={{ borderRadius }}>
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className={fit}
              sizes="(max-width: 768px) 100vw, 1200px"
              style={{ borderRadius }}
              unoptimized={imageUrl.startsWith("http")}
            />
          </div>
        </div>
      )}
      {captionEl}
    </div>
  );
}
