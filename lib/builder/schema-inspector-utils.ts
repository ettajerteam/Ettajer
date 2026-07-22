import type { BlockSettingsSchema, InspectorTab, SettingFieldSchema } from "./block-schema";
import type { InspectorElementFocus } from "./inspector-config";
import type { BlockDefinition } from "./types";

const FOCUS_ORDER: InspectorElementFocus[] = [
  "text",
  "image",
  "button",
  "link",
  "section",
];

const CONTENT_GROUP_FOCUS: Record<string, InspectorElementFocus[]> = {
  text: ["text", "section"],
  images: ["image", "section"],
  buttons: ["button"],
  links: ["link"],
  products: ["section"],
  general: ["section"],
};

const STYLE_GROUP_FOCUS: Record<string, InspectorElementFocus[]> = {
  typography: ["text", "section", "button"],
  colors: ["text", "section", "button", "image"],
  background: ["section"],
  spacing: ["section", "text", "image", "button", "link"],
  alignment: ["text", "section"],
  layout: ["section"],
  borders: ["section", "image", "button"],
  radius: ["section", "image", "button"],
  size: ["section", "image"],
  display: ["section"],
  shadow: ["section", "image", "button"],
  opacity: ["section", "image"],
  visibility: ["section"],
  images: ["image", "section", "button"],
  animation: ["section"],
  responsive: ["section"],
  custom: ["section"],
  general: ["section"],
};

const LAYOUT_GROUP_FOCUS: Record<string, InspectorElementFocus[]> = {
  spacing: ["section", "text", "image", "button", "link"],
  alignment: ["text", "section"],
  layout: ["section"],
  size: ["section", "image"],
  display: ["section"],
  general: ["section"],
};

const ADVANCED_GROUP_FOCUS: Record<string, InspectorElementFocus[]> = {
  animation: ["section"],
  responsive: ["section"],
  custom: ["section"],
  general: ["section"],
};

function normalizeFocus(
  focus: InspectorElementFocus | InspectorElementFocus[] | undefined
): InspectorElementFocus[] | undefined {
  if (!focus) return undefined;
  return Array.isArray(focus) ? focus : [focus];
}

function focusMapForTab(tab: InspectorTab): Record<string, InspectorElementFocus[]> {
  switch (tab) {
    case "content":
      return CONTENT_GROUP_FOCUS;
    case "style":
      return STYLE_GROUP_FOCUS;
    case "layout":
      return LAYOUT_GROUP_FOCUS;
    case "advanced":
      return ADVANCED_GROUP_FOCUS;
  }
}

export function resolveFieldTab(
  field: SettingFieldSchema,
  bucket: InspectorTab
): InspectorTab {
  return field.tab ?? bucket;
}

export function getSchemaFieldsForTab(
  schema: BlockSettingsSchema,
  tab: InspectorTab
): SettingFieldSchema[] {
  const buckets: [InspectorTab, SettingFieldSchema[]][] = [
    ["content", schema.content],
    ["style", schema.styles],
    ["layout", schema.layout ?? []],
    ["advanced", schema.advanced ?? []],
  ];

  const fields: SettingFieldSchema[] = [];
  for (const [bucket, bucketFields] of buckets) {
    for (const field of bucketFields) {
      if (resolveFieldTab(field, bucket) === tab) {
        fields.push(field);
      }
    }
  }
  return fields;
}

export function getAllSchemaFields(schema: BlockSettingsSchema): SettingFieldSchema[] {
  return [
    ...schema.content,
    ...schema.styles,
    ...(schema.layout ?? []),
    ...(schema.advanced ?? []),
  ];
}

export function resolveFieldFocuses(
  field: SettingFieldSchema,
  tab: InspectorTab
): InspectorElementFocus[] {
  const explicit = normalizeFocus(field.focus);
  if (explicit) return explicit;

  if (field.type === "styleGroup" && field.styleGroup) {
    return STYLE_GROUP_FOCUS[field.styleGroup] ?? LAYOUT_GROUP_FOCUS[field.styleGroup] ?? ["section"];
  }

  const group = field.group ?? "general";
  return focusMapForTab(tab)[group] ?? ["section"];
}

export function fieldMatchesFocus(
  field: SettingFieldSchema,
  tab: InspectorTab,
  focus: InspectorElementFocus
): boolean {
  return resolveFieldFocuses(field, tab).includes(focus);
}

export function filterFieldsByFocus(
  fields: SettingFieldSchema[],
  tab: InspectorTab,
  focus: InspectorElementFocus
): SettingFieldSchema[] {
  return fields.filter((field) => fieldMatchesFocus(field, tab, focus));
}

export function getSchemaInspectorFocuses(block: BlockDefinition): InspectorElementFocus[] {
  const { focuses } = block.settingsSchema;
  if (focuses?.length) {
    return FOCUS_ORDER.filter((f) => focuses.includes(f));
  }

  const discovered = new Set<InspectorElementFocus>();
  const tabs: InspectorTab[] = ["content", "style", "layout", "advanced"];

  for (const tab of tabs) {
    for (const field of getSchemaFieldsForTab(block.settingsSchema, tab)) {
      for (const f of resolveFieldFocuses(field, tab)) {
        if (f !== "section") discovered.add(f);
      }
    }
  }

  if (getSchemaFieldsForTab(block.settingsSchema, "style").length > 0 ||
      getSchemaFieldsForTab(block.settingsSchema, "layout").length > 0 ||
      getSchemaFieldsForTab(block.settingsSchema, "advanced").length > 0) {
    discovered.add("section");
  }

  const ordered = FOCUS_ORDER.filter((f) => discovered.has(f));
  return ordered.length > 0 ? ordered : ["section"];
}

export function hasSchemaFields(block: BlockDefinition | undefined): boolean {
  if (!block) return false;
  return getAllSchemaFields(block.settingsSchema).length > 0;
}

export function schemaHasTab(schema: BlockSettingsSchema, tab: InspectorTab): boolean {
  return getSchemaFieldsForTab(schema, tab).length > 0;
}
