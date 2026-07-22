import type { PublicStore } from "@/types/storefront";
import type { StoreThemeSettings } from "@/types/storefront";
import type { PreviewPage, PreviewPaths } from "@/types/theme";
import type { HomeLayout } from "@/lib/sections/types";
import { encodeLayoutForPreview } from "@/lib/sections/parse";
import { isValidThemeId } from "@/lib/themes";
import { PREVIEW_PRODUCT_SLUG } from "@/lib/storefront-preview-product";
import { PREVIEW_COLLECTION_SLUG } from "@/lib/storefront-preview-collection";
import { resolveManagedStorePageUrl, isDedicatedStorefrontRouteSlug } from "@/lib/editor-pages-config";

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
      return `/store/${slug}/product/${paths?.product ?? PREVIEW_PRODUCT_SLUG}`;
    case "category":
      return paths?.category ? `/store/${slug}/category/${paths.category}` : `/store/${slug}`;
    case "collection":
      return `/store/${slug}/collection/${paths?.collection ?? PREVIEW_COLLECTION_SLUG}`;
    default:
      return `/store/${slug}`;
  }
}

export interface PreviewQueryOptions {
  settings?: StoreThemeSettings;
  layout?: HomeLayout | null;
  selectedSectionId?: string | null;
  previewDevice?: "desktop" | "tablet" | "mobile";
}

export function buildPreviewQueryString(options: PreviewQueryOptions): string {
  const params = new URLSearchParams({ preview: "true" });
  const { settings, layout, selectedSectionId, previewDevice } = options;

  if (settings?.theme) params.set("theme", settings.theme);
  if (settings?.primaryColor) params.set("primary", settings.primaryColor);
  if (settings?.secondaryColor) params.set("secondary", settings.secondaryColor);
  if (settings?.font) params.set("font", settings.font);
  if (settings?.logo) params.set("logo", settings.logo);
  if (layout) params.set("layout", encodeLayoutForPreview(layout));
  if (selectedSectionId) params.set("section", selectedSectionId);
  if (previewDevice) params.set("device", previewDevice);

  return params.toString();
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
  const query = buildPreviewQueryString({
    settings,
    layout,
    selectedSectionId,
    previewDevice,
  });

  if (pageSlug) {
    if (isDedicatedStorefrontRouteSlug(pageSlug)) {
      return `${resolveManagedStorePageUrl(slug, pageSlug)}?${query}`;
    }
    return `/store/${slug}/pages/${pageSlug}?${query}`;
  }

  return `${getPreviewPath(slug, page, paths)}?${query}`;
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
