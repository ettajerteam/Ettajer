"use client";

import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  FONT_WEIGHT_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  TYPOGRAPHY_SCALE_PRESETS,
} from "@/lib/builder/style-system";
import {
  InspectorColorField,
  InspectorFieldGroup,
  InspectorSelectField,
  InspectorTextField,
  InspectorAlignmentToggle,
} from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { readString, type StyleEditorProps, styleFieldId } from "./style-editor-props";

export function TypographyEditor({
  device,
  idPrefix,
  values,
  onPatch,
  emphasized,
  hasOverride,
  clearOverride,
}: StyleEditorProps & { hasOverride?: (key: keyof typeof values) => boolean }) {
  return (
    <InspectorFieldGroup
      title="Typography"
      description="Font family, size, weight, and text color"
      emphasized={emphasized}
    >
      <div className="space-y-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
          Scale presets
        </span>
        <div className="flex flex-wrap gap-1">
          {TYPOGRAPHY_SCALE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onPatch(
                  {
                    fontSize: preset.fontSize,
                    fontWeight: preset.fontWeight,
                    lineHeight: preset.lineHeight,
                  },
                  { responsive: true }
                )
              }
              className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700 transition-colors hover:border-[#007AFF]/40 hover:bg-[#007AFF]/5 hover:text-[#007AFF]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Font size</span>
        <OverrideIndicator
          active={hasOverride?.("fontSize")}
          onReset={clearOverride ? () => clearOverride("fontSize") : undefined}
        />
      </div>
      <InspectorSelectField
        id={styleFieldId(idPrefix, "font-size", device)}
        label="Font size"
        value={readString(values, "fontSize")}
        options={FONT_SIZE_OPTIONS}
        onChange={(v) => onPatch({ fontSize: v || undefined }, { responsive: true })}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Font family</span>
        <OverrideIndicator
          active={hasOverride?.("fontFamily")}
          onReset={clearOverride ? () => clearOverride("fontFamily") : undefined}
        />
      </div>
      <InspectorSelectField
        id={styleFieldId(idPrefix, "font-family", device)}
        label="Font family"
        value={readString(values, "fontFamily")}
        options={FONT_FAMILY_OPTIONS}
        onChange={(v) => onPatch({ fontFamily: v || undefined }, { responsive: true })}
      />
      <InspectorSelectField
        id={styleFieldId(idPrefix, "font-weight", device)}
        label="Font weight"
        value={readString(values, "fontWeight")}
        options={FONT_WEIGHT_OPTIONS}
        onChange={(v) => onPatch({ fontWeight: v || undefined }, { responsive: true })}
      />
      <InspectorSelectField
        id={styleFieldId(idPrefix, "line-height", device)}
        label="Line height"
        value={readString(values, "lineHeight")}
        options={LINE_HEIGHT_OPTIONS}
        onChange={(v) => onPatch({ lineHeight: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "letter-spacing", device)}
        label="Letter spacing"
        value={readString(values, "letterSpacing")}
        placeholder="0.05em"
        onChange={(v) => onPatch({ letterSpacing: v || undefined }, { responsive: true })}
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Text color</span>
        <OverrideIndicator
          active={hasOverride?.("textColor")}
          onReset={clearOverride ? () => clearOverride("textColor") : undefined}
        />
      </div>
      <InspectorColorField
        id={styleFieldId(idPrefix, "text-color", device)}
        label="Text color"
        value={readString(values, "textColor")}
        onChange={(v) => onPatch({ textColor: v || undefined }, { responsive: true })}
      />
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-neutral-600">Text alignment</span>
          <OverrideIndicator
            active={hasOverride?.("alignment") || hasOverride?.("textAlign")}
            onReset={
              clearOverride
                ? () => {
                    clearOverride("alignment");
                    clearOverride("textAlign");
                  }
                : undefined
            }
          />
        </div>
        <InspectorAlignmentToggle
          value={
            values.textAlign === "left" ||
            values.textAlign === "center" ||
            values.textAlign === "right"
              ? values.textAlign
              : values.alignment ?? "center"
          }
          onChange={(v) => onPatch({ alignment: v, textAlign: v }, { responsive: true })}
        />
      </div>
    </InspectorFieldGroup>
  );
}
