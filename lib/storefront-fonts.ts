/** Client-safe storefront font CSS helpers (no server-only imports). */

export function getFontFamily(font: string): string {
  const families: Record<string, string> = {
    Inter: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
    Poppins: "var(--font-poppins), sans-serif",
    Outfit: "var(--font-outfit), sans-serif",
    "Space Grotesk": "var(--font-space), sans-serif",
    "Playfair Display": "var(--font-playfair), serif",
  };
  return families[font] ?? families.Inter!;
}

/** Thin Inter default weight for modern/minimal storefronts */
export function getStoreFontWeight(font: string): number {
  if (font === "Inter" || font === "Poppins" || font === "Outfit") return 300;
  return 400;
}
