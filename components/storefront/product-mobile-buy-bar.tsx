"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { useProductVariantSelection } from "@/components/storefront/product-variant-context";
import { resolveBuyNowLabel } from "@/lib/storefront/buy-labels";
import { formatCurrency, cn } from "@/lib/utils";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import type { PublicProduct, PublicStore } from "@/types/storefront";

interface ProductMobileBuyBarProps {
  store: PublicStore;
  product: PublicProduct;
  label?: string;
  /** When true, also show on desktop (fallback if buy section missing). */
  forceDesktop?: boolean;
}

export function ProductMobileBuyBar({
  store,
  product,
  label,
  forceDesktop = false,
}: ProductMobileBuyBarProps) {
  const t = getStorefrontCopy(store.language);
  const buyLabel = resolveBuyNowLabel(store, label);
  const [visible, setVisible] = useState(false);
  const { selectedVariant } = useProductVariantSelection();
  const isBold = store.theme === "bold";
  const outOfStock = product.inventory <= 0;
  const image = product.images[0];

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 380);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (outOfStock || product.id === "preview-placeholder") return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 px-3 transition-all duration-500 ease-out",
        forceDesktop ? "" : "lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className={cn(
          "mx-auto flex max-w-lg items-center gap-2 p-2 pl-2 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:gap-3",
          "rounded-[1.35rem]",
          isBold
            ? "border border-white/10 bg-zinc-950/80 text-white"
            : "border border-white/60 bg-white/75"
        )}
      >
        {image ? (
          <div
            className={cn(
              "relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl",
              isBold ? "bg-zinc-800" : "bg-neutral-100"
            )}
          >
            <Image src={image} alt="" fill className="object-cover" sizes="48px" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-[13px] font-medium tracking-[-0.01em]",
              isBold ? "text-white" : "text-neutral-900"
            )}
          >
            {product.title}
          </p>
          <p
            className="text-[14px] font-semibold tabular-nums tracking-tight"
            style={isBold ? undefined : { color: "var(--store-primary)" }}
          >
            {formatCurrency(product.price, store.currency)}
          </p>
        </div>
        <AddToCartButton
          store={store}
          product={product}
          mode="add"
          label={t.buy.addToCart}
          variant={selectedVariant}
          className={cn(
            "pdp-cta-ghost h-11 shrink-0 px-3 text-[12px]",
            isBold && "border-white/20 bg-white/5 text-white"
          )}
        />
        <AddToCartButton
          store={store}
          product={product}
          mode="buy-now"
          label={buyLabel}
          variant={selectedVariant}
          className="pdp-cta h-11 shrink-0 px-4 text-[12px] sm:h-12 sm:px-5 sm:text-[13px]"
          style={{ backgroundColor: "var(--store-primary)" }}
        />
      </div>
    </div>
  );
}
