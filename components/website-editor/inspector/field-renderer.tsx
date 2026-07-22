"use client";

import { useId } from "react";
import {
  FONT_SIZE_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  SHADOW_OPTIONS,
  ANIMATION_OPTIONS,
} from "@/lib/builder/inspector-config";
import type { SettingFieldSchema } from "@/lib/builder/block-schema";
import { isDeviceAwareField } from "@/lib/builder/block-schema";
import type { DeviceMode } from "@/lib/builder/types";
import {
  getDeviceStyles,
  getResolvedStyles,
  hasOverride,
  updateDeviceStyle,
} from "@/lib/builder/responsive-styles";
import { clearStyleOverride, type ElementStyleValues } from "@/lib/builder/style-system";
import { OverrideIndicator } from "@/components/website-editor/style-editors/override-indicator";
import {
  InspectorAlignmentToggle,
  InspectorColorField,
  InspectorMediaField,
  InspectorSelectField,
  InspectorSpacingField,
  InspectorTextField,
  InspectorTextareaField,
  InspectorToggleField,
} from "./inspector-fields";
import { InspectorRichTextField } from "./inspector-rich-text-field";
import { InspectorProductPicker } from "./inspector-product-picker";
import { InspectorCollectionPicker } from "./inspector-collection-picker";
import { InspectorLinkField } from "./inspector-link-field";
import { InspectorItemListField } from "./inspector-item-list-field";
import { InspectorVariantPicker } from "./inspector-variant-picker";

function enrichFieldOptions(field: SettingFieldSchema): SettingFieldSchema {
  if (field.options) return field;
  if (field.key === "animation") return { ...field, options: ANIMATION_OPTIONS };
  if (field.key === "boxShadow") return { ...field, options: SHADOW_OPTIONS };
  if (field.key === "fontWeight") return { ...field, options: FONT_WEIGHT_OPTIONS };
  if (field.key === "fontSize") return { ...field, options: FONT_SIZE_OPTIONS };
  return field;
}

function readFieldValue(
  settings: Record<string, unknown>,
  field: SettingFieldSchema,
  device: DeviceMode
): unknown {
  if (isDeviceAwareField(field)) {
    const deviceStyles = getResolvedStyles(settings, device);
    const value = deviceStyles[field.key as keyof typeof deviceStyles];
    if (value !== undefined) return value;
  }
  return settings[field.key];
}

function writeFieldValue(
  settings: Record<string, unknown>,
  field: SettingFieldSchema,
  device: DeviceMode,
  value: unknown
): Record<string, unknown> {
  if (isDeviceAwareField(field)) {
    const patch: Record<string, unknown> = {
      [field.key]: value === "" || value === null ? undefined : value,
    };
    return updateDeviceStyle(settings, device, patch);
  }

  const next = { ...settings, [field.key]: value };
  if (value === "" || value === null || value === undefined) {
    delete next[field.key];
  }
  return next;
}

export interface SchemaFieldProps {
  field: SettingFieldSchema;
  settings: Record<string, unknown>;
  device: DeviceMode;
  onChange: (settings: Record<string, unknown>) => void;
}

export function SchemaField({ field, settings, device, onChange }: SchemaFieldProps) {
  const enriched = enrichFieldOptions(field);
  const uid = useId().replace(/:/g, "");
  const id = `${uid}-${field.key}-${device}`;
  const value = readFieldValue(settings, field, device);
  const patch = (next: unknown) => onChange(writeFieldValue(settings, field, device, next));
  const styleKey = field.key as keyof ElementStyleValues;
  const deviceAware = isDeviceAwareField(field);
  const showOverride = deviceAware && device !== "desktop";
  const fieldHasOverride = showOverride && hasOverride(settings, device, styleKey);

  const fieldLabel = (
    <div className="mb-1 flex items-center justify-between gap-2">
      <span className="text-[10px] text-neutral-400">{enriched.label}</span>
      {showOverride ? (
        <OverrideIndicator
          active={fieldHasOverride}
          onReset={
            fieldHasOverride
              ? () => onChange(clearStyleOverride(settings, device, styleKey))
              : undefined
          }
        />
      ) : null}
    </div>
  );

  switch (enriched.type) {
    case "text":
    case "radius":
      return (
        <div>
          {deviceAware ? fieldLabel : null}
          <InspectorTextField
            id={id}
            label={enriched.label}
            value={typeof value === "string" ? value : ""}
            placeholder={enriched.placeholder}
            onChange={(v) => patch(v)}
          />
        </div>
      );
    case "url":
    case "link":
      return (
        <div>
          {deviceAware ? fieldLabel : null}
          <InspectorLinkField
            id={id}
            label={enriched.label}
            value={typeof value === "string" ? value : ""}
            placeholder={enriched.placeholder}
            description={enriched.description}
            onChange={(v) => patch(v)}
          />
        </div>
      );
    case "image":
    case "media": {
      const altKey = enriched.altKey ?? "alt";
      const altValue = (settings[altKey] as string) ?? "";
      return (
        <InspectorMediaField
          id={id}
          label={enriched.label}
          value={typeof value === "string" ? value : ""}
          altValue={altValue}
          description={enriched.description}
          kind={enriched.mediaKind ?? "image"}
          onChange={(url) => patch(url)}
          onAltChange={
            altKey && enriched.mediaKind !== "video"
              ? (alt) => {
                  const next = { ...settings, [altKey]: alt || undefined };
                  if (!alt) delete next[altKey];
                  onChange(next);
                }
              : undefined
          }
        />
      );
    }
    case "textarea":
      return (
        <InspectorTextareaField
          id={id}
          label={enriched.label}
          value={typeof value === "string" ? value : ""}
          placeholder={enriched.placeholder}
          rows={4}
          onChange={(v) => patch(v)}
        />
      );
    case "richtext":
      return (
        <InspectorRichTextField
          id={id}
          label={enriched.label}
          value={typeof value === "string" ? value : ""}
          placeholder={enriched.placeholder}
          description={enriched.description}
          onChange={(v) => patch(v)}
        />
      );
    case "color":
      return (
        <div>
          {deviceAware ? fieldLabel : null}
          <InspectorColorField
            id={id}
            label={enriched.label}
            value={typeof value === "string" ? value : ""}
            onChange={(v) => patch(v || undefined)}
          />
        </div>
      );
    case "spacing":
      return (
        <div>
          {deviceAware ? fieldLabel : null}
          <InspectorSpacingField
            label={enriched.label}
            value={typeof value === "string" ? value : ""}
            placeholder={enriched.placeholder}
            onChange={(v) => patch(v || undefined)}
          />
        </div>
      );
    case "alignment":
      return (
        <div className="space-y-1.5">
          {deviceAware ? fieldLabel : <p className="text-xs text-neutral-600">{enriched.label}</p>}
          <InspectorAlignmentToggle
            value={
              value === "left" || value === "center" || value === "right" ? value : "center"
            }
            onChange={(v) => patch(v)}
          />
        </div>
      );
    case "toggle": {
      const checked =
        field.key === "visible" && deviceAware
          ? getDeviceStyles(settings, device).visible !== false
          : value === true;
      return (
        <InspectorToggleField
          id={id}
          label={enriched.label}
          description={enriched.description}
          checked={checked}
          onChange={(v) => patch(v)}
        />
      );
    }
    case "select":
    case "columns":
      return (
        <div>
          {deviceAware ? fieldLabel : null}
          <InspectorSelectField
            id={id}
            label={enriched.label}
            value={value != null ? String(value) : ""}
            options={enriched.options ?? []}
            onChange={(v) => {
              if (enriched.type === "columns") {
                patch(v ? Number.parseInt(v, 10) : undefined);
              } else if (enriched.key === "animation") {
                patch(v === "none" || !v ? undefined : v);
              } else {
                patch(v || undefined);
              }
            }}
          />
        </div>
      );
    case "variant":
      return (
        <InspectorVariantPicker
          id={id}
          label={enriched.label}
          value={value != null ? String(value) : ""}
          options={enriched.options ?? []}
          onChange={(v) => patch(v || undefined)}
          visual={enriched.key === "ctaVariant" || enriched.key.includes("Variant") ? "plain" : "layout"}
        />
      );
    case "number":
      return (
        <InspectorTextField
          id={id}
          label={enriched.label}
          value={value != null ? String(value) : ""}
          placeholder={enriched.placeholder}
          onChange={(v) => {
            const n = Number.parseInt(v, 10);
            patch(Number.isFinite(n) ? n : undefined);
          }}
        />
      );
    case "productPicker": {
      const ids = Array.isArray(value)
        ? value.filter((v): v is string => typeof v === "string")
        : [];
      return (
        <InspectorProductPicker
          label={enriched.label}
          description={enriched.description}
          value={ids}
          onChange={(nextIds) => {
            onChange({
              ...settings,
              productSource: "manual",
              productIds: nextIds,
            });
          }}
        />
      );
    }
    case "collectionPicker": {
      const ids = Array.isArray(value)
        ? value.filter((v): v is string => typeof v === "string")
        : [];
      return (
        <InspectorCollectionPicker
          label={enriched.label}
          description={enriched.description}
          value={ids}
          onChange={(nextIds) => {
            onChange({
              ...settings,
              collectionSource: "manual",
              collectionIds: nextIds,
            });
          }}
        />
      );
    }
    case "datetime": {
      const raw = typeof value === "string" ? value : "";
      const localValue = raw.length >= 16 ? raw.slice(0, 16) : raw;
      return (
        <div className="space-y-1.5">
          <p className="text-xs text-neutral-600">{enriched.label}</p>
          {enriched.description ? (
            <p className="text-[11px] text-neutral-400">{enriched.description}</p>
          ) : null}
          <input
            id={id}
            type="datetime-local"
            className="h-8 w-full rounded-lg border border-neutral-200 bg-white px-2 text-xs text-neutral-800"
            value={localValue}
            onChange={(e) => patch(e.target.value || undefined)}
          />
        </div>
      );
    }
    case "itemList":
      return (
        <InspectorItemListField
          label={enriched.label}
          description={enriched.description}
          itemLabel={enriched.itemLabel}
          maxItems={enriched.maxItems}
          itemFields={enriched.itemFields ?? []}
          value={value}
          onChange={(next) => patch(next)}
        />
      );
    case "styleGroup":
    case "typography":
      return null;
    default:
      return null;
  }
}

/** Alias for schema-driven inspector field rendering */
export const SchemaFieldRenderer = SchemaField;
