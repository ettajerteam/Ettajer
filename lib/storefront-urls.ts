/** Canonical public product URL (spec: /store/[slug]/product/[product-slug]) */
export function getStoreProductUrl(storeSlug: string, productSlug: string): string {
  return `/store/${storeSlug}/product/${productSlug}`;
}

export function getStoreCategoryUrl(storeSlug: string, categorySlug: string): string {
  return `/store/${storeSlug}/category/${categorySlug}`;
}

export function getStoreCollectionUrl(storeSlug: string, collectionSlug: string): string {
  return `/store/${storeSlug}/collection/${collectionSlug}`;
}

export function getStoreUrl(storeSlug: string): string {
  return `/store/${storeSlug}`;
}

/** Resolve dashboard nav href to a storefront URL */
export function resolveStoreNavHref(storeSlug: string, href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith(`/store/${storeSlug}`)) return href;

  const normalized = href.trim() || "/";
  if (normalized === "/" || normalized === "/products" || normalized === "/collections") {
    return getStoreUrl(storeSlug);
  }
  if (normalized.startsWith("/pages/")) {
    return `/store/${storeSlug}${normalized}`;
  }
  if (normalized.startsWith("/category/")) {
    return `/store/${storeSlug}/category/${normalized.slice("/category/".length)}`;
  }
  if (normalized.startsWith("/collection/")) {
    return `/store/${storeSlug}/collection/${normalized.slice("/collection/".length)}`;
  }
  const pageSlug = normalized.replace(/^\//, "");
  return getStorePageUrl(storeSlug, pageSlug);
}

export function getStorePageUrl(storeSlug: string, pageSlug: string): string {
  return `/store/${storeSlug}/pages/${pageSlug}`;
}

export function getStoreCheckoutUrl(storeSlug: string): string {
  return `/store/${storeSlug}/checkout`;
}

export function getOrderConfirmationUrl(storeSlug: string, orderNumber: string): string {
  return `/store/${storeSlug}/checkout/confirmation?order=${encodeURIComponent(orderNumber)}`;
}
