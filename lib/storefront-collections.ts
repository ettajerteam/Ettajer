import type { FeaturedCollectionsSectionSettings } from "@/lib/sections/types";
import type { PublicCollection } from "@/types/storefront";

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 24;

function clampLimit(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.floor(n), 1), MAX_LIMIT);
}

/**
 * Pick collections for a featured-collections section.
 */
export function resolveSectionCollections(
  collections: PublicCollection[],
  settings: FeaturedCollectionsSectionSettings
): PublicCollection[] {
  const limit = clampLimit(settings.limit);
  const source = settings.collectionSource ?? "featured";
  const selectedIds = Array.isArray(settings.collectionIds)
    ? settings.collectionIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (source === "manual" && selectedIds.length > 0) {
    const byId = new Map(collections.map((c) => [c.id, c]));
    const picked: PublicCollection[] = [];
    for (const id of selectedIds) {
      const collection = byId.get(id);
      if (collection) picked.push(collection);
      if (picked.length >= limit) break;
    }
    return picked;
  }

  if (source === "all") {
    return collections.slice(0, limit);
  }

  const featured = collections.filter((c) => c.featured);
  return (featured.length > 0 ? featured : collections).slice(0, limit);
}
