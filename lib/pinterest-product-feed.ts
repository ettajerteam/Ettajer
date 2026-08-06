import { absoluteUrl } from "@/lib/seo/site-config";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { parseProductCommerce } from "@/lib/product-commerce";
import { parseProductImages } from "@/lib/product-images";
import { createCatalogFeedToken } from "@/lib/meta-product-feed";

/**
 * Pinterest retail catalog scheduled feed (TSV).
 * @see https://help.pinterest.com/en/business/article/before-you-get-started-with-catalogs
 */
export const PINTEREST_CATALOG_FEED_COLUMNS = [
  "id",
  "title",
  "description",
  "link",
  "image_link",
  "price",
  "availability",
  "brand",
  "additional_image_link",
  "sale_price",
  "product_type",
  "condition",
] as const;

export type PinterestCatalogFeedColumn =
  (typeof PINTEREST_CATALOG_FEED_COLUMNS)[number];

export interface PinterestCatalogFeedProduct {
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

export interface BuildPinterestCatalogFeedInput {
  storeSlug: string;
  storeName: string;
  currency: string;
  products: PinterestCatalogFeedProduct[];
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

/** Active storefront products eligible for Pinterest product Pins / shopping ads. */
export function isProductEligibleForPinterestCatalog(
  product: PinterestCatalogFeedProduct
): boolean {
  if (product.status !== "active") return false;
  const commerce = parseProductCommerce(product.commerce);
  if (!commerce.visibility?.onlineStore) return false;
  const images = parseProductImages(product.images);
  return images.length > 0 && Boolean(toAbsoluteImage(images[0]!));
}

export function buildPinterestCatalogFeedRow(
  product: PinterestCatalogFeedProduct,
  input: Omit<BuildPinterestCatalogFeedInput, "products">
): Record<PinterestCatalogFeedColumn, string> | null {
  if (!isProductEligibleForPinterestCatalog(product)) return null;

  const commerce = parseProductCommerce(product.commerce);
  const images = parseProductImages(product.images)
    .map(toAbsoluteImage)
    .filter((url): url is string => Boolean(url));
  if (!images.length) return null;

  const inStock =
    product.inventory > 0 || commerce.continueSellingWhenOutOfStock === true;
  const description =
    truncate(stripHtml(product.description ?? product.title), 10000) ||
    product.title;
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

  const productLink = absoluteUrl(
    getStoreProductUrl(input.storeSlug, product.slug)
  );

  return {
    id: truncate(product.id, 127),
    title: truncate(stripHtml(product.title), 500) || "Product",
    description,
    link: truncate(productLink, 511),
    image_link: images[0]!,
    price: formatMoney(onSale ? compare! : product.price, input.currency),
    availability: inStock ? "in stock" : "out of stock",
    brand: truncate(brand, 100),
    additional_image_link: images.slice(1, 11).join(","),
    sale_price: onSale ? formatMoney(product.price, input.currency) : "",
    product_type: truncate(productType, 1000),
    condition: "new",
  };
}

export function buildPinterestCatalogFeedTsv(
  input: BuildPinterestCatalogFeedInput
): string {
  const header = PINTEREST_CATALOG_FEED_COLUMNS.join("\t");
  const lines = [header];

  for (const product of input.products) {
    const row = buildPinterestCatalogFeedRow(product, input);
    if (!row) continue;
    lines.push(
      PINTEREST_CATALOG_FEED_COLUMNS.map((column) =>
        escapeTsv(row[column] ?? "")
      ).join("\t")
    );
  }

  return `${lines.join("\n")}\n`;
}

export { createCatalogFeedToken };

export function getPinterestCatalogFeedPath(
  storeSlug: string,
  token?: string | null
): string {
  const base = `/api/feeds/pinterest/${encodeURIComponent(storeSlug)}.tsv`;
  if (!token?.trim()) return base;
  return `${base}?key=${encodeURIComponent(token.trim())}`;
}

export function getPinterestCatalogFeedUrl(
  storeSlug: string,
  token?: string | null
): string {
  return absoluteUrl(getPinterestCatalogFeedPath(storeSlug, token));
}
