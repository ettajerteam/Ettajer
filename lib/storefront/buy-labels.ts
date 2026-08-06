import { getStorefrontCopy } from "@/lib/storefront/storefront-i18n";
import type { PublicStore } from "@/types/storefront";

/** Labels that mean “add to cart” — must not override the Buy now / Order CTA. */
const CART_LIKE_LABEL =
  /^(add to (bag|cart|basket)|ajouter au panier|أضف إلى السلة|أضف للسلة)$/i;

export function isCartLikeBuyLabel(text: string | null | undefined): boolean {
  const t = text?.trim();
  if (!t) return false;
  return CART_LIKE_LABEL.test(t);
}

/** Primary PDP CTA: Order now when COD is on; never show a cart-like label on buy-now. */
export function resolveBuyNowLabel(
  store: Pick<PublicStore, "language" | "checkout">,
  buttonText?: string | null
): string {
  const t = getStorefrontCopy(store.language);
  const custom = buttonText?.trim();
  if (custom && !isCartLikeBuyLabel(custom)) return custom;
  if (store.checkout?.cashOnDelivery) return t.buy.orderNowCod;
  return t.buy.buyNow;
}
