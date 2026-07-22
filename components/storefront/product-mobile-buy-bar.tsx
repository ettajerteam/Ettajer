"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { useProductVariantSelection } from "@/components/storefront/product-variant-context";
import { formatCurrency, cn } from "@/lib/utils";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import type { PublicProduct, PublicStore } from "@/types/storefront";

interface ProductMobileBuyBarProps {
  store: PublicStore;
  product: PublicProduct;
  label?: string;
}

export function ProductMobileBuyBar({
  store,
  product,
  label,
}: ProductMobileBuyBarProps) {
  const t = getStorefrontCopy(store.language);
  const resolvedLabel = label?.trim() || t.buy.orderNowCod;
  const [visible, setVisible] = useState(false);
  const { selectedVariant } = useProductVariantSelection();
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
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
        "fixed inset-x-0 bottom-0 z-40 px-3 transition-all duration-300 lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
      style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className={cn(
          "mx-auto flex max-w-lg items-center gap-3 border p-2.5 pl-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl",
          isModern ? "rounded-sm" : "rounded-2xl",
          isBold
            ? "border-white/10 bg-zinc-950/92 text-white"
            : "border-black/5 bg-white/92"
        )}
      >
        {image ? (
          <div
            className={cn(
              "relative h-12 w-12 shrink-0 overflow-hidden",
              isModern ? "rounded-sm" : "rounded-xl",
              isBold ? "bg-zinc-800" : "bg-neutral-100"
            )}
          >
            <Image src={image} alt="" fill className="object-cover" sizes="48px" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-[13px] font-medium tracking-tight",
              isBold ? "text-white" : "text-neutral-900"
            )}
          >
            {product.title}
          </p>
          <p
            className="text-[13px] font-semibold tabular-nums"
            style={isBold ? undefined : { color: "var(--store-primary)" }}
          >
            {formatCurrency(product.price, store.currency)}
          </p>
        </div>
        <AddToCartButton
          store={store}
          product={product}
          label={resolvedLabel}
          variant={selectedVariant}
          className={cn(
            "h-11 shrink-0 px-4 text-[12px] font-semibold text-white shadow-sm",
            isModern ? "rounded-sm uppercase tracking-[0.08em]" : "rounded-xl"
          )}
          style={{ backgroundColor: "var(--store-primary)" }}
        />
      </div>
    </div>
  );
}
