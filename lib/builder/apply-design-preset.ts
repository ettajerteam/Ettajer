/**
 * Safe “Change design” merge: apply layout/style from a preset while keeping
 * merchant copy, media, and picked products/collections.
 */

/** Keys that define presentation — always taken from the preset when changing design. */
const DESIGN_KEYS = new Set([
  "layout",
  "cardStyle",
  "columns", // numeric column count for grids (see isDesignKey for array guard)
  "columnCount",
  "overlay",
  "alignment",
  "objectFit",
  "aspectRatio",
  "gap",
  "showIcons",
  "showViewAll",
  "showDescription",
  "showCardButton",
  "cardButtonStyle",
  "viewAllStyle",
  "grayscale",
  "thickness",
  "height",
  "backgroundColor",
  "textColor",
  "padding",
  "margin",
  "borderRadius",
  "fontSize",
  "fontWeight",
  "letterSpacing",
  "lineHeight",
  "ctaVariant",
  "styles",
  "openFirst",
  "thumbPosition",
  "density",
  "minHeight",
  "showTitle",
  "showBrand",
  "showThumbnails",
  "showBreadcrumb",
  "showComparePrice",
  "pageSize",
  "columnCount",
  "gap",
  "showSummary",
]);

/** Keys that are always treated as merchant content (never overwrite if set). */
const CONTENT_KEYS = new Set([
  "title",
  "subtitle",
  "headline",
  "subheadline",
  "eyebrow",
  "accentHeadline",
  "content",
  "description",
  "body",
  "items",
  "images",
  "imageUrl",
  "imageAlt",
  "alt",
  "caption",
  "videoUrl",
  "posterUrl",
  "url",
  "productIds",
  "collectionIds",
  "productSource",
  "collectionSource",
  "limit",
  "offset",
  "ctaText",
  "ctaLink",
  "buttonText",
  "buttonLink",
  "secondaryCtaText",
  "secondaryCtaLink",
  "secondaryButtonText",
  "secondaryButtonLink",
  "cardButtonText",
  "placeholder",
  "endAt",
  "logos",
  "showPhone",
  "showStoreDescription",
  "showPoweredBy",
  "showNav",
  "showClientCare",
  "showLegal",
  "tagline",
  "linkUrl",
  "label",
]);

export type ApplyDesignMode = "keep-content" | "replace-all";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** True when the current value looks like real merchant content worth keeping. */
export function hasMeaningfulContent(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (isPlainObject(value)) return Object.keys(value).length > 0;
  return false;
}

function isDesignKey(key: string, presetValue: unknown): boolean {
  if (CONTENT_KEYS.has(key)) return false;
  if (key === "columns" && Array.isArray(presetValue)) {
    // Columns block stores cell content in `columns` — treat as content.
    return false;
  }
  if (key === "width" && typeof presetValue === "string") {
    // Divider width (e.g. "100%" / "4rem") is design; media widths rarely appear in presets.
    return true;
  }
  if (key === "color" && typeof presetValue === "string") {
    // Divider line color.
    return true;
  }
  return DESIGN_KEYS.has(key);
}

/**
 * Merge a design preset onto current section settings.
 * - keep-content (default for Change design): layout/style from preset; keep copy/media when set
 * - replace-all: preset values win for every key they define (legacy wipe behavior)
 */
export function applyDesignPresetSettings(
  current: Record<string, unknown>,
  presetSettings: Record<string, unknown>,
  mode: ApplyDesignMode = "keep-content"
): Record<string, unknown> {
  if (mode === "replace-all") {
    return { ...current, ...presetSettings };
  }

  const next: Record<string, unknown> = { ...current };

  for (const [key, presetValue] of Object.entries(presetSettings)) {
    if (isDesignKey(key, presetValue)) {
      next[key] = presetValue;
      continue;
    }

    // Content / unknown keys: only fill when the section doesn't already have content.
    if (!hasMeaningfulContent(current[key])) {
      next[key] = presetValue;
    }
  }

  return next;
}

/** Keys the preset would change under keep-content (for UI hints). */
export function getDesignKeysApplied(
  presetSettings: Record<string, unknown>
): string[] {
  return Object.keys(presetSettings).filter((key) =>
    isDesignKey(key, presetSettings[key])
  );
}
