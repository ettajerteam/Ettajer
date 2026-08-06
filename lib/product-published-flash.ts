export const PRODUCT_PUBLISHED_FLASH_KEY = "ettajer:product-published-flash";

export type ProductPublishedFlash = {
  title: string;
  at: number;
};

export function setProductPublishedFlash(title: string) {
  if (typeof window === "undefined") return;
  try {
    const payload: ProductPublishedFlash = { title, at: Date.now() };
    window.sessionStorage.setItem(PRODUCT_PUBLISHED_FLASH_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function consumeProductPublishedFlash(): ProductPublishedFlash | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PRODUCT_PUBLISHED_FLASH_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(PRODUCT_PUBLISHED_FLASH_KEY);
    const parsed = JSON.parse(raw) as ProductPublishedFlash;
    if (!parsed?.title || typeof parsed.at !== "number") return null;
    // Ignore stale flashes older than 2 minutes
    if (Date.now() - parsed.at > 2 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}
