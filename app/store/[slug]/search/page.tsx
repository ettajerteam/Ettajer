import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontRenderer } from "@/components/storefront/storefront-renderer";
import { FooterSection } from "@/components/storefront/sections/footer-section";
import { StoreSearchView } from "@/components/storefront/store-search-view";
import {
  getStoreBySlug,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import { resolveStorePageSectionLayout } from "@/lib/storefront-page-layout";
import { resolveStorefrontCatalog } from "@/lib/storefront-demo-products";
import { collectSearchSuggestions, searchProducts } from "@/lib/storefront-search";
import { getStoreSearchUrl } from "@/lib/storefront-urls";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";

interface PageProps {
  params: { slug: string };
  searchParams: {
    q?: string;
    preview?: string;
    theme?: string;
    primary?: string;
    secondary?: string;
    font?: string;
    logo?: string;
    layout?: string;
    section?: string;
    device?: string;
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) return { title: "Store Not Found" };
  const q = searchParams.q?.trim();
  return buildStorefrontMetadata({
    storeName: storeData.name,
    path: getStoreSearchUrl(storeData.slug, q),
    title: q ? `Search: ${q}` : "Search",
    description: `Search products at ${storeData.name}`,
    image: storeData.logo,
    noIndex: true,
  });
}

export default async function StoreSearchPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const isPreview = searchParams.preview === "true";
  const query = searchParams.q?.trim() ?? "";
  const store = applyPreviewOverrides(serializePublicStore(storeData, storeData.settings), searchParams);
  const categories = storeData.categories.map(serializePublicCategory);
  const featuredCollections = storeData.collections.map(serializePublicCollection);
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isBold = themeId === "bold";
  const isModern = themeId === "modern";

  const catalog = resolveStorefrontCatalog(
    storeData.products.map(serializePublicProduct),
    { preview: isPreview, theme: store.theme }
  );
  const results = query ? searchProducts(catalog, query) : [];
  const suggestions = collectSearchSuggestions(catalog, {
    categoryNames: categories.map((c) => c.name),
    limit: 8,
  });
  const popular = catalog.slice(0, 8);

  const sectionLayout = await resolveStorePageSectionLayout({
    storeId: storeData.id,
    pageSlug: "search",
    themeId,
    isPreview,
    layoutParam: searchParams.layout,
  });

  // Theme editor preview: show merchant section layout as designed.
  if (isPreview && sectionLayout) {
    return (
      <StorefrontRenderer
        store={store}
        products={query ? results : catalog}
        categories={categories}
        featuredCollections={featuredCollections}
        homeLayout={sectionLayout}
        preview
        builderMode
        selectedSectionId={searchParams.section ?? null}
        previewDevice={parsePreviewDevice(searchParams.device)}
      />
    );
  }

  return (
    <StorefrontShell store={store} preview={isPreview}>
      <div
        className={cn("min-h-screen", isBold ? "bg-zinc-950 text-white" : "bg-white")}
        style={isModern ? { backgroundColor: store.secondaryColor } : undefined}
      >
        <StorefrontHeader store={store} variant={themeId} categories={categories} />
        <StoreSearchView
          store={store}
          themeId={themeId}
          query={query}
          catalog={catalog}
          suggestions={suggestions}
          popular={popular}
        />
        <FooterSection
          store={store}
          settings={{ backgroundColor: "#0a0a0a", textColor: "#a3a3a3" }}
        />
      </div>
    </StorefrontShell>
  );
}
