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
    defaultSettings: {
      title: "Featured Collections",
      collectionSource: "featured",
      limit: 6,
    },
  },
  "product-grid": {
    type: "product-grid",
    label: "Product grid",
    description: "Showcase your products",
    icon: "shopping-bag",
    defaultSettings: {
      title: "Products",
      subtitle: "",
      productSource: "latest",
      limit: 8,
      offset: 0,
      showViewAll: true,
    },
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
      layout: "default",
    },
  },
  image: {
    type: "image",
    label: "Image",
    description: "Full-width or contained image",
    icon: "image",
    defaultSettings: { imageUrl: "", alt: "", caption: "", layout: "contained", objectFit: "cover" },
  },
  gallery: {
    type: "gallery",
    label: "Gallery",
    description: "Image grid or carousel",
    icon: "images",
    defaultSettings: { layout: "grid", columns: 3, images: "" },
  },
  video: {
    type: "video",
    label: "Video",
    description: "Embed a video",
    icon: "video",
    defaultSettings: { videoSource: "url", videoUrl: "", aspectRatio: "16/9" },
  },
  "contact-form": {
    type: "contact-form",
    label: "Contact form",
    description: "Let visitors reach you",
    icon: "form",
    defaultSettings: {
      title: "Get in touch",
      description: "Send a message and we’ll reply as soon as we can.",
      buttonText: "Send message",
      showPhone: true,
    },
  },
  faq: {
    type: "faq",
    label: "FAQ",
    description: "Expandable Q&A list",
    icon: "help",
    defaultSettings: {
      title: "Frequently asked questions",
      items: [],
    },
  },
  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    description: "Customer quote cards",
    icon: "quote",
    defaultSettings: {
      title: "What customers say",
      items: [],
    },
  },
  footer: {
    type: "footer",
    label: "Footer",
    description: "Brand, navigation, client care, and legal links",
    icon: "minus",
    defaultSettings: {
      showPoweredBy: true,
      tagline: "",
      showNav: true,
      showClientCare: true,
      showLegal: true,
      backgroundColor: "#0a0a0a",
      textColor: "#a3a3a3",
      padding: "4rem 1.5rem 3rem",
    },
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

/** Safe label for toasts / layers — never throws on unknown types. */
export function getSectionLabel(type: string | undefined | null, fallback?: string): string {
  if (!type) return fallback ?? "Section";
  const def = (SECTION_REGISTRY as Partial<Record<string, SectionDefinition>>)[type];
  return def?.label ?? fallback ?? type.replace(/-/g, " ");
}

export function getSectionDefinition(type: string | undefined | null): SectionDefinition | undefined {
  if (!type) return undefined;
  return (SECTION_REGISTRY as Partial<Record<string, SectionDefinition>>)[type];
}

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
