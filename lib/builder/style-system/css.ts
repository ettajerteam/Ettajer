import type { CSSProperties } from "react";
import type { ElementStyleValues } from "./types";
import { diffStyleOverrides, getStyleForDevice, normalizeSectionStyleSettings } from "./helpers";
import { BREAKPOINT_MOBILE_MAX, BREAKPOINT_TABLET_MAX } from "./constants";

function textAlignValue(values: ElementStyleValues): string | undefined {
  return values.textAlign ?? values.alignment;
}

/** Converts element style model to React inline CSS properties. */
export function elementStyleToCss(values: ElementStyleValues): CSSProperties {
  const css: CSSProperties = {};

  if (values.visible === false) css.display = "none";
  if (values.fontFamily) css.fontFamily = values.fontFamily;
  if (values.fontSize) css.fontSize = values.fontSize;
  if (values.fontWeight) css.fontWeight = values.fontWeight;
  if (values.lineHeight) css.lineHeight = values.lineHeight;
  if (values.letterSpacing) css.letterSpacing = values.letterSpacing;
  if (values.textColor) css.color = values.textColor;

  const align = textAlignValue(values);
  if (align) css.textAlign = align as CSSProperties["textAlign"];

  if (values.padding) css.padding = values.padding;
  if (values.margin) css.margin = values.margin;
  if (values.paddingTop) css.paddingTop = values.paddingTop;
  if (values.paddingRight) css.paddingRight = values.paddingRight;
  if (values.paddingBottom) css.paddingBottom = values.paddingBottom;
  if (values.paddingLeft) css.paddingLeft = values.paddingLeft;
  if (values.marginTop) css.marginTop = values.marginTop;
  if (values.marginRight) css.marginRight = values.marginRight;
  if (values.marginBottom) css.marginBottom = values.marginBottom;
  if (values.marginLeft) css.marginLeft = values.marginLeft;

  if (values.backgroundColor) css.backgroundColor = values.backgroundColor;
  if (values.backgroundImage) css.backgroundImage = values.backgroundImage;
  if (values.backgroundSize) css.backgroundSize = values.backgroundSize;
  if (values.backgroundPosition) css.backgroundPosition = values.backgroundPosition;
  if (values.backgroundRepeat) css.backgroundRepeat = values.backgroundRepeat;

  if (values.borderWidth) css.borderWidth = values.borderWidth;
  if (values.borderStyle) css.borderStyle = values.borderStyle;
  if (values.borderColor) css.borderColor = values.borderColor;
  if (values.borderTopWidth) css.borderTopWidth = values.borderTopWidth;
  if (values.borderRightWidth) css.borderRightWidth = values.borderRightWidth;
  if (values.borderBottomWidth) css.borderBottomWidth = values.borderBottomWidth;
  if (values.borderLeftWidth) css.borderLeftWidth = values.borderLeftWidth;
  if (values.borderRadius) css.borderRadius = values.borderRadius;

  if (values.width) css.width = values.width;
  if (values.height) css.height = values.height;
  if (values.minWidth) css.minWidth = values.minWidth;
  if (values.maxWidth) css.maxWidth = values.maxWidth;
  if (values.minHeight) css.minHeight = values.minHeight;
  if (values.maxHeight) css.maxHeight = values.maxHeight;

  if (values.display && values.visible !== false) css.display = values.display;
  if (values.flexDirection) css.flexDirection = values.flexDirection as CSSProperties["flexDirection"];
  if (values.flexWrap) css.flexWrap = values.flexWrap as CSSProperties["flexWrap"];
  if (values.gap) css.gap = values.gap;
  if (values.alignItems) css.alignItems = values.alignItems as CSSProperties["alignItems"];
  if (values.justifyContent) {
    css.justifyContent = values.justifyContent as CSSProperties["justifyContent"];
  }
  if (values.alignSelf) css.alignSelf = values.alignSelf as CSSProperties["alignSelf"];

  if (values.boxShadow) css.boxShadow = values.boxShadow;
  if (values.opacity != null && Number.isFinite(values.opacity)) css.opacity = values.opacity;

  return css;
}

function cssRuleDeclarations(values: ElementStyleValues): string[] {
  const rules: string[] = [];
  if (values.visible === false) rules.push("display: none !important");
  if (values.fontFamily) rules.push(`font-family: ${values.fontFamily}`);
  if (values.fontSize) rules.push(`font-size: ${values.fontSize}`);
  if (values.fontWeight) rules.push(`font-weight: ${values.fontWeight}`);
  if (values.lineHeight) rules.push(`line-height: ${values.lineHeight}`);
  if (values.letterSpacing) rules.push(`letter-spacing: ${values.letterSpacing}`);
  if (values.textColor) rules.push(`color: ${values.textColor}`);
  const align = textAlignValue(values);
  if (align) rules.push(`text-align: ${align}`);
  if (values.padding) rules.push(`padding: ${values.padding}`);
  if (values.margin) rules.push(`margin: ${values.margin}`);
  if (values.backgroundColor) rules.push(`background-color: ${values.backgroundColor}`);
  if (values.backgroundImage) rules.push(`background-image: ${values.backgroundImage}`);
  if (values.borderWidth) rules.push(`border-width: ${values.borderWidth}`);
  if (values.borderStyle) rules.push(`border-style: ${values.borderStyle}`);
  if (values.borderColor) rules.push(`border-color: ${values.borderColor}`);
  if (values.borderRadius) rules.push(`border-radius: ${values.borderRadius}`);
  if (values.width) rules.push(`width: ${values.width}`);
  if (values.height) rules.push(`height: ${values.height}`);
  if (values.minHeight) rules.push(`min-height: ${values.minHeight}`);
  if (values.maxWidth) rules.push(`max-width: ${values.maxWidth}`);
  if (values.boxShadow) rules.push(`box-shadow: ${values.boxShadow}`);
  if (values.opacity != null && Number.isFinite(values.opacity)) {
    rules.push(`opacity: ${values.opacity}`);
  }
  if (values.display && values.visible !== false) rules.push(`display: ${values.display}`);
  if (values.gap) rules.push(`gap: ${values.gap}`);
  if (values.columns) {
    rules.push(
      `--ettajer-grid-columns: ${values.columns}`,
      `grid-template-columns: repeat(${values.columns}, minmax(0, 1fr))`
    );
  }
  return rules;
}

function cssBlock(values: ElementStyleValues, selector: string): string {
  const rules = cssRuleDeclarations(values);
  if (rules.length === 0) return "";
  return `${selector} { ${rules.join("; ")}; }`;
}

/** Builds scoped CSS with media queries for storefront rendering. */
export function buildElementStyleCss(
  sectionId: string,
  settings: Record<string, unknown>
): string {
  const normalized = normalizeSectionStyleSettings(settings);
  const styles = normalized.styles ?? {};
  const selector = `#section-${sectionId}`;
  const gridSelector = `#section-${sectionId} .ettajer-responsive-grid`;

  const desktop = getStyleForDevice(normalized, "desktop");
  const parts: string[] = [];

  const desktopCss = cssBlock(desktop, selector);
  if (desktopCss) parts.push(desktopCss);

  if (desktop.columns) {
    const gridCss = cssBlock({ columns: desktop.columns }, gridSelector);
    if (gridCss) parts.push(gridCss);
  }

  const tabletOverrides = diffStyleOverrides(desktop, styles.tablet);
  if (tabletOverrides) {
    const tabletCss = cssBlock(tabletOverrides, selector);
    if (tabletCss) {
      parts.push(`@media (max-width: ${BREAKPOINT_TABLET_MAX}px) { ${tabletCss} }`);
    }
    if (tabletOverrides.columns) {
      const gridCss = cssBlock({ columns: tabletOverrides.columns }, gridSelector);
      if (gridCss) {
        parts.push(`@media (max-width: ${BREAKPOINT_TABLET_MAX}px) { ${gridCss} }`);
      }
    }
  }

  const tabletMerged = styles.tablet ? { ...desktop, ...styles.tablet } : desktop;
  const mobileOverrides = diffStyleOverrides(tabletMerged, styles.mobile);
  if (mobileOverrides) {
    const mobileCss = cssBlock(mobileOverrides, selector);
    if (mobileCss) {
      parts.push(`@media (max-width: ${BREAKPOINT_MOBILE_MAX}px) { ${mobileCss} }`);
    }
    if (mobileOverrides.columns) {
      const gridCss = cssBlock({ columns: mobileOverrides.columns }, gridSelector);
      if (gridCss) {
        parts.push(`@media (max-width: ${BREAKPOINT_MOBILE_MAX}px) { ${gridCss} }`);
      }
    }
  }

  return parts.join("\n");
}

/** Alias for inline preview usage. */
export function styleObjectToCss(
  settings: Record<string, unknown>,
  device?: import("../types").DeviceMode
): CSSProperties {
  const values = device ? getStyleForDevice(settings, device) : getStyleForDevice(settings, "desktop");
  return elementStyleToCss(values);
}
