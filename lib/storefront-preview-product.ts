import { getThemeAssets } from "@/lib/storefront-assets";
import type { PublicProduct, PublicStore } from "@/types/storefront";

/** Reserved slug for editor PDP template preview when no catalog product is selected. */
export const PREVIEW_PRODUCT_SLUG = "__preview__";

export function isPreviewProductSlug(slug: string): boolean {
  return slug === PREVIEW_PRODUCT_SLUG;
}

/** Neutral placeholder for PDP template editing — not published, not a demo catalog item. */
export function getPreviewPlaceholderProduct(store: PublicStore): PublicProduct {
  const images = getThemeAssets(store.theme).productPlaceholders;

  return {
    id: "preview-placeholder",
    title: "Your product",
    slug: PREVIEW_PRODUCT_SLUG,
    description: "<p>Your product description will appear here when you add items to your catalog.</p>",
    price: 0,
    comparePrice: null,
    inventory: 0,
    images: [images[0] ?? "/assets/placeholders/products/modern-1.webp"],
    variants: [],
    tags: [],
    details: [
      { id: "preview-brand", label: "Brand", value: store.name },
      { id: "preview-material", label: "Material", value: "Premium cotton" },
    ],
    reviews: [],
  };
}
