"use client";

import { SPACING_PRESETS } from "@/lib/builder/style-system";
import {
  InspectorFieldGroup,
  InspectorSelectField,
  InspectorSpacingField,
} from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { readString, type StyleEditorProps, styleFieldId } from "./style-editor-props";

interface SpacingEditorProps extends StyleEditorProps {
  mode: "padding" | "margin" | "both";
  hasOverride?: (key: keyof import("@/lib/builder/style-system").ElementStyleValues) => boolean;
}

export function SpacingEditor({
  device,
  idPrefix,
  values,
  onPatch,
  mode,
  hasOverride,
  clearOverride,
}: SpacingEditorProps) {
  const title =
    mode === "padding" ? "Padding" : mode === "margin" ? "Margin" : "Spacing";

  const patchSpacing = (
    key: "padding" | "margin",
    value: string,
    responsive = true
  ) => {
    onPatch({ [key]: value || undefined }, { responsive });
  };

  return (
    <InspectorFieldGroup title={title} description="Shorthand or preset values">
      {(mode === "padding" || mode === "both") && (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-neutral-400">Padding</span>
            <OverrideIndicator
              active={hasOverride?.("padding")}
              onReset={clearOverride ? () => clearOverride("padding") : undefined}
            />
          </div>
          <InspectorSelectField
            id={styleFieldId(idPrefix, "padding-preset", device)}
            label="Padding preset"
            value=""
            options={SPACING_PRESETS}
            onChange={(v) => {
              if (v) patchSpacing("padding", v);
            }}
          />
          <InspectorSpacingField
            label="Padding"
            value={readString(values, "padding")}
            placeholder="e.g. 2rem 1.5rem"
            onChange={(v) => patchSpacing("padding", v)}
          />
        </>
      )}
      {(mode === "margin" || mode === "both") && (
        <>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-neutral-400">Margin</span>
            <OverrideIndicator
              active={hasOverride?.("margin")}
              onReset={clearOverride ? () => clearOverride("margin") : undefined}
            />
          </div>
          <InspectorSelectField
            id={styleFieldId(idPrefix, "margin-preset", device)}
            label="Margin preset"
            value=""
            options={SPACING_PRESETS}
            onChange={(v) => {
              if (v) patchSpacing("margin", v);
            }}
          />
          <InspectorSpacingField
            label="Margin"
            value={readString(values, "margin")}
            placeholder="e.g. 0 auto"
            onChange={(v) => patchSpacing("margin", v)}
          />
        </>
      )}
    </InspectorFieldGroup>
  );
}

export function PaddingEditor(props: Omit<SpacingEditorProps, "mode">) {
  return <SpacingEditor {...props} mode="padding" />;
}

export function MarginEditor(props: Omit<SpacingEditorProps, "mode">) {
  return <SpacingEditor {...props} mode="margin" />;
}
