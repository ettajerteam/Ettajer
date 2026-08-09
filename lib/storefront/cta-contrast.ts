/**
 * Contrast helpers for storefront CTAs (cart / checkout).
 * Merchants sometimes set primaryColor to white or near-white, which made
 * `text-white` + `backgroundColor: primary` invisible on white panels.
 */

const FALLBACK_PRIMARY = "#0a0a0a";
const ON_LIGHT = "#0a0a0a";
const ON_DARK = "#ffffff";
/** Relative luminance above this → treat as light fill (use dark text). */
const LIGHT_TEXT_THRESHOLD = 0.55;
/**
 * On a light surface (white cart/checkout), primary fills above this look
 * invisible — darken the CTA fill while leaving --store-primary for accents.
 */
const LIGHT_SURFACE_MIN_CONTRAST = 0.72;

export function parseHexColor(input: string | null | undefined): string | null {
  if (!input) return null;
  let raw = input.trim();
  if (!raw) return null;
  if (raw.startsWith("#")) raw = raw.slice(1);
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    raw = raw
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;
  return `#${raw.toLowerCase()}`;
}

function srgbChannel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number | null {
  const parsed = parseHexColor(hex);
  if (!parsed) return null;
  const r = parseInt(parsed.slice(1, 3), 16);
  const g = parseInt(parsed.slice(3, 5), 16);
  const b = parseInt(parsed.slice(5, 7), 16);
  return (
    0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b)
  );
}

export function contrastOnColor(backgroundHex: string): typeof ON_LIGHT | typeof ON_DARK {
  const L = relativeLuminance(backgroundHex);
  if (L == null) return ON_DARK;
  return L > LIGHT_TEXT_THRESHOLD ? ON_LIGHT : ON_DARK;
}

function mixTowardNeutral(hex: string, amount: number): string {
  const parsed = parseHexColor(hex) ?? FALLBACK_PRIMARY;
  const r = parseInt(parsed.slice(1, 3), 16);
  const g = parseInt(parsed.slice(3, 5), 16);
  const b = parseInt(parsed.slice(5, 7), 16);
  const t = Math.min(1, Math.max(0, amount));
  const nr = Math.round(r + (10 - r) * t);
  const ng = Math.round(g + (10 - g) * t);
  const nb = Math.round(b + (10 - b) * t);
  return `#${[nr, ng, nb].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** CTA fill safe on a light (white) surface. */
export function resolveCtaFill(
  primaryColor: string | null | undefined,
  surface: "light" | "dark" = "light",
): string {
  const primary = parseHexColor(primaryColor) ?? FALLBACK_PRIMARY;
  const L = relativeLuminance(primary) ?? 0;
  if (surface === "light" && L >= LIGHT_SURFACE_MIN_CONTRAST) {
    // Near-white brand color: keep a hint of hue but ensure the button is visible.
    return mixTowardNeutral(primary, 0.82);
  }
  if (surface === "dark" && L < 0.12) {
    // Near-black on dark theme: lift slightly so the button still reads.
    return mixTowardNeutral(primary, -0.35);
  }
  return primary;
}

export type StoreCtaColors = {
  fill: string;
  onFill: string;
  cssVars: {
    "--store-cta": string;
    "--store-on-cta": string;
  };
  style: {
    backgroundColor: string;
    color: string;
  };
};

export function resolveStoreCtaColors(
  primaryColor: string | null | undefined,
  surface: "light" | "dark" = "light",
): StoreCtaColors {
  const fill = resolveCtaFill(primaryColor, surface);
  const onFill = contrastOnColor(fill);
  return {
    fill,
    onFill,
    cssVars: {
      "--store-cta": fill,
      "--store-on-cta": onFill,
    },
    style: {
      backgroundColor: fill,
      color: onFill,
    },
  };
}
