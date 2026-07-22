import type { InspectorElementFocus } from "./inspector-config";

/** Props for clickable/editable canvas nodes in builder mode. */
export function builderFocusAttrs(
  sectionId: string | undefined,
  focus: InspectorElementFocus,
  settingKey?: string
): Record<string, string> | undefined {
  if (!sectionId) return undefined;
  const attrs: Record<string, string> = {
    "data-builder-focus": focus === "section" ? sectionId : `${sectionId}:${focus}`,
  };
  if (settingKey) attrs["data-builder-setting"] = settingKey;
  return attrs;
}

export function inferFocusFromTarget(target: HTMLElement): InspectorElementFocus {
  if (target.closest("img, picture, [data-builder-focus$=':image']")) return "image";
  if (target.closest("a, button, [data-builder-focus$=':button']")) return "button";
  if (target.closest("h1, h2, h3, h4, p, [data-builder-focus$=':text']")) return "text";
  return "section";
}

export function inferInlineSettingKey(
  sectionType: string | null,
  focus: InspectorElementFocus
): string | null {
  if (focus === "text") {
    if (sectionType === "hero") return "headline";
    if (sectionType === "rich-text") return "content";
    if (sectionType === "cta") return "headline";
    if (sectionType === "newsletter") return "headline";
    return "title";
  }
  if (focus === "button") {
    if (sectionType === "hero" || sectionType === "cta") return "ctaText";
    return "buttonText";
  }
  return null;
}
