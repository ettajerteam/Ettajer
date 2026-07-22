/**
 * Optimistic concurrency for layout go-live.
 * Revision is stored on StoreSettings.seo.layoutRevision (no schema migration).
 */

export function parseLayoutRevision(seoRaw: unknown): number {
  if (!seoRaw || typeof seoRaw !== "object" || Array.isArray(seoRaw)) return 0;
  const value = (seoRaw as Record<string, unknown>).layoutRevision;
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return 0;
}

export function mergeSeoWithLayoutRevision(
  seoRaw: unknown,
  revision: number
): Record<string, unknown> {
  const base =
    seoRaw && typeof seoRaw === "object" && !Array.isArray(seoRaw)
      ? { ...(seoRaw as Record<string, unknown>) }
      : {};
  base.layoutRevision = Math.max(0, Math.floor(revision));
  return base;
}
