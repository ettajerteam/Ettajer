import type { ListingImportReadiness } from "@/lib/channels/types";
import type { ChannelImageInput, ChannelListing, ChannelVariantInput } from "@/lib/channels/adapters/types";

/**
 * Loose shapes for the Etsy Open API v3 Listing resource, requested with
 * `includes=Images,Inventory,Shipping`. We only type the fields we actually
 * read — Etsy's payload has many more we don't need.
 */
export interface EtsyMoney {
  amount: number;
  divisor: number;
  currency_code: string;
}

export interface EtsyListingImage {
  listing_image_id: number;
  url_fullxfull?: string | null;
  url_570xN?: string | null;
  url_170x135?: string | null;
  alt_text?: string | null;
  rank?: number | null;
}

export interface EtsyInventoryOffering {
  offering_id: number;
  quantity: number;
  is_enabled: boolean;
  price: EtsyMoney;
}

export interface EtsyPropertyValue {
  property_id: number;
  property_name?: string | null;
  values: string[];
}

export interface EtsyInventoryProduct {
  product_id: number;
  sku?: string | null;
  is_deleted?: boolean;
  offerings: EtsyInventoryOffering[];
  property_values: EtsyPropertyValue[];
}

export interface EtsyListingInventory {
  products: EtsyInventoryProduct[];
}

export interface EtsyListing {
  listing_id: number;
  title?: string | null;
  description?: string | null;
  price?: EtsyMoney | null;
  quantity?: number | null;
  tags?: string[] | null;
  state?: string | null;
  url?: string | null;
  images?: EtsyListingImage[] | null;
  inventory?: EtsyListingInventory | null;
  [key: string]: unknown;
}

export interface MappedListingImportResult {
  readiness: ListingImportReadiness;
  issues: string[];
  channelListing: ChannelListing;
  /** Ready-to-use fields for a Product create/update, when readiness allows it. */
  productInput: {
    title: string;
    description: string;
    price: number | null;
    sku: string | null;
    inventory: number | null;
    tags: string[];
    images: string[];
  };
}

function moneyToDecimal(money: EtsyMoney | null | undefined): number | null {
  if (!money || !money.divisor) return null;
  const value = money.amount / money.divisor;
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
}

function mapImages(images: EtsyListingImage[] | null | undefined): ChannelImageInput[] {
  if (!images?.length) return [];
  return images
    .filter((img) => Boolean(img.url_fullxfull))
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .map((img, index) => ({
      url: img.url_fullxfull as string,
      alt: img.alt_text ?? null,
      position: img.rank ?? index,
    }));
}

function mapVariants(
  inventory: EtsyListingInventory | null | undefined
): ChannelVariantInput[] {
  if (!inventory?.products?.length) return [];
  return inventory.products
    .filter((p) => !p.is_deleted)
    .map((product) => {
      const enabledOffering =
        product.offerings.find((o) => o.is_enabled) ?? product.offerings[0];
      const optionValues: Record<string, string> = {};
      for (const pv of product.property_values ?? []) {
        const label = pv.property_name?.trim() || `property_${pv.property_id}`;
        if (pv.values?.length) optionValues[label] = pv.values.join(" / ");
      }
      return {
        sku: product.sku?.trim() || null,
        price: moneyToDecimal(enabledOffering?.price),
        quantity: enabledOffering?.quantity ?? null,
        optionValues,
      } satisfies ChannelVariantInput;
    });
}

/**
 * Classify how safe it is to auto-import an Etsy listing into an Ettajer
 * product without a human reviewing it. We never invent price/sku/inventory —
 * missing data downgrades readiness instead of being defaulted.
 */
export function mapEtsyListingToImportResult(
  listing: EtsyListing
): MappedListingImportResult {
  const issues: string[] = [];

  const title = listing.title?.trim() || "";
  const description = listing.description?.trim() || "";
  const price = moneyToDecimal(listing.price);
  const images = mapImages(listing.images);
  const variants = mapVariants(listing.inventory);

  const topLevelSku =
    variants.length === 1 && variants[0].sku ? variants[0].sku : null;
  const inventoryQty =
    typeof listing.quantity === "number" ? listing.quantity : null;

  if (!title) issues.push("Missing title");
  if (!price) issues.push("Missing or unparseable price");
  if (images.length === 0) issues.push("No usable images");
  if (variants.length > 1 && variants.some((v) => !v.sku)) {
    issues.push("One or more variants are missing a SKU");
  }

  let readiness: ListingImportReadiness;
  if (listing.state && listing.state !== "active" && listing.state !== "draft") {
    readiness = "unsupported";
    issues.push(`Unsupported listing state: ${listing.state}`);
  } else if (!title || !price || images.length === 0) {
    readiness = "needs_review";
  } else if (variants.length > 0 && variants.every((v) => !v.sku) && !topLevelSku) {
    readiness = "missing_sku";
  } else {
    readiness = "ready";
  }

  const channelListing: ChannelListing = {
    externalProductId: String(listing.listing_id),
    title,
    description,
    price: price ?? 0,
    currencyCode: listing.price?.currency_code ?? "USD",
    sku: topLevelSku,
    quantity: inventoryQty ?? 0,
    tags: listing.tags ?? [],
    images,
    variants,
    state: listing.state ?? "unknown",
    url: listing.url ?? null,
    raw: listing,
  };

  return {
    readiness,
    issues,
    channelListing,
    productInput: {
      title,
      description,
      price,
      sku: topLevelSku,
      inventory: inventoryQty,
      tags: listing.tags ?? [],
      images: images.map((i) => i.url),
    },
  };
}
