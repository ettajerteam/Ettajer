import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { StorefrontRenderer } from "@/components/storefront/storefront-renderer";
import { FooterSection } from "@/components/storefront/sections/footer-section";
import { StorefrontQuietState } from "@/components/storefront/storefront-quiet-state";
import { FadeInSection, StaggerGrid, StaggerItem } from "@/components/storefront/motion-wrapper";
import {
  getStoreBySlug,
  serializePublicStore,
  serializePublicProduct,
} from "@/lib/storefront";
import { serializePublicCategory, serializePublicCollection } from "@/lib/catalog";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { parsePreviewDevice } from "@/lib/builder/responsive-styles";
import { resolveStorePageSectionLayout } from "@/lib/storefront-page-layout";
import { getStoreCollectionUrl, getStoreProductsUrl, getStoreUrl, getStoreCollectionsUrl } from "@/lib/storefront-urls";
import { getThemeAssets } from "@/lib/storefront-assets";
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
    path: getStoreCollectionsUrl(storeData.slug),
    title: "Collections",
    description: `Browse collections at ${storeData.name}`,
    image: storeData.logo,
  });
}

export default async function StoreCollectionsPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const isPreview = searchParams.preview === "true";
  const store = applyPreviewOverrides(serializePublicStore(storeData, storeData.settings), searchParams);
  const categories = storeData.categories.map(serializePublicCategory);
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isModern = themeId === "modern";
  const isBold = themeId === "bold";
  const assets = getThemeAssets(store.theme);

  const collections = await prisma.collection.findMany({
    where: { storeId: storeData.id },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
  const publicCollections = collections.map(serializePublicCollection);
  const products = storeData.products.map(serializePublicProduct);

  const sectionLayout = await resolveStorePageSectionLayout({
    storeId: storeData.id,
    pageSlug: "collections",
    themeId,
    isPreview,
    layoutParam: searchParams.layout,
  });

  if (sectionLayout) {
    return (
      <StorefrontRenderer
        store={store}
        products={products}
        categories={categories}
        featuredCollections={publicCollections}
        homeLayout={sectionLayout}
        preview={isPreview}
        builderMode={isPreview}
        selectedSectionId={searchParams.section ?? null}
        previewDevice={parsePreviewDevice(searchParams.device)}
      />
    );
  }

  return (
    <StorefrontShell store={store} preview={isPreview}>
      <div
        className={cn("min-h-screen", isBold ? "bg-zinc-950 text-white" : "bg-white")}
        style={isModern ? { backgroundColor: store.secondaryColor } : undefined}
      >
        <StorefrontHeader store={store} variant={themeId} categories={categories} />

        {isModern ? (
          <div className="relative w-full overflow-hidden bg-[#0a0a0a]">
            <div className="mx-auto max-w-7xl px-6 pt-6">
              <StorefrontBreadcrumb
                variant={themeId}
                items={[
                  { label: store.name, href: getStoreUrl(store.slug) },
                  { label: "Collections" },
                ]}
              />
            </div>
            <div className="relative mt-4 min-h-[280px] w-full md:min-h-[380px]">
              <Image
                src={assets.collectionCover}
                alt=""
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15" />
              <div className="absolute bottom-0 left-0 right-0 px-6 py-10 sm:px-12 md:py-14">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  Curated edits
                </p>
                <h1 className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
                  Collections
                </h1>
                <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/70">
                  Numbered archives, seasonal capsules, and everyday essentials — grouped for how you dress.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <main className="mx-auto max-w-6xl px-6 pt-12">
            <FadeInSection>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Curated edits
              </p>
              <h1 className="mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">Collections</h1>
            </FadeInSection>
          </main>
        )}

        <main className={cn("mx-auto px-6 py-12 sm:py-16", isModern ? "max-w-7xl" : "max-w-6xl")}>
          {publicCollections.length === 0 ? (
            <StorefrontQuietState
              eyebrow="Collections"
              title="No collections yet"
              description="Curated edits will appear here once they’re published — start with the full catalog in the meantime."
              primaryAction={{
                label: "Shop all products",
                href: getStoreProductsUrl(store.slug),
              }}
              secondaryAction={{
                label: "Back to home",
                href: getStoreUrl(store.slug),
              }}
              isBold={isBold}
              isModern={isModern}
            />
          ) : (
            <StaggerGrid className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {publicCollections.map((collection) => (
                <StaggerItem key={collection.id}>
                  <Link
                    href={getStoreCollectionUrl(store.slug, collection.slug)}
                    className={cn("group relative block overflow-hidden", isModern && "rounded-sm")}
                  >
                    <div className={cn("relative", isModern ? "aspect-[4/5]" : "aspect-[16/10]")}>
                      <Image
                        src={collection.image ?? assets.collectionCover}
                        alt={collection.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        {collection.featured ? (
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                            Featured
                          </p>
                        ) : null}
                        <h2
                          className={cn(
                            "font-semibold text-white",
                            isModern && "text-sm font-medium uppercase tracking-[0.14em]"
                          )}
                        >
                          {collection.name}
                        </h2>
                        {collection.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-white/70">{collection.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}

          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            <Link
              href={getStoreProductsUrl(store.slug)}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900"
            >
              Shop all products
            </Link>
            <Link
              href={getStoreUrl(store.slug)}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900"
            >
              Back to home
            </Link>
          </div>
        </main>

        {isModern ? (
          <FooterSection
            store={store}
            settings={{ backgroundColor: "#0a0a0a", textColor: "#a3a3a3" }}
          />
        ) : null}
      </div>
    </StorefrontShell>
  );
}
