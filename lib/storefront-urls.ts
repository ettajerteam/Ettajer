import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-config";

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

/** Absolute live storefront URL (for share / copy / open). */
export function getAbsoluteStoreUrl(storeSlug: string): string {
  return absoluteUrl(getStoreUrl(storeSlug));
}

/** WhatsApp share link for the live storefront. */
export function getStoreWhatsAppShareUrl(storeSlug: string, storeName?: string): string {
  const url = getAbsoluteStoreUrl(storeSlug);
  const text = storeName
    ? `Shop ${storeName}: ${url}`
    : `Check out my store: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** QR image URL for the live storefront (no extra package). */
export function getStoreQrImageUrl(storeSlug: string, size = 180): string {
  const data = encodeURIComponent(getAbsoluteStoreUrl(storeSlug));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
}

/** Normalize a merchant-entered custom domain to a bare hostname. */
export function normalizeCustomDomain(input: string | null | undefined): string | null {
  if (input == null) return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  try {
    const withProto = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    const hostname = new URL(withProto).hostname.toLowerCase();
    return hostname.replace(/^www\./, "") || null;
  } catch {
    const host = trimmed
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      ?.split(":")[0]
      ?.replace(/^www\./, "");
    return host || null;
  }
}

/** Hostnames that belong to the Ettajer platform (not merchant custom domains). */
export function isPlatformHost(host: string): boolean {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h.endsWith(".vercel.app") || h.endsWith(".ngrok-free.app") || h.endsWith(".ngrok.io")) {
    return true;
  }
  try {
    const siteHost = getSiteUrl().hostname.toLowerCase();
    if (h === siteHost || h === `www.${siteHost}` || `www.${h}` === siteHost) return true;
  } catch {
    // ignore
  }
  return h === "ettajer.com" || h === "www.ettajer.com";
}

export function getStoreProductsUrl(storeSlug: string): string {
  return `/store/${storeSlug}/products`;
}

export function getStoreCollectionsUrl(storeSlug: string): string {
  return `/store/${storeSlug}/collections`;
}

export function getStoreSearchUrl(storeSlug: string, query?: string): string {
  const base = `/store/${storeSlug}/search`;
  if (!query?.trim()) return base;
  return `${base}?q=${encodeURIComponent(query.trim())}`;
}

export function getStoreBlogUrl(storeSlug: string): string {
  return `/store/${storeSlug}/blog`;
}

export function getStoreBlogPostUrl(storeSlug: string, postSlug: string): string {
  return `/store/${storeSlug}/blog/${postSlug}`;
}

/** Resolve dashboard nav href to a storefront URL */
export function resolveStoreNavHref(storeSlug: string, href: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith(`/store/${storeSlug}`)) return href;

  const normalized = href.trim() || "/";
  if (normalized === "/") return getStoreUrl(storeSlug);
  if (normalized === "/products") return getStoreProductsUrl(storeSlug);
  if (normalized === "/collections") return getStoreCollectionsUrl(storeSlug);
  if (normalized === "/search") return getStoreSearchUrl(storeSlug);
  if (normalized === "/blog") return getStoreBlogUrl(storeSlug);
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
