import type { ChannelOrderDetail, ChannelOrderLineItem, ChannelOrderSummary } from "@/lib/channels/adapters/types";
import type { EtsyMoney } from "@/lib/channels/adapters/etsy/map-listing";

/**
 * Loose shape for the Etsy Open API v3 ShopReceipt resource (+ nested
 * transactions, i.e. line items). We only type fields we read.
 */
export interface EtsyReceiptTransaction {
  transaction_id: number;
  listing_id: number | null;
  product_id?: number | null;
  sku?: string | null;
  title?: string | null;
  quantity: number;
  price: EtsyMoney;
  variations?: Array<{ formatted_name?: string; formatted_value?: string }> | null;
}

export interface EtsyReceipt {
  receipt_id: number;
  status?: string | null;
  is_paid?: boolean | null;
  is_shipped?: boolean | null;
  create_timestamp?: number | null;
  name?: string | null;
  buyer_email?: string | null;
  buyer_user_id?: number | null;
  first_line?: string | null;
  second_line?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country_iso?: string | null;
  formatted_address?: string | null;
  grandtotal?: EtsyMoney | null;
  subtotal?: EtsyMoney | null;
  total_shipping_cost?: EtsyMoney | null;
  total_tax_cost?: EtsyMoney | null;
  discount_amt?: EtsyMoney | null;
  transactions?: EtsyReceiptTransaction[] | null;
  [key: string]: unknown;
}

/** Ettajer order status values this mapper can produce (see prisma Order.status). */
export type MappedOrderStatus = "pending" | "paid" | "shipped" | "completed";

function moneyToDecimal(money: EtsyMoney | null | undefined): number {
  if (!money || !money.divisor) return 0;
  const value = money.amount / money.divisor;
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
}

/**
 * Etsy exposes order progress via `is_paid` / `is_shipped` booleans (documented
 * in the receipts tutorial) plus a loosely-typed `status` string on some
 * responses. We prefer the booleans since they're guaranteed to exist.
 */
export function mapEtsyReceiptStatus(receipt: EtsyReceipt): MappedOrderStatus {
  if (receipt.is_shipped) return "shipped";
  if (receipt.is_paid) return "paid";
  return "pending";
}

function mapLineItems(receipt: EtsyReceipt): ChannelOrderLineItem[] {
  return (receipt.transactions ?? []).map((tx) => {
    const variantLabel = (tx.variations ?? [])
      .filter((v) => v.formatted_name && v.formatted_value)
      .map((v) => `${v.formatted_name}: ${v.formatted_value}`)
      .join(", ");
    return {
      externalLineItemId: String(tx.transaction_id),
      externalListingId: tx.listing_id != null ? String(tx.listing_id) : null,
      sku: tx.sku?.trim() || null,
      title: tx.title?.trim() || "Etsy item",
      quantity: tx.quantity ?? 1,
      unitPrice: moneyToDecimal(tx.price),
      variantLabel: variantLabel || null,
    } satisfies ChannelOrderLineItem;
  });
}

/**
 * Etsy receipts don't always expose a verified buyer email under
 * `transactions_r` scope; when absent we surface `null` rather than
 * fabricating one, so callers know to flag the order for review.
 */
export function mapEtsyReceiptToOrderDetail(receipt: EtsyReceipt): ChannelOrderDetail {
  const lineItems = mapLineItems(receipt);
  const status = mapEtsyReceiptStatus(receipt);

  return {
    externalOrderId: String(receipt.receipt_id),
    externalStatus: receipt.status?.trim() || status,
    createdAt: receipt.create_timestamp
      ? new Date(receipt.create_timestamp * 1000).toISOString()
      : new Date().toISOString(),
    total: moneyToDecimal(receipt.grandtotal),
    currencyCode: receipt.grandtotal?.currency_code ?? "USD",
    customerName: receipt.name?.trim() || "Etsy buyer",
    customerEmail: receipt.buyer_email?.trim() || null,
    customerPhone: null,
    shippingAddress: {
      name: receipt.name ?? null,
      line1: receipt.first_line ?? null,
      line2: receipt.second_line ?? null,
      city: receipt.city ?? null,
      state: receipt.state ?? null,
      zip: receipt.zip ?? null,
      countryIso: receipt.country_iso ?? null,
      formatted: receipt.formatted_address ?? null,
    },
    lineItems,
    subtotal: moneyToDecimal(receipt.subtotal),
    shipping: moneyToDecimal(receipt.total_shipping_cost),
    tax: moneyToDecimal(receipt.total_tax_cost),
    discount: moneyToDecimal(receipt.discount_amt),
    isShipped: receipt.is_shipped === true,
    isPaid: receipt.is_paid === true,
    raw: receipt,
  };
}

export function mapEtsyReceiptToOrderSummary(receipt: EtsyReceipt): ChannelOrderSummary {
  const status = mapEtsyReceiptStatus(receipt);
  return {
    externalOrderId: String(receipt.receipt_id),
    externalStatus: receipt.status?.trim() || status,
    createdAt: receipt.create_timestamp
      ? new Date(receipt.create_timestamp * 1000).toISOString()
      : new Date().toISOString(),
    total: moneyToDecimal(receipt.grandtotal),
    currencyCode: receipt.grandtotal?.currency_code ?? "USD",
    raw: receipt,
  };
}
