import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { HomeLayout, SectionSettings, StoreSection } from "@/lib/sections/types";
import { getBlock } from "@/lib/builder/block-registry";
import type { BuilderDocumentV2, BuilderElement, BuilderStyle } from "../types";
import { BUILDER_V1_LAYOUT_VERSION } from "../constants";

function mergeStylesIntoSettings(
  content: Record<string, unknown>,
  styles: BuilderStyle,
  responsiveStyles: BuilderElement["responsiveStyles"],
  animation: BuilderElement["animation"],
  metadata: BuilderElement["metadata"]
): Record<string, unknown> {
  const settings: Record<string, unknown> = { ...content, ...styles };

  if (responsiveStyles && Object.keys(responsiveStyles).length > 0) {
    settings.styles = responsiveStyles;
  }

  if (animation.entrance && animation.entrance !== "none") {
    settings.animation = animation.entrance;
  }
  if (typeof animation.delayMs === "number") {
    settings.animationDelayMs = animation.delayMs;
  }

  if (metadata.customClass && typeof metadata.customClass === "string") {
    settings.customClass = metadata.customClass;
  }

  return settings;
}

function v2ElementToV1Section(
  element: BuilderElement,
  section: BuilderDocumentV2["sections"][string]
): StoreSection {
  const block = getBlock(String(element.type));
  const def = SECTION_REGISTRY[section.type];

  const settings = mergeStylesIntoSettings(
    element.content,
    element.styles,
    element.responsiveStyles,
    element.animation,
    element.metadata
  );

  if (block?.defaultContent) {
    Object.assign(settings, block.defaultContent);
    Object.assign(settings, element.content);
  }

  return {
    id: element.id,
    type: section.type,
    settings: {
      ...def.defaultSettings,
      ...section.settings,
      ...settings,
    } as SectionSettings,
    visible: element.visibility,
  };
}

/**
 * Convert V2 document → V1 HomeLayout for storefront rendering.
 * Lossy when V2 has nested child elements not representable in V1 flat sections.
 */
export function v2ToHomeLayout(doc: BuilderDocumentV2): HomeLayout {
  const home = doc.pages.find((p) => p.pageType === "home") ?? doc.pages[0];
  if (!home) {
    return { version: BUILDER_V1_LAYOUT_VERSION, sections: [] };
  }

  const sections: StoreSection[] = [];

  for (const sectionId of home.sections) {
    const sectionMeta = doc.sections[sectionId];
    if (!sectionMeta) continue;

    const root = doc.elements[sectionMeta.rootElementId];
    if (!root) continue;

    sections.push(v2ElementToV1Section(root, sectionMeta));
  }

  return { version: BUILDER_V1_LAYOUT_VERSION, sections };
}

/** Check whether a V2 document can round-trip to V1 without nested-element data loss. */
export function isV2V1Compatible(doc: BuilderDocumentV2): boolean {
  for (const section of Object.values(doc.sections)) {
    if (section.elements.length > 0) return false;
    const root = doc.elements[section.rootElementId];
    if (root && root.children.length > 0) return false;
  }
  return true;
}
