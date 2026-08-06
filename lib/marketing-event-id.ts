/**
 * Shared browser Pixel + Conversions API `event_id` / `eventID` for Meta dedupe.
 * Meta collapses matching event_name + event_id within the dedupe window into one conversion.
 */

/** Random id for ephemeral events (PageView, ViewContent, AddToCart, InitiateCheckout). */
export function createMarketingEventId(prefix = "evt"): string {
  const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, "").slice(0, 24) || "evt";
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `${safePrefix}_${crypto.randomUUID()}`;
    }
  } catch {
    // fall through
  }
  return `${safePrefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Stable Purchase id so checkout CAPI and thank-you Pixel always match.
 * Format: purchase_{orderNumber}
 */
export function purchaseEventId(orderNumber: string): string {
  const normalized = orderNumber.trim().replace(/\s+/g, "_");
  if (!normalized) return createMarketingEventId("purchase");
  return `purchase_${normalized}`;
}

/** True when an id looks like our stable Purchase event id. */
export function isPurchaseEventId(eventId: string | null | undefined): boolean {
  return Boolean(eventId && /^purchase_.+/i.test(eventId.trim()));
}
