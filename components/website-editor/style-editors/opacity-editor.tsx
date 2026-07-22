"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InspectorFieldGroup } from "../inspector/inspector-fields";
import { OverrideIndicator } from "./override-indicator";
import { type StyleEditorProps, styleFieldId } from "./style-editor-props";

export function OpacityEditor({
  device,
  idPrefix,
  values,
  onPatch,
  hasOverride,
}: StyleEditorProps & {
  hasOverride?: (key: keyof import("@/lib/builder/style-system").ElementStyleValues) => boolean;
}) {
  const opacity = values.opacity ?? 1;

  return (
    <InspectorFieldGroup title="Opacity">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={`opacity-${device}`} className="text-xs text-neutral-600">
          Opacity
        </Label>
        <OverrideIndicator active={hasOverride?.("opacity")} />
      </div>
      <div className="flex items-center gap-3">
        <input
          id={styleFieldId(idPrefix, "opacity-range", device)}
          type="range"
          min={0}
          max={100}
          value={Math.round(opacity * 100)}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            onPatch(
              { opacity: Number.isFinite(n) ? n / 100 : undefined },
              { responsive: true }
            );
          }}
          className="flex-1"
        />
        <Input
          id={styleFieldId(idPrefix, "opacity", device)}
          value={String(opacity)}
          onChange={(e) => {
            const n = Number.parseFloat(e.target.value);
            onPatch(
              { opacity: Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : undefined },
              { responsive: true }
            );
          }}
          className="h-8 w-16 rounded-lg text-xs"
        />
      </div>
    </InspectorFieldGroup>
  );
}
