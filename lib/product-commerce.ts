import type { ProductStatus } from "@/lib/product-types";
import type { ProductCommerce } from "@/types";

export type ProductVisibilityChannels = NonNullable<ProductCommerce["visibility"]>;
export type ProductCommerceSettings = ProductCommerce;

export const DEFAULT_VISIBILITY: ProductVisibilityChannels = {
  onlineStore: true,
  facebook: false,
  instagram: false,
  tiktok: false,
  google: false,
};

export const DEFAULT_COMMERCE: ProductCommerceSettings = {
  vendor: "",
  supplier: "",
  brand: "",
  trackQuantity: true,
  continueSellingWhenOutOfStock: false,
  lowStockAlert: 5,
  inventoryLocation: "warehouse",
  requiresShipping: true,
  freeShipping: false,
  packageWeight: null,
  chargeTax: true,
  taxIncluded: false,
  shippingProfile: "standard",
  hsCode: "",
  countryOfOrigin: "",
  highlights: [],
  videos: [],
  models3d: [],
  dropshippingProvider: "",
  dropshippingUrl: "",
  customFields: [],
  metafields: [],
  visibility: { ...DEFAULT_VISIBILITY },
  publishMode: "now",
  publishAt: null,
  relatedProductIds: [],
  upsellProductIds: [],
  frequentlyBoughtIds: [],
};

const HIGHLIGHT_PRESETS = [
  "Lightweight",
  "Waterproof",
  "Premium quality",
  "Fast shipping",
  "Eco-friendly",
  "Handmade",
] as const;

export { HIGHLIGHT_PRESETS };

function kvList(
  raw: unknown
): { id: string; key: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((x, i) => ({
      id: typeof x.id === "string" ? x.id : `cf-${i}`,
      key: typeof x.key === "string" ? x.key : "",
      value: typeof x.value === "string" ? x.value : "",
    }))
    .filter((x) => x.key.trim() || x.value.trim());
}

function metafieldList(
  raw: unknown
): { id: string; namespace: string; key: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null)
    .map((x, i) => ({
      id: typeof x.id === "string" ? x.id : `mf-${i}`,
      namespace: typeof x.namespace === "string" ? x.namespace : "custom",
      key: typeof x.key === "string" ? x.key : "",
      value: typeof x.value === "string" ? x.value : "",
    }))
    .filter((x) => x.key.trim() || x.value.trim());
}

export function parseProductCommerce(raw: unknown): ProductCommerceSettings {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_COMMERCE, visibility: { ...DEFAULT_VISIBILITY } };
  }
  const obj = raw as Record<string, unknown>;
  const vis =
    obj.visibility && typeof obj.visibility === "object"
      ? (obj.visibility as Record<string, unknown>)
      : {};

  const numOrNull = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : null;
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const ids = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  const strings = (v: unknown) =>
    Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim())
      : [];

  const provider = str(obj.dropshippingProvider);
  const validProvider =
    provider === "aliexpress" || provider === "cj" || provider === "bigbuy" ? provider : "";

  return {
    vendor: str(obj.vendor),
    supplier: str(obj.supplier),
    brand: str(obj.brand),
    trackQuantity: obj.trackQuantity !== false,
    continueSellingWhenOutOfStock: obj.continueSellingWhenOutOfStock === true,
    lowStockAlert: numOrNull(obj.lowStockAlert) ?? 5,
    inventoryLocation: obj.inventoryLocation === "supplier" ? "supplier" : "warehouse",
    requiresShipping: obj.requiresShipping !== false,
    freeShipping: obj.freeShipping === true,
    packageWeight: numOrNull(obj.packageWeight),
    chargeTax: obj.chargeTax !== false,
    taxIncluded: obj.taxIncluded === true,
    shippingProfile: obj.shippingProfile === "express" ? "express" : "standard",
    hsCode: str(obj.hsCode),
    countryOfOrigin: str(obj.countryOfOrigin),
    highlights: strings(obj.highlights).slice(0, 12),
    videos: strings(obj.videos).slice(0, 5),
    models3d: strings(obj.models3d).slice(0, 3),
    dropshippingProvider: validProvider,
    dropshippingUrl: str(obj.dropshippingUrl),
    customFields: kvList(obj.customFields),
    metafields: metafieldList(obj.metafields),
    visibility: {
      onlineStore: vis.onlineStore !== false,
      facebook: vis.facebook === true,
      instagram: vis.instagram === true,
      tiktok: vis.tiktok === true,
      google: vis.google === true,
    },
    publishMode: obj.publishMode === "schedule" ? "schedule" : "now",
    publishAt: typeof obj.publishAt === "string" ? obj.publishAt : null,
    relatedProductIds: ids(obj.relatedProductIds),
    upsellProductIds: ids(obj.upsellProductIds),
    frequentlyBoughtIds: ids(obj.frequentlyBoughtIds),
  };
}

export function serializeProductCommerceForDb(
  commerce: ProductCommerceSettings | null | undefined
): object | null {
  const c = parseProductCommerce(commerce ?? {});
  const payload: Record<string, unknown> = {
    trackQuantity: c.trackQuantity !== false,
    continueSellingWhenOutOfStock: c.continueSellingWhenOutOfStock === true,
    lowStockAlert: c.lowStockAlert ?? null,
    inventoryLocation: c.inventoryLocation ?? "warehouse",
    requiresShipping: c.requiresShipping !== false,
    freeShipping: c.freeShipping === true,
    packageWeight: c.packageWeight ?? null,
    chargeTax: c.chargeTax !== false,
    taxIncluded: c.taxIncluded === true,
    shippingProfile: c.shippingProfile ?? "standard",
    visibility: c.visibility ?? { ...DEFAULT_VISIBILITY },
    publishMode: c.publishMode ?? "now",
    publishAt: c.publishAt || null,
    relatedProductIds: c.relatedProductIds ?? [],
    upsellProductIds: c.upsellProductIds ?? [],
    frequentlyBoughtIds: c.frequentlyBoughtIds ?? [],
  };

  if (c.vendor?.trim()) payload.vendor = c.vendor.trim();
  if (c.supplier?.trim()) payload.supplier = c.supplier.trim();
  if (c.brand?.trim()) payload.brand = c.brand.trim();
  if (c.hsCode?.trim()) payload.hsCode = c.hsCode.trim();
  if (c.countryOfOrigin?.trim()) payload.countryOfOrigin = c.countryOfOrigin.trim();
  if (c.highlights?.length) payload.highlights = c.highlights;
  if (c.videos?.length) payload.videos = c.videos;
  if (c.models3d?.length) payload.models3d = c.models3d;
  if (c.dropshippingProvider) payload.dropshippingProvider = c.dropshippingProvider;
  if (c.dropshippingUrl?.trim()) payload.dropshippingUrl = c.dropshippingUrl.trim();
  if (c.customFields?.length) payload.customFields = c.customFields;
  if (c.metafields?.length) payload.metafields = c.metafields;

  return payload;
}

/** Simple SEO completeness score 0–100 for the sticky panel. */
export function computeProductSeoScore(input: {
  title: string;
  description?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  imagesCount: number;
  categoryId?: string | null;
  hasDetails?: boolean;
}): number {
  let score = 0;
  if (input.title.trim().length >= 3) score += 20;
  if ((input.description ?? "").replace(/<[^>]*>/g, "").trim().length >= 40) score += 20;
  if ((input.seoTitle ?? "").trim().length >= 10) score += 15;
  else if (input.title.trim()) score += 8;
  if ((input.seoDescription ?? "").trim().length >= 50) score += 20;
  else if ((input.description ?? "").replace(/<[^>]*>/g, "").trim().length >= 40) score += 8;
  if (input.imagesCount >= 1) score += 15;
  if (input.imagesCount >= 3) score += 5;
  if (input.categoryId) score += 5;
  if (input.hasDetails) score += 5;
  return Math.min(100, score);
}

export function statusLabel(status: ProductStatus | string): string {
  if (status === "active") return "Active";
  if (status === "archived") return "Archived";
  return "Draft";
}
