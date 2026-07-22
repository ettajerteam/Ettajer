import type { ProductDetail } from "@/types";

export type { ProductDetail };

/** Parse product.details JSON into clean label/value rows. */
export function parseProductDetails(raw: unknown): ProductDetail[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductDetail[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const label = typeof r.label === "string" ? r.label.trim() : "";
    const value = typeof r.value === "string" ? r.value.trim() : "";
    if (!label || !value) continue;
    out.push({
      id: typeof r.id === "string" && r.id ? r.id : `detail-${out.length + 1}`,
      label,
      value,
    });
  }
  return out;
}

/** Normalize details before saving to the database. */
export function normalizeProductDetails(raw: unknown): ProductDetail[] {
  return parseProductDetails(raw);
}

export const DETAIL_PRESETS = [
  "Brand",
  "Material",
  "Weight",
  "Dimensions",
  "Color",
  "Size guide",
  "Care",
  "Origin",
  "Warranty",
  "Shipping",
] as const;
