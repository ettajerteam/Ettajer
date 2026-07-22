import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { StorefrontRenderer } from "@/components/storefront/storefront-renderer";
import { SectionRenderer } from "@/components/storefront/section-renderer";
import { FooterSection } from "@/components/storefront/sections/footer-section";
import { JournalPostsList } from "@/components/storefront/journal-posts-list";
import {
  getStoreBySlug,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { listPublishedBlogPosts } from "@/lib/blog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import { resolveStorePageSectionLayout } from "@/lib/storefront-page-layout";
import { getStoreUrl, getStoreBlogUrl } from "@/lib/storefront-urls";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) return { title: "Store Not Found" };
  return buildStorefrontMetadata({
    storeName: storeData.name,
    path: getStoreBlogUrl(storeData.slug),
    title: "Journal",
    description: `Stories and notes from ${storeData.name}`,
    image: storeData.logo,
  });
}

export default async function StoreBlogPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const isPreview = searchParams.preview === "true";
  const store = applyPreviewOverrides(serializePublicStore(storeData, storeData.settings), searchParams);
  const categories = storeData.categories.map(serializePublicCategory);
  const featuredCollections = storeData.collections.map(serializePublicCollection);
  const products = storeData.products.map(serializePublicProduct);
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isBold = themeId === "bold";
  const isModern = themeId === "modern";
  const posts = await listPublishedBlogPosts(storeData.id);

  const sectionLayout = await resolveStorePageSectionLayout({
    storeId: storeData.id,
    pageSlug: "blog",
    themeId,
    isPreview,
    layoutParam: searchParams.layout,
  });

  const list = (
    <JournalPostsList
      storeSlug={store.slug}
      posts={posts}
      isBold={isBold}
      isModern={isModern}
    />
  );

  if (sectionLayout) {
    if (isPreview) {
      return (
        <StorefrontRenderer
          store={store}
          products={products}
          categories={categories}
          featuredCollections={featuredCollections}
          homeLayout={sectionLayout}
          preview
          builderMode
          selectedSectionId={searchParams.section ?? null}
          previewDevice={parsePreviewDevice(searchParams.device)}
        />
      );
    }

    const insertAt = sectionLayout.sections.findIndex(
      (s) =>
        s.visible &&
        (s.type === "footer" ||
          (s.type === "rich-text" &&
            (s.settings as Record<string, unknown>).layout === "newsletter"))
    );
    const split = insertAt >= 0 ? insertAt : sectionLayout.sections.length;
    const before = { version: 1 as const, sections: sectionLayout.sections.slice(0, split) };
    const after = { version: 1 as const, sections: sectionLayout.sections.slice(split) };

    return (
      <StorefrontShell store={store} preview={isPreview}>
        <div
          className={cn(isBold && "bg-zinc-950 text-white")}
          style={isModern ? { backgroundColor: store.secondaryColor } : undefined}
        >
          <SectionRenderer
            store={store}
            layout={before}
            products={products}
            categories={categories}
            featuredCollections={featuredCollections}
            showHeader
          />
          {list}
          {after.sections.length > 0 ? (
            <SectionRenderer
              store={store}
              layout={after}
              products={products}
              categories={categories}
              featuredCollections={featuredCollections}
              showHeader={false}
            />
          ) : null}
        </div>
      </StorefrontShell>
    );
  }

  return (
    <StorefrontShell store={store} preview={isPreview}>
      <div
        className={cn("min-h-screen", isBold ? "bg-zinc-950 text-white" : "bg-white")}
        style={isModern ? { backgroundColor: store.secondaryColor } : undefined}
      >
        <StorefrontHeader store={store} variant={themeId} categories={categories} />

        <section className="relative overflow-hidden bg-[#0a0a0a] px-6 pb-14 pt-8 text-white sm:pb-16 sm:pt-10">
          <div className={cn("mx-auto", isModern ? "max-w-6xl" : "max-w-5xl")}>
            <div className="[&_nav]:mb-0 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white/90">
              <StorefrontBreadcrumb
                variant={themeId}
                items={[
                  { label: store.name, href: getStoreUrl(store.slug) },
                  { label: "Journal" },
                ]}
              />
            </div>
            <p className="mt-10 mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
              Editorial
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Journal
            </h1>
            <p className="mt-4 max-w-lg text-sm font-light leading-relaxed text-white/60 sm:text-[15px]">
              Atelier notes, lookbook frames, and quiet dispatches from the archive.
            </p>
          </div>
        </section>

        <main>{list}</main>

        <div className="pb-12 text-center">
          <Link
            href={getStoreUrl(store.slug)}
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.16em] transition",
              isBold ? "text-white/40 hover:text-white" : "text-neutral-400 hover:text-neutral-900"
            )}
          >
            Back to home
          </Link>
        </div>

        <FooterSection
          store={store}
          settings={{ backgroundColor: "#0a0a0a", textColor: "#a3a3a3" }}
        />
      </div>
    </StorefrontShell>
  );
}
