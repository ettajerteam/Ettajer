import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import { getBlock, getBlockBySectionType } from "./block-registry";
import { sectionToBlockId } from "./legacy-adapter";

export type LayoutSectionChangeKind = "added" | "removed" | "reordered" | "changed";

export type LayoutSectionChange = {
  kind: LayoutSectionChangeKind;
  sectionId: string;
  label: string;
  detail: string;
};

function sectionLabel(section: StoreSection): string {
  if (section.label?.trim()) return section.label.trim();
  const block = getBlockBySectionType(section.type) ?? getBlock(sectionToBlockId(section));
  if (block?.name) return block.name;
  return SECTION_REGISTRY[section.type]?.label ?? section.type;
}

function sectionFingerprint(section: StoreSection): string {
  return JSON.stringify({
    type: section.type,
    visible: section.visible,
    settings: section.settings,
    label: section.label ?? null,
  });
}

/** Diff draft vs saved layout into merchant-readable section changes. */
export function diffLayouts(
  draft: HomeLayout | undefined | null,
  saved: HomeLayout | undefined | null
): LayoutSectionChange[] {
  const draftSections = draft?.sections ?? [];
  const savedSections = saved?.sections ?? [];
  const changes: LayoutSectionChange[] = [];

  const savedById = new Map(savedSections.map((s) => [s.id, s]));
  const draftById = new Map(draftSections.map((s) => [s.id, s]));
  const savedOrder = savedSections.map((s) => s.id);
  const draftOrder = draftSections.map((s) => s.id);

  for (const section of draftSections) {
    const prev = savedById.get(section.id);
    if (!prev) {
      changes.push({
        kind: "added",
        sectionId: section.id,
        label: sectionLabel(section),
        detail: "Added section",
      });
      continue;
    }
    if (sectionFingerprint(section) !== sectionFingerprint(prev)) {
      changes.push({
        kind: "changed",
        sectionId: section.id,
        label: sectionLabel(section),
        detail: section.visible !== prev.visible
          ? section.visible
            ? "Shown"
            : "Hidden"
          : "Content or style updated",
      });
    }
  }

  for (const section of savedSections) {
    if (!draftById.has(section.id)) {
      changes.push({
        kind: "removed",
        sectionId: section.id,
        label: sectionLabel(section),
        detail: "Removed section",
      });
    }
  }

  const shared = draftOrder.filter((id) => savedById.has(id) && draftById.has(id));
  const savedShared = savedOrder.filter((id) => draftById.has(id));
  if (
    shared.length > 1 &&
    shared.length === savedShared.length &&
    shared.some((id, i) => id !== savedShared[i])
  ) {
    changes.push({
      kind: "reordered",
      sectionId: shared[0]!,
      label: "Section order",
      detail: "Sections reordered",
    });
  }

  return changes;
}
