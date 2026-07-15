"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Image,
  LayoutGrid,
  Layers,
  Minus,
  MoreHorizontal,
  Search,
  ShoppingBag,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditorOpenAddPanelTrigger } from "@/components/website-editor/editor-add-section-picker";
import { EditorHelpTooltip } from "@/components/website-editor/editor-help-tooltip";
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { SectionType, StoreSection } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Image> = {
  image: Image,
  grid: LayoutGrid,
  "shopping-bag": ShoppingBag,
  type: Type,
  minus: Minus,
};

interface EditorSectionListProps {
  sections: StoreSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
  onRemove: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onAdd: (type: SectionType) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

export function EditorSectionList({
  sections,
  selectedId,
  onSelect,
  onReorder,
  onRemove,
  onToggleVisible,
  onAdd,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: EditorSectionListProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((section) => {
      const def = SECTION_REGISTRY[section.type];
      return def.label.toLowerCase().includes(q) || def.description.toLowerCase().includes(q);
    });
  }, [sections, search]);

  const showSearch = sections.length >= 4;

  useEffect(() => {
    if (!selectedId) return;
    const el = itemRefs.current.get(selectedId);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    el?.focus({ preventScroll: true });
  }, [selectedId]);

  const handleListKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!selectedId || sections.length === 0) return;
      const idx = sections.findIndex((s) => s.id === selectedId);
      if (idx < 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const next = sections[Math.min(idx + 1, sections.length - 1)];
        if (next) onSelect(next.id);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prev = sections[Math.max(idx - 1, 0)];
        if (prev) onSelect(prev.id);
      }
    },
    [onSelect, sections, selectedId]
  );

  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 bg-gradient-to-b from-neutral-50 to-white p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007AFF]/10">
          <Layers className="h-6 w-6 text-[#007AFF]" />
        </div>
        <p className="text-sm font-semibold text-neutral-900">Build your home page</p>
        <p className="mt-1 text-xs text-neutral-500">
          Add your first section to start designing your storefront.
        </p>
        <div className="mt-4">
          <EditorOpenAddPanelTrigger className="mx-auto max-w-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <EditorPanelSection
        label="Home page blocks"
        description="Drag to reorder sections on your home page"
        count={sections.length}
      >
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <GripVertical className="h-3.5 w-3.5" />
          Drag handle to reorder
          <EditorHelpTooltip text="Drag the grip icon to change section order. Arrow keys move the selected section; use the keyboard icon in the header for all shortcuts." />
        </div>

        {showSearch ? (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sections…"
              className="h-8 pl-8 text-xs"
              aria-label="Search sections"
            />
          </div>
        ) : null}

        <div
          className="space-y-1.5"
          role="listbox"
          aria-label="Page sections"
          aria-activedescendant={selectedId ? `section-option-${selectedId}` : undefined}
          onKeyDown={handleListKeyDown}
        >
          {filteredSections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-xs text-neutral-500">
              No sections match &ldquo;{search}&rdquo;
            </p>
          ) : (
            filteredSections.map((section) => {
              const index = sections.findIndex((s) => s.id === section.id);
              const def = SECTION_REGISTRY[section.type];
              const Icon = ICONS[def.icon] ?? LayoutGrid;
              const active = selectedId === section.id;
              const canMoveUp = index > 0;
              const canMoveDown = index < sections.length - 1;
              const showInsertAbove = dragId !== null && dragId !== section.id;

              return (
                <div key={section.id}>
                  {showInsertAbove && (
                    <div
                      className={cn(
                        "mx-2 my-0.5 h-0.5 rounded-full transition-all duration-150",
                        dragId ? "bg-[#007AFF] shadow-[0_0_6px_rgba(0,122,255,0.5)]" : "bg-transparent"
                      )}
                    />
                  )}
                  <div
                  ref={(node) => {
                    if (node) itemRefs.current.set(section.id, node);
                    else itemRefs.current.delete(section.id);
                  }}
                  id={`section-option-${section.id}`}
                  role="option"
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  draggable
                  onDragStart={() => setDragId(section.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId) onReorder(dragId, section.id);
                    setDragId(null);
                  }}
                  onDragEnd={() => setDragId(null)}
                  className={cn(
                    "group flex flex-nowrap items-center gap-1.5 rounded-xl border px-2 py-2 transition-all duration-200",
                    dragId === section.id && "opacity-50",
                    !section.visible && "border-dashed bg-neutral-50/80",
                    active
                      ? "border-[#007AFF]/40 bg-[#007AFF]/[0.06] shadow-[0_0_0_1px_rgba(0,122,255,0.12)] ring-1 ring-[#007AFF]/20"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                  )}
                >
                  <GripVertical
                    className="h-4 w-4 shrink-0 cursor-grab text-neutral-400 active:cursor-grabbing"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={() => onSelect(section.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-left"
                    aria-label={`${def.label}${!section.visible ? ", hidden" : ""}`}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums transition-colors",
                        active ? "bg-[#007AFF] text-white" : "bg-neutral-100 text-neutral-500",
                        !section.visible && "opacity-50"
                      )}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        active ? "bg-[#007AFF]/15" : "bg-neutral-100",
                        !section.visible && "opacity-50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", active ? "text-[#007AFF]" : "text-neutral-600")} />
                    </span>
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 truncate text-sm font-medium",
                          !section.visible && "text-neutral-400 line-through decoration-neutral-300"
                        )}
                      >
                        {def.label}
                        {!section.visible && (
                          <span className="rounded bg-neutral-200/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 no-underline">
                            Hidden
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-[11px] text-neutral-400">{def.description}</span>
                    </span>
                  </button>
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-0.5 pl-0.5 transition-opacity",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                    )}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => onToggleVisible(section.id)}
                      title={section.visible ? "Hide section" : "Show section"}
                      aria-label={section.visible ? "Hide section" : "Show section"}
                    >
                      {section.visible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-neutral-400" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          title="Section actions"
                          aria-label="Section actions"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {onDuplicate && (
                          <DropdownMenuItem onClick={() => onDuplicate(section.id)}>
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        {onMoveUp && (
                          <DropdownMenuItem
                            onClick={() => onMoveUp(section.id)}
                            disabled={!canMoveUp}
                          >
                            <ArrowUp className="mr-2 h-3.5 w-3.5" />
                            Move up
                          </DropdownMenuItem>
                        )}
                        {onMoveDown && (
                          <DropdownMenuItem
                            onClick={() => onMoveDown(section.id)}
                            disabled={!canMoveDown}
                          >
                            <ArrowDown className="mr-2 h-3.5 w-3.5" />
                            Move down
                          </DropdownMenuItem>
                        )}
                        {(onDuplicate || onMoveUp || onMoveDown) && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onRemove(section.id)}
                          disabled={sections.length <= 1}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                </div>
              );
            })
          )}
        </div>
      </EditorPanelSection>

      <EditorPanelSection label="Add block" divider>
        <EditorOpenAddPanelTrigger />
      </EditorPanelSection>
    </div>
  );
}
