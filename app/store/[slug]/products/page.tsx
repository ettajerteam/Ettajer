import { StorefrontRenderer } from "@/components/storefront/storefront-renderer";
import { ProductsPage } from "@/components/storefront/products-page";
import { ProductsPageToolbar } from "@/components/storefront/products-page-toolbar";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { SectionRenderer } from "@/components/storefront/section-renderer";
import {
  getStoreBySlug,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { getStorePageBySlug } from "@/lib/pages";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { decodeLayoutFromPreview } from "@/lib/sections/parse";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import { extractLayoutFromPageContent } from "@/lib/page-layout";
import { resolveStorefrontCatalog } from "@/lib/storefront-demo-products";
import { parseProductSort, sortPublicProducts } from "@/lib/storefront-products-page";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";
import { getStoreProductsUrl } from "@/lib/storefront-urls";

interface PageProps {
  params: { slug: string };
  searchParams: {
    category?: string;
    sort?: string;
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
  const category = searchParams.category?.trim();
  if (category) {
    const cat = storeData.categories.find((c) => c.slug === category);
    if (cat) {
      return buildStorefrontMetadata({
        storeName: storeData.name,
        path: `${getStoreProductsUrl(storeData.slug)}?category=${encodeURIComponent(cat.slug)}`,
        title: cat.name,
        description: cat.description || `Shop ${cat.name} at ${storeData.name}`,
        image: cat.image ?? storeData.logo,
      });
    }
  }
  return buildStorefrontMetadata({
    storeName: storeData.name,
    path: getStoreProductsUrl(storeData.slug),
    title: "Shop",
    description: `Browse all products at ${storeData.name}`,
    image: storeData.logo,
  });
}

export default async function StoreProductsPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const isPreview = searchParams.preview === "true";
  const categorySlug = searchParams.category?.trim();
  const sort = parseProductSort(searchParams.sort);
  const themeId = (storeData.theme in { minimal: 1, modern: 1, bold: 1 }
    ? storeData.theme
    : "minimal") as ThemeId;

  const store = applyPreviewOverrides(serializePublicStore(storeData, storeData.settings), searchParams);
  const categories = storeData.categories.map(serializePublicCategory);
  const featuredCollections = storeData.collections.map(serializePublicCollection);

  let catalogRows = storeData.products;
  if (categorySlug) {
    const category = storeData.categories.find((c) => c.slug === categorySlug);
    if (category) {
      catalogRows = catalogRows.filter((p) => p.categoryId === category.id);
    }
  }

  const catalog = resolveStorefrontCatalog(
    catalogRows.map(serializePublicProduct),
    { preview: isPreview, theme: store.theme }
  );
  const products = sortPublicProducts(catalog, sort);

  const shopPage = await getStorePageBySlug(storeData.id, "products", { includeDraft: isPreview });
  const pageLayout = shopPage?.content ? extractLayoutFromPageContent(shopPage.content, themeId) : null;
  const useSectionLayout = Boolean(pageLayout?.sections?.length) || Boolean(searchParams.layout);

  if (useSectionLayout) {
    const savedLayout = pageLayout ?? { version: 1 as const, sections: [] };
    const previewLayout = searchParams.layout
      ? decodeLayoutFromPreview(searchParams.layout) ?? savedLayout
      : savedLayout;

    const gridIndex = previewLayout.sections.findIndex((s) => s.type === "product-grid" && s.visible);
    const injectToolbar = gridIndex >= 0 && !isPreview;

    if (injectToolbar) {
      const beforeLayout = {
        version: 1 as const,
        sections: previewLayout.sections.slice(0, gridIndex),
      };
      const afterLayout = {
        version: 1 as const,
        sections: previewLayout.sections.slice(gridIndex),
      };

      return (
        <StorefrontShell store={store} preview={isPreview}>
          <div
            className={cn(themeId === "bold" && "bg-zinc-950")}
            style={themeId === "modern" ? { backgroundColor: store.secondaryColor } : undefined}
          >
            <SectionRenderer
              store={store}
              layout={beforeLayout}
              products={products}
              categories={categories}
              featuredCollections={featuredCollections}
              showHeader
            />
            <div
              className={cn(
                "mx-auto px-6 pb-2 pt-6 sm:pt-8",
                themeId === "modern" ? "max-w-7xl" : "max-w-6xl"
              )}
            >
              <Suspense fallback={null}>
                <ProductsPageToolbar
                  storeSlug={store.slug}
                  categories={categories}
                  activeSort={sort}
                  activeCategory={categorySlug}
                  productCount={products.length}
                  variant={themeId}
                />
              </Suspense>
            </div>
            <SectionRenderer
              store={store}
              layout={afterLayout}
              products={products}
              categories={categories}
              featuredCollections={featuredCollections}
              showHeader={false}
            />
          </div>
        </StorefrontShell>
      );
    }

    return (
      <StorefrontRenderer
        store={store}
        products={products}
        categories={categories}
        featuredCollections={featuredCollections}
        homeLayout={previewLayout}
        preview={isPreview}
        builderMode={isPreview}
        selectedSectionId={searchParams.section ?? null}
        previewDevice={parsePreviewDevice(searchParams.device)}
      />
    );
  }

  return (
    <ProductsPage
      store={store}
      products={products}
      categories={categories}
      sort={sort}
      activeCategory={categorySlug}
      preview={isPreview}
    />
  );
}
