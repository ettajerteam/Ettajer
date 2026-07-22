import { getBlock, getBlockBySectionType } from "@/lib/builder/block-registry";
import { getAllSchemaFields } from "@/lib/builder/schema-inspector-utils";
import { sectionToBlockId } from "@/lib/builder/legacy-adapter";
import type { InspectorElementFocus } from "@/lib/builder/inspector-config";
import type { StoreSection } from "@/lib/sections/types";

/** Pick the best image/media setting key for the current selection. */
export function resolveImageSettingKey(
  section: StoreSection | null | undefined,
  inspectorFocus?: InspectorElementFocus | null
): string | null {
  if (!section) return null;
  const block =
    getBlockBySectionType(section.type) ?? getBlock(sectionToBlockId(section));
  if (!block?.settingsSchema) return null;

  const fields = getAllSchemaFields(block.settingsSchema).filter(
    (f) => f.type === "image" || f.type === "media"
  );
  if (fields.length === 0) return null;

  if (inspectorFocus === "image") {
    const focused = fields.find((f) => {
      const focus = f.focus;
      if (!focus) return true;
      return Array.isArray(focus) ? focus.includes("image") : focus === "image";
    });
    if (focused) return focused.key;
  }

  return fields[0]?.key ?? null;
}
