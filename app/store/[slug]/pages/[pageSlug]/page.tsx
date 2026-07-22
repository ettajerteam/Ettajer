import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontRenderer } from "@/components/storefront/storefront-renderer";
import {
  getStoreBySlug,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { getStorePageBySlug } from "@/lib/pages";
import { parsePageContent } from "@/lib/page-content";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { parseHomeLayout, decodeLayoutFromPreview } from "@/lib/sections/parse";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import { getStoreUrl, getStorePageUrl } from "@/lib/storefront-urls";
import { resolveStorefrontCatalog } from "@/lib/storefront-demo-products";
import Link from "next/link";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";

interface PageProps {
  params: { slug: string; pageSlug: string };
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
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) return { title: "Page Not Found" };

  const page = await getStorePageBySlug(storeData.id, params.pageSlug);
  if (!page) return { title: "Page Not Found" };

  const parsed = parsePageContent(page.content);
  const metaTitle = parsed.metaTitle?.trim() || page.title;
  const metaDescription =
    parsed.metaDescription?.trim() ||
    parsed.body.slice(0, 160) ||
    `Read ${page.title} at ${storeData.name}`;

  return buildStorefrontMetadata({
    storeName: storeData.name,
    path: getStorePageUrl(storeData.slug, page.slug),
    title: metaTitle,
    description: metaDescription,
    image: storeData.logo,
  });
}

export default async function StoreCustomPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const isPreview = searchParams.preview === "true";
  const page = await getStorePageBySlug(storeData.id, params.pageSlug, { includeDraft: isPreview });

  if (!page && !isPreview) notFound();

  const store = applyPreviewOverrides(
    serializePublicStore(storeData, storeData.settings),
    searchParams
  );
  const products = resolveStorefrontCatalog(
    storeData.products.map(serializePublicProduct),
    { preview: isPreview, theme: store.theme }
  );
  const categories = storeData.categories.map(serializePublicCategory);
  const featuredCollections = storeData.collections.map(serializePublicCollection);
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;

  const parsedContent = page ? parsePageContent(page.content) : null;
  const savedLayout = parsedContent?.layout
    ? parseHomeLayout(parsedContent.layout, themeId)
    : null;
  const previewLayout = searchParams.layout
    ? decodeLayoutFromPreview(searchParams.layout) ?? savedLayout
    : savedLayout;
  const previewDevice = parsePreviewDevice(searchParams.device);
  const useSectionLayout = Boolean(previewLayout?.sections?.length);

  if (useSectionLayout && previewLayout) {
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

  const isBold = themeId === "bold";
  const title = page?.title ?? params.pageSlug;
  const content = parsedContent?.body ?? "";

  return (
    <StorefrontShell store={store} preview={isPreview}>
      <div className={cn("min-h-screen", isBold ? "bg-zinc-950 text-white" : "bg-white")}>
        <StorefrontHeader
          store={store}
          variant={themeId}
          backHref={getStoreUrl(store.slug)}
          backLabel="← Back to store"
        />
        <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {content ? (
            <div
              className={cn(
                "prose prose-neutral mt-8 max-w-none",
                isBold && "prose-invert"
              )}
            >
              <p className="whitespace-pre-wrap text-base leading-relaxed">{content}</p>
            </div>
          ) : (
            <p className={cn("mt-8 text-muted-foreground", isBold && "text-zinc-400")}>
              This page has no content yet.
            </p>
          )}
        </article>
        <footer className={cn("border-t py-10", isBold ? "border-white/10" : "border-gray-100")}>
          <div className="mx-auto max-w-3xl px-6 text-center text-sm text-muted-foreground">
            <Link href={getStoreUrl(store.slug)} className="hover:underline">
              Return to {store.name}
            </Link>
          </div>
        </footer>
      </div>
    </StorefrontShell>
  );
}
