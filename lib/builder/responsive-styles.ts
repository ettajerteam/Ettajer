import type { CSSProperties } from "react";
import type { DeviceMode, DeviceStyleValues, SectionVisualStyles } from "./types";
import {
  buildElementStyleCss,
  diffStyleOverrides,
  elementStyleToCss,
  getStyleForDevice,
  normalizeSectionStyleSettings,
  patchElementStyle,
  type ElementStyleValues,
} from "./style-system";

export { BREAKPOINT_TABLET_MAX, BREAKPOINT_MOBILE_MAX, DEVICE_LABELS, COLUMN_OPTIONS } from "./style-system/constants";

export {
  getResolvedStyles,
  getStyleOverride,
  setStyleOverride,
  clearStyleOverride,
  hasOverride,
} from "./style-system";

function isDeviceMode(value: unknown): value is DeviceMode {
  return value === "desktop" || value === "tablet" || value === "mobile";
}

/** Ensures styles object exists; migrates flat legacy fields into styles.desktop. */
export function normalizeSectionSettings(
  settings: Record<string, unknown>
): Record<string, unknown> & { styles: SectionVisualStyles } {
  const normalized = normalizeSectionStyleSettings(settings);
  return {
    ...normalized,
    styles: (normalized.styles ?? {}) as SectionVisualStyles,
  };
}

export function getSectionVisualStyles(settings: Record<string, unknown>): SectionVisualStyles {
  return normalizeSectionSettings(settings).styles;
}

/** Merged effective values: desktop base + device overrides. */
export function getDeviceStyles(
  settings: Record<string, unknown>,
  device: DeviceMode
): DeviceStyleValues {
  return getStyleForDevice(settings, device) as DeviceStyleValues;
}

/** Alias for getResolvedStyles / getStyleForDevice — desktop base + cascade overrides. */
export const resolveStylesForDevice = getDeviceStyles;

export function isSectionVisibleOnDevice(
  settings: Record<string, unknown>,
  device: DeviceMode
): boolean {
  const deviceStyles = getDeviceStyles(settings, device);
  return deviceStyles.visible !== false;
}

export function updateDeviceStyle(
  settings: Record<string, unknown>,
  device: DeviceMode,
  patch: Partial<DeviceStyleValues>
): Record<string, unknown> {
  return patchElementStyle(settings, device, patch as Partial<ElementStyleValues>);
}

export function deviceStyleToCss(values: DeviceStyleValues): CSSProperties {
  return elementStyleToCss(values as ElementStyleValues);
}

/** Generates scoped CSS with media queries for storefront rendering. */
export function buildResponsiveCss(sectionId: string, settings: Record<string, unknown>): string {
  return buildElementStyleCss(sectionId, settings);
}

/** Fallback Tailwind classes for legacy hideOnMobile/hideOnDesktop. */
export function sectionVisibilityClassName(settings: Record<string, unknown>): string {
  const classes: string[] = [];
  const normalized = normalizeSectionSettings(settings);
  const styles = normalized.styles;

  const desktopHidden =
    styles.desktop?.visible === false || settings.hideOnDesktop === true;
  const mobileHidden =
    styles.mobile?.visible === false || settings.hideOnMobile === true;
  const tabletHidden = styles.tablet?.visible === false;

  if (settings.hideOnDesktop === true) {
    classes.push("md:hidden");
  } else if (desktopHidden) {
    classes.push("lg:hidden");
  }

  if (settings.hideOnMobile === true || mobileHidden) {
    classes.push("max-md:hidden");
  }

  if (tabletHidden) {
    classes.push("md:hidden", "lg:block");
  }

  return classes.filter(Boolean).join(" ");
}

export function parsePreviewDevice(value: unknown): DeviceMode | undefined {
  return isDeviceMode(value) ? value : undefined;
}

export { diffStyleOverrides };
