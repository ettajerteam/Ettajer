import type { StoreSection } from "@/lib/sections/types";
import { stripComponentRef } from "./section-meta";
import type { ComponentRoot } from "./types";

function cloneSectionTemplate(section: StoreSection): StoreSection {
  const stripped = stripComponentRef(section);
  return JSON.parse(JSON.stringify(stripped)) as StoreSection;
}

/** Capture selected sections as a reusable component root (V1 sections array). */
export function captureSectionsAsComponentRoot(
  sections: StoreSection[],
  selectionIds: string[]
): ComponentRoot | null {
  const selected = selectionIds
    .map((id) => sections.find((s) => s.id === id))
    .filter((s): s is StoreSection => Boolean(s));

  if (selected.length === 0) return null;

  return {
    kind: "sections",
    sections: selected.map(cloneSectionTemplate),
  };
}

export function getComponentRootSections(root: ComponentRoot): StoreSection[] {
  if (root.kind === "sections") return root.sections;
  return [];
}
