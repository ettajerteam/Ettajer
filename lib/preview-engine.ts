import type { PublicStore } from "@/types/storefront";
import type { StoreThemeSettings } from "@/types/storefront";
import type { PreviewPage, PreviewPaths } from "@/types/theme";
import type { HomeLayout } from "@/lib/sections/types";
import { encodeLayoutForPreview } from "@/lib/sections/parse";
import { isValidThemeId } from "@/lib/themes";

export type { PreviewPage, PreviewPaths };

export interface PreviewParams {
  preview?: string;
  theme?: string;
  primary?: string;
  secondary?: string;
  font?: string;
  logo?: string;
  layout?: string;
}

function getPreviewPath(slug: string, page: PreviewPage, paths?: PreviewPaths): string {
  switch (page) {
    case "product":
      return paths?.product ? `/store/${slug}/product/${paths.product}` : `/store/${slug}`;
    case "category":
      return paths?.category ? `/store/${slug}/category/${paths.category}` : `/store/${slug}`;
    case "collection":
      return paths?.collection ? `/store/${slug}/collection/${paths.collection}` : `/store/${slug}`;
    default:
      return `/store/${slug}`;
  }
}

export function buildPreviewUrl(
  slug: string,
  settings?: StoreThemeSettings,
  page: PreviewPage = "home",
  paths?: PreviewPaths,
  layout?: HomeLayout | null,
  selectedSectionId?: string | null,
  previewDevice?: "desktop" | "tablet" | "mobile",
  pageSlug?: string
): string {
  const params = new URLSearchParams({ preview: "true" });

  if (settings?.theme) params.set("theme", settings.theme);
  if (settings?.primaryColor) params.set("primary", settings.primaryColor);
  if (settings?.secondaryColor) params.set("secondary", settings.secondaryColor);
  if (settings?.font) params.set("font", settings.font);
  if (settings?.logo) params.set("logo", settings.logo);
  if (layout) params.set("layout", encodeLayoutForPreview(layout));
  if (selectedSectionId) params.set("section", selectedSectionId);
  if (previewDevice) params.set("device", previewDevice);

  if (pageSlug) {
    return `/store/${slug}/pages/${pageSlug}?${params.toString()}`;
  }

  return `${getPreviewPath(slug, page, paths)}?${params.toString()}`;
}

export function applyPreviewOverrides(
  store: PublicStore,
  searchParams: PreviewParams
): PublicStore {
  if (searchParams.preview !== "true") return store;

  const updated = { ...store };

  if (searchParams.theme && isValidThemeId(searchParams.theme)) {
    updated.theme = searchParams.theme;
  }
  if (searchParams.primary) {
    updated.primaryColor = decodeURIComponent(searchParams.primary);
  }
  if (searchParams.secondary) {
    updated.secondaryColor = decodeURIComponent(searchParams.secondary);
  }
  if (searchParams.font) {
    updated.font = decodeURIComponent(searchParams.font);
  }
  if (searchParams.logo) {
    updated.logo = decodeURIComponent(searchParams.logo);
  }

  return updated;
}
