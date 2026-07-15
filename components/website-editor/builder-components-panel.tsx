"use client";

import { Boxes, Puzzle } from "lucide-react";
import { COMPONENT_DRAG_MIME } from "@/lib/builder/components";
import { useComponentStore } from "@/lib/builder/component-store";
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import { cn } from "@/lib/utils";

interface BuilderComponentsPanelProps {
  onInsertComponent: (componentId: string) => void;
}

export function BuilderComponentsPanel({ onInsertComponent }: BuilderComponentsPanelProps) {
  const components = useComponentStore((s) => Object.values(s.components));
  const loading = useComponentStore((s) => s.loading);

  const handleDragStart = (componentId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData(COMPONENT_DRAG_MIME, componentId);
    e.dataTransfer.effectAllowed = "copy";
  };

  if (loading) {
    return (
      <p className="py-6 text-center text-xs text-neutral-500">Loading components…</p>
    );
  }

  if (components.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center">
        <Puzzle className="mx-auto h-8 w-8 text-neutral-300" />
        <p className="mt-2 text-sm font-medium text-neutral-700">No saved components</p>
        <p className="mt-1 text-xs text-neutral-500">
          Select a section in Layers, then choose &quot;Save as component&quot; from the menu.
        </p>
      </div>
    );
  }

  return (
    <EditorPanelSection
      label="Your components"
      description="Click or drag to insert a linked instance"
    >
      <div className="grid grid-cols-1 gap-2">
        {components.map((component) => (
          <button
            key={component.id}
            type="button"
            draggable
            onClick={() => onInsertComponent(component.id)}
            onDragStart={handleDragStart(component.id)}
            className={cn(
              "group flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left transition-all",
              "hover:border-[#007AFF]/40 hover:shadow-sm active:cursor-grabbing"
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#007AFF]/10 text-[#007AFF]">
              <Boxes className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-neutral-900">
                {component.name}
              </span>
              {component.description ? (
                <span className="mt-0.5 line-clamp-2 block text-xs text-neutral-500">
                  {component.description}
                </span>
              ) : null}
              <span className="mt-1 block text-[10px] font-medium text-neutral-400 group-hover:text-[#007AFF]">
                Click to insert · drag to canvas
              </span>
            </span>
          </button>
        ))}
      </div>
    </EditorPanelSection>
  );
}
