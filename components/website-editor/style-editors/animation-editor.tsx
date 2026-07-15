"use client";

import { ANIMATION_OPTIONS, EASING_OPTIONS } from "@/lib/builder/style-system";
import {
  InspectorFieldGroup,
  InspectorSelectField,
  InspectorTextField,
} from "../inspector/inspector-fields";
import { readNumber, readString, type StyleEditorProps } from "./style-editor-props";

export function AnimationEditor({ device, values, onPatch }: StyleEditorProps) {
  return (
    <InspectorFieldGroup title="Animation" description="Entrance animation timing">
      <InspectorSelectField
        id={`animation-${device}`}
        label="Entrance animation"
        value={readString(values, "animation") || "none"}
        options={ANIMATION_OPTIONS}
        onChange={(v) => onPatch({ animation: v === "none" || !v ? undefined : v })}
      />
      <InspectorTextField
        id={`animation-duration-${device}`}
        label="Duration (ms)"
        value={readNumber(values, "animationDurationMs")}
        placeholder="300"
        onChange={(v) => {
          const n = Number.parseInt(v, 10);
          onPatch({ animationDurationMs: Number.isFinite(n) ? n : undefined });
        }}
      />
      <InspectorTextField
        id={`animation-delay-${device}`}
        label="Delay (ms)"
        value={readNumber(values, "animationDelayMs")}
        placeholder="0"
        onChange={(v) => {
          const n = Number.parseInt(v, 10);
          onPatch({ animationDelayMs: Number.isFinite(n) ? n : undefined });
        }}
      />
      <InspectorSelectField
        id={`animation-easing-${device}`}
        label="Easing"
        value={readString(values, "animationEasing")}
        options={EASING_OPTIONS}
        onChange={(v) => onPatch({ animationEasing: v || undefined })}
      />
    </InspectorFieldGroup>
  );
}
