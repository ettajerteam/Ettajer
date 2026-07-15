"use client";

import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { StoreSection } from "@/lib/sections/types";
import { getBlock } from "@/lib/builder/block-registry";
import { sectionToBlockId } from "@/lib/builder/legacy-adapter";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Layers } from "lucide-react";

interface BuilderLayersPanelProps {
  sections: StoreSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function BuilderLayersPanel({ sections, selectedId, onSelect }: BuilderLayersPanelProps) {
  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center">
        <Layers className="mx-auto h-8 w-8 text-neutral-300" />
        <p className="mt-2 text-sm font-medium text-neutral-700">No layers yet</p>
        <p className="mt-1 text-xs text-neutral-500">Add blocks from the Add panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sections.map((section, index) => {
        const blockId = sectionToBlockId(section);
        const block = getBlock(blockId);
        const def = SECTION_REGISTRY[section.type];
        const active = selectedId === section.id;

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors",
              active
                ? "border-[#007AFF]/40 bg-[#007AFF]/[0.06]"
                : "border-transparent hover:bg-neutral-50"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold tabular-nums",
                active ? "bg-[#007AFF] text-white" : "bg-neutral-100 text-neutral-500"
              )}
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">
              {block?.name ?? def.label}
            </span>
            {!section.visible ? (
              <EyeOff className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            ) : (
              <Eye className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
            )}
          </button>
        );
      })}
    </div>
  );
}
