import Image from "next/image";
import Link from "next/link";
import { parseSectionVisualSettings } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { ProductCardSectionSettings } from "@/lib/sections/types";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { formatCurrency } from "@/lib/utils";

interface ProductCardSectionProps {
  store: PublicStore;
  settings: ProductCardSectionSettings;
  products?: PublicProduct[];
  previewDevice?: DeviceMode;
}

export function ProductCardSection({
  store,
  settings,
  products = [],
}: ProductCardSectionProps) {
  const visual = parseSectionVisualSettings(settings as Record<string, unknown>);
  const title = settings.title?.trim();
  const ctaText = settings.ctaText?.trim() || "View product";

  let product: PublicProduct | undefined;
  if (settings.productSource === "manual" && settings.productIds?.length) {
    const id = settings.productIds[0];
    product = products.find((p) => p.id === id);
  }
  if (!product) product = products[0];

  return (
    <section
      className="px-6 py-12"
      style={{
        padding: visual.padding,
        margin: visual.margin,
        backgroundColor: visual.backgroundColor,
        color: visual.textColor,
      }}
    >
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100">
          {product?.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              {products.length === 0 ? "Add a product to spotlight" : "No image"}
            </div>
          )}
        </div>
        <div>
          {title ? (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {title}
            </p>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {product?.title ?? "Featured product"}
          </h2>
          {product ? (
            <p className="mt-3 text-lg tabular-nums text-neutral-600">
              {formatCurrency(product.price, store.currency)}
            </p>
          ) : null}
          {product?.description ? (
            <p className="mt-5 line-clamp-4 text-[15px] leading-relaxed text-neutral-500">
              {product.description}
            </p>
          ) : null}
          {product ? (
            <Link
              href={getStoreProductUrl(store.slug, product.slug)}
              className="mt-8 inline-flex rounded-full bg-neutral-900 px-7 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {ctaText}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
