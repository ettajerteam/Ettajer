import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontRenderer } from "@/components/storefront/storefront-renderer";
import {
  getStoreBySlug,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { parseHomeLayout, decodeLayoutFromPreview } from "@/lib/sections/parse";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";

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

  return {
    title: store.name,
    description: store.description ?? `Shop at ${store.name}`,
  };
}

export default async function StorePage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const store = applyPreviewOverrides(serializePublicStore(storeData, storeData.settings), searchParams);
  const products = storeData.products.map(serializePublicProduct);
  const categories = storeData.categories.map(serializePublicCategory);
  const featuredCollections = storeData.collections.map(serializePublicCollection);
  const isPreview = searchParams.preview === "true";

  const savedLayout = parseHomeLayout(
    storeData.settings?.homeLayout,
    store.theme as "minimal" | "modern" | "bold"
  );
  const previewLayout = searchParams.layout
    ? decodeLayoutFromPreview(searchParams.layout) ?? savedLayout
    : savedLayout;

  const previewDevice = parsePreviewDevice(searchParams.device);

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
      previewDevice={previewDevice}
    />
  );
}
