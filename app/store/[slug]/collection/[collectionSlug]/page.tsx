import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CollectionPageRenderer } from "@/components/storefront/collection-page-renderer";
import {
  getStoreCollection,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { decodeLayoutFromPreview, parseCollectionLayout } from "@/lib/sections/parse";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";

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
  const data = await getStoreCollection(params.slug, params.collectionSlug);
  if (!data) return { title: "Collection Not Found" };
  return { title: `${data.collection.name} — ${data.store.name}` };
}

export default async function CollectionPage({ params, searchParams }: PageProps) {
  const data = await getStoreCollection(params.slug, params.collectionSlug);
  if (!data) notFound();

  const store = applyPreviewOverrides(
    serializePublicStore(data.store, data.store.settings),
    searchParams
  );
  const categories = data.store.categories.map(serializePublicCategory);
  const products = data.collection.products.map(serializePublicProduct);
  const collection = serializePublicCollection(data.collection);
  const isPreview = searchParams.preview === "true";
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
  );
}
