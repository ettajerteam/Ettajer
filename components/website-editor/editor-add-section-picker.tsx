"use client";

import {
  Image,
  LayoutGrid,
  Minus,
  Plus,
  ShoppingBag,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCentralBuilderStore } from "@/lib/builder/central-builder-store";
import { ADDABLE_SECTION_TYPES, getSectionDefinition } from "@/lib/sections/registry";
import type { SectionType } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Image> = {
  image: Image,
  grid: LayoutGrid,
  "shopping-bag": ShoppingBag,
  type: Type,
  minus: Minus,
};

interface EditorAddSectionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (type: SectionType) => void;
}

export function EditorAddSectionPicker({
  open,
  onOpenChange,
  onAdd,
}: EditorAddSectionPickerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add section</DialogTitle>
          <DialogDescription>
            Choose a block type to add to your home page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {ADDABLE_SECTION_TYPES.map((type) => {
            const def = getSectionDefinition(type);
            if (!def) return null;
            const Icon = ICONS[def.icon] ?? LayoutGrid;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onAdd(type);
                  onOpenChange(false);
                }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left transition-all",
                  "hover:border-[#007AFF]/40 hover:bg-[#007AFF]/[0.04] hover:shadow-sm"
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <Icon className="h-5 w-5 text-neutral-600" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-neutral-900">{def.label}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500">{def.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Opens the permanent Add panel tab instead of the legacy modal. */
export function EditorOpenAddPanelTrigger({
  className,
  label = "Add block",
}: {
  className?: string;
  label?: string;
}) {
  const setActiveTab = useCentralBuilderStore((s) => s.setActiveTab);
  const setBuilderSettings = useCentralBuilderStore((s) => s.setBuilderSettings);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-9 w-full gap-1.5 rounded-xl border-dashed text-xs", className)}
      onClick={() => {
        setActiveTab("add");
        setBuilderSettings({ leftPanelOpen: true });
      }}
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}

interface EditorAddSectionTriggerProps {
  onClick: () => void;
  className?: string;
}

/** @deprecated Prefer EditorOpenAddPanelTrigger for the permanent Add panel. */
export function EditorAddSectionTrigger({ onClick, className }: EditorAddSectionTriggerProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-9 w-full gap-1.5 rounded-xl border-dashed text-xs", className)}
      onClick={onClick}
    >
      <Plus className="h-3.5 w-3.5" />
      Add section
    </Button>
  );
}
