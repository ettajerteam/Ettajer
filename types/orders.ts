import type { OrderStatus, ShippingAddress } from "@/types";

export interface OrderItemDetail {
  id: string;
  productId: string;
  title: string;
  image: string | null;
  quantity: number;
  price: number;
  variant: Record<string, string> | null;
  ticketPrinterId: string | null;
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
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
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
  itemCount: number;
  createdAt: string;
}

export const ORDER_STATUSES: {
  value: OrderStatus;
  label: string;
  description: string;
}[] = [
  { value: "draft", label: "Draft", description: "Draft order not yet submitted" },
  { value: "pending", label: "Pending", description: "Order received, awaiting confirmation" },
  { value: "processing", label: "Processing", description: "Order is being prepared" },
  { value: "shipped", label: "Shipped", description: "Order has been shipped" },
  { value: "delivered", label: "Delivered", description: "Order delivered to customer" },
  { value: "returned", label: "Returned", description: "Order was returned by customer" },
  { value: "cancelled", label: "Cancelled", description: "Order was cancelled" },
];

export const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

export function getStatusLabel(status: OrderStatus): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === "cancelled" || current === "returned") return [];
  if (current === "delivered" || current === "shipped") return ["returned"];
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1) return ["cancelled"];
  const options: OrderStatus[] = [];
  if (idx < STATUS_FLOW.length - 1) {
    options.push(STATUS_FLOW[idx + 1]);
  }
  options.push("cancelled");
  return options;
}
