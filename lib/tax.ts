import type { TaxPreferences } from "@/lib/shop-preferences";

export type TaxCalculation = {
  /** Amount stored on the order as tax */
  tax: number;
  /** Amount added on top of subtotal+shipping (0 when prices already include tax) */
  addToTotal: number;
  /** Human label e.g. TVA */
  label: string;
  ratePercent: number;
  enabled: boolean;
  pricesIncludeTax: boolean;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Compute tax for an order from merchandise base (subtotal − discount).
 * Shipping and COD fees are not taxed in this first version.
 */
export function calculateOrderTax(
  prefs: TaxPreferences,
  subtotal: number,
  discount = 0
): TaxCalculation {
  const label = prefs.label.trim() || "Tax";
  const ratePercent = Math.max(0, Math.min(100, prefs.ratePercent));
  const base = Math.max(0, subtotal - Math.max(0, discount));

  if (!prefs.enabled || ratePercent <= 0 || base <= 0) {
    return {
      tax: 0,
      addToTotal: 0,
      label,
      ratePercent,
      enabled: prefs.enabled,
      pricesIncludeTax: prefs.pricesIncludeTax,
    };
  }

  if (prefs.pricesIncludeTax) {
    const net = base / (1 + ratePercent / 100);
    const tax = roundMoney(base - net);
    return {
      tax,
      addToTotal: 0,
      label,
      ratePercent,
      enabled: true,
      pricesIncludeTax: true,
    };
  }

  const tax = roundMoney(base * (ratePercent / 100));
  return {
    tax,
    addToTotal: tax,
    label,
    ratePercent,
    enabled: true,
    pricesIncludeTax: false,
  };
}
