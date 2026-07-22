"use client";

import { COLUMN_OPTIONS } from "@/lib/builder/style-system";
import { InspectorFieldGroup, InspectorSelectField } from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { type StyleEditorProps, styleFieldId } from "./style-editor-props";

export function LayoutEditor({
  device,
  idPrefix,
  values,
  onPatch,
  hasOverride,
}: StyleEditorProps & {
  hasOverride?: (key: keyof import("@/lib/builder/style-system").ElementStyleValues) => boolean;
}) {
  return (
    <InspectorFieldGroup title="Grid columns">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Columns</span>
        <OverrideIndicator active={hasOverride?.("columns")} />
      </div>
      <InspectorSelectField
        id={styleFieldId(idPrefix, "columns", device)}
        label="Columns"
        value={values.columns != null ? String(values.columns) : ""}
        options={COLUMN_OPTIONS}
        onChange={(v) =>
          onPatch({ columns: v ? Number.parseInt(v, 10) : undefined }, { responsive: true })
        }
      />
    </InspectorFieldGroup>
  );
}
