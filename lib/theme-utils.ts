import { THEME_TEMPLATES, type ThemeId } from "@/lib/themes";
import type { StoreThemeData } from "@/types/theme";
import type { StoreThemeSettings } from "@/types/storefront";

export function resolveThemeDraft(
  saved: StoreThemeData,
  draft: StoreThemeSettings,
  selectedTemplate: ThemeId
): StoreThemeSettings {
  const template = THEME_TEMPLATES.find((t) => t.id === selectedTemplate);
  return {
    theme: selectedTemplate,
    primaryColor: draft.primaryColor ?? template?.defaultPrimary ?? saved.primaryColor,
    secondaryColor: draft.secondaryColor ?? template?.defaultSecondary ?? saved.secondaryColor,
    font: draft.font ?? template?.defaultFont ?? saved.font,
    logo: draft.logo !== undefined ? draft.logo : saved.logo,
    textColor: draft.textColor ?? saved.textColor,
    mutedColor: draft.mutedColor ?? saved.mutedColor,
    borderColor: draft.borderColor ?? saved.borderColor,
    buttonRadius: draft.buttonRadius ?? saved.buttonRadius,
  };
}

export function isThemeDirty(saved: StoreThemeData, draft: StoreThemeSettings, selectedTemplate: ThemeId): boolean {
  const resolved = resolveThemeDraft(saved, draft, selectedTemplate);
  return (
    saved.theme !== resolved.theme ||
    saved.primaryColor !== resolved.primaryColor ||
    saved.secondaryColor !== resolved.secondaryColor ||
    saved.font !== resolved.font ||
    saved.logo !== resolved.logo ||
    (saved.textColor ?? undefined) !== (resolved.textColor ?? undefined) ||
    (saved.mutedColor ?? undefined) !== (resolved.mutedColor ?? undefined) ||
    (saved.borderColor ?? undefined) !== (resolved.borderColor ?? undefined) ||
    (saved.buttonRadius ?? undefined) !== (resolved.buttonRadius ?? undefined)
  );
}

export function getTemplateDefaults(themeId: ThemeId) {
  const template = THEME_TEMPLATES.find((t) => t.id === themeId)!;
  return {
    theme: themeId,
    primaryColor: template.defaultPrimary,
    secondaryColor: template.defaultSecondary,
    font: template.defaultFont,
  };
}

export function getBrandProgress(settings: StoreThemeSettings): number {
  let score = 0;
  if (settings.logo) score += 34;
  if (settings.primaryColor && settings.secondaryColor) score += 33;
  if (settings.font) score += 33;
  return Math.min(score, 100);
}
