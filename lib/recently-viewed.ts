import type { PublicProduct } from "@/types/storefront";

const STORAGE_PREFIX = "ettajer:recently-viewed:";
const MAX_ITEMS = 12;

export type RecentlyViewedSnapshot = {
  id: string;
  title: string;
  slug: string;
  price: number;
  images: string[];
};

function storageKey(storeSlug: string): string {
  return `${STORAGE_PREFIX}${storeSlug}`;
}

function isSnapshot(value: unknown): value is RecentlyViewedSnapshot {
  if (!value || typeof value !== "object") return false;
  const v = value as RecentlyViewedSnapshot;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.slug === "string" &&
    typeof v.price === "number" &&
    Array.isArray(v.images)
  );
}

export function readRecentlyViewed(storeSlug: string): RecentlyViewedSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(storeSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // Migrate legacy id-only arrays by dropping them (can't render without snapshots).
    return parsed.filter(isSnapshot).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function pushRecentlyViewed(
  storeSlug: string,
  product: Pick<PublicProduct, "id" | "title" | "slug" | "price" | "images">
): RecentlyViewedSnapshot[] {
  if (typeof window === "undefined" || !product.id || product.id === "preview-placeholder") {
    return readRecentlyViewed(storeSlug);
  }
  const snapshot: RecentlyViewedSnapshot = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    images: product.images.slice(0, 4),
  };
  const prev = readRecentlyViewed(storeSlug).filter((item) => item.id !== product.id);
  const next = [snapshot, ...prev].slice(0, MAX_ITEMS);
  try {
    window.localStorage.setItem(storageKey(storeSlug), JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
  return next;
}
