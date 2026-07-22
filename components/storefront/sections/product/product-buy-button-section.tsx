"use client";

import { useState } from "react";
import { Banknote, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { ProductSectionShell } from "@/components/storefront/product-section-shell";
import { useProductVariantSelection } from "@/components/storefront/product-variant-context";
import type { ProductBuyButtonSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { getStoreProductsUrl, getStoreCollectionsUrl } from "@/lib/storefront-urls";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import { cn } from "@/lib/utils";

function QuantityStepper({
  value,
  max,
  onChange,
  isBold,
  isModern,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  isBold: boolean;
  isModern: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-12 items-center border",
        isModern ? "rounded-sm" : "rounded-2xl",
        isBold ? "border-white/15" : "border-neutral-200"
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className={cn(
          "inline-flex h-full w-11 items-center justify-center transition disabled:opacity-40",
          isBold ? "text-white/70 hover:bg-white/5" : "text-neutral-600 hover:bg-neutral-50"
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "min-w-[2.5rem] text-center text-sm font-semibold tabular-nums",
          isBold ? "text-white" : "text-neutral-900"
        )}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(
          "inline-flex h-full w-11 items-center justify-center transition disabled:opacity-40",
          isBold ? "text-white/70 hover:bg-white/5" : "text-neutral-600 hover:bg-neutral-50"
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProductBuyButtonSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductBuyButtonSectionSettings;
  const t = getStorefrontCopy(store.language);
  const buttonText = s.buttonText?.trim() || t.buy.orderNowCod;
  const isBold = store.theme === "bold";
  const isModern = store.theme === "modern";
  const layout = s.layout ?? "solid";
  const { selectedVariant } = useProductVariantSelection();
  const [quantity, setQuantity] = useState(1);

  const shape = cn(
    "h-12 text-[13px] font-semibold tracking-[-0.01em] shadow-sm transition disabled:opacity-50",
    isModern
      ? "rounded-sm uppercase tracking-[0.12em]"
      : layout === "pill"
        ? "rounded-full"
        : "rounded-2xl",
    layout === "full" || layout === "solid" || layout === "pill" ? "w-full" : "w-full sm:w-auto",
    "px-8"
  );

  const styleClass =
    layout === "outline"
      ? cn(
          shape,
          "border-2 bg-transparent",
          isBold
            ? "border-white/30 text-white hover:border-white hover:bg-white/5"
            : "border-neutral-900 text-neutral-900 hover:bg-neutral-50"
        )
      : cn(shape, "text-white hover:opacity-90");

  const styleAttr =
    layout === "outline" ? undefined : { backgroundColor: "var(--store-primary)" };

  if (!product) {
    return (
      <ProductSectionShell>
        <button type="button" className={cn(styleClass, "cursor-not-allowed opacity-50")} style={styleAttr}>
          {buttonText}
        </button>
      </ProductSectionShell>
    );
  }

  const outOfStock = product.inventory <= 0;
  const lowStock = !outOfStock && product.inventory > 0 && product.inventory <= 5;
  const maxQty = Math.max(product.inventory, 1);

  if (outOfStock) {
    return (
      <ProductSectionShell className="space-y-5 pt-1">
        <div className="text-left">
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.16em]",
              isBold ? "text-white/40" : "text-neutral-400"
            )}
          >
            Currently unavailable
          </p>
          <p
            className={cn(
              "mt-2 text-xl font-medium tracking-tight",
              isBold ? "text-white" : "text-neutral-900"
            )}
          >
            Out of stock
          </p>
          <p
            className={cn(
              "mt-2 max-w-sm text-sm leading-relaxed",
              isBold ? "text-white/45" : "text-neutral-500"
            )}
          >
            This piece isn’t available right now. Browse the shop for something else that fits.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={getStoreProductsUrl(store.slug)}
            className={cn(styleClass, "inline-flex items-center justify-center text-center")}
            style={styleAttr}
          >
            Shop the catalog
          </Link>
          <Link
            href={getStoreCollectionsUrl(store.slug)}
            className={cn(
              shape,
              "inline-flex items-center justify-center border text-center transition",
              isBold
                ? "border-white/25 text-white/80 hover:border-white/50"
                : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
            )}
          >
            Browse collections
          </Link>
        </div>
      </ProductSectionShell>
    );
  }

  const trusts = [
    { icon: Banknote, label: "Cash on delivery" },
    { icon: Truck, label: "Fast shipping" },
    { icon: ShieldCheck, label: "Secure order" },
  ];

  return (
    <ProductSectionShell className="space-y-4 pt-1">
      {lowStock ? (
        <p
          className={cn(
            "text-[12px] font-medium",
            isBold ? "text-amber-300/90" : "text-amber-700"
          )}
        >
          Only {product.inventory} left — order soon
        </p>
      ) : (
        <p className={cn("text-[12px]", isBold ? "text-white/40" : "text-neutral-400")}>
          In stock · Ready to ship
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <QuantityStepper
          value={Math.min(quantity, maxQty)}
          max={maxQty}
          onChange={setQuantity}
          isBold={isBold}
          isModern={isModern}
        />
        <AddToCartButton
          store={store}
          product={product}
          className={cn(styleClass, "flex-1")}
          style={styleAttr}
          label={buttonText}
          variant={selectedVariant}
          quantity={quantity}
        />
      </div>

      <ul className="grid grid-cols-3 gap-2">
        {trusts.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className={cn(
              "flex flex-col items-start gap-1.5 border px-2.5 py-2.5 text-[11px] leading-snug sm:px-3",
              isModern ? "rounded-sm" : "rounded-2xl",
              isBold
                ? "border-white/10 bg-white/[0.03] text-white/60"
                : "border-neutral-200/70 bg-[#fafafa] text-neutral-600"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </ProductSectionShell>
  );
}
