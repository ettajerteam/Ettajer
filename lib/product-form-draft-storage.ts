import type { ProductFormValues } from "@/lib/validations/product";

/** Short-lived recovery cache (reload / sleep / drop connection) — not a permanent draft. */
const STORAGE_PREFIX = "ettajer:product-form-recovery:";
const MAX_AGE_MS = 1000 * 60 * 60 * 4; // 4 hours

export type ProductFormDraft = {
  updatedAt: number;
  values: ProductFormValues;
  dropshipReady: boolean;
  moreSettingsOpen: boolean;
};

function key(storeSlug: string) {
  return `${STORAGE_PREFIX}${storeSlug || "default"}`;
}

function readRaw(storeSlug: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    // Prefer session (same tab session), fall back to local for laptop sleep / crash
    return (
      window.sessionStorage.getItem(key(storeSlug)) ??
      window.localStorage.getItem(key(storeSlug))
    );
  } catch {
    return null;
  }
}

export function loadProductFormDraft(storeSlug: string): ProductFormDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = readRaw(storeSlug);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProductFormDraft;
    if (!parsed || typeof parsed.updatedAt !== "number" || !parsed.values) return null;
    if (Date.now() - parsed.updatedAt > MAX_AGE_MS) {
      clearProductFormDraft(storeSlug);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveProductFormDraft(
  storeSlug: string,
  draft: Omit<ProductFormDraft, "updatedAt">
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ProductFormDraft = {
      ...draft,
      updatedAt: Date.now(),
    };
    const raw = JSON.stringify(payload);
    window.sessionStorage.setItem(key(storeSlug), raw);
    window.localStorage.setItem(key(storeSlug), raw);
  } catch {
    // quota / private mode — ignore
  }
}

export function clearProductFormDraft(storeSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key(storeSlug));
    window.localStorage.removeItem(key(storeSlug));
    // legacy key from older draft storage
    window.localStorage.removeItem(`ettajer:product-form-draft:${storeSlug || "default"}`);
  } catch {
    // ignore
  }
}
