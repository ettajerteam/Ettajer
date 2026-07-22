import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontRenderer } from "@/components/storefront/storefront-renderer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getStoreBySlug,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { parseHomeLayout, decodeLayoutFromPreview } from "@/lib/sections/parse";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import { resolveStorefrontCatalog } from "@/lib/storefront-demo-products";
import { buildStorefrontMetadata, parseStoreSeo } from "@/lib/seo/storefront-metadata";
import {
  buildStoreOrganizationSchema,
  buildStoreWebSiteSchema,
} from "@/lib/seo/structured-data";
import { getStoreSearchUrl, getStoreUrl } from "@/lib/storefront-urls";

interface PageProps {
  params: { slug: string };
  searchParams: {
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
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return { title: "Store Not Found" };

  const seo = parseStoreSeo((store.settings as { seo?: unknown } | null)?.seo);
  const title = seo.title || store.name;
  const description = seo.description || store.description || `Shop at ${store.name}`;

  return buildStorefrontMetadata({
    storeName: store.name,
    path: getStoreUrl(store.slug),
    title,
    description,
    image: store.logo,
    keywords: seo.keywords,
    absoluteTitle: true,
    noIndex: seo.noIndex,
  });
}

export default async function StorePage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const store = applyPreviewOverrides(serializePublicStore(storeData, storeData.settings), searchParams);
  const isPreview = searchParams.preview === "true";
  const products = resolveStorefrontCatalog(
    storeData.products.map(serializePublicProduct),
    { preview: isPreview, theme: store.theme }
  );
  const categories = storeData.categories.map(serializePublicCategory);
  const featuredCollections = storeData.collections.map(serializePublicCollection);

  const savedLayout = parseHomeLayout(
    storeData.settings?.homeLayout,
    store.theme as "minimal" | "modern" | "bold"
  );
  const previewLayout = searchParams.layout
    ? decodeLayoutFromPreview(searchParams.layout) ?? savedLayout
    : savedLayout;

  const previewDevice = parsePreviewDevice(searchParams.device);
  const storePath = getStoreUrl(store.slug);

  return (
    <>
      {!isPreview ? (
        <JsonLd
          graph={[
            buildStoreOrganizationSchema({
              name: store.name,
              path: storePath,
              description: store.description,
              logo: store.logo,
              currency: store.currency,
            }),
            buildStoreWebSiteSchema({
              name: store.name,
              path: storePath,
              description: store.description,
              searchPath: getStoreSearchUrl(store.slug),
            }),
          ]}
        />
      ) : null}
      <StorefrontRenderer
        store={store}
        products={products}
        categories={categories}
        featuredCollections={featuredCollections}
        homeLayout={previewLayout}
        preview={isPreview}
        builderMode={isPreview}
        selectedSectionId={searchParams.section ?? null}
        previewDevice={previewDevice}
      />
    </>
  );
}
