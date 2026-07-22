import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { DividerSectionSettings } from "@/lib/sections/types";
import type { PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface DividerSectionProps {
  store: PublicStore;
  settings: DividerSectionSettings;
  previewDevice?: DeviceMode;
}

export function DividerSection({ settings }: DividerSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const thickness = settings.thickness?.trim() || "1px";
  const width = settings.width?.trim() || "100%";
  const color = settings.color?.trim() || visual.textColor || "#e5e5e5";
  const alignment = settings.alignment ?? "center";

  return (
    <div
      className={cn(
        "flex w-full px-6",
        alignment === "left" && "justify-start",
        alignment === "center" && "justify-center",
        alignment === "right" && "justify-end"
      )}
      style={{
        padding: visual.padding ?? "1.5rem 1.5rem",
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
      }}
    >
      <hr
        className="border-0"
        style={{
          width,
          maxWidth: "100%",
          height: thickness,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
