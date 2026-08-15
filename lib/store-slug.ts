const STORE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LEN = 60;

/** Public storefront slug rules (matches updateStoreSchema). */
export function isValidStoreSlug(slug: string): boolean {
  if (!slug || slug.length < 2 || slug.length > MAX_SLUG_LEN) return false;
  if (!STORE_SLUG_RE.test(slug)) return false;
  // Reject URL leftovers / marketplace paste jobs
  if (
    slug.includes("http") ||
    slug.includes("www") ||
    slug.includes("aliexpress") ||
    slug.includes("amazon") ||
    slug.includes("spm") ||
    slug.includes("html")
  ) {
    return false;
  }
  return true;
}

/**
 * Build a safe store slug from a store name (or pasted junk).
 * Strips protocols/hosts, keeps a-z0-9 hyphens, max 60 chars.
 */
export function makeStoreSlug(input: string): string {
  let text = (input ?? "").trim().toLowerCase();

  // If it looks like a URL, prefer the last path segment before query
  if (/^https?:\/\//i.test(text) || text.includes("://") || text.includes("www.")) {
    try {
      const url = new URL(text.startsWith("http") ? text : `https://${text}`);
      const parts = url.pathname.split("/").filter(Boolean);
      text = parts[parts.length - 1] || url.hostname.replace(/^www\./, "");
    } catch {
      text = text.replace(/^https?:\/\//i, "").split(/[/?#]/)[0] ?? "";
    }
  }

  let slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SLUG_LEN)
    .replace(/-+$/g, "");

  if (!isValidStoreSlug(slug)) {
    // Last resort: short random-ish from cleaned chars
    slug = slug
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, MAX_SLUG_LEN);
  }

  if (!slug || slug.length < 2 || !isValidStoreSlug(slug)) {
    return "";
  }

  return slug;
}
