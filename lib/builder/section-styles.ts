import type { CSSProperties } from "react";
import type { SectionVisualSettings } from "./inspector-config";
import type { DeviceMode } from "./types";
import {
  getStyleForDevice,
  styleObjectToCss,
} from "./style-system";
import {
  normalizeSectionSettings,
  sectionVisibilityClassName,
} from "./responsive-styles";

export {
  sectionVisibilityClassName,
  normalizeSectionSettings,
  getDeviceStyles,
  isSectionVisibleOnDevice,
  shouldMountSectionForDevice,
} from "./responsive-styles";

export function parseSectionVisualSettings(
  settings: Record<string, unknown>
): SectionVisualSettings {
  const desktop = getStyleForDevice(settings, "desktop");

  return {
    fontSize: desktop.fontSize,
    fontWeight: desktop.fontWeight ?? (typeof settings.fontWeight === "string" ? settings.fontWeight : undefined),
    textColor: desktop.textColor ?? (typeof settings.textColor === "string" ? settings.textColor : undefined),
    backgroundColor:
      desktop.backgroundColor ??
      (typeof settings.backgroundColor === "string" ? settings.backgroundColor : undefined),
    padding: desktop.padding,
    margin: desktop.margin,
    width: desktop.width ?? (typeof settings.width === "string" ? settings.width : undefined),
    height: desktop.height ?? (typeof settings.height === "string" ? settings.height : undefined),
    minHeight: desktop.minHeight ?? (typeof settings.minHeight === "string" ? settings.minHeight : undefined),
    borderRadius:
      desktop.borderRadius ??
      (typeof settings.borderRadius === "string" ? settings.borderRadius : undefined),
    boxShadow: desktop.boxShadow ?? (typeof settings.boxShadow === "string" ? settings.boxShadow : undefined),
    alignment: (() => {
      const align = desktop.alignment ?? desktop.textAlign;
      if (align === "left" || align === "center" || align === "right") return align;
      if (
        settings.alignment === "left" ||
        settings.alignment === "center" ||
        settings.alignment === "right"
      ) {
        return settings.alignment;
      }
      return undefined;
    })(),
    imageUrl: typeof settings.imageUrl === "string" ? settings.imageUrl : undefined,
    ctaLink: typeof settings.ctaLink === "string" ? settings.ctaLink : undefined,
    animation:
      desktop.animation === "fade" ||
      desktop.animation === "slide-up" ||
      desktop.animation === "slide-down" ||
      desktop.animation === "none" ||
      settings.animation === "fade" ||
      settings.animation === "slide-up" ||
      settings.animation === "slide-down" ||
      settings.animation === "none"
        ? ((desktop.animation ?? settings.animation) as SectionVisualSettings["animation"])
        : undefined,
    animationDelayMs:
      desktop.animationDelayMs ??
      (typeof settings.animationDelayMs === "number" ? settings.animationDelayMs : undefined),
    customClass: typeof settings.customClass === "string" ? settings.customClass : undefined,
    hideOnMobile: settings.hideOnMobile === true,
    hideOnDesktop: settings.hideOnDesktop === true,
  };
}

export function sectionWrapperStyle(
  settings: Record<string, unknown>,
  device?: DeviceMode
): CSSProperties {
  const v = parseSectionVisualSettings(settings);
  const style = device
    ? styleObjectToCss(settings, device)
    : styleObjectToCss(settings, "desktop");

  if (v.fontWeight && !style.fontWeight) style.fontWeight = v.fontWeight;
  if (v.backgroundColor && !style.backgroundColor) style.backgroundColor = v.backgroundColor;
  if (v.width && !style.width) style.width = v.width;
  if (v.height && !style.height) style.height = v.height;
  if (v.minHeight && !style.minHeight) style.minHeight = v.minHeight;
  if (v.borderRadius && !style.borderRadius) style.borderRadius = v.borderRadius;
  if (v.boxShadow && !style.boxShadow) style.boxShadow = v.boxShadow;
  if (v.textColor && !style.color) style.color = v.textColor;

  return style;
}

export function sectionWrapperClassName(settings: Record<string, unknown>): string {
  const v = parseSectionVisualSettings(settings);
  const classes: string[] = [];

  if (v.customClass) classes.push(v.customClass);
  classes.push(sectionVisibilityClassName(settings));
  if (v.animation && v.animation !== "none") {
    classes.push(`ettajer-animate-${v.animation}`);
  }

  return classes.filter(Boolean).join(" ");
}
