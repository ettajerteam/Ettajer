import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CollectionPageRenderer } from "@/components/storefront/collection-page-renderer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getStoreBySlug,
  getStoreCollection,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { decodeLayoutFromPreview, parseCollectionLayout } from "@/lib/sections/parse";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import {
  getPreviewPlaceholderCollection,
  isPreviewCollectionSlug,
} from "@/lib/storefront-preview-collection";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/structured-data";
import {
  getStoreCollectionUrl,
  getStoreCollectionsUrl,
  getStoreProductUrl,
  getStoreUrl,
} from "@/lib/storefront-urls";

interface PageProps {
  params: { slug: string; collectionSlug: string };
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (isPreviewCollectionSlug(params.collectionSlug)) {
    const storeData = await getStoreBySlug(params.slug);
    if (!storeData) return { title: "Collection Not Found" };
    return { title: `Collection template — ${storeData.name}` };
  }

  const data = await getStoreCollection(params.slug, params.collectionSlug);
  if (!data) return { title: "Collection Not Found" };
  return buildStorefrontMetadata({
    storeName: data.store.name,
    path: getStoreCollectionUrl(data.store.slug, data.collection.slug),
    title: data.collection.name,
    description:
      data.collection.description ||
      `Shop ${data.collection.name} at ${data.store.name}`,
    image: data.collection.image ?? data.store.logo,
  });
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const isPreview = searchParams.preview === "true";

  if (isPreviewCollectionSlug(params.collectionSlug) && isPreview) {
    const storeData = await getStoreBySlug(params.slug);
    if (!storeData) notFound();

    const store = applyPreviewOverrides(
      serializePublicStore(storeData, storeData.settings),
      searchParams
    );
    const categories = storeData.categories.map(serializePublicCategory);
    const collection = getPreviewPlaceholderCollection(store.theme);
    const theme = store.theme as "minimal" | "modern" | "bold";
    const settings = storeData.settings as typeof storeData.settings & {
      collectionLayout?: unknown;
    };
    const savedLayout = parseCollectionLayout(settings?.collectionLayout, theme);
    const previewLayout = searchParams.layout
      ? decodeLayoutFromPreview(searchParams.layout) ?? savedLayout
      : savedLayout;

    return (
      <CollectionPageRenderer
        store={store}
        collection={collection}
        products={[]}
        categories={categories}
        collectionLayout={previewLayout}
        preview
        builderMode
        selectedSectionId={searchParams.section ?? null}
        previewDevice={parsePreviewDevice(searchParams.device)}
      />
    );
  }

  const data = await getStoreCollection(params.slug, params.collectionSlug);
  if (!data) notFound();

  const store = applyPreviewOverrides(
    serializePublicStore(data.store, data.store.settings),
    searchParams
  );
  const categories = data.store.categories.map(serializePublicCategory);
  const products = data.collection.products.map(serializePublicProduct);
  const collection = serializePublicCollection(data.collection);
  const theme = store.theme as "minimal" | "modern" | "bold";

  const settings = data.store.settings as typeof data.store.settings & {
    productLayout?: unknown;
    collectionLayout?: unknown;
  };
  const savedLayout = parseCollectionLayout(settings?.collectionLayout, theme);
  const previewLayout = searchParams.layout
    ? decodeLayoutFromPreview(searchParams.layout) ?? savedLayout
    : savedLayout;

  return (
    <>
      {!isPreview ? (
        <JsonLd
          graph={[
            buildItemListSchema({
              name: collection.name,
              path: getStoreCollectionUrl(store.slug, collection.slug),
              description: collection.description,
              items: products.map((p) => ({
                name: p.title,
                path: getStoreProductUrl(store.slug, p.slug),
              })),
            }),
            buildBreadcrumbSchema([
              { name: store.name, path: getStoreUrl(store.slug) },
              { name: "Collections", path: getStoreCollectionsUrl(store.slug) },
              { name: collection.name },
            ]),
          ]}
        />
      ) : null}
      <CollectionPageRenderer
        store={store}
        collection={collection}
        products={products}
        categories={categories}
        collectionLayout={previewLayout}
        preview={isPreview}
        builderMode={isPreview}
        selectedSectionId={searchParams.section ?? null}
        previewDevice={parsePreviewDevice(searchParams.device)}
      />
    </>
  );
}
