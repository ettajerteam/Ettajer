import Image from "next/image";
import { parseSectionVisualSettings, getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { ImageSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface ImageSectionProps {
  store: PublicStore;
  settings: ImageSectionSettings;
  previewDevice?: DeviceMode;
}

export function ImageSection({ settings, previewDevice }: ImageSectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const visual = parseSectionVisualSettings(settingsRecord);
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const imageUrl = settings.imageUrl?.trim();
  const alignment = deviceStyles.alignment ?? settings.alignment ?? "center";

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
            alt={settings.alt?.trim() || "Store image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            style={{ borderRadius }}
          />
        </div>
      </div>
    </div>
  );
}
