"use client";

import {
  ArrowDown,
  ArrowUp,
  Copy,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { StoreSection } from "@/lib/sections/types";
import type { InspectorElementFocus } from "@/lib/builder/inspector-config";
import type { ElementStyleValues } from "@/lib/builder/style-system";
import type { DeviceMode } from "@/lib/builder/types";
import { dashboardKicker, dashboardSubtitle } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import { InspectorPanel } from "./inspector/inspector-panel";

interface EditorSectionSettingsProps {
  section: StoreSection | null;
  sectionIndex?: number;
  device?: DeviceMode;
  inspectorFocus?: InspectorElementFocus;
  onFocusChange?: (focus: InspectorElementFocus) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onChange: (settings: Record<string, unknown>) => void;
  onStylePatch?: (
    patch: Partial<ElementStyleValues>,
    options?: { responsive?: boolean }
  ) => void;
  onToggleVisible?: (visible: boolean) => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function EmptyInspector() {
  return (
    <div className="rounded-xl border border-dashed border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100">
        <MousePointerClick className="h-6 w-6 text-neutral-400" />
      </div>
      <p className="text-sm font-semibold text-neutral-900">No section selected</p>
      <p className={cn("mt-1", dashboardSubtitle)}>
        Click a section in the preview or choose one from the list to edit its settings.
      </p>
    </div>
  );
}

export function EditorSectionSettings({
  section,
  sectionIndex,
  device = "desktop",
  inspectorFocus = "section",
  onFocusChange,
  canMoveUp = false,
  canMoveDown = false,
  onChange,
  onStylePatch,
  onToggleVisible,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: EditorSectionSettingsProps) {
  if (!section) return <EmptyInspector />;

  const def = SECTION_REGISTRY[section.type];
  const showQuickActions = onDuplicate || onMoveUp || onMoveDown;

  return (
    <div className="space-y-4 transition-all duration-200">
      <div>
        <p className={dashboardKicker}>
          {sectionIndex != null ? `Section ${sectionIndex + 1}` : "Section"}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-neutral-900">{def.label}</p>
        <p className={cn("mt-0.5", dashboardSubtitle)}>{def.description}</p>
        {!section.visible ? (
          <span className="mt-2 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Hidden in live store
          </span>
        ) : null}
      </div>

      {showQuickActions && (
        <div className="flex flex-wrap gap-1.5">
          {onDuplicate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-lg text-xs"
              onClick={onDuplicate}
              title="Duplicate (Ctrl/Cmd+D)"
            >
              <Copy className="h-3 w-3" />
              Duplicate
            </Button>
          )}
          {onMoveUp && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              title="Move up"
              aria-label="Move section up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          )}
          {onMoveDown && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              title="Move down"
              aria-label="Move section down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      <InspectorPanel
        section={section}
        focus={inspectorFocus}
        device={device}
        onFocusChange={onFocusChange ?? (() => {})}
        onChange={onChange}
        onStylePatch={onStylePatch}
        onToggleVisible={onToggleVisible}
      />
    </div>
  );
}
