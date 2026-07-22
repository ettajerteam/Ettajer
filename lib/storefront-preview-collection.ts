import { getThemeAssets } from "@/lib/storefront-assets";
import type { PublicCollection } from "@/types/storefront";

export const PREVIEW_COLLECTION_SLUG = "__preview__";

export function isPreviewCollectionSlug(slug: string): boolean {
  return slug === PREVIEW_COLLECTION_SLUG;
}

export function getPreviewPlaceholderCollection(theme: string): PublicCollection {
  const assets = getThemeAssets(theme);

  return {
    id: "preview-placeholder",
    name: "Your collection",
    slug: PREVIEW_COLLECTION_SLUG,
    description: "Collection description will appear here when you add collections in your dashboard.",
    image: assets.collectionCover,
    featured: false,
  };
}
