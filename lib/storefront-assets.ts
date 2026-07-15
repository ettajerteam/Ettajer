import type { ThemeId } from "@/lib/themes";
import { isValidThemeId } from "@/lib/themes";

export interface ThemeAssetSet {
  preview: string;
  hero: string;
  collectionCover: string;
  categoryCover: string;
  productPlaceholders: string[];
}

export const THEME_ASSETS: Record<ThemeId, ThemeAssetSet> = {
  minimal: {
    preview: "/assets/themes/minimal-preview.webp",
    hero: "/assets/themes/minimal-hero.webp",
    collectionCover: "/assets/placeholders/collections/minimal-cover.webp",
    categoryCover: "/assets/placeholders/categories/carpets.webp",
    productPlaceholders: [
      "/assets/placeholders/products/minimal-1.webp",
      "/assets/placeholders/products/minimal-2.webp",
      "/assets/placeholders/products/minimal-3.webp",
    ],
  },
  modern: {
    preview: "/assets/themes/modern-preview.webp",
    hero: "/assets/themes/modern-hero.webp",
    collectionCover: "/assets/placeholders/collections/modern-cover.webp",
    categoryCover: "/assets/placeholders/categories/fashion.webp",
    productPlaceholders: [
      "/assets/placeholders/products/modern-1.webp",
      "/assets/placeholders/products/modern-2.webp",
      "/assets/placeholders/products/modern-3.webp",
    ],
  },
  bold: {
    preview: "/assets/themes/bold-preview.webp",
    hero: "/assets/themes/bold-hero.webp",
    collectionCover: "/assets/placeholders/collections/bold-cover.webp",
    categoryCover: "/assets/placeholders/categories/tech.webp",
    productPlaceholders: [
      "/assets/placeholders/products/bold-1.webp",
      "/assets/placeholders/products/bold-2.webp",
      "/assets/placeholders/products/bold-3.webp",
    ],
  },
};

export function resolveThemeId(theme: string): ThemeId {
  return isValidThemeId(theme) ? theme : "minimal";
}

export function getThemeAssets(theme: string): ThemeAssetSet {
  return THEME_ASSETS[resolveThemeId(theme)];
}

export function getProductPlaceholder(theme: string, seed: string): string {
  const assets = getThemeAssets(theme);
  const index =
    Math.abs(seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) %
    assets.productPlaceholders.length;
  return assets.productPlaceholders[index];
}

export function getProductImage(
  theme: string,
  productImages: string[],
  productId: string
): string {
  if (productImages[0]) return productImages[0];
  return getProductPlaceholder(theme, productId);
}
