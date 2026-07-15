import type { ShippingMethod } from "@/types/cart";

export const FREE_SHIPPING_THRESHOLD = 300;

export const SHIPPING_OPTIONS: {
  id: ShippingMethod;
  label: string;
  description: string;
  rate: number;
}[] = [
  {
    id: "standard",
    label: "Standard shipping",
    description: "3–5 business days",
    rate: 30,
  },
  {
    id: "express",
    label: "Express shipping",
    description: "1–2 business days",
    rate: 50,
  },
];

export function calculateCheckoutShipping(
  subtotal: number,
  method: ShippingMethod,
  freeThreshold = FREE_SHIPPING_THRESHOLD
): number {
  if (subtotal >= freeThreshold) return 0;
  const option = SHIPPING_OPTIONS.find((o) => o.id === method);
  return option?.rate ?? 30;
}

export function getCartItemId(productId: string, variant: Record<string, string> | null): string {
  if (!variant || Object.keys(variant).length === 0) return productId;
  const key = Object.entries(variant)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return `${productId}__${key}`;
}
