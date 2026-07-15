"use client";

import { InspectorFieldGroup, InspectorTextField } from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { readString, type StyleEditorProps } from "./style-editor-props";

export function RadiusEditor({
  device,
  values,
  onPatch,
  emphasized,
  hasOverride,
  clearOverride,
}: StyleEditorProps & {
  hasOverride?: (key: keyof typeof values) => boolean;
}) {
  return (
    <InspectorFieldGroup title="Border radius" emphasized={emphasized}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Radius</span>
        <OverrideIndicator
          active={hasOverride?.("borderRadius")}
          onReset={clearOverride ? () => clearOverride("borderRadius") : undefined}
        />
      </div>
      <InspectorTextField
        id={`border-radius-${device}`}
        label="Radius"
        value={readString(values, "borderRadius")}
        placeholder="1rem"
        onChange={(v) => onPatch({ borderRadius: v || undefined }, { responsive: true })}
      />
    </InspectorFieldGroup>
  );
}
