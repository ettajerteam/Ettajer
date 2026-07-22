"use client";

import { InspectorColorField, InspectorFieldGroup, InspectorTextField } from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { readString, type StyleEditorProps, styleFieldId } from "./style-editor-props";

export function BackgroundEditor({
  device,
  idPrefix,
  values,
  onPatch,
  hasOverride,
  clearOverride,
}: StyleEditorProps & {
  hasOverride?: (key: keyof typeof values) => boolean;
}) {
  return (
    <InspectorFieldGroup title="Background" description="Color and image">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Background color</span>
        <OverrideIndicator
          active={hasOverride?.("backgroundColor")}
          onReset={clearOverride ? () => clearOverride("backgroundColor") : undefined}
        />
      </div>
      <InspectorColorField
        id={styleFieldId(idPrefix, "bg-color", device)}
        label="Background color"
        value={readString(values, "backgroundColor")}
        onChange={(v) => onPatch({ backgroundColor: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "bg-image", device)}
        label="Background image"
        value={readString(values, "backgroundImage")}
        placeholder="url(...) or linear-gradient(...)"
        onChange={(v) => onPatch({ backgroundImage: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "bg-size", device)}
        label="Background size"
        value={readString(values, "backgroundSize")}
        placeholder="cover"
        onChange={(v) => onPatch({ backgroundSize: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "bg-position", device)}
        label="Background position"
        value={readString(values, "backgroundPosition")}
        placeholder="center"
        onChange={(v) => onPatch({ backgroundPosition: v || undefined }, { responsive: true })}
      />
    </InspectorFieldGroup>
  );
}
