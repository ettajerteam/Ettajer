"use client";

import { AddToCartButton } from "@/components/storefront/cart/add-to-cart-button";
import type { ProductBuyButtonSectionSettings } from "@/lib/sections/types";
import type { BlockRenderProps } from "@/lib/builder/types";

export function ProductBuyButtonSection({ store, product, settings }: BlockRenderProps) {
  const s = settings as ProductBuyButtonSectionSettings;
  const buttonText = s.buttonText ?? "Add to cart";

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-6">
        <button
          type="button"
          className="px-8 py-3.5 rounded-xl text-white font-medium opacity-50 cursor-not-allowed"
          style={{ backgroundColor: "var(--store-primary)" }}
        >
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6">
      <AddToCartButton
        store={store}
        product={product}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "var(--store-primary)" }}
        label={buttonText}
      />
    </div>
  );
}
