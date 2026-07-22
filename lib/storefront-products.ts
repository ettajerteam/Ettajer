import { isDemoProductId } from "@/lib/storefront-demo-products";
import type { ProductGridSectionSettings } from "@/lib/sections/types";
import type { PublicProduct } from "@/types/storefront";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 48;

function clampLimit(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(n), 1), MAX_LIMIT);
}

/**
 * Pick products for a product-grid / featured-products section.
 * Demo IDs are never returned unless they were already in `products` (preview-only catalog).
 */
export function resolveSectionProducts(
  products: PublicProduct[],
  settings: ProductGridSectionSettings
): PublicProduct[] {
  const limit = clampLimit(settings.limit);
  const source = settings.productSource ?? "latest";
  const selectedIds = Array.isArray(settings.productIds)
    ? settings.productIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (source === "manual" && selectedIds.length > 0) {
    const byId = new Map(products.map((p) => [p.id, p]));
    const picked: PublicProduct[] = [];
    for (const id of selectedIds) {
      // Merchants can only pin real products — ignore leftover demo ids in settings.
      if (isDemoProductId(id)) continue;
      const product = byId.get(id);
      if (product) picked.push(product);
      if (picked.length >= limit) break;
    }
    return picked;
  }

  const rawOffset =
    typeof settings.offset === "number"
      ? settings.offset
      : Number.parseInt(String(settings.offset ?? ""), 10);
  const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0;

  return products.slice(offset, offset + limit);
}
