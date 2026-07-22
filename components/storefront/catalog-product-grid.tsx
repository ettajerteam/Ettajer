import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { StaggerGrid, StaggerItem } from "@/components/storefront/motion-wrapper";
import { getProductImage } from "@/lib/storefront-assets";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface CatalogProductGridProps {
  store: PublicStore;
  products: PublicProduct[];
  themeId: ThemeId;
  columns?: number;
  density?: "comfortable" | "dense";
}

function gridClass(columns: number, density: "comfortable" | "dense", themeId: ThemeId) {
  const cols =
    columns >= 4
      ? "grid-cols-2 md:grid-cols-4"
      : columns === 2
        ? "grid-cols-2"
        : "grid-cols-2 md:grid-cols-3";
  const gap =
    density === "dense"
      ? themeId === "bold"
        ? "gap-3"
        : "gap-x-3 gap-y-7 md:gap-x-4 md:gap-y-9"
      : themeId === "bold"
        ? "gap-4"
        : themeId === "modern"
          ? "gap-x-5 gap-y-11 md:gap-x-7 md:gap-y-14"
          : "gap-x-5 gap-y-11 md:gap-x-7 md:gap-y-14";
  return cn("grid", cols, gap);
}

function ProductMeta({
  store,
  product,
  themeId,
}: {
  store: PublicStore;
  product: PublicProduct;
  themeId: ThemeId;
}) {
  const hasCompare =
    typeof product.comparePrice === "number" && product.comparePrice > product.price;

  if (themeId === "bold") {
    return (
      <div className="p-4">
        <h3 className="truncate text-[11px] font-bold uppercase tracking-[0.14em]">
          {product.title}
        </h3>
        <p className="mt-1.5 font-mono text-sm" style={{ color: "var(--store-primary)" }}>
          {formatCurrency(product.price, store.currency)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3
        className={cn(
          "tracking-tight transition-opacity group-hover:opacity-70",
          themeId === "modern"
            ? "text-[13px] font-medium text-neutral-900"
            : "text-sm font-medium text-neutral-900"
        )}
      >
        {product.title}
      </h3>
      <div className="flex items-baseline gap-2">
        <p
          className={cn(
            "text-[13px] tabular-nums",
            themeId === "modern" ? "text-neutral-700" : "text-neutral-800"
          )}
          style={themeId === "minimal" ? { color: "var(--store-primary)" } : undefined}
        >
          {formatCurrency(product.price, store.currency)}
        </p>
        {hasCompare ? (
          <span className="text-[12px] tabular-nums text-neutral-400 line-through">
            {formatCurrency(product.comparePrice!, store.currency)}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function CatalogProductGrid({
  store,
  products,
  themeId,
  columns = 3,
  density = "comfortable",
}: CatalogProductGridProps) {
  const className = gridClass(columns, density, themeId);

  return (
    <StaggerGrid className={className}>
      {products.map((product) => {
        const imageSrc = getProductImage(store.theme, product.images, product.id);
        const aspect =
          density === "dense"
            ? themeId === "bold"
              ? "aspect-[4/5]"
              : "aspect-square"
            : themeId === "modern"
              ? "aspect-[3/4]"
              : themeId === "bold"
                ? "aspect-square"
                : "aspect-[4/5]";

        return (
          <StaggerItem key={product.id}>
            <Link
              href={getStoreProductUrl(store.slug, product.slug)}
              className={cn(
                "group block",
                themeId === "bold" &&
                  "overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-[var(--store-primary)] hover:shadow-[0_0_30px_var(--store-primary)]"
              )}
            >
              <div
                className={cn(
                  "relative mb-3.5 overflow-hidden bg-neutral-100",
                  themeId === "bold" && "mb-0 bg-transparent",
                  themeId === "modern" ? "rounded-sm" : themeId === "minimal" ? "rounded-2xl" : "",
                  aspect
                )}
              >
                <Image
                  src={imageSrc}
                  alt={product.title}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                    themeId === "bold" && "opacity-80 transition-opacity group-hover:opacity-100",
                    product.inventory <= 0 && "opacity-70"
                  )}
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                {product.inventory <= 0 ? (
                  <span
                    className={cn(
                      "absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-[0.14em]",
                      themeId === "bold"
                        ? "text-white/80"
                        : "bg-white/90 px-2 py-1 text-neutral-600 backdrop-blur-sm"
                    )}
                  >
                    Sold out
                  </span>
                ) : null}
              </div>
              <ProductMeta store={store} product={product} themeId={themeId} />
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerGrid>
  );
}
