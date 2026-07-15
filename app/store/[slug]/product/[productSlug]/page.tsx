import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductPageRenderer } from "@/components/storefront/product-page-renderer";
import {
  getStoreProduct,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { prisma } from "@/lib/db";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { decodeLayoutFromPreview, parseProductLayout } from "@/lib/sections/parse";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";

interface PageProps {
  params: { slug: string; productSlug: string };
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
  const data = await getStoreProduct(params.slug, params.productSlug);
  if (!data) return { title: "Product Not Found" };

  return {
    title: `${data.product.title} — ${data.store.name}`,
    description: data.product.description?.replace(/<[^>]*>/g, "").slice(0, 160),
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const data = await getStoreProduct(params.slug, params.productSlug);
  if (!data) notFound();

  const store = applyPreviewOverrides(serializePublicStore(data.store, data.store.settings), searchParams);
  const product = serializePublicProduct(data.product);
  const relatedRows = await prisma.product.findMany({
    where: { storeId: data.store.id, id: { not: data.product.id } },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  const relatedProducts = relatedRows.map(serializePublicProduct);
  const isPreview = searchParams.preview === "true";
  const theme = store.theme as "minimal" | "modern" | "bold";

  const settings = data.store.settings as typeof data.store.settings & {
    productLayout?: unknown;
    collectionLayout?: unknown;
  };
  const savedLayout = parseProductLayout(settings?.productLayout, theme);
  const previewLayout = searchParams.layout
    ? decodeLayoutFromPreview(searchParams.layout) ?? savedLayout
    : savedLayout;

  return (
    <ProductPageRenderer
      store={store}
      product={product}
      relatedProducts={relatedProducts}
      productLayout={previewLayout}
      preview={isPreview}
      builderMode={isPreview}
      selectedSectionId={searchParams.section ?? null}
      previewDevice={parsePreviewDevice(searchParams.device)}
    />
  );
}
