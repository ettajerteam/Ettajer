"use client";

import { DEVICE_LABELS } from "@/lib/builder/style-system";
import { InspectorFieldGroup, InspectorToggleField } from "../inspector/inspector-fields";
import { type StyleEditorProps } from "./style-editor-props";

export function VisibilityEditor({ device, values, onPatch }: StyleEditorProps) {
  const isVisible = values.visible !== false;

  return (
    <InspectorFieldGroup
      title="Visibility"
      description={`Control visibility on ${DEVICE_LABELS[device].toLowerCase()}`}
    >
      <InspectorToggleField
        id={`visible-${device}`}
        label={`Visible on ${DEVICE_LABELS[device].toLowerCase()}`}
        checked={isVisible}
        onChange={(v) => onPatch({ visible: v ? undefined : false }, { responsive: true })}
      />
    </InspectorFieldGroup>
  );
}
