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

/** Stable date for SSR + client (avoids hydration mismatches from locale defaults). */
export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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
