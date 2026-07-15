"use client";

import { InspectorAlignmentToggle, InspectorFieldGroup } from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { type StyleEditorProps } from "./style-editor-props";

export function AlignmentEditor({
  device,
  values,
  onPatch,
  hasOverride,
}: StyleEditorProps & {
  hasOverride?: (key: keyof import("@/lib/builder/style-system").ElementStyleValues) => boolean;
}) {
  const align =
    values.textAlign === "left" ||
    values.textAlign === "center" ||
    values.textAlign === "right"
      ? values.textAlign
      : values.alignment ?? "center";

  return (
    <InspectorFieldGroup title="Text alignment">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Alignment</span>
        <OverrideIndicator active={hasOverride?.("alignment") || hasOverride?.("textAlign")} />
      </div>
      <InspectorAlignmentToggle
        value={align}
        onChange={(v) =>
          onPatch({ alignment: v, textAlign: v }, { responsive: true })
        }
      />
    </InspectorFieldGroup>
  );
}
