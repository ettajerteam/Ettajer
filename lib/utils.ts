import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "MAD"): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** ASCII-safe money for emails (avoids NBSP / exotic glyphs that show as □). */
export function formatEmailCurrency(amount: number, currency = "MAD"): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const fixed = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `${fixed} ${currency}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ETJ-${timestamp}-${random}`;
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    MAD: "د.م.",
    DZD: "د.ج",
    TND: "د.ت",
    USD: "$",
    EUR: "€",
  };
  return symbols[currency] ?? currency;
}
