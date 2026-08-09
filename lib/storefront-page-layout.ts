import type { ThemeId } from "@/lib/themes";
import type { HomeLayout } from "@/lib/sections/types";
import { getStorePageBySlug } from "@/lib/pages";
import { extractLayoutFromPageContent } from "@/lib/page-layout";
import { decodeLayoutFromPreview, parseHomeLayout } from "@/lib/sections/parse";
import type { StoreThemeDocumentV1 } from "@/lib/developer/theme-document";
import { getThemePageBySlug } from "@/lib/developer/storefront-theme-resolve";

export async function resolveStorePageSectionLayout(options: {
  storeId: string;
  pageSlug: string;
  themeId: ThemeId;
  isPreview: boolean;
  layoutParam?: string;
  /** When previewing a private StoreTheme draft, prefer its page layout. */
  previewThemeDocument?: StoreThemeDocumentV1 | null;
}): Promise<HomeLayout | null> {
  const {
    storeId,
    pageSlug,
    themeId,
    isPreview,
    layoutParam,
    previewThemeDocument,
  } = options;

  if (layoutParam) {
    const decoded = decodeLayoutFromPreview(layoutParam);
    if (decoded) return decoded;
  }

  if (previewThemeDocument) {
    const themePage = getThemePageBySlug(previewThemeDocument, pageSlug);
    if (themePage?.layout) {
      return parseHomeLayout(themePage.layout, themeId);
    }
  }

  const page = await getStorePageBySlug(storeId, pageSlug, { includeDraft: isPreview });
  const pageLayout = page?.content
    ? extractLayoutFromPageContent(page.content, themeId)
    : null;

  if (pageLayout?.sections?.length) return pageLayout;
  return null;
}
