import type { SectionType } from "./types";
import { ALL_SECTION_TYPES } from "./types";
import { blockRegistry } from "@/lib/builder/block-registry-service";
import { registerAllBlocks } from "@/lib/builder/blocks/register";

export interface SectionDefinition {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
  defaultSettings: Record<string, unknown>;
}

/** Static fallbacks if block registry is unavailable during init. */
const STATIC_SECTION_REGISTRY: Partial<Record<SectionType, SectionDefinition>> = {
  hero: {
    type: "hero",
    label: "Hero banner",
    description: "Store name, image, and intro",
    icon: "image",
    defaultSettings: { showStoreDescription: true },
  },
  "featured-collections": {
    type: "featured-collections",
    label: "Featured collections",
    description: "Highlight your collections",
    icon: "grid",
    defaultSettings: { title: "Featured Collections" },
  },
  "product-grid": {
    type: "product-grid",
    label: "Product grid",
    description: "Showcase your products",
    icon: "shopping-bag",
    defaultSettings: { title: "Products" },
  },
  "rich-text": {
    type: "rich-text",
    label: "Rich text",
    description: "Custom content block",
    icon: "type",
    defaultSettings: {
      title: "About us",
      content: "Tell your brand story here.",
      alignment: "center",
    },
  },
  image: {
    type: "image",
    label: "Image",
    description: "Full-width or contained image",
    icon: "image",
    defaultSettings: { imageUrl: "", alt: "" },
  },
  footer: {
    type: "footer",
    label: "Footer",
    description: "Copyright and powered by",
    icon: "minus",
    defaultSettings: { showPoweredBy: true },
  },
};

function blockToSectionDefinition(type: SectionType): SectionDefinition | undefined {
  const block = blockRegistry.getBySectionType(type);
  if (!block) return undefined;

  const desktop = block.defaultStyles.desktop ?? {};
  return {
    type,
    label: block.name,
    description: block.description,
    icon: block.icon,
    defaultSettings: { ...block.defaultContent, ...desktop },
  };
}

function buildSectionRegistry(): Record<SectionType, SectionDefinition> {
  const registry = {} as Record<SectionType, SectionDefinition>;
  for (const type of ALL_SECTION_TYPES) {
    registry[type] = blockToSectionDefinition(type) ?? STATIC_SECTION_REGISTRY[type] ?? {
      type,
      label: type.replace(/-/g, " "),
      description: "",
      icon: "box",
      defaultSettings: {},
    };
  }
  return registry;
}

registerAllBlocks(blockRegistry);

/**
 * V1 section catalog — derived from the Block Registry when available.
 * Kept for backward compatibility with existing editor and template code.
 */
export const SECTION_REGISTRY: Record<SectionType, SectionDefinition> = buildSectionRegistry();

/** Section types that can be added via the legacy section picker. */
export const ADDABLE_SECTION_TYPES: SectionType[] = blockRegistry
  .getImplemented()
  .map((block) => block.legacySectionType)
  .filter((type): type is SectionType => type != null)
  .filter((type, index, all) => all.indexOf(type) === index);

/** Rebuild SECTION_REGISTRY after dynamic block registration. */
export function syncSectionRegistry(): void {
  const next = buildSectionRegistry();
  for (const type of ALL_SECTION_TYPES) {
    SECTION_REGISTRY[type] = next[type];
  }
}

export { blockRegistry };
