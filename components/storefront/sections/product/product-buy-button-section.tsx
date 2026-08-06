"use client";

import { useState } from "react";
import { Banknote, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import { ProductCodOrderForm } from "@/components/storefront/sections/product/product-cod-order-form";
import { ProductSectionShell } from "@/components/storefront/product-section-shell";
import { useProductVariantSelection } from "@/components/storefront/product-variant-context";
import type { ProductBuyButtonSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";
import { getStoreProductsUrl, getStoreCollectionsUrl } from "@/lib/storefront-urls";
import { resolveBuyNowLabel } from "@/lib/storefront/buy-labels";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import { cn } from "@/lib/utils";

function QuantityStepper({
  value,
  max,
  onChange,
  isBold,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  isBold: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-14 items-center rounded-full border px-1.5 backdrop-blur-md",
        isBold
          ? "border-white/15 bg-white/[0.06]"
          : "border-black/[0.08] bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full transition duration-300 disabled:opacity-35",
          isBold
            ? "text-white/75 hover:bg-white/10"
            : "text-neutral-700 hover:bg-black/[0.04]"
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "min-w-[2.75rem] text-center text-[15px] font-medium tabular-nums",
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
          "inline-flex h-11 w-11 items-center justify-center rounded-full transition duration-300 disabled:opacity-35",
          isBold
            ? "text-white/75 hover:bg-white/10"
            : "text-neutral-700 hover:bg-black/[0.04]"
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
  const addLabel = t.buy.addToCart;
  const buyLabel = resolveBuyNowLabel(store, s.buttonText);
  const showCodForm = Boolean(store.checkout?.cashOnDelivery);
  const isBold = store.theme === "bold";
  const layout = s.layout ?? "solid";
  const { selectedVariant } = useProductVariantSelection();
  const [quantity, setQuantity] = useState(1);

  const primaryCta = cn(
    "pdp-cta w-full",
    layout === "outline" && "!bg-transparent !text-inherit !shadow-none"
  );

  const outlineCta = cn(
    "pdp-cta-ghost w-full",
    isBold && "border-white/20 bg-white/5 text-white hover:bg-white/10"
  );

  const styleAttr =
    layout === "outline" ? undefined : { backgroundColor: "var(--store-primary)" };

  if (!product) {
    return (
      <ProductSectionShell>
        <button type="button" className={cn(primaryCta, "cursor-not-allowed opacity-50")} style={styleAttr}>
          {buyLabel}
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
              "text-[11px] font-medium uppercase tracking-[0.16em]",
              isBold ? "text-white/40" : "text-neutral-400"
            )}
          >
            Currently unavailable
          </p>
          <p
            className={cn(
              "mt-2 text-2xl font-medium tracking-[-0.03em]",
              isBold ? "text-white" : "text-neutral-900"
            )}
          >
            Out of stock
          </p>
          <p
            className={cn(
              "mt-2 max-w-sm text-[15px] leading-relaxed",
              isBold ? "text-white/45" : "text-neutral-500"
            )}
          >
            This piece isn’t available right now. Browse the shop for something else that fits.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Link
            href={getStoreProductsUrl(store.slug)}
            className={cn(primaryCta, "inline-flex text-center")}
            style={styleAttr}
          >
            Shop the catalog
          </Link>
          <Link
            href={getStoreCollectionsUrl(store.slug)}
            className={cn(outlineCta, "inline-flex text-center")}
          >
            Browse collections
          </Link>
        </div>
      </ProductSectionShell>
    );
  }

  const trusts = [
    ...(store.checkout.cashOnDelivery
      ? [{ icon: Banknote, label: t.cart.cashOnDelivery }]
      : []),
    { icon: Truck, label: t.cart.trackedDelivery },
    { icon: ShieldCheck, label: t.cart.secureCheckout },
  ];

  return (
    <ProductSectionShell className="space-y-5 pt-1">
      {lowStock ? (
        <p
          className={cn(
            "text-[13px] font-medium",
            isBold ? "text-amber-300/90" : "text-amber-700"
          )}
        >
          Only {product.inventory} left — order soon
        </p>
      ) : (
        <p className={cn("text-[13px]", isBold ? "text-white/45" : "text-neutral-500")}>
          In stock · Ready to ship
        </p>
      )}

      <div className="flex flex-col gap-3">
        <QuantityStepper
          value={Math.min(quantity, maxQty)}
          max={maxQty}
          onChange={setQuantity}
          isBold={isBold}
        />
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <AddToCartButton
            store={store}
            product={product}
            mode="buy-now"
            className={cn(
              layout === "outline" ? outlineCta : primaryCta,
              "flex-1"
            )}
            style={styleAttr}
            label={buyLabel}
            variant={selectedVariant}
            quantity={quantity}
          />
          <AddToCartButton
            store={store}
            product={product}
            mode="add"
            className={cn(outlineCta, "flex-1")}
            label={addLabel}
            variant={selectedVariant}
            quantity={quantity}
          />
        </div>
      </div>

      <ul
        className={cn(
          "grid gap-2",
          trusts.length === 3 ? "grid-cols-3" : "grid-cols-2"
        )}
      >
        {trusts.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl px-3 py-3 text-[11px] leading-snug backdrop-blur-md sm:px-3.5",
              isBold
                ? "border border-white/10 bg-white/[0.05] text-white/65"
                : "border border-white/60 bg-white/45 text-neutral-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.75} />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      {showCodForm ? (
        <ProductCodOrderForm
          store={store}
          product={product}
          quantity={Math.min(quantity, maxQty)}
          variant={selectedVariant}
          isBold={isBold}
        />
      ) : null}
    </ProductSectionShell>
  );
}
