import Image from "next/image";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontBreadcrumb } from "@/components/storefront/storefront-breadcrumb";
import { CatalogProductGrid } from "@/components/storefront/catalog-product-grid";
import { FadeInSection } from "@/components/storefront/motion-wrapper";
import { getThemeAssets } from "@/lib/storefront-assets";
import type { PublicCategory, PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import { getStoreUrl } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

interface CatalogPageProps {
  store: PublicStore;
  products: PublicProduct[];
  categories: PublicCategory[];
  title: string;
  description?: string | null;
  image?: string | null;
  breadcrumbLabel: string;
  preview?: boolean;
}

export function CatalogPage({
  store,
  products,
  categories,
  title,
  description,
  image,
  breadcrumbLabel,
  preview,
}: CatalogPageProps) {
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 } ? store.theme : "minimal") as ThemeId;
  const variant = themeId;
  const isBold = themeId === "bold";
  const assets = getThemeAssets(store.theme);
  const coverImage = image ?? assets.categoryCover;

  return (
    <StorefrontShell store={store} preview={preview}>
      <div className={cn("min-h-screen", isBold ? "bg-[#0A0A0A] text-white" : "bg-white")}>
        <StorefrontHeader store={store} variant={variant} categories={categories} />
        <main
          className={cn(
            "mx-auto px-6 py-10 sm:py-14",
            themeId === "modern" ? "max-w-7xl" : "max-w-6xl"
          )}
        >
          <StorefrontBreadcrumb
            variant={variant}
            items={[
              { label: store.name, href: getStoreUrl(store.slug) },
              { label: breadcrumbLabel },
            ]}
          />

          <FadeInSection className="mb-10">
            <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden mb-6">
              <Image src={coverImage} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 1152px" />
            </div>
            <h1
              className={cn(
                "text-3xl sm:text-4xl font-bold tracking-tight mb-3",
                themeId === "modern" && "uppercase font-black tracking-tighter",
                themeId === "bold" && "uppercase"
              )}
            >
              {title}
            </h1>
            {description && (
              <p className={cn("text-lg max-w-2xl", isBold ? "text-white/60" : "text-gray-500")}>
                {description}
              </p>
            )}
          </FadeInSection>

          {products.length === 0 ? (
            <p className={cn("text-center py-16", isBold ? "text-white/40" : "text-gray-400")}>
              No products found.
            </p>
          ) : (
            <CatalogProductGrid store={store} products={products} themeId={themeId} />
          )}
        </main>
      </div>
    </StorefrontShell>
  );
}
