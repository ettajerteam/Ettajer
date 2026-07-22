import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogPage } from "@/components/storefront/catalog-page";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getStoreCategory,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory } from "@/lib/catalog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo/structured-data";
import {
  getStoreCategoryUrl,
  getStoreProductUrl,
  getStoreProductsUrl,
  getStoreUrl,
} from "@/lib/storefront-urls";

interface PageProps {
  params: { slug: string; categorySlug: string };
  searchParams: {
    preview?: string;
    theme?: string;
    primary?: string;
    secondary?: string;
    font?: string;
    logo?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await getStoreCategory(params.slug, params.categorySlug);
  if (!data) return { title: "Category Not Found" };
  return buildStorefrontMetadata({
    storeName: data.store.name,
    path: getStoreCategoryUrl(data.store.slug, data.category.slug),
    title: data.category.name,
    description:
      data.category.description ||
      `Shop ${data.category.name} at ${data.store.name}`,
    image: data.category.image ?? data.store.logo,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const data = await getStoreCategory(params.slug, params.categorySlug);
  if (!data) notFound();

  const store = applyPreviewOverrides(
    serializePublicStore(data.store, data.store.settings),
    searchParams
  );
  const categories = data.store.categories.map(serializePublicCategory);
  const products = data.category.products.map(serializePublicProduct);
  const isPreview = searchParams.preview === "true";

  return (
    <>
      {!isPreview ? (
        <JsonLd
          graph={[
            buildItemListSchema({
              name: data.category.name,
              path: getStoreCategoryUrl(store.slug, data.category.slug),
              description: data.category.description,
              items: products.map((p) => ({
                name: p.title,
                path: getStoreProductUrl(store.slug, p.slug),
              })),
            }),
            buildBreadcrumbSchema([
              { name: store.name, path: getStoreUrl(store.slug) },
              { name: "Shop", path: getStoreProductsUrl(store.slug) },
              { name: data.category.name },
            ]),
          ]}
        />
      ) : null}
      <CatalogPage
        store={store}
        products={products}
        categories={categories}
        title={data.category.name}
        description={data.category.description}
        image={data.category.image}
        breadcrumbLabel={data.category.name}
        preview={isPreview}
      />
    </>
  );
}
