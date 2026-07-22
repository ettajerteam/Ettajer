import { STORE_FONTS } from "@/lib/themes";

export const BREAKPOINT_TABLET_MAX = 1023;
export const BREAKPOINT_MOBILE_MAX = 767;

export const DEVICE_LABELS = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
} as const;

/** Section typography fonts aligned with store brand fonts. */
export const FONT_FAMILY_OPTIONS = [
  { value: "", label: "Store default" },
  { value: "inherit", label: "Inherit" },
  ...STORE_FONTS.map((f) => ({
    value: f.value,
    label: f.label,
  })),
];

/** Merchant-friendly type scale (includes heading sizes). */
export const FONT_SIZE_OPTIONS = [
  { value: "", label: "Default" },
  { value: "0.75rem", label: "XS · caption" },
  { value: "0.875rem", label: "Small · body" },
  { value: "1rem", label: "Base · body" },
  { value: "1.125rem", label: "LG · lead" },
  { value: "1.25rem", label: "XL · H4" },
  { value: "1.5rem", label: "2XL · H3" },
  { value: "1.875rem", label: "3XL · H2" },
  { value: "2.25rem", label: "4XL · H1" },
  { value: "3rem", label: "5XL · display" },
];

/** One-tap heading / body presets for the typography editor. */
export const TYPOGRAPHY_SCALE_PRESETS = [
  { id: "body", label: "Body", fontSize: "1rem", fontWeight: "400", lineHeight: "1.5" },
  { id: "lead", label: "Lead", fontSize: "1.125rem", fontWeight: "400", lineHeight: "1.5" },
  { id: "h4", label: "H4", fontSize: "1.25rem", fontWeight: "600", lineHeight: "1.25" },
  { id: "h3", label: "H3", fontSize: "1.5rem", fontWeight: "600", lineHeight: "1.25" },
  { id: "h2", label: "H2", fontSize: "1.875rem", fontWeight: "700", lineHeight: "1.25" },
  { id: "h1", label: "H1", fontSize: "2.25rem", fontWeight: "700", lineHeight: "1.2" },
  { id: "display", label: "Display", fontSize: "3rem", fontWeight: "700", lineHeight: "1.1" },
] as const;

export const FONT_WEIGHT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

export const LINE_HEIGHT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "1", label: "Tight" },
  { value: "1.25", label: "Snug" },
  { value: "1.5", label: "Normal" },
  { value: "1.75", label: "Relaxed" },
  { value: "2", label: "Loose" },
];

export const BORDER_STYLE_OPTIONS = [
  { value: "", label: "Default" },
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

export const DISPLAY_OPTIONS = [
  { value: "", label: "Default" },
  { value: "block", label: "Block" },
  { value: "flex", label: "Flex" },
  { value: "grid", label: "Grid" },
  { value: "inline-block", label: "Inline block" },
  { value: "none", label: "None" },
];

export const FLEX_DIRECTION_OPTIONS = [
  { value: "", label: "Default" },
  { value: "row", label: "Row" },
  { value: "column", label: "Column" },
  { value: "row-reverse", label: "Row reverse" },
  { value: "column-reverse", label: "Column reverse" },
];

export const ALIGN_ITEMS_OPTIONS = [
  { value: "", label: "Default" },
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "stretch", label: "Stretch" },
];

export const JUSTIFY_CONTENT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "space-between", label: "Space between" },
  { value: "space-around", label: "Space around" },
];

export const SHADOW_OPTIONS = [
  { value: "", label: "None" },
  { value: "0 1px 3px rgba(0,0,0,0.08)", label: "Soft" },
  { value: "0 8px 24px rgba(0,0,0,0.12)", label: "Medium" },
  { value: "0 16px 40px rgba(0,0,0,0.18)", label: "Strong" },
];

export const ANIMATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade in" },
  { value: "slide-up", label: "Slide up" },
  { value: "slide-down", label: "Slide down" },
];

export const EASING_OPTIONS = [
  { value: "", label: "Default" },
  { value: "ease", label: "Ease" },
  { value: "ease-in", label: "Ease in" },
  { value: "ease-out", label: "Ease out" },
  { value: "ease-in-out", label: "Ease in-out" },
  { value: "linear", label: "Linear" },
];

export const SPACING_PRESETS = [
  { value: "", label: "Custom" },
  { value: "0", label: "None" },
  { value: "0.5rem", label: "XS" },
  { value: "1rem", label: "SM" },
  { value: "1.5rem", label: "MD" },
  { value: "2rem", label: "LG" },
  { value: "3rem", label: "XL" },
  { value: "1rem 1.5rem", label: "SM horizontal" },
  { value: "2rem 1.5rem", label: "MD horizontal" },
  { value: "3rem 1.5rem", label: "LG horizontal" },
];

export const COLUMN_OPTIONS = [
  { value: "", label: "Default" },
  { value: "1", label: "1 column" },
  { value: "2", label: "2 columns" },
  { value: "3", label: "3 columns" },
  { value: "4", label: "4 columns" },
];
