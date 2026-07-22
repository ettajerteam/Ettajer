"use client";

import { BORDER_STYLE_OPTIONS } from "@/lib/builder/style-system";
import {
  InspectorColorField,
  InspectorFieldGroup,
  InspectorSelectField,
  InspectorTextField,
} from "../inspector/inspector-fields";
import { readString, type StyleEditorProps, styleFieldId } from "./style-editor-props";

export function BorderEditor({ device,
  idPrefix, values, onPatch }: StyleEditorProps) {
  return (
    <InspectorFieldGroup title="Borders" description="Width, style, and color">
      <InspectorTextField
        id={styleFieldId(idPrefix, "border-width", device)}
        label="Border width"
        value={readString(values, "borderWidth")}
        placeholder="1px"
        onChange={(v) => onPatch({ borderWidth: v || undefined })}
      />
      <InspectorSelectField
        id={styleFieldId(idPrefix, "border-style", device)}
        label="Border style"
        value={readString(values, "borderStyle")}
        options={BORDER_STYLE_OPTIONS}
        onChange={(v) => onPatch({ borderStyle: v || undefined })}
      />
      <InspectorColorField
        id={styleFieldId(idPrefix, "border-color", device)}
        label="Border color"
        value={readString(values, "borderColor")}
        onChange={(v) => onPatch({ borderColor: v || undefined })}
      />
    </InspectorFieldGroup>
  );
}
