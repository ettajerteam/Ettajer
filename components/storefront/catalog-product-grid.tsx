import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { StaggerGrid, StaggerItem } from "@/components/storefront/motion-wrapper";
import { MinimalProductCard } from "@/components/storefront/templates/minimal";
import { getProductImage } from "@/lib/storefront-assets";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface CatalogProductGridProps {
  store: PublicStore;
  products: PublicProduct[];
  themeId: ThemeId;
}

export function CatalogProductGrid({ store, products, themeId }: CatalogProductGridProps) {
  if (themeId === "minimal") {
    return (
      <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
        {products.map((product) => (
          <StaggerItem key={product.id}>
            <MinimalProductCard store={store} product={product} />
          </StaggerItem>
        ))}
      </StaggerGrid>
    );
  }

  if (themeId === "modern") {
    return (
      <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {products.map((product) => {
          const imageSrc = getProductImage(store.theme, product.images, product.id);
          return (
          <StaggerItem key={product.id}>
            <Link
              href={getStoreProductUrl(store.slug, product.slug)}
              className="group relative aspect-[3/4] overflow-hidden bg-neutral-200"
            >
              <Image
                src={imageSrc}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                <h3 className="text-white font-bold uppercase tracking-wide text-lg">{product.title}</h3>
                <p className="text-white/80 text-sm mt-1">{formatCurrency(product.price, store.currency)}</p>
              </div>
            </Link>
          </StaggerItem>
        );
        })}
      </StaggerGrid>
    );
  }

  return (
    <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => {
        const imageSrc = getProductImage(store.theme, product.images, product.id);
        return (
        <StaggerItem key={product.id}>
          <Link
            href={getStoreProductUrl(store.slug, product.slug)}
            className="group relative rounded-xl overflow-hidden border border-white/10 bg-white/5 transition-all duration-300 hover:border-[var(--store-primary)] hover:shadow-[0_0_30px_var(--store-primary)]"
          >
            <div className="aspect-square relative">
              <Image
                src={imageSrc}
                alt={product.title}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider truncate">{product.title}</h3>
              <p className="text-sm mt-1 font-mono" style={{ color: "var(--store-primary)" }}>
                {formatCurrency(product.price, store.currency)}
              </p>
            </div>
          </Link>
        </StaggerItem>
      );
      })}    </StaggerGrid>
  );
}
