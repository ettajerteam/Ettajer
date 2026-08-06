"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { createMarketingEventId } from "@/lib/marketing-event-id";
import { trackAddToCart } from "@/lib/marketing-events";
import { resolveBuyNowLabel } from "@/lib/storefront/buy-labels";
import { getStoreCheckoutUrl } from "@/lib/storefront-urls";
import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import type { PublicProduct, PublicStore } from "@/types/storefront";

interface AddToCartButtonProps {
  store: PublicStore;
  product: PublicProduct;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Selected option map (e.g. { Size: "M", Color: "Black" }). */
  variant?: Record<string, string> | null;
  quantity?: number;
  /**
   * `add` — add to bag and open the cart drawer.
   * `buy-now` — add to bag and go straight to checkout.
   */
  mode?: "add" | "buy-now";
}

export function AddToCartButton({
  store,
  product,
  label,
  className,
  style,
  variant = null,
  quantity = 1,
  mode = "add",
}: AddToCartButtonProps) {
  const router = useRouter();
  const t = getStorefrontCopy(store.language);
  const resolvedLabel =
    label?.trim() ||
    (mode === "buy-now"
      ? resolveBuyNowLabel(store, null)
      : t.buy.addToCart);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const setStore = useCartStore((s) => s.setStore);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const qty = Math.max(1, Math.min(quantity, Math.max(product.inventory, 1)));

  async function handleAdd() {
    if (product.inventory <= 0) return;

    setLoading(true);
    setStore(store.slug, store.currency);

    const cartItem = {
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: product.images[0] ?? null,
      price: product.price,
      inventory: product.inventory,
      variant: variant && Object.keys(variant).length > 0 ? variant : null,
      quantity: qty,
    };

    const eventId = createMarketingEventId("cart");
    addItem(cartItem);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug: store.slug,
          currency: store.currency,
          eventId,
          ...cartItem,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Failed to add to cart");
      }

      const data = await res.json();
      useCartStore.getState().hydrateFromServer(store.slug, data.currency, data.items);
      trackAddToCart(store.marketing, {
        productId: product.id,
        title: product.title,
        price: product.price,
        currency: store.currency,
        quantity: qty,
        eventId,
        storeSlug: store.slug,
      });

      if (mode === "buy-now") {
        router.push(getStoreCheckoutUrl(store.slug));
        return;
      }

      setAdded(true);
      openCart();
      setTimeout(() => setAdded(false), 2000);
    } catch {
      useCartStore.getState().removeItem(
        useCartStore.getState().items.find((i) => i.productId === product.id)?.id ?? ""
      );
    } finally {
      setLoading(false);
    }
  }

  const outOfStock = product.inventory <= 0;

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={loading || outOfStock || (mode === "add" && added)}
      className={className}
      style={style}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {mode === "buy-now" ? t.buy.buying : t.buy.adding}
        </span>
      ) : added && mode === "add" ? (
        <span className="inline-flex items-center gap-2">
          <Check className="h-4 w-4" />
          {t.buy.added}
        </span>
      ) : outOfStock ? (
        t.buy.outOfStock
      ) : (
        resolvedLabel
      )}
    </button>
  );
}
