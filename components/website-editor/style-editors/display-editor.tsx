"use client";

import {
  ALIGN_ITEMS_OPTIONS,
  DISPLAY_OPTIONS,
  FLEX_DIRECTION_OPTIONS,
  JUSTIFY_CONTENT_OPTIONS,
} from "@/lib/builder/style-system";
import {
  InspectorFieldGroup,
  InspectorSelectField,
  InspectorTextField,
} from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { readString, type StyleEditorProps, styleFieldId } from "./style-editor-props";

export function DisplayEditor({
  device,
  idPrefix,
  values,
  onPatch,
  hasOverride,
}: StyleEditorProps & {
  hasOverride?: (key: keyof import("@/lib/builder/style-system").ElementStyleValues) => boolean;
}) {
  return (
    <InspectorFieldGroup title="Display" description="Layout mode and flex basics">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Layout</span>
        <OverrideIndicator active={hasOverride?.("display")} />
      </div>
      <InspectorSelectField
        id={styleFieldId(idPrefix, "display", device)}
        label="Display"
        value={readString(values, "display")}
        options={DISPLAY_OPTIONS}
        onChange={(v) => onPatch({ display: v || undefined }, { responsive: true })}
      />
      <InspectorSelectField
        id={styleFieldId(idPrefix, "flex-direction", device)}
        label="Flex direction"
        value={readString(values, "flexDirection")}
        options={FLEX_DIRECTION_OPTIONS}
        onChange={(v) => onPatch({ flexDirection: v || undefined })}
      />
      <InspectorSelectField
        id={styleFieldId(idPrefix, "align-items", device)}
        label="Align items"
        value={readString(values, "alignItems")}
        options={ALIGN_ITEMS_OPTIONS}
        onChange={(v) => onPatch({ alignItems: v || undefined })}
      />
      <InspectorSelectField
        id={styleFieldId(idPrefix, "justify-content", device)}
        label="Justify content"
        value={readString(values, "justifyContent")}
        options={JUSTIFY_CONTENT_OPTIONS}
        onChange={(v) => onPatch({ justifyContent: v || undefined })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "gap", device)}
        label="Gap"
        value={readString(values, "gap")}
        placeholder="1rem"
        onChange={(v) => onPatch({ gap: v || undefined }, { responsive: true })}
      />
    </InspectorFieldGroup>
  );
}
