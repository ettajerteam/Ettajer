import type { DeviceMode } from "../types";
import type { ElementStyleValues, ResponsiveElementStyles } from "./types";
import { FLAT_STYLE_KEYS, RESPONSIVE_STYLE_KEYS } from "./types";

const LEGACY_ALIGNMENT_KEYS = ["alignment"] as const;

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

function normalizeTextAlign(values: ElementStyleValues): ElementStyleValues {
  const next = { ...values };
  if (next.textAlign == null && next.alignment != null) {
    next.textAlign = next.alignment;
  }
  if (next.alignment == null && next.textAlign != null && next.textAlign !== "justify") {
    next.alignment = next.textAlign;
  }
  return next;
}

function parseElementStyleValues(raw: unknown): ElementStyleValues | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const result: ElementStyleValues = {};

  for (const key of [...RESPONSIVE_STYLE_KEYS, ...FLAT_STYLE_KEYS]) {
    const value = obj[key];
    if (isEmptyValue(value)) continue;
    if (key === "visible" && value === false) {
      result.visible = false;
    } else if (key === "columns" && typeof value === "number" && Number.isFinite(value)) {
      result.columns = Math.min(4, Math.max(1, Math.round(value)));
    } else if (key === "opacity" && typeof value === "number" && Number.isFinite(value)) {
      result.opacity = value;
    } else if (
      key === "animationDurationMs" ||
      key === "animationDelayMs"
    ) {
      if (typeof value === "number" && Number.isFinite(value)) {
        (result as Record<string, unknown>)[key] = value;
      }
    } else if (typeof value === "string" && value) {
      (result as Record<string, unknown>)[key] = value;
    } else if (typeof value === "boolean" && key === "visible") {
      result.visible = value;
    }
  }

  return Object.keys(result).length > 0 ? normalizeTextAlign(result) : undefined;
}

function extractFlatStyles(settings: Record<string, unknown>): ElementStyleValues {
  return parseElementStyleValues(settings) ?? {};
}

function legacyVisibility(settings: Record<string, unknown>): ResponsiveElementStyles {
  const styles: ResponsiveElementStyles = {};
  if (settings.hideOnDesktop === true) {
    styles.desktop = { visible: false };
  }
  if (settings.hideOnMobile === true) {
    styles.mobile = { visible: false };
  }
  return styles;
}

function parseResponsiveStyles(raw: unknown): ResponsiveElementStyles | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as Record<string, unknown>;
  const desktop = parseElementStyleValues(obj.desktop);
  const tablet = parseElementStyleValues(obj.tablet);
  const mobile = parseElementStyleValues(obj.mobile);
  if (!desktop && !tablet && !mobile) return undefined;
  return { desktop, tablet, mobile };
}

function cleanStyleValues(values: ElementStyleValues | undefined): ElementStyleValues | undefined {
  if (!values) return undefined;
  const cleaned: ElementStyleValues = {};
  for (const [key, value] of Object.entries(values)) {
    if (isEmptyValue(value)) continue;
    (cleaned as Record<string, unknown>)[key] = value;
  }
  return Object.keys(cleaned).length > 0 ? normalizeTextAlign(cleaned) : undefined;
}

export function mergeStyles(
  base: ElementStyleValues | undefined,
  patch: ElementStyleValues | undefined
): ElementStyleValues {
  return normalizeTextAlign({ ...(base ?? {}), ...(patch ?? {}) });
}

/** Ensures styles object exists; migrates flat legacy fields into styles.desktop. */
export function normalizeSectionStyleSettings(
  settings: Record<string, unknown>
): Record<string, unknown> & { styles?: ResponsiveElementStyles } {
  const flat = extractFlatStyles(settings);
  const parsed = parseResponsiveStyles(settings.styles);
  const legacy = legacyVisibility(settings);

  const desktop = mergeStyles(mergeStyles(flat, parsed?.desktop), legacy.desktop);
  const tablet = parsed?.tablet;
  const mobile = mergeStyles(parsed?.mobile, legacy.mobile);

  const styles: ResponsiveElementStyles = {};
  const desktopClean = cleanStyleValues(desktop);
  const tabletClean = cleanStyleValues(tablet);
  const mobileClean = cleanStyleValues(mobile);
  if (desktopClean) styles.desktop = desktopClean;
  if (tabletClean) styles.tablet = tabletClean;
  if (mobileClean) styles.mobile = mobileClean;

  return Object.keys(styles).length > 0 ? { ...settings, styles } : { ...settings };
}

export function getResponsiveStyles(settings: Record<string, unknown>): ResponsiveElementStyles {
  return normalizeSectionStyleSettings(settings).styles ?? {};
}

/** Merged effective values: desktop base + cascading device overrides. */
export function getStyleForDevice(
  settings: Record<string, unknown>,
  device: DeviceMode
): ElementStyleValues {
  const normalized = normalizeSectionStyleSettings(settings);
  const styles = normalized.styles ?? {};
  const flat = extractFlatStyles(settings);
  const desktopBase = mergeStyles(flat, styles.desktop);

  if (device === "desktop") {
    return { ...desktopBase };
  }

  if (device === "tablet") {
    return mergeStyles(desktopBase, styles.tablet);
  }

  const tabletMerged = mergeStyles(desktopBase, styles.tablet);
  return mergeStyles(tabletMerged, styles.mobile);
}

/** Alias — merged effective values for a device (desktop base + cascade). */
export const getResolvedStyles = getStyleForDevice;

/** Styles inherited before applying the active device's override layer. */
export function getInheritedStyles(
  settings: Record<string, unknown>,
  device: DeviceMode
): ElementStyleValues {
  const normalized = normalizeSectionStyleSettings(settings);
  const styles = normalized.styles ?? {};
  const flat = extractFlatStyles(settings);
  const desktopBase = mergeStyles(flat, styles.desktop);

  if (device === "desktop") {
    return { ...desktopBase };
  }
  if (device === "tablet") {
    return { ...desktopBase };
  }
  return mergeStyles(desktopBase, styles.tablet);
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (isEmptyValue(a) && isEmptyValue(b)) return true;
  return a === b;
}

function pruneMatchingOverrides(
  settings: Record<string, unknown>,
  device: DeviceMode,
  keys: (keyof ElementStyleValues)[]
): Record<string, unknown> {
  if (device === "desktop") return settings;

  const inherited = getInheritedStyles(settings, device);
  let next = settings;

  for (const key of keys) {
    const override = getStyleOverride(next, device, key);
    if (override === undefined) continue;
    if (valuesEqual(override, inherited[key])) {
      next = clearStyleOverride(next, device, key);
    }
  }

  return next;
}

export function isStyleKeyResponsive(key: keyof ElementStyleValues): boolean {
  return (RESPONSIVE_STYLE_KEYS as string[]).includes(key);
}

/** Raw override stored on the active device layer only (undefined on desktop = base value). */
export function getStyleOverride(
  settings: Record<string, unknown>,
  device: DeviceMode,
  propertyPath: keyof ElementStyleValues
): unknown {
  const styles = getResponsiveStyles(settings);
  if (device === "desktop") {
    return styles.desktop?.[propertyPath];
  }
  return styles[device]?.[propertyPath];
}

export function hasOverride(
  settings: Record<string, unknown>,
  device: DeviceMode,
  propertyPath: keyof ElementStyleValues
): boolean {
  return hasDeviceOverride(settings, device, propertyPath);
}

export function clearStyleOverride(
  settings: Record<string, unknown>,
  device: DeviceMode,
  propertyPath: keyof ElementStyleValues
): Record<string, unknown> {
  return setStyleOverride(settings, device, propertyPath, undefined);
}

export function setStyleOverride(
  settings: Record<string, unknown>,
  device: DeviceMode,
  propertyPath: keyof ElementStyleValues,
  value: unknown
): Record<string, unknown> {
  const patch = { [propertyPath]: value } as Partial<ElementStyleValues>;
  return patchElementStyle(settings, device, patch, { forceResponsive: true });
}

export function patchElementStyle(
  settings: Record<string, unknown>,
  device: DeviceMode,
  patch: Partial<ElementStyleValues>,
  options?: { forceResponsive?: boolean }
): Record<string, unknown> {
  const normalized = normalizeSectionStyleSettings(settings);
  const styles: ResponsiveElementStyles = { ...(normalized.styles ?? {}) };
  const flatPatch: Partial<ElementStyleValues> = {};
  const devicePatch: Partial<ElementStyleValues> = {};
  const responsiveKeys: (keyof ElementStyleValues)[] = [];

  for (const [rawKey, value] of Object.entries(patch)) {
    const key = rawKey as keyof ElementStyleValues;
    const cleared = isEmptyValue(value);
    const useResponsive =
      options?.forceResponsive === true || isStyleKeyResponsive(key) || key === "visible";

    if (useResponsive) {
      responsiveKeys.push(key);
      if (cleared) {
        devicePatch[key] = undefined;
      } else {
        (devicePatch as Record<string, unknown>)[key] = value;
      }
    } else if (cleared) {
      flatPatch[key] = undefined;
    } else {
      (flatPatch as Record<string, unknown>)[key] = value;
    }
  }

  const next: Record<string, unknown> = { ...settings };

  for (const [key, value] of Object.entries(flatPatch)) {
    if (isEmptyValue(value)) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }

  if (Object.keys(devicePatch).length > 0) {
    const current = { ...(styles[device] ?? {}) };
    for (const [key, value] of Object.entries(devicePatch)) {
      if (isEmptyValue(value)) {
        delete (current as Record<string, unknown>)[key];
      } else {
        (current as Record<string, unknown>)[key] = value;
      }
    }
    const cleaned = cleanStyleValues(current);
    const nextStyles: ResponsiveElementStyles = { ...styles };
    if (cleaned) {
      nextStyles[device] = cleaned;
    } else {
      delete nextStyles[device];
    }
    next.styles = Object.keys(nextStyles).some((d) => nextStyles[d as DeviceMode])
      ? nextStyles
      : undefined;
    if (!next.styles) delete next.styles;
  }

  if (responsiveKeys.length > 0) {
    return pruneMatchingOverrides(next, device, responsiveKeys);
  }

  return next;
}

/** Returns only keys that differ from base (for media-query CSS). */
export function diffStyleOverrides(
  base: ElementStyleValues,
  overrides: ElementStyleValues | undefined
): ElementStyleValues | undefined {
  if (!overrides) return undefined;
  const diff: ElementStyleValues = {};

  for (const key of [...RESPONSIVE_STYLE_KEYS, ...FLAT_STYLE_KEYS, ...LEGACY_ALIGNMENT_KEYS]) {
    const k = key as keyof ElementStyleValues;
    const overrideVal = overrides[k];
    if (isEmptyValue(overrideVal)) continue;
    if (overrideVal !== base[k]) {
      (diff as Record<string, unknown>)[k as string] = overrideVal;
    }
  }

  return cleanStyleValues(diff);
}

export function hasDeviceOverride(
  settings: Record<string, unknown>,
  device: DeviceMode,
  key: keyof ElementStyleValues
): boolean {
  if (device === "desktop") return false;
  const styles = getResponsiveStyles(settings);
  const overrides = styles[device];
  if (!overrides) return false;
  return overrides[key] !== undefined;
}

export function readStyleValue(
  settings: Record<string, unknown>,
  device: DeviceMode,
  key: keyof ElementStyleValues,
  responsive?: boolean
): unknown {
  if (responsive && isStyleKeyResponsive(key)) {
    const styles = getResponsiveStyles(settings);
    const override = styles[device]?.[key];
    if (override !== undefined) return override;
    if (device !== "desktop") {
      const desktop = getStyleForDevice(settings, "desktop");
      return desktop[key];
    }
  }
  const merged = getStyleForDevice(settings, device);
  return merged[key] ?? settings[key as string];
}
