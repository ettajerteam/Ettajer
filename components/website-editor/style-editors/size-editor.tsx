"use client";

import { InspectorFieldGroup, InspectorTextField } from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { readString, type StyleEditorProps, styleFieldId } from "./style-editor-props";

export function SizeEditor({
  device,
  idPrefix,
  values,
  onPatch,
  emphasized,
  hasOverride,
  clearOverride,
}: StyleEditorProps & {
  hasOverride?: (key: keyof import("@/lib/builder/style-system").ElementStyleValues) => boolean;
}) {
  return (
    <InspectorFieldGroup title="Size" description="Width and height" emphasized={emphasized}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-neutral-400">Dimensions</span>
        <OverrideIndicator
          active={
            hasOverride?.("width") ||
            hasOverride?.("height") ||
            hasOverride?.("minHeight")
          }
          onReset={
            clearOverride
              ? () => {
                  clearOverride("width");
                  clearOverride("height");
                  clearOverride("minHeight");
                }
              : undefined
          }
        />
      </div>
      <InspectorTextField
        id={styleFieldId(idPrefix, "width", device)}
        label="Width"
        value={readString(values, "width")}
        placeholder="100%"
        onChange={(v) => onPatch({ width: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "height", device)}
        label="Height"
        value={readString(values, "height")}
        placeholder="16rem"
        onChange={(v) => onPatch({ height: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "min-width", device)}
        label="Min width"
        value={readString(values, "minWidth")}
        placeholder="auto"
        onChange={(v) => onPatch({ minWidth: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "max-width", device)}
        label="Max width"
        value={readString(values, "maxWidth")}
        placeholder="100%"
        onChange={(v) => onPatch({ maxWidth: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "min-height", device)}
        label="Min height"
        value={readString(values, "minHeight")}
        placeholder="12rem"
        onChange={(v) => onPatch({ minHeight: v || undefined }, { responsive: true })}
      />
      <InspectorTextField
        id={styleFieldId(idPrefix, "max-height", device)}
        label="Max height"
        value={readString(values, "maxHeight")}
        placeholder="none"
        onChange={(v) => onPatch({ maxHeight: v || undefined }, { responsive: true })}
      />
    </InspectorFieldGroup>
  );
}
