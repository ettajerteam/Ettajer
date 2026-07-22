import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { getProductImage } from "@/lib/storefront-assets";
import { isDemoProductId } from "@/lib/storefront-demo-products";
import type { PublicProduct, PublicStore } from "@/types/storefront";
import { cn } from "@/lib/utils";

interface EditorialProductCardProps {
  store: PublicStore;
  product: PublicProduct;
  className?: string;
}

export function EditorialProductCard({ store, product, className }: EditorialProductCardProps) {
  const imageSrc = getProductImage(store.theme, product.images, product.id);
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const isDemo = isDemoProductId(product.id);

  const media = (
    <div
      className={cn(
        "relative mb-4 aspect-[3/4] overflow-hidden",
        isModern ? "rounded-sm bg-stone-100" : "rounded-2xl",
        isBold ? "bg-zinc-900 ring-1 ring-white/10" : !isModern && "bg-gray-50"
      )}
    >
      <Image
        src={imageSrc}
        alt={product.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      {isDemo ? (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/65 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
          Sample
        </span>
      ) : null}
    </div>
  );

  const meta = (
    <div className="space-y-1">
      <h3
        className={cn(
          "tracking-tight transition-opacity group-hover:opacity-70",
          isModern ? "text-[13px] font-medium text-neutral-900" : "text-sm font-medium",
          isBold && "text-white"
        )}
      >
        {product.title}
      </h3>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            isModern ? "text-[13px] text-neutral-700" : "text-sm",
            isBold && "text-white/80"
          )}
          style={!isModern && !isBold ? { color: "var(--store-primary)" } : undefined}
        >
          {formatCurrency(product.price, store.currency)}
        </span>
        {product.comparePrice && product.comparePrice > product.price ? (
          <span className="text-xs text-neutral-400 line-through">
            {formatCurrency(product.comparePrice, store.currency)}
          </span>
        ) : null}
      </div>
    </div>
  );

  if (isDemo) {
    return (
      <div
        className={cn("group block cursor-default", className)}
        title="Sample product — only shown in editor preview"
      >
        {media}
        {meta}
      </div>
    );
  }

  return (
    <Link href={getStoreProductUrl(store.slug, product.slug)} className={cn("group block", className)}>
      {media}
      {meta}
    </Link>
  );
}
