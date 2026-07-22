import type { ThemeId } from "@/lib/themes";
import type { HomeLayout } from "@/lib/sections/types";
import { getStorePageBySlug } from "@/lib/pages";
import { extractLayoutFromPageContent } from "@/lib/page-layout";
import { decodeLayoutFromPreview } from "@/lib/sections/parse";

export async function resolveStorePageSectionLayout(options: {
  storeId: string;
  pageSlug: string;
  themeId: ThemeId;
  isPreview: boolean;
  layoutParam?: string;
}): Promise<HomeLayout | null> {
  const { storeId, pageSlug, themeId, isPreview, layoutParam } = options;
  const page = await getStorePageBySlug(storeId, pageSlug, { includeDraft: isPreview });
  const pageLayout = page?.content ? extractLayoutFromPageContent(page.content, themeId) : null;

  if (layoutParam) {
    const decoded = decodeLayoutFromPreview(layoutParam);
    if (decoded) return decoded;
  }

  if (pageLayout?.sections?.length) return pageLayout;
  return null;
}
