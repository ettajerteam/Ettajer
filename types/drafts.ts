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
  total: number;
  items: DraftItemDetail[];
  createdAt: string;
  updatedAt: string;
}
