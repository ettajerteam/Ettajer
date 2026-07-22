/** Store-wide design tokens (beyond primary/secondary/font). Persisted in StoreSettings.seo.design */

export interface StoreDesignTokens {
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  /** CSS length, e.g. 0.75rem */
  buttonRadius?: string;
}

export const DEFAULT_DESIGN_TOKENS: Required<StoreDesignTokens> = {
  textColor: "#1A1A1A",
  mutedColor: "#737373",
  borderColor: "#E5E5E5",
  buttonRadius: "0.75rem",
};

export const BOLD_DESIGN_TOKENS: Required<StoreDesignTokens> = {
  textColor: "#FFFFFF",
  mutedColor: "#A3A3A3",
  borderColor: "#262626",
  buttonRadius: "0.5rem",
};

export function parseDesignTokens(seoRaw: unknown): StoreDesignTokens {
  if (!seoRaw || typeof seoRaw !== "object") return {};
  const design = (seoRaw as Record<string, unknown>).design;
  if (!design || typeof design !== "object") return {};
  const obj = design as Record<string, unknown>;
  const out: StoreDesignTokens = {};
  if (typeof obj.textColor === "string" && obj.textColor.trim()) out.textColor = obj.textColor.trim();
  if (typeof obj.mutedColor === "string" && obj.mutedColor.trim()) out.mutedColor = obj.mutedColor.trim();
  if (typeof obj.borderColor === "string" && obj.borderColor.trim()) out.borderColor = obj.borderColor.trim();
  if (typeof obj.buttonRadius === "string" && obj.buttonRadius.trim()) {
    out.buttonRadius = obj.buttonRadius.trim();
  }
  return out;
}

export function mergeSeoWithDesignTokens(
  seoRaw: unknown,
  tokens: StoreDesignTokens | null | undefined
): Record<string, unknown> {
  const base =
    seoRaw && typeof seoRaw === "object" && !Array.isArray(seoRaw)
      ? { ...(seoRaw as Record<string, unknown>) }
      : {};

  if (tokens == null) {
    delete base.design;
    return base;
  }

  const cleaned: StoreDesignTokens = {};
  if (tokens.textColor) cleaned.textColor = tokens.textColor;
  if (tokens.mutedColor) cleaned.mutedColor = tokens.mutedColor;
  if (tokens.borderColor) cleaned.borderColor = tokens.borderColor;
  if (tokens.buttonRadius) cleaned.buttonRadius = tokens.buttonRadius;

  if (Object.keys(cleaned).length === 0) {
    delete base.design;
  } else {
    base.design = cleaned;
  }
  return base;
}

export function resolveDesignTokens(
  themeId: string | undefined,
  tokens?: StoreDesignTokens | null
): Required<StoreDesignTokens> {
  const base = themeId === "bold" ? BOLD_DESIGN_TOKENS : DEFAULT_DESIGN_TOKENS;
  return {
    textColor: tokens?.textColor || base.textColor,
    mutedColor: tokens?.mutedColor || base.mutedColor,
    borderColor: tokens?.borderColor || base.borderColor,
    buttonRadius: tokens?.buttonRadius || base.buttonRadius,
  };
}

export function designTokensToCssVars(
  tokens: Required<StoreDesignTokens>
): Record<string, string> {
  return {
    "--store-text": tokens.textColor,
    "--store-muted": tokens.mutedColor,
    "--store-border": tokens.borderColor,
    "--store-radius": tokens.buttonRadius,
  };
}
