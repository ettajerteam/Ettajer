import type { HomeLayout, SectionType, StoreSection } from "@/lib/sections/types";
import { getBlock, getBlockBySectionType } from "./block-registry";
import {
  buildStylesFromDefaults,
  mergeSectionSettings,
} from "./blocks/components";
import type { BlockDefinition, BlockId, BuilderDocument, BuilderElement, BuilderPage } from "./types";

function mergeBlockDefaults(
  block: BlockDefinition,
  overrides?: Record<string, unknown>
): Record<string, unknown> {
  const desktop = block.defaultStyles.desktop ?? {};
  const responsiveStyles = buildStylesFromDefaults(block.defaultStyles);

  const settings: Record<string, unknown> = {
    ...block.defaultContent,
    ...desktop,
    ...overrides,
  };

  if (responsiveStyles && overrides?.styles == null) {
    settings.styles = responsiveStyles;
  }

  return settings;
}

export function sectionToBlockId(section: StoreSection): BlockId {
  const byType = getBlockBySectionType(section.type);
  if (byType) return byType.id;
  return section.type as BlockId;
}

export function sectionToBuilderElement(section: StoreSection): BuilderElement {
  return {
    id: section.id,
    kind: "section",
    type: sectionToBlockId(section),
    parentId: null,
    children: [],
    content: { ...(section.settings as Record<string, unknown>) },
    styles: {},
    responsive: {},
    animation: { entrance: "none" },
    visible: section.visible,
  };
}

export function builderElementToSection(element: BuilderElement): StoreSection | null {
  const block = getBlock(String(element.type));
  if (!block?.legacySectionType) return null;

  return {
    id: element.id,
    type: block.legacySectionType,
    settings: mergeBlockDefaults(block, element.content) as StoreSection["settings"],
    visible: element.visible,
  };
}

export function homeLayoutToBuilderDocument(layout: HomeLayout): BuilderDocument {
  const elements: Record<string, BuilderElement> = {};
  const rootElementIds: string[] = [];

  for (const section of layout.sections) {
    const el = sectionToBuilderElement(section);
    elements[el.id] = el;
    rootElementIds.push(el.id);
  }

  const homePage: BuilderPage = {
    id: "home",
    slug: "",
    title: "Home",
    type: "home",
    rootElementIds,
  };

  return { version: 2, pages: [homePage], elements };
}

export function builderDocumentToHomeLayout(doc: BuilderDocument): HomeLayout {
  const home = doc.pages.find((p) => p.type === "home") ?? doc.pages[0];
  if (!home) return { version: 1, sections: [] };

  const sections: StoreSection[] = [];
  for (const id of home.rootElementIds) {
    const el = doc.elements[id];
    if (!el) continue;
    const section = builderElementToSection(el);
    if (section) sections.push(section);
  }

  return { version: 1, sections };
}

export function createSectionFromBlock(
  blockId: BlockId,
  overrides?: { settings?: Record<string, unknown> }
): StoreSection | null {
  const block = getBlock(blockId);
  if (!block?.legacySectionType || !block.implemented) return null;

  const id = `${block.legacySectionType}-${Math.random().toString(36).slice(2, 10)}`;

  return {
    id,
    type: block.legacySectionType,
    settings: mergeBlockDefaults(block, overrides?.settings) as StoreSection["settings"],
    visible: true,
  };
}

export function blockIdToSectionType(blockId: BlockId): SectionType | null {
  return getBlock(blockId)?.legacySectionType ?? null;
}

export { mergeSectionSettings };
