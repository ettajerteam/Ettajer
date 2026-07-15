import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogPage } from "@/components/storefront/catalog-page";
import {
  getStoreCategory,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory } from "@/lib/catalog";
import { applyPreviewOverrides } from "@/lib/preview-engine";

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
  return { title: `${data.category.name} — ${data.store.name}` };
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

  return (
    <CatalogPage
      store={store}
      products={products}
      categories={categories}
      title={data.category.name}
      description={data.category.description}
      image={data.category.image}
      breadcrumbLabel={data.category.name}
      preview={searchParams.preview === "true"}
    />
  );
}
