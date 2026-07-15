import type { SettingFieldSchema } from "../block-schema";
import type { StyleGroupId } from "../style-system";
import {
  ANIMATION_OPTIONS,
  FONT_SIZE_OPTIONS,
  FONT_WEIGHT_OPTIONS,
} from "../inspector-config";
import { COLUMN_OPTIONS } from "../responsive-styles";

/** Creates a schema field that renders a shared style editor group */
export function styleGroupField(
  group: StyleGroupId,
  focus: SettingFieldSchema["focus"] = "section",
  tab: SettingFieldSchema["tab"] = undefined
): SettingFieldSchema {
  return {
    key: `style-${group}`,
    type: "styleGroup",
    label: group.charAt(0).toUpperCase() + group.slice(1),
    group,
    styleGroup: group,
    focus,
    tab,
  };
}

export const SECTION_LAYOUT_GROUPS: SettingFieldSchema[] = [
  styleGroupField("spacing", ["section", "text"]),
  styleGroupField("alignment", ["text", "section"]),
];

export const SECTION_STYLE_GROUPS: SettingFieldSchema[] = [
  styleGroupField("typography", ["text", "section"]),
  styleGroupField("background", "section"),
  styleGroupField("radius", "section"),
];

export const HERO_LAYOUT_GROUPS: SettingFieldSchema[] = [
  styleGroupField("spacing", ["section", "text", "image", "button"]),
  styleGroupField("alignment", ["text", "section"]),
  styleGroupField("size", ["image", "section"]),
];

export const HERO_STYLE_GROUPS: SettingFieldSchema[] = [
  styleGroupField("typography", ["text", "section", "button"]),
  styleGroupField("background", "section"),
  styleGroupField("radius", ["image", "button", "section"]),
  styleGroupField("shadow", ["image", "section"]),
];

export const TITLE_CONTENT_FIELD: SettingFieldSchema = {
  key: "title",
  type: "text",
  label: "Title",
  group: "text",
  focus: ["text", "section"],
};

export const RICH_TEXT_CONTENT_FIELDS: SettingFieldSchema[] = [
  TITLE_CONTENT_FIELD,
  {
    key: "content",
    type: "textarea",
    label: "Content",
    group: "text",
    focus: ["text", "section"],
    placeholder: "Tell your brand story here.",
  },
];

export const BASIC_ALIGNMENT_STYLE: SettingFieldSchema = {
  key: "alignment",
  type: "alignment",
  label: "Alignment",
  group: "alignment",
  focus: ["text", "section"],
  responsive: true,
  tab: "layout",
};

export const BASIC_SPACING_STYLES: SettingFieldSchema[] = [
  {
    key: "padding",
    type: "spacing",
    label: "Padding",
    group: "spacing",
    focus: ["section", "text", "image", "button"],
    responsive: true,
    placeholder: "3rem 1.5rem",
    tab: "layout",
  },
  {
    key: "margin",
    type: "spacing",
    label: "Margin",
    group: "spacing",
    focus: ["section", "text", "image", "button"],
    responsive: true,
    tab: "layout",
  },
];

export const BASIC_BACKGROUND_STYLE: SettingFieldSchema = {
  key: "backgroundColor",
  type: "color",
  label: "Background",
  group: "background",
  focus: "section",
  responsive: true,
  tab: "style",
};

export const BASIC_TYPOGRAPHY_STYLES: SettingFieldSchema[] = [
  {
    key: "textColor",
    type: "color",
    label: "Text color",
    group: "typography",
    focus: ["text", "section", "button"],
    responsive: true,
    tab: "style",
  },
  {
    key: "fontSize",
    type: "select",
    label: "Font size",
    group: "typography",
    focus: ["text", "section", "button"],
    options: FONT_SIZE_OPTIONS,
    responsive: true,
    tab: "style",
  },
  {
    key: "fontWeight",
    type: "select",
    label: "Font weight",
    group: "typography",
    focus: ["text", "section", "button"],
    options: FONT_WEIGHT_OPTIONS,
    responsive: true,
    tab: "style",
  },
];

export const BASIC_SIZE_LAYOUT_STYLES: SettingFieldSchema[] = [
  {
    key: "width",
    type: "text",
    label: "Width",
    group: "size",
    focus: ["image", "section"],
    placeholder: "100%",
    responsive: true,
    tab: "layout",
  },
  {
    key: "height",
    type: "text",
    label: "Height",
    group: "size",
    focus: ["image", "section"],
    placeholder: "auto",
    responsive: true,
    tab: "layout",
  },
  {
    key: "minHeight",
    type: "text",
    label: "Min height",
    group: "size",
    focus: ["image", "section"],
    placeholder: "12rem",
    responsive: true,
    tab: "layout",
  },
];

export const IMAGE_STYLE_FIELDS: SettingFieldSchema[] = [
  {
    key: "borderRadius",
    type: "radius",
    label: "Border radius",
    group: "radius",
    focus: ["image", "section"],
    placeholder: "0.5rem",
    responsive: true,
    tab: "style",
  },
  {
    key: "opacity",
    type: "number",
    label: "Opacity (%)",
    group: "opacity",
    focus: ["image", "section"],
    placeholder: "100",
    responsive: true,
    tab: "style",
  },
];

export const IMAGE_LAYOUT_FIELDS: SettingFieldSchema[] = [
  ...BASIC_SPACING_STYLES,
  BASIC_ALIGNMENT_STYLE,
  ...BASIC_SIZE_LAYOUT_STYLES,
  {
    key: "objectFit",
    type: "select",
    label: "Crop / fit",
    group: "layout",
    focus: ["image", "section"],
    tab: "layout",
    options: [
      { value: "cover", label: "Cover (crop)" },
      { value: "contain", label: "Contain" },
      { value: "fill", label: "Fill" },
    ],
  },
];

export const PRODUCT_GRID_LAYOUT_FIELDS: SettingFieldSchema[] = [
  ...BASIC_SPACING_STYLES,
  {
    key: "columns",
    type: "columns",
    label: "Columns",
    group: "layout",
    focus: "section",
    options: COLUMN_OPTIONS,
    responsive: true,
    tab: "layout",
  },
];

export const BUTTON_VARIANT_OPTIONS = [
  { value: "", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "outline", label: "Outline" },
  { value: "ghost", label: "Ghost" },
];

export const STANDARD_ADVANCED_FIELDS: SettingFieldSchema[] = [
  {
    key: "visible",
    type: "toggle",
    label: "Visible on this device",
    group: "responsive",
    focus: "section",
    responsive: true,
    tab: "advanced",
    description: "Hide this section on the current preview device",
  },
  {
    key: "animation",
    type: "select",
    label: "Entrance animation",
    group: "animation",
    focus: "section",
    options: ANIMATION_OPTIONS,
    tab: "advanced",
  },
  {
    key: "animationDelayMs",
    type: "number",
    label: "Animation delay (ms)",
    group: "animation",
    focus: "section",
    placeholder: "0",
    tab: "advanced",
  },
  {
    key: "customClass",
    type: "text",
    label: "Custom CSS classes",
    group: "custom",
    focus: "section",
    placeholder: "my-class another-class",
    tab: "advanced",
  },
];

export const GALLERY_CONTENT_FIELDS: SettingFieldSchema[] = [
  {
    key: "images",
    type: "textarea",
    label: "Image URLs",
    group: "images",
    focus: ["image", "section"],
    placeholder: "One URL per line",
    description: "Paste image URLs or use the media library per slot in a future release",
  },
];

export const GALLERY_LAYOUT_FIELDS: SettingFieldSchema[] = [
  {
    key: "columns",
    type: "columns",
    label: "Columns",
    group: "layout",
    focus: "section",
    options: COLUMN_OPTIONS,
    responsive: true,
    tab: "layout",
  },
  {
    key: "gap",
    type: "spacing",
    label: "Gap",
    group: "layout",
    focus: "section",
    placeholder: "1rem",
    tab: "layout",
  },
  {
    key: "layout",
    type: "select",
    label: "Layout",
    group: "layout",
    focus: "section",
    tab: "layout",
    options: [
      { value: "grid", label: "Grid" },
      { value: "masonry", label: "Masonry" },
      { value: "carousel", label: "Carousel" },
    ],
  },
];

export const GALLERY_STYLE_FIELDS: SettingFieldSchema[] = [
  {
    key: "borderRadius",
    type: "radius",
    label: "Image radius",
    group: "images",
    focus: ["image", "section"],
    placeholder: "0.5rem",
    tab: "style",
  },
];
