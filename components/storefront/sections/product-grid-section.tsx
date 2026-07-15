import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { getProductImage } from "@/lib/storefront-assets";
import { StaggerGrid, StaggerItem } from "@/components/storefront/motion-wrapper";
import { getDeviceStyles } from "@/lib/builder/section-styles";
import type { DeviceMode } from "@/lib/builder/types";
import type { ProductGridSectionSettings } from "@/lib/sections/types";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import type { ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface ProductGridSectionProps {
  store: PublicStore;
  products: PublicProduct[];
  settings: ProductGridSectionSettings;
  previewDevice?: DeviceMode;
}

function ProductCard({ store, product }: { store: PublicStore; product: PublicProduct }) {
  const imageSrc = getProductImage(store.theme, product.images, product.id);
  const isBold = store.theme === "bold";

  return (
    <Link href={getStoreProductUrl(store.slug, product.slug)} className="group block">
      <div
        className={cn(
          "aspect-square rounded-2xl overflow-hidden mb-4 relative",
          isBold ? "bg-zinc-900 ring-1 ring-white/10" : "bg-gray-50"
        )}
      >
        <Image
          src={imageSrc}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <h3 className="font-medium text-sm tracking-tight group-hover:opacity-70 transition-opacity">
        {product.title}
      </h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm" style={{ color: "var(--store-primary)" }}>
          {formatCurrency(product.price, store.currency)}
        </span>
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="text-xs text-gray-400 line-through">
            {formatCurrency(product.comparePrice, store.currency)}
          </span>
        )}
      </div>
    </Link>
  );
}

export function ProductGridSection({
  store,
  products,
  settings,
  previewDevice,
}: ProductGridSectionProps) {
  const title = settings.title ?? "Products";
  const theme = store.theme as ThemeId;
  const deviceStyles = getDeviceStyles(
    settings as Record<string, unknown>,
    previewDevice ?? "desktop"
  );
  const columns = deviceStyles.columns ?? 3;

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <h2
        className={cn(
          "mb-8",
          theme === "modern" && "text-2xl font-black uppercase tracking-tighter",
          theme === "bold" && "text-xs font-bold uppercase tracking-[0.4em]",
          theme === "minimal" && "text-xs font-medium uppercase tracking-widest text-gray-400"
        )}
        style={{
          ...(theme === "bold" ? { color: "var(--store-primary)" } : undefined),
          fontSize: deviceStyles.fontSize,
        }}
      >
        {title}
      </h2>
      {products.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No products available yet.</p>
      ) : (
        <StaggerGrid
          className="ettajer-responsive-grid grid gap-x-6 gap-y-12 grid-cols-2 md:grid-cols-3"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard store={store} product={product} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </section>
  );
}
