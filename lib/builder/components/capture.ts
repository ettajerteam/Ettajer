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

export function getComponentRootSections(root: ComponentRoot | null | undefined): StoreSection[] {
  if (!root || typeof root !== "object") return [];
  if (root.kind === "sections" && Array.isArray(root.sections)) {
    return root.sections.filter(
      (section): section is StoreSection =>
        !!section &&
        typeof section === "object" &&
        typeof section.id === "string" &&
        typeof section.type === "string"
    );
  }
  // Legacy / corrupt payloads sometimes stored a bare sections array
  if (Array.isArray((root as { sections?: unknown }).sections)) {
    return ((root as { sections: unknown[] }).sections).filter(
      (section): section is StoreSection =>
        !!section &&
        typeof section === "object" &&
        typeof (section as StoreSection).id === "string" &&
        typeof (section as StoreSection).type === "string"
    );
  }
  return [];
}
