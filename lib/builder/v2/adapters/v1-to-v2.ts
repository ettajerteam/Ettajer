import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import { sectionToBlockId } from "@/lib/builder/legacy-adapter";
import {
  getSectionVisualStyles,
  normalizeSectionSettings,
} from "@/lib/builder/responsive-styles";
import type { BuilderStyle } from "../types/styles";
import type {
  BuilderDocumentV2,
  BuilderElement,
  BuilderPage,
  BuilderSection,
} from "../types";
import { BUILDER_V2_DOCUMENT_VERSION, BUILDER_V2_HOME_PAGE_ID } from "../constants";
import { generateSectionId } from "../utils/ids";

const CONTENT_KEYS = new Set([
  "headline",
  "subheadline",
  "ctaText",
  "ctaLink",
  "title",
  "content",
  "alignment",
  "showStoreDescription",
  "showPoweredBy",
  "imageUrl",
  "alt",
]);

const STYLE_KEYS = new Set([
  "padding",
  "margin",
  "backgroundColor",
  "textColor",
  "fontSize",
  "fontWeight",
  "borderRadius",
  "boxShadow",
  "width",
  "height",
  "minHeight",
  "columns",
]);

function splitSettings(settings: Record<string, unknown>): {
  content: Record<string, unknown>;
  styles: BuilderStyle;
  responsiveStyles: BuilderElement["responsiveStyles"];
} {
  const normalized = normalizeSectionSettings(settings);
  const content: Record<string, unknown> = {};
  const styles: BuilderStyle = {};

  for (const [key, value] of Object.entries(normalized)) {
    if (key === "styles" || key === "hideOnMobile" || key === "hideOnDesktop") continue;
    if (CONTENT_KEYS.has(key)) {
      content[key] = value;
    } else if (STYLE_KEYS.has(key)) {
      styles[key] = value;
    } else if (
      key === "animation" ||
      key === "animationDelayMs" ||
      key === "customClass"
    ) {
      content[key] = value;
    }
  }

  return {
    content,
    styles,
    responsiveStyles: getSectionVisualStyles(normalized) as BuilderElement["responsiveStyles"],
  };
}

function v1SectionToV2Element(section: StoreSection): BuilderElement {
  const settings = section.settings as Record<string, unknown>;
  const { content, styles, responsiveStyles } = splitSettings(settings);
  const blockId = sectionToBlockId(section);

  return {
    id: section.id,
    type: blockId,
    parentId: null,
    children: [],
    content,
    styles,
    responsiveStyles,
    visibility: section.visible,
    animation: {
      entrance:
        (settings.animation as BuilderElement["animation"]["entrance"]) ?? "none",
      delayMs:
        typeof settings.animationDelayMs === "number"
          ? settings.animationDelayMs
          : undefined,
    },
    metadata: {
      label: section.type,
      blockId,
      legacySectionId: section.id,
      migratedFromV1: true,
    },
  };
}

function v1SectionToV2Section(section: StoreSection, sortOrder: number): BuilderSection {
  const blockId = sectionToBlockId(section);
  return {
    id: section.id,
    type: section.type,
    elements: [],
    settings: section.settings,
    visible: section.visible,
    metadata: {
      blockId,
      label: section.type,
      legacySectionId: section.id,
      migratedFromV1: true,
    },
    rootElementId: section.id,
    sortOrder,
  };
}

/**
 * Convert V1 HomeLayout → V2 document (read-only, non-destructive).
 * Used for preview, AI output, and future migration — does not write to DB.
 */
export function homeLayoutToV2(layout: HomeLayout): BuilderDocumentV2 {
  const sections: Record<string, BuilderSection> = {};
  const elements: Record<string, BuilderElement> = {};
  const pageSections: string[] = [];

  layout.sections.forEach((section, index) => {
    pageSections.push(section.id);
    sections[section.id] = v1SectionToV2Section(section, index);
    elements[section.id] = v1SectionToV2Element(section);
  });

  const homePage: BuilderPage = {
    id: BUILDER_V2_HOME_PAGE_ID,
    slug: "",
    title: "Home",
    pageType: "home",
    sections: pageSections,
  };

  return {
    version: BUILDER_V2_DOCUMENT_VERSION,
    pages: [homePage],
    sections,
    elements,
    metadata: {
      migratedFromV1: true,
      sourceLayoutVersion: 1,
    },
  };
}

/** Create an empty V2 home document. */
export function createEmptyV2Document(): BuilderDocumentV2 {
  return {
    version: BUILDER_V2_DOCUMENT_VERSION,
    pages: [
      {
        id: BUILDER_V2_HOME_PAGE_ID,
        slug: "",
        title: "Home",
        pageType: "home",
        sections: [],
      },
    ],
    sections: {},
    elements: {},
  };
}

/** Create a new V2 section shell from block id (for future editor use). */
export function createV2SectionShell(
  blockId: string,
  legacyType: StoreSection["type"],
  sortOrder: number
): { section: BuilderSection; element: BuilderElement } {
  const id = generateSectionId(legacyType);
  const def = SECTION_REGISTRY[legacyType];

  const element: BuilderElement = {
    id,
    type: blockId,
    parentId: null,
    children: [],
    content: {},
    styles: {},
    responsiveStyles: {},
    visibility: true,
    animation: { entrance: "none" },
    metadata: { blockId, label: legacyType },
  };

  const section: BuilderSection = {
    id,
    type: legacyType,
    elements: [],
    settings: { ...def.defaultSettings },
    visible: true,
    metadata: { blockId, label: legacyType },
    rootElementId: id,
    sortOrder,
  };

  return { section, element };
}
