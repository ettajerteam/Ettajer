import type { InspectorElementFocus } from "./inspector-config";
import type { StyleGroupId } from "./style-system";

export type SettingFieldType =
  | "text"
  | "textarea"
  | "url"
  | "link"
  | "image"
  | "media"
  | "color"
  | "spacing"
  | "alignment"
  | "toggle"
  | "select"
  | "number"
  | "columns"
  | "variant"
  | "styleGroup"
  | "radius"
  | "typography";

export type InspectorTab = "content" | "style" | "layout" | "advanced";

export interface SettingFieldSchema {
  key: string;
  type: SettingFieldType;
  label: string;
  description?: string;
  /** Field group shown as a titled section in the inspector (e.g. Typography, Spacing). */
  group?: string;
  /** Explicit tab placement. When omitted, derived from the schema bucket (content/styles/layout/advanced). */
  tab?: InspectorTab;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** When true, value is stored in per-device styles (styles.desktop/tablet/mobile). */
  responsive?: boolean;
  /** Alias for responsive — same behavior. */
  deviceAware?: boolean;
  defaultValue?: unknown;
  /** Which element-focus pills show this field. Derived from group when omitted. */
  focus?: InspectorElementFocus | InspectorElementFocus[];
  /** Alt-text companion key for image/media fields (defaults to "alt"). */
  altKey?: string;
  /** When type is styleGroup — renders a shared style editor group */
  styleGroup?: StyleGroupId;
}

export interface BlockSettingsSchema {
  content: SettingFieldSchema[];
  styles: SettingFieldSchema[];
  layout?: SettingFieldSchema[];
  advanced?: SettingFieldSchema[];
  /** Element focus pills for this block. Derived from field scopes when omitted. */
  focuses?: InspectorElementFocus[];
}

export interface BlockThumbnail {
  type: "gradient" | "image";
  value: string;
}

export interface BlockStylesDefaults {
  desktop?: Record<string, unknown>;
  tablet?: Record<string, unknown>;
  mobile?: Record<string, unknown>;
}

/** Returns true when a field reads/writes per-device style overrides. */
export function isDeviceAwareField(field: SettingFieldSchema): boolean {
  return field.responsive === true || field.deviceAware === true;
}
