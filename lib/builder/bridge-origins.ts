/**
 * Allowed origins for editor ↔ preview iframe postMessage.
 */

export function getEditorOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

/** Preview iframes load same-origin preview routes under the app origin. */
export function getPreviewOrigins(): string[] {
  const origin = getEditorOrigin();
  return origin ? [origin] : [];
}

export function isAllowedBridgeOrigin(origin: string): boolean {
  if (!origin) return false;
  const allowed = getPreviewOrigins();
  if (allowed.length === 0) return false;
  return allowed.includes(origin);
}
