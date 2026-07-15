import type { DeviceMode } from "../types";

/** Canonical typography properties */
export interface TypographyStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textColor?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  /** @deprecated Use textAlign — kept for legacy storage */
  alignment?: "left" | "center" | "right";
}

/** Padding / margin shorthand or per-side values */
export interface SpacingStyle {
  padding?: string;
  margin?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
}

export interface BackgroundStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
}

export interface BorderStyle {
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  borderTopWidth?: string;
  borderRightWidth?: string;
  borderBottomWidth?: string;
  borderLeftWidth?: string;
}

export interface RadiusStyle {
  borderRadius?: string;
}

export interface SizeStyle {
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
}

export interface AlignmentStyle {
  alignItems?: string;
  justifyContent?: string;
  alignSelf?: string;
}

export interface DisplayStyle {
  display?: string;
  flexDirection?: string;
  flexWrap?: string;
  gap?: string;
}

export interface ShadowStyle {
  boxShadow?: string;
}

export interface OpacityStyle {
  opacity?: number;
}

export interface AnimationStyle {
  animation?: "none" | "fade" | "slide-up" | "slide-down" | string;
  animationDurationMs?: number;
  animationDelayMs?: number;
  animationEasing?: string;
}

export interface VisibilityStyle {
  visible?: boolean;
}

export interface LayoutStyle {
  columns?: number;
}

/** Full element style model — stored per device in settings.styles */
export type ElementStyleValues = TypographyStyle &
  SpacingStyle &
  BackgroundStyle &
  BorderStyle &
  RadiusStyle &
  SizeStyle &
  AlignmentStyle &
  DisplayStyle &
  ShadowStyle &
  OpacityStyle &
  AnimationStyle &
  VisibilityStyle &
  LayoutStyle;

export interface ResponsiveElementStyles {
  desktop?: ElementStyleValues;
  tablet?: ElementStyleValues;
  mobile?: ElementStyleValues;
}

/** Style groups blocks can opt into */
export type StyleGroupId =
  | "typography"
  | "spacing"
  | "padding"
  | "margin"
  | "background"
  | "borders"
  | "radius"
  | "size"
  | "alignment"
  | "display"
  | "shadow"
  | "opacity"
  | "animation"
  | "visibility"
  | "layout";

export interface StyleGroupConfig {
  id: StyleGroupId;
  label: string;
  /** Keys written to responsive styles.styles[device] when true */
  responsive?: boolean;
}

export const STYLE_GROUP_KEYS: Record<StyleGroupId, (keyof ElementStyleValues)[]> = {
  typography: [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "lineHeight",
    "letterSpacing",
    "textColor",
    "textAlign",
    "alignment",
  ],
  spacing: ["padding", "margin", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft"],
  padding: ["padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
  margin: ["margin", "marginTop", "marginRight", "marginBottom", "marginLeft"],
  background: ["backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition", "backgroundRepeat"],
  borders: ["borderWidth", "borderStyle", "borderColor", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
  radius: ["borderRadius"],
  size: ["width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight"],
  alignment: ["alignItems", "justifyContent", "alignSelf", "textAlign", "alignment"],
  display: ["display", "flexDirection", "flexWrap", "gap"],
  shadow: ["boxShadow"],
  opacity: ["opacity"],
  animation: ["animation", "animationDurationMs", "animationDelayMs", "animationEasing"],
  visibility: ["visible"],
  layout: ["columns"],
};

/** Keys stored at settings root (non-responsive legacy) */
export const FLAT_STYLE_KEYS: (keyof ElementStyleValues)[] = [
  "fontFamily",
  "fontWeight",
  "textColor",
  "backgroundColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "borderWidth",
  "borderStyle",
  "borderColor",
  "borderRadius",
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "boxShadow",
  "opacity",
  "animation",
  "animationDurationMs",
  "animationDelayMs",
  "animationEasing",
  "display",
  "flexDirection",
  "flexWrap",
  "gap",
  "alignItems",
  "justifyContent",
  "alignSelf",
  "lineHeight",
  "letterSpacing",
];

/** Keys that support per-device overrides in settings.styles (desktop = base, tablet/mobile = overrides only). */
export const RESPONSIVE_STYLE_KEYS: (keyof ElementStyleValues)[] = Array.from(
  new Set([
    ...Object.values(STYLE_GROUP_KEYS).flat(),
    ...FLAT_STYLE_KEYS,
    "visible",
    "columns",
    "textAlign",
    "alignment",
  ])
) as (keyof ElementStyleValues)[];

export type { DeviceMode };
