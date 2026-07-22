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

/**
 * When `previewDevice` is set (editor iframe / ?device=), hide sections in JS
 * so the forced viewport matches. On the live storefront, always render and let
 * ResponsiveSectionStyles media queries handle per-device hide/show.
 */
export function shouldMountSectionForDevice(
  settings: Record<string, unknown>,
  previewDevice: DeviceMode | undefined
): boolean {
  if (!previewDevice) return true;
  return isSectionVisibleOnDevice(settings, previewDevice);
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

/** Fallback Tailwind classes for legacy hideOnMobile/hideOnDesktop only.
 * Per-device `styles.*.visible` is handled by ResponsiveSectionStyles media CSS
 * so we do not double-apply conflicting utility classes. */
export function sectionVisibilityClassName(settings: Record<string, unknown>): string {
  const classes: string[] = [];

  if (settings.hideOnDesktop === true) {
    classes.push("md:hidden");
  }

  if (settings.hideOnMobile === true) {
    classes.push("max-md:hidden");
  }

  return classes.filter(Boolean).join(" ");
}

export function parsePreviewDevice(value: unknown): DeviceMode | undefined {
  return isDeviceMode(value) ? value : undefined;
}

export { diffStyleOverrides };
