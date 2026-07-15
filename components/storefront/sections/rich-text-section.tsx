import { getDeviceStyles, parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { RichTextSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface RichTextSectionProps {
  store: PublicStore;
  settings: RichTextSectionSettings;
  previewDevice?: DeviceMode;
}

export function RichTextSection({ store, settings, previewDevice }: RichTextSectionProps) {
  const settingsRecord = settings as Record<string, unknown>;
  const deviceStyles = getDeviceStyles(settingsRecord, previewDevice ?? "desktop");
  const alignment = deviceStyles.alignment ?? settings.alignment ?? "center";
  const isBold = store.theme === "bold";
  const visual = parseSectionVisualSettings(settingsRecord);

  const alignClass =
    alignment === "center"
      ? "text-center"
      : alignment === "right"
        ? "text-right"
        : "text-left";

  const textStyle = {
    color: visual.textColor,
    fontSize: deviceStyles.fontSize ?? visual.fontSize,
    fontWeight: visual.fontWeight,
  };

  return (
    <section className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
      {settings.title ? (
        <h2
          className={cn(
            "text-2xl font-semibold tracking-tight mb-4",
            alignClass,
            isBold && !visual.textColor && "text-white"
          )}
          style={textStyle}
        >
          {settings.title}
        </h2>
      ) : null}
      {settings.content ? (
        <p
          className={cn(
            "text-base leading-relaxed text-muted-foreground whitespace-pre-wrap",
            alignClass,
            isBold && !visual.textColor && "text-zinc-400"
          )}
          style={textStyle}
        >
          {settings.content}
        </p>
      ) : null}
    </section>
  );
}
