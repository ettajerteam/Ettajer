import type {
  OrderPaymentMethod,
  OrderPaymentStatus,
  OrderStatus,
  ShippingAddress,
} from "@/types";

export interface OrderItemDetail {
  id: string;
  productId: string;
  title: string;
  image: string | null;
  quantity: number;
  price: number;
  variant: Record<string, string> | null;
  ticketPrinterId: string | null;
  barcode: string | null;
  sku: string | null;
}

export interface OrderStatusEvent {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  couponCode: string | null;
  paymentMethod: OrderPaymentMethod | null;
  paymentStatus: OrderPaymentStatus;
  refundedAmount: number;
  merchantNote: string | null;
  inventoryRestored: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  customerId: string | null;
  shippingAddress: ShippingAddress;
  items: OrderItemDetail[];
  statusHistory: OrderStatusEvent[];
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  itemCount: number;
  paymentMethod: OrderPaymentMethod | null;
  paymentStatus: OrderPaymentStatus;
  createdAt: string;
}

export const ORDER_STATUSES: {
  value: OrderStatus;
  label: string;
  description: string;
}[] = [
  { value: "draft", label: "Draft", description: "Draft order not yet submitted" },
  { value: "pending", label: "Pending", description: "Order received, awaiting confirmation" },
  { value: "processing", label: "Confirmed", description: "Buyer verified; ready for packing or courier" },
  { value: "shipped", label: "Shipped", description: "Order has been shipped" },
  { value: "delivered", label: "Delivered", description: "Order delivered to customer" },
  { value: "returned", label: "Returned", description: "Order was returned by customer" },
  { value: "cancelled", label: "Cancelled", description: "Order was cancelled" },
  { value: "refunded", label: "Refunded", description: "Payment was refunded to the customer" },
];

export const PAYMENT_STATUSES: {
  value: OrderPaymentStatus;
  label: string;
}[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partially refunded" },
];

export const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

/** Statuses that should restore inventory when entered (once). */
export const RESTOCK_STATUSES: OrderStatus[] = ["cancelled", "returned", "refunded"];

/** Statuses excluded from revenue totals. */
export const NON_REVENUE_STATUSES: OrderStatus[] = ["cancelled", "returned", "refunded", "draft"];

export function getStatusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getPaymentMethodLabel(method: OrderPaymentMethod | null | undefined): string {
  if (method === "cod") return "Cash on Delivery";
  if (method === "stripe") return "Card";
  if (method === "paypal") return "PayPal";
  if (method === "other") return "Other";
  return "—";
}

export function getPaymentStatusLabel(status: OrderPaymentStatus): string {
  return PAYMENT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === "refunded") return [];
  if (current === "cancelled") return ["refunded"];
  if (current === "returned") return ["refunded"];
  if (current === "delivered") return ["returned", "refunded"];
  if (current === "shipped") return ["delivered", "returned", "refunded"];
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1) return ["cancelled"];
  const options: OrderStatus[] = [];
  if (idx < STATUS_FLOW.length - 1) {
    options.push(STATUS_FLOW[idx + 1]);
  }
  options.push("cancelled");
  return options;
}
