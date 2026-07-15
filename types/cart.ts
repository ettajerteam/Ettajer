export interface CartItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  variant: Record<string, string> | null;
  inventory: number;
}

export interface ServerCart {
  storeSlug: string;
  currency: string;
  items: CartItem[];
}

export type ShippingMethod = "standard" | "express";
export type PaymentMethod = "cod" | "stripe";
