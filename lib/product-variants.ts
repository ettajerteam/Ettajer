import type { ProductVariant } from "@/types";

export function parseProductVariants(variants: unknown): ProductVariant[] {
  if (!Array.isArray(variants)) return [];
  return variants.filter(
    (v): v is ProductVariant =>
      typeof v === "object" &&
      v !== null &&
      "id" in v &&
      "name" in v &&
      "options" in v &&
      Array.isArray((v as ProductVariant).options)
  );
}
