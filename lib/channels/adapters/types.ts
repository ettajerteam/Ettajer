/**
 * Channel-agnostic contract every marketplace adapter (Etsy today, others later)
 * must implement. Types here intentionally avoid leaking channel-specific shapes
 * into callers (sync jobs, API routes) — each adapter maps to/from its own wire
 * format internally (see adapters/etsy/map-listing.ts, map-order.ts).
 */

export interface ChannelShop {
  externalShopId: string;
  externalAccountId: string;
  name: string;
  url?: string | null;
  currencyCode?: string | null;
  countryCode?: string | null;
  listingActiveCount?: number | null;
  raw: unknown;
}

export interface ChannelImageInput {
  url: string;
  alt?: string | null;
  position?: number;
}

export interface ChannelVariantInput {
  sku?: string | null;
  price?: number | null;
  quantity?: number | null;
  optionValues: Record<string, string>;
}

/** Generic payload for pushing an Ettajer product to a channel. */
export interface ChannelProductInput {
  title: string;
  description: string;
  price: number;
  currencyCode: string;
  sku?: string | null;
  quantity: number;
  tags: string[];
  images: ChannelImageInput[];
  variants?: ChannelVariantInput[];
  /**
   * Channel-specific required fields that don't have a generic equivalent
   * (e.g. Etsy's taxonomy_id / who_made / when_made / is_supply).
   */
  channelAttributes?: Record<string, unknown>;
}

export interface ChannelListing {
  externalProductId: string;
  title: string;
  description: string;
  price: number;
  currencyCode: string;
  sku: string | null;
  quantity: number;
  tags: string[];
  images: ChannelImageInput[];
  variants: ChannelVariantInput[];
  state: string;
  url?: string | null;
  raw: unknown;
}

export interface ChannelListPage<T> {
  items: T[];
  nextCursor?: string | null;
}

export interface ChannelListProductsParams {
  cursor?: string | null;
  limit?: number;
  state?: string;
}

export interface ChannelInventoryUpdate {
  sku?: string | null;
  variantKey?: string | null;
  quantity: number;
}

export interface ChannelOrderLineItem {
  externalLineItemId: string;
  externalListingId: string | null;
  sku: string | null;
  title: string;
  quantity: number;
  unitPrice: number;
  variantLabel?: string | null;
}

export interface ChannelOrderSummary {
  externalOrderId: string;
  externalStatus: string;
  createdAt: string;
  total: number;
  currencyCode: string;
  raw: unknown;
}

export interface ChannelOrderDetail extends ChannelOrderSummary {
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: Record<string, unknown>;
  lineItems: ChannelOrderLineItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  isShipped: boolean;
  isPaid: boolean;
}

export interface ChannelListOrdersParams {
  cursor?: string | null;
  limit?: number;
  /** Only orders created/modified since this ISO date. */
  since?: string | null;
}

export interface ChannelFulfillmentInput {
  trackingNumber: string;
  carrierName?: string | null;
  trackingUrl?: string | null;
}

export interface ChannelAdapter {
  getShop(): Promise<ChannelShop>;
  listProducts(
    params?: ChannelListProductsParams
  ): Promise<ChannelListPage<ChannelListing>>;
  getProduct(externalProductId: string): Promise<ChannelListing>;
  createProduct(input: ChannelProductInput): Promise<{ externalProductId: string; raw: unknown }>;
  updateProduct(
    externalProductId: string,
    input: Partial<ChannelProductInput>
  ): Promise<{ raw: unknown }>;
  publishProduct(externalProductId: string): Promise<{ raw: unknown }>;
  /**
   * Upload listing images from public URLs (best-effort per image).
   * Adapters that don't support images may no-op.
   */
  syncProductImages?(
    externalProductId: string,
    images: ChannelImageInput[]
  ): Promise<{ uploaded: number; failed: number; errors: string[] }>;
  /** Optional: list shipping profiles for channels that require one to go live. */
  listShippingProfiles?(): Promise<
    Array<{ id: string; title: string; isDefault?: boolean }>
  >;
  updateInventory(
    externalProductId: string,
    updates: ChannelInventoryUpdate[]
  ): Promise<{ raw: unknown }>;
  listOrders(
    params?: ChannelListOrdersParams
  ): Promise<ChannelListPage<ChannelOrderSummary>>;
  getOrder(externalOrderId: string): Promise<ChannelOrderDetail>;
  updateFulfillment(
    externalOrderId: string,
    input: ChannelFulfillmentInput
  ): Promise<{ raw: unknown }>;
}
