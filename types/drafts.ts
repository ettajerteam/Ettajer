import type { ShippingAddress } from "@/types";

export interface DraftItemInput {
  productId: string;
  quantity: number;
}

export interface DraftListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DraftItemDetail {
  id: string;
  productId: string;
  title: string;
  image: string | null;
  quantity: number;
  price: number;
  inventory: number;
}

export type DraftPaymentMethod = "cod" | "stripe" | "paypal" | "other";

export interface DraftDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: DraftPaymentMethod;
  merchantNote: string | null;
  items: DraftItemDetail[];
  createdAt: string;
  updatedAt: string;
}
