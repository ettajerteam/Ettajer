import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { CatalogProductGrid } from "@/components/storefront/catalog-product-grid";
import { ProductsPageToolbar } from "@/components/storefront/products-page-toolbar";
import { FooterSection } from "@/components/storefront/sections/footer-section";
import { StorefrontQuietState } from "@/components/storefront/storefront-quiet-state";
import { getThemeAssets } from "@/lib/storefront-assets";
import { isDemoProductId } from "@/lib/storefront-demo-products";
import {
  getStoreCollectionsUrl,
  getStoreProductsUrl,
  getStoreUrl,
} from "@/lib/storefront-urls";
import type { PublicCategory } from "@/types/catalog";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import type { ProductSort } from "@/lib/storefront-products-page";
import { cn } from "@/lib/utils";

interface ProductsPageProps {
  store: PublicStore;
  products: PublicProduct[];
  categories: PublicCategory[];
  sort: ProductSort;
  activeCategory?: string;
  preview?: boolean;
}

export function ProductsPage({
  store,
  products,
  categories,
  sort,
  activeCategory,
  preview,
}: ProductsPageProps) {
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const isModern = themeId === "modern";
  const isBold = themeId === "bold";
  const assets = getThemeAssets(store.theme);
  const showingSamples = products.some((p) => isDemoProductId(p.id));
  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;
  const title = activeCategoryName ?? "All pieces";
  const eyebrow = activeCategoryName ? "Category" : "Full catalog";

  return (
    <StorefrontShell store={store} preview={preview}>
      <div
        className={cn("min-h-screen", isBold ? "bg-zinc-950 text-white" : "bg-white")}
        style={isModern ? { backgroundColor: store.secondaryColor } : undefined}
      >
        <StorefrontHeader store={store} variant={themeId} categories={categories} />

        <section className="relative w-full overflow-hidden" style={{ minHeight: "38vh" }}>
          <Image
            src={assets.hero}
            alt={activeCategoryName ?? `${store.name} shop`}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
          <div
            className={cn(
              "relative z-10 mx-auto flex h-full min-h-[inherit] flex-col justify-between px-6 py-8 sm:px-10 lg:px-16",
              isModern ? "max-w-7xl" : "max-w-6xl"
            )}
          >
            <div className="pt-1 text-white/80 [&_nav]:mb-0 [&_a]:text-white/70 [&_a:hover]:text-white [&_span]:text-white/90">
              <StorefrontBreadcrumb
                variant={themeId}
                items={[
                  { label: store.name, href: getStoreUrl(store.slug) },
                  { label: activeCategoryName ?? "Shop" },
                ]}
              />
            </div>
            <div className="pb-2 pt-16 sm:pb-6 sm:pt-20">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                {eyebrow}
              </p>
              <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                {title}
              </h1>
              {!activeCategoryName && store.description ? (
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65 sm:text-[15px]">
                  {store.description}
                </p>
              ) : (
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
                  {activeCategoryName
                    ? `Browse ${activeCategoryName} from the full catalog.`
                    : "Browse every piece — sort, filter, and find what belongs."}
                </p>
              )}
            </div>
          </div>
        </section>

        <main
          className={cn(
            "mx-auto px-6 pb-16 pt-8 sm:pt-10",
            isModern ? "max-w-7xl" : "max-w-6xl"
          )}
        >
          {showingSamples ? (
            <p
              className={cn(
                "mb-6 inline-flex px-3 py-1 text-[10px] font-medium uppercase tracking-wide",
                isModern ? "rounded-sm" : "rounded-full",
                isBold
                  ? "bg-white/10 text-white/50"
                  : "bg-neutral-100 text-neutral-500"
              )}
            >
              Preview samples — add real products to replace these
            </p>
          ) : null}

          <Suspense
            fallback={
              <div
                className={cn(
                  "mb-8 h-12 animate-pulse",
                  isBold ? "bg-white/5" : "bg-neutral-100"
                )}
              />
            }
          >
            <div className="mb-8 sm:mb-10">
              <ProductsPageToolbar
                storeSlug={store.slug}
                categories={categories}
                activeCategory={activeCategory}
                activeSort={sort}
                productCount={products.length}
                variant={themeId}
              />
            </div>
          </Suspense>

          {products.length === 0 ? (
            <StorefrontQuietState
              eyebrow={activeCategory ? "Category" : "Catalog"}
              title={activeCategory ? "Nothing in this category" : "No products yet"}
              description={
                activeCategory
                  ? "Try another category, or browse the full catalog."
                  : "New pieces will appear here as soon as they’re published."
              }
              primaryAction={
                activeCategory
                  ? {
                      label: "View all products",
                      href: getStoreProductsUrl(store.slug),
                    }
                  : {
                      label: "Browse collections",
                      href: getStoreCollectionsUrl(store.slug),
                    }
              }
              secondaryAction={
                activeCategory
                  ? {
                      label: "Browse collections",
                      href: getStoreCollectionsUrl(store.slug),
                    }
                  : undefined
              }
              isBold={isBold}
              isModern={isModern}
            />
          ) : (
            <CatalogProductGrid
              store={store}
              products={products}
              themeId={themeId}
              columns={isModern ? 4 : 3}
              density="comfortable"
            />
          )}

          {categories.length > 0 || products.length > 0 ? (
            <div
              className={cn(
                "mt-16 border-t pt-10 text-center",
                isBold ? "border-white/10" : "border-neutral-200/80"
              )}
            >
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.18em]",
                  isBold ? "text-white/35" : "text-neutral-400"
                )}
              >
                Prefer curated edits?
              </p>
              <Link
                href={getStoreCollectionsUrl(store.slug)}
                className={cn(
                  "mt-3 inline-block text-sm font-medium transition",
                  isBold
                    ? "text-white/75 hover:text-white"
                    : "text-neutral-700 hover:text-neutral-900"
                )}
              >
                View all collections →
              </Link>
            </div>
          ) : null}
        </main>

        <section
          className="px-6 py-14 text-center sm:py-16"
          style={{ backgroundColor: "#0a0a0a", color: "#e5e5e5" }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Stay in the edit
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/45">
            New arrivals and restocks — quiet updates when you connect your list.
          </p>
        </section>

        <FooterSection
          store={store}
          settings={{ backgroundColor: "#0a0a0a", textColor: "#a3a3a3" }}
        />
      </div>
    </StorefrontShell>
  );
}
