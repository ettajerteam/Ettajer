import { absoluteUrl } from "@/lib/seo/site-config";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { parseProductCommerce } from "@/lib/product-commerce";
import { parseProductImages } from "@/lib/product-images";

/** Meta Commerce Manager scheduled feed columns (TSV). */
export const META_CATALOG_FEED_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "additional_image_link",
  "sale_price",
  "product_type",
  "quantity_to_sell_on_facebook",
  "status",
] as const;

export type MetaCatalogFeedColumn = (typeof META_CATALOG_FEED_COLUMNS)[number];

export interface MetaCatalogFeedProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  inventory: number;
  status: string;
  productType: string | null;
  images: unknown;
  commerce: unknown;
  categoryName?: string | null;
  tags?: string[] | null;
}

export interface BuildMetaCatalogFeedInput {
  storeSlug: string;
  storeName: string;
  currency: string;
  products: MetaCatalogFeedProduct[];
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

function escapeTsv(value: string): string {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function formatMoney(amount: number, currency: string): string {
  const safe = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return `${safe.toFixed(2)} ${currency.toUpperCase()}`;
}

function toAbsoluteImage(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  return absoluteUrl(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}

/** Active storefront products that can appear in Dynamic Ads / Advantage+. */
export function isProductEligibleForMetaCatalog(product: MetaCatalogFeedProduct): boolean {
  if (product.status !== "active") return false;
  const commerce = parseProductCommerce(product.commerce);
  if (!commerce.visibility?.onlineStore) return false;
  const images = parseProductImages(product.images);
  return images.length > 0 && Boolean(toAbsoluteImage(images[0]!));
}

export function buildMetaCatalogFeedRow(
  product: MetaCatalogFeedProduct,
  input: Omit<BuildMetaCatalogFeedInput, "products">
): Record<MetaCatalogFeedColumn, string> | null {
  if (!isProductEligibleForMetaCatalog(product)) return null;

  const commerce = parseProductCommerce(product.commerce);
  const images = parseProductImages(product.images)
    .map(toAbsoluteImage)
    .filter((url): url is string => Boolean(url));
  if (!images.length) return null;

  const inStock =
    product.inventory > 0 || commerce.continueSellingWhenOutOfStock === true;
  const description =
    truncate(stripHtml(product.description ?? product.title), 5000) || product.title;
  const brand =
    commerce.brand?.trim() ||
    commerce.vendor?.trim() ||
    input.storeName.trim() ||
    "Store";
  const productType =
    product.categoryName?.trim() ||
    product.tags?.filter(Boolean).slice(0, 3).join(" > ") ||
    product.productType ||
    "product";

  const compare = product.comparePrice;
  const onSale =
    typeof compare === "number" &&
    Number.isFinite(compare) &&
    compare > product.price;

  return {
    id: product.id,
    title: truncate(stripHtml(product.title), 150) || "Product",
    description,
    availability: inStock ? "in stock" : "out of stock",
    condition: "new",
    price: formatMoney(onSale ? compare! : product.price, input.currency),
    link: absoluteUrl(getStoreProductUrl(input.storeSlug, product.slug)),
    image_link: images[0]!,
    brand: truncate(brand, 100),
    additional_image_link: images.slice(1, 11).join(","),
    sale_price: onSale ? formatMoney(product.price, input.currency) : "",
    product_type: truncate(productType, 750),
    quantity_to_sell_on_facebook: String(Math.max(0, product.inventory)),
    status: "active",
  };
}

export function buildMetaCatalogFeedTsv(input: BuildMetaCatalogFeedInput): string {
  const header = META_CATALOG_FEED_COLUMNS.join("\t");
  const lines = [header];

  for (const product of input.products) {
    const row = buildMetaCatalogFeedRow(product, input);
    if (!row) continue;
    lines.push(
      META_CATALOG_FEED_COLUMNS.map((column) => escapeTsv(row[column] ?? "")).join("\t")
    );
  }

  return `${lines.join("\n")}\n`;
}

export function createCatalogFeedToken(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID().replace(/-/g, "");
    }
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

export function getMetaCatalogFeedPath(storeSlug: string, token?: string | null): string {
  const base = `/api/feeds/meta/${encodeURIComponent(storeSlug)}.tsv`;
  if (!token?.trim()) return base;
  return `${base}?key=${encodeURIComponent(token.trim())}`;
}

export function getMetaCatalogFeedUrl(storeSlug: string, token?: string | null): string {
  return absoluteUrl(getMetaCatalogFeedPath(storeSlug, token));
}
