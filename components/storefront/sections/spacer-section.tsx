import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { SpacerSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";

interface SpacerSectionProps {
  store: PublicStore;
  settings: SpacerSectionSettings;
  previewDevice?: DeviceMode;
}

export function SpacerSection({ settings }: SpacerSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const height = settings.height?.trim() || "4rem";

  return (
    <div
      aria-hidden
      className="w-full"
      style={{
        height,
        backgroundColor: visual.backgroundColor,
        margin: visual.margin,
      }}
    />
  );
}
