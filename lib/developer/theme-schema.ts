import { ALL_SECTION_TYPES, HOME_SECTION_TYPES, PRODUCT_ALLOWED_SECTION_TYPES, COLLECTION_ALLOWED_SECTION_TYPES } from "@/lib/sections/types";
import { SECTION_REGISTRY, getSectionDefinition } from "@/lib/sections/registry";
import { blockRegistry } from "@/lib/builder/block-registry-service";
import { registerAllBlocks } from "@/lib/builder/blocks/register";
import { emptyThemeDocument } from "@/lib/developer/theme-document";
import { THEME_TEMPLATES } from "@/lib/themes";

let blocksRegistered = false;
function ensureBlocks() {
  if (blocksRegistered) return;
  try {
    registerAllBlocks(blockRegistry);
  } catch {
    // already registered
  }
  blocksRegistered = true;
}

/** Canonical machine-readable theme capabilities from real Ettajer registries. */
export function buildCanonicalThemeSchema() {
  ensureBlocks();

  const sections = ALL_SECTION_TYPES.map((type) => {
    const def = getSectionDefinition(type) ?? SECTION_REGISTRY[type];
    const block = blockRegistry.get(type as never);
    const settingsSchema = block?.settingsSchema
      ? {
          content: block.settingsSchema.content ?? [],
          styles: block.settingsSchema.styles ?? [],
          layout: block.settingsSchema.layout ?? [],
          advanced: block.settingsSchema.advanced ?? [],
        }
      : null;

    return {
      type,
      label: def?.label ?? type,
      description: def?.description ?? "",
      icon: def?.icon ?? "box",
      defaultSettings: def?.defaultSettings ?? {},
      templates: {
        home: HOME_SECTION_TYPES.includes(type as never),
        product: PRODUCT_ALLOWED_SECTION_TYPES.includes(type as never),
        collection: COLLECTION_ALLOWED_SECTION_TYPES.includes(type as never),
      },
      implemented: block?.implemented ?? true,
      settingsSchema,
      references: {
        products:
          type === "product-grid" ||
          type === "product-card" ||
          type === "product-related" ||
          type === "product-recently-viewed",
        collections: type === "featured-collections" || type === "collection-product-grid",
        media: type === "image" || type === "gallery" || type === "hero" || type === "video",
      },
    };
  });

  return {
    version: 1,
    principle: {
      ai: "presentation / theme / layout / content structure",
      ettajer: "products / inventory / cart / checkout / payments / orders",
    },
    document: emptyThemeDocument(),
    documentShape: {
      version: 1,
      theme: {
        theme: "minimal | modern | bold",
        primaryColor: "hex string",
        secondaryColor: "hex string",
        font: "font family name",
        logo: "url | null",
      },
      navigation: "NavItem[] { id, label, href, children? }",
      templates: {
        home: "HomeLayout { version: 1, sections: StoreSection[] }",
        product: "HomeLayout",
        collection: "HomeLayout",
        blogPost: "HomeLayout (optional)",
      },
      pages: "Array<{ id?, slug, title, layout: HomeLayout, status?: draft|published }>",
    },
    styleThemes: THEME_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      tagline: t.tagline,
    })),
    typography: {
      fonts: "Store.font string — applied storefront-wide",
      sectionFields: ["fontSize", "fontWeight", "textColor"],
    },
    colors: {
      themeTokens: ["primaryColor", "secondaryColor", "textColor", "mutedColor", "borderColor"],
      sectionFields: ["backgroundColor", "textColor"],
    },
    spacing: {
      sectionFields: ["padding", "margin", "width", "height", "minHeight", "borderRadius"],
    },
    templates: {
      home: { allowedSectionTypes: HOME_SECTION_TYPES },
      product: { allowedSectionTypes: PRODUCT_ALLOWED_SECTION_TYPES },
      collection: { allowedSectionTypes: COLLECTION_ALLOWED_SECTION_TYPES },
      blogPost: { allowedSectionTypes: HOME_SECTION_TYPES },
      pages: { allowedSectionTypes: HOME_SECTION_TYPES },
    },
    sections,
    references: {
      product: {
        shape: { productId: "string (must belong to authenticated store)" },
        also: "settings.products: Array<string | { productId: string }>",
      },
      collection: {
        shape: { collectionId: "string (must belong to authenticated store)" },
        also: "settings.collections / collectionIds arrays",
      },
      media: {
        shape: { mediaId: "string (must belong to authenticated store)" },
        also: "settings.imageUrl may be an Ettajer media URL",
      },
    },
    navigation: {
      item: { id: "string", label: "string", href: "string", children: "NavItem[]?" },
      note: "Do not replace /cart or /checkout commerce routes",
    },
    restrictions: [
      "No arbitrary React/HTML/JS execution in themes",
      "No script tags or javascript: URLs",
      "No cross-store product/collection/media IDs",
      "Publishing requires themes:publish and is transactional",
      "System commerce routes /products /cart /checkout are not replaceable by theme pages",
    ],
  };
}
