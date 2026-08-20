import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductPageRenderer } from "@/components/storefront/product-page-renderer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getStoreBySlug,
  getStoreProduct,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { parseProductImages } from "@/lib/product-images";
import { prisma } from "@/lib/db";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { decodeLayoutFromPreview, parseProductLayout } from "@/lib/sections/parse";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import {
  getPreviewPlaceholderProduct,
  isPreviewProductSlug,
} from "@/lib/storefront-preview-product";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";
import { parseProductSeo, resolveProductSeo } from "@/lib/product-seo";
import { buildBreadcrumbSchema, buildProductSchema } from "@/lib/seo/structured-data";
import { getStoreProductUrl, getStoreProductsUrl, getStoreUrl } from "@/lib/storefront-urls";
import {
  applyResolvedThemeBranding,
  getThemeTemplateLayout,
  resolveStorefrontThemeFromRequest,
} from "@/lib/developer/storefront-theme-resolve";

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
    previewThemeId?: string;
    previewToken?: string;
  };
}

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  if (isPreviewProductSlug(params.productSlug)) {
    const storeData = await getStoreBySlug(params.slug);
    if (!storeData) return { title: "Product Not Found" };
    return { title: `Product template — ${storeData.name}` };
  }

  const data = await getStoreProduct(params.slug, params.productSlug);
  if (!data) return { title: "Product Not Found" };

  const images = parseProductImages(data.product.images);

  const resolved = resolveProductSeo({
    seo: parseProductSeo(data.product.seo),
    title: data.product.title,
    description: data.product.description,
    storeName: data.store.name,
  });

  return buildStorefrontMetadata({
    storeName: data.store.name,
    path: getStoreProductUrl(data.store.slug, data.product.slug),
    title: resolved.title,
    description: resolved.description,
    keywords: resolved.keywords,
    image: images[0] ?? data.store.logo,
  });
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const themeResolution = await resolveStorefrontThemeFromRequest({
    storeId: storeData.id,
    storeOwnerUserId: storeData.userId,
    searchParams,
  });
  if (themeResolution.status === "forbidden") notFound();

  const isPreview =
    searchParams.preview === "true" || themeResolution.status === "preview";

  if (isPreviewProductSlug(params.productSlug) && isPreview) {
    let store = applyPreviewOverrides(
      serializePublicStore(storeData, storeData.settings),
      searchParams,
    );
    if (themeResolution.status === "preview") {
      store = applyResolvedThemeBranding(store, themeResolution.resolved);
    }
    const product = getPreviewPlaceholderProduct(store);
    const theme = store.theme as "minimal" | "modern" | "bold";
    const settings = storeData.settings as typeof storeData.settings & {
      productLayout?: unknown;
    };
    const savedLayout = parseProductLayout(settings?.productLayout, theme);
    const themeLayout =
      themeResolution.status === "preview"
        ? getThemeTemplateLayout(themeResolution.resolved.document, "product")
        : null;
    const fromTheme = themeLayout ? parseProductLayout(themeLayout, theme) : null;
    const decoded = searchParams.layout ? decodeLayoutFromPreview(searchParams.layout) : null;
    const previewLayout = decoded
      ? parseProductLayout(decoded, theme)
      : fromTheme ?? savedLayout;

    return (
      <ProductPageRenderer
        store={store}
        product={product}
        relatedProducts={[]}
        productLayout={previewLayout}
        preview
        builderMode
        selectedSectionId={searchParams.section ?? null}
        previewDevice={parsePreviewDevice(searchParams.device)}
      />
    );
  }

  const data = await getStoreProduct(params.slug, params.productSlug);
  if (!data) notFound();

  let store = applyPreviewOverrides(
    serializePublicStore(data.store, data.store.settings),
    searchParams,
  );
  if (themeResolution.status === "preview") {
    store = applyResolvedThemeBranding(store, themeResolution.resolved);
  }
  const product = serializePublicProduct(data.product);
  const relatedRows = await prisma.product.findMany({
    where: {
      storeId: data.store.id,
      id: { not: data.product.id },
      status: "active",
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  const relatedProducts = relatedRows.map(serializePublicProduct);
  const theme = store.theme as "minimal" | "modern" | "bold";

  const settings = data.store.settings as typeof data.store.settings & {
    productLayout?: unknown;
  };
  const savedLayout = parseProductLayout(settings?.productLayout, theme);
  const themeLayout =
    themeResolution.status === "preview"
      ? getThemeTemplateLayout(themeResolution.resolved.document, "product")
      : null;
  const fromTheme = themeLayout ? parseProductLayout(themeLayout, theme) : null;
  const decoded = searchParams.layout ? decodeLayoutFromPreview(searchParams.layout) : null;
  const previewLayout = decoded
    ? parseProductLayout(decoded, theme)
    : fromTheme ?? savedLayout;

  return (
    <>
      {!isPreview ? (
        <JsonLd
          graph={[
            buildProductSchema({
              name: product.title,
              path: getStoreProductUrl(store.slug, product.slug),
              description: product.description,
              images: product.images,
              price: product.price,
              currency: store.currency,
              availability: product.inventory > 0 ? "InStock" : "OutOfStock",
              sku: null,
              storeName: store.name,
              storePath: getStoreUrl(store.slug),
            }),
            buildBreadcrumbSchema([
              { name: store.name, path: getStoreUrl(store.slug) },
              { name: "Shop", path: getStoreProductsUrl(store.slug) },
              { name: product.title },
            ]),
          ]}
        />
      ) : null}
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
    </>
  );
}
