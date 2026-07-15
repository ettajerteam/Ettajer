import type { OrderStatus, ShippingAddress } from "@/types";

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string;
  firstOrderAt: string;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: ShippingAddress | null;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt: string;
  firstOrderAt: string;
  orders: CustomerOrderSummary[];
}

export type CustomerSort = "recent" | "spent" | "orders" | "name";
