"use client";

import { SHADOW_OPTIONS } from "@/lib/builder/style-system";
import { InspectorFieldGroup, InspectorSelectField } from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { readString, type StyleEditorProps } from "./style-editor-props";

export function ShadowEditor({
  device,
  values,
  onPatch,
  hasOverride,
  clearOverride,
}: StyleEditorProps & {
  hasOverride?: (key: keyof typeof values) => boolean;
}) {
  return (
    <InspectorFieldGroup title="Shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Box shadow</span>
        <OverrideIndicator
          active={hasOverride?.("boxShadow")}
          onReset={clearOverride ? () => clearOverride("boxShadow") : undefined}
        />
      </div>
      <InspectorSelectField
        id={`box-shadow-${device}`}
        label="Box shadow"
        value={readString(values, "boxShadow")}
        options={SHADOW_OPTIONS}
        onChange={(v) => onPatch({ boxShadow: v || undefined }, { responsive: true })}
      />
    </InspectorFieldGroup>
  );
}
