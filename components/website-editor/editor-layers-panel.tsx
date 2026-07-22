"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Box,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Home,
  Image,
  Layers,
  Link2,
  Link2Off,
  MousePointerClick,
  MoreHorizontal,
  Puzzle,
  Save,
  Square,
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
import {
  buildPageLayerTree,
  parseLayerSelection,
  resolveActiveLayerId,
  type LayerNode,
  type LayerNodeKind,
} from "@/lib/builder/layer-tree";
import { flattenVisibleLayerNodes } from "@/lib/builder/layer-tree-nav";
import { searchLayoutSections } from "@/lib/builder/layout-search";
import { useCentralBuilderStore } from "@/lib/builder/central-builder-store";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { SectionType, StoreSection } from "@/lib/sections/types";
import { cn } from "@/lib/utils";

const KIND_ICONS: Record<LayerNodeKind, typeof Layers> = {
  page: Home,
  section: Box,
  element: Square,
};

const FOCUS_ICONS: Record<string, typeof Type> = {
  text: Type,
  image: Image,
  button: MousePointerClick,
  link: Link2,
  section: Square,
};

interface EditorLayersPanelProps {
  sections: StoreSection[];
  onReorder: (fromId: string, toId: string) => void;
  onRemove: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onAdd: (type: SectionType) => void;
  onDuplicate?: (id: string) => void;
  onSaveAsComponent?: (sectionId: string) => void;
  onDetachComponent?: (instanceId: string) => void;
  onEditComponent?: (componentId: string) => void;
  componentNames?: Record<string, string>;
}

interface LayerRowProps {
  node: LayerNode;
  depth: number;
  activeLayerId: string | null;
  collapsedLayers: Record<string, boolean>;
  dragId: string | null;
  renamingId: string | null;
  sections: StoreSection[];
  onSelect: (layerId: string) => void;
  onToggleExpand: (layerId: string) => void;
  onStartRename: (layerId: string) => void;
  onCommitRename: (layerId: string, name: string) => void;
  onCancelRename: () => void;
  onDragStart: (sectionId: string) => void;
  onDragEnd: () => void;
  onDrop: (sectionId: string) => void;
  onToggleVisible: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSaveAsComponent?: (sectionId: string) => void;
  onDetachComponent?: (instanceId: string) => void;
  onEditComponent?: (componentId: string) => void;
  onRemove: (id: string) => void;
}

function LayerRow({
  node,
  depth,
  activeLayerId,
  collapsedLayers,
  dragId,
  renamingId,
  sections,
  onSelect,
  onToggleExpand,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDragStart,
  onDragEnd,
  onDrop,
  onToggleVisible,
  onDuplicate,
  onSaveAsComponent,
  onDetachComponent,
  onEditComponent,
  onRemove,
}: LayerRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [renameValue, setRenameValue] = useState(node.label);
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsedLayers[node.id] === true;
  const isActive = activeLayerId === node.id;
  const isRenaming = renamingId === node.id;
  const isSection = node.kind === "section";
  const isDragging = dragId === node.id;

  const Icon =
    node.kind === "element" && node.focus
      ? (FOCUS_ICONS[node.focus] ?? Square)
      : KIND_ICONS[node.kind];

  useEffect(() => {
    if (isRenaming) {
      setRenameValue(node.label);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming, node.label]);

  const commitRename = () => {
    onCommitRename(node.id, renameValue);
  };

  return (
    <>
      <div
        role="treeitem"
        aria-level={depth + 1}
        aria-selected={isActive}
        aria-expanded={hasChildren ? !isCollapsed : undefined}
        tabIndex={isActive ? 0 : -1}
        className={cn(
          "group flex items-center gap-0.5 rounded-md border py-1 pr-1 transition-all duration-150",
          isDragging && "opacity-40",
          isActive
            ? "border-[#007AFF]/40 bg-[#007AFF]/[0.08]"
            : "border-transparent hover:bg-neutral-50",
          !node.visible && isSection && "opacity-60",
          isSection && "mt-1 first:mt-0"
        )}
        style={{ paddingLeft: Math.max(depth, 0) * 12 + 2 }}
        draggable={isSection && node.draggable}
        onDragStart={() => isSection && onDragStart(node.id)}
        onDragOver={(e) => {
          if (isSection) e.preventDefault();
        }}
        onDrop={() => isSection && onDrop(node.id)}
        onDragEnd={onDragEnd}
        onKeyDown={(e) => {
          if (isRenaming) return;
          if (e.key === "ArrowRight" && hasChildren && isCollapsed) {
            e.preventDefault();
            onToggleExpand(node.id);
          } else if (e.key === "ArrowLeft" && hasChildren && !isCollapsed) {
            e.preventDefault();
            onToggleExpand(node.id);
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (node.kind === "page") onToggleExpand(node.id);
            else onSelect(node.id);
          } else if (e.key === "F2" && isSection) {
            e.preventDefault();
            onStartRename(node.id);
          }
        }}
      >
        {isSection ? (
          <GripVertical
            className="h-3.5 w-3.5 shrink-0 cursor-grab text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            aria-hidden
          />
        ) : (
          <span className="w-0 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => (hasChildren ? onToggleExpand(node.id) : undefined)}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
            hasChildren ? "hover:bg-neutral-100" : "pointer-events-none"
          )}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
          tabIndex={hasChildren ? 0 : -1}
        >
          {hasChildren ? (
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-neutral-400 transition-transform",
                !isCollapsed && "rotate-90"
              )}
            />
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (node.kind === "page") onToggleExpand(node.id);
            else onSelect(node.id);
          }}
          onDoubleClick={() => onStartRename(node.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-left"
        >
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded",
              isActive ? "bg-[#007AFF]/15 text-[#007AFF]" : "bg-neutral-100 text-neutral-500"
            )}
          >
            <Icon className="h-3 w-3" />
          </span>

          {isRenaming ? (
            <Input
              ref={inputRef}
              id={`layer-rename-${node.id}`}
              name={`layer-rename-${node.id}`}
              autoComplete="off"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") onCancelRename();
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-6 min-w-0 flex-1 px-1.5 text-xs font-semibold"
              aria-label="Rename layer"
            />
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                isSection || node.kind === "page"
                  ? "text-[13px] font-bold leading-tight text-neutral-900"
                  : "text-xs font-normal text-neutral-600",
                isActive && (isSection || node.kind === "page"
                  ? "text-[#007AFF]"
                  : "font-medium text-[#007AFF]"),
                !node.visible && isSection && "line-through decoration-neutral-300"
              )}
            >
              {node.isComponentInstance && (
                <Puzzle className="mr-1 inline h-3 w-3 text-[#007AFF]" aria-hidden />
              )}
              {node.label}
            </span>
          )}
        </button>

        {isSection && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-0.5 transition-opacity",
              isActive || !node.visible ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-6 w-6", !node.visible && "text-amber-600")}
              onClick={() => onToggleVisible(node.id)}
              title={node.visible ? "Hide section" : "Show section"}
            >
              {node.visible ? (
                <Eye className="h-3 w-3 text-neutral-400" />
              ) : (
                <EyeOff className="h-3 w-3 text-amber-600" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onStartRename(node.id)}>
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(node.id)}>
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Duplicate
                  </DropdownMenuItem>
                )}
                {onSaveAsComponent && !node.isComponentInstance && (
                  <DropdownMenuItem onClick={() => onSaveAsComponent(node.id)}>
                    <Save className="mr-2 h-3.5 w-3.5" />
                    Save as component
                  </DropdownMenuItem>
                )}
                {node.isComponentInstance && node.componentInstanceId && onDetachComponent && (
                  <DropdownMenuItem onClick={() => onDetachComponent(node.componentInstanceId!)}>
                    <Link2Off className="mr-2 h-3.5 w-3.5" />
                    Detach component
                  </DropdownMenuItem>
                )}
                {node.isComponentInstance && node.componentId && onEditComponent && (
                  <DropdownMenuItem onClick={() => onEditComponent(node.componentId!)}>
                    <Puzzle className="mr-2 h-3.5 w-3.5" />
                    Edit component globally
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onRemove(node.id)}
                  disabled={sections.length <= 1}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {hasChildren && !isCollapsed ? (
        <div
          className={cn(
            "min-w-0",
            isSection && "mb-1 ml-4 border-l border-neutral-200 pl-1"
          )}
          role="group"
          aria-label={`${node.label} content`}
        >
          {node.children.map((child) => (
            <LayerRow
              key={child.id}
              node={child}
              depth={depth + 1}
              activeLayerId={activeLayerId}
              collapsedLayers={collapsedLayers}
              dragId={dragId}
              renamingId={renamingId}
              sections={sections}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onStartRename={onStartRename}
              onCommitRename={onCommitRename}
              onCancelRename={onCancelRename}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              onToggleVisible={onToggleVisible}
              onDuplicate={onDuplicate}
              onSaveAsComponent={onSaveAsComponent}
              onDetachComponent={onDetachComponent}
              onEditComponent={onEditComponent}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

export function EditorLayersPanel({
  sections,
  onReorder,
  onRemove,
  onToggleVisible,
  onAdd: _onAdd,
  onDuplicate,
  onSaveAsComponent,
  onDetachComponent,
  onEditComponent,
  componentNames = {},
}: EditorLayersPanelProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [layerQuery, setLayerQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const searchFieldId = `layers-search-${useId().replace(/:/g, "")}`;

  const selectedSectionId = useCentralBuilderStore((s) => s.selectedSectionId);
  const selectedElementId = useCentralBuilderStore((s) => s.selectedElementId);
  const inspectorFocus = useCentralBuilderStore((s) => s.builderSettings.inspectorFocus);
  const layerRenames = useCentralBuilderStore((s) => s.builderSettings.layerRenames);
  const collapsedLayers = useCentralBuilderStore((s) => s.builderSettings.collapsedLayers);
  const selectLayer = useCentralBuilderStore((s) => s.selectLayer);
  const toggleLayerExpanded = useCentralBuilderStore((s) => s.toggleLayerExpanded);
  const setLayerRename = useCentralBuilderStore((s) => s.setLayerRename);

  const tree = useMemo(
    () => buildPageLayerTree(sections, "Home", layerRenames, componentNames),
    [sections, layerRenames, componentNames]
  );

  const contentHits = useMemo(
    () => searchLayoutSections(sections, layerQuery),
    [sections, layerQuery]
  );

  const filteredChildren = useMemo(() => {
    const q = layerQuery.trim().toLowerCase();
    if (!q) return tree.children;
    const hitIds = new Set(contentHits.map((h) => h.sectionId));
    const matches = (node: LayerNode): boolean => {
      if (node.label.toLowerCase().includes(q)) return true;
      if (node.sectionId && hitIds.has(node.sectionId)) return true;
      if (node.kind === "section" && hitIds.has(node.id)) return true;
      return node.children.some(matches);
    };
    return tree.children.filter(matches);
  }, [tree.children, layerQuery, contentHits]);

  const visibleNodes = useMemo(
    () => flattenVisibleLayerNodes(filteredChildren, collapsedLayers),
    [filteredChildren, collapsedLayers]
  );

  const activeLayerId = useMemo(
    () => resolveActiveLayerId(selectedSectionId, inspectorFocus, selectedElementId),
    [selectedSectionId, inspectorFocus, selectedElementId]
  );

  useEffect(() => {
    if (!activeLayerId) return;
    const { sectionId } = parseLayerSelection(activeLayerId);
    const state = useCentralBuilderStore.getState();
    const collapsed = state.builderSettings.collapsedLayers;
    if (collapsed["page:home"]) toggleLayerExpanded("page:home");
    if (sectionId && collapsed[sectionId]) toggleLayerExpanded(sectionId);
  }, [activeLayerId, toggleLayerExpanded]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        const target = event.target as HTMLElement | null;
        if (target?.closest("input, textarea, [contenteditable=true]")) return;
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
      if (event.key === "/" && !(event.target instanceof HTMLInputElement)) {
        const target = event.target as HTMLElement | null;
        if (target?.isContentEditable) return;
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const moveTreeSelection = useCallback(
    (delta: number) => {
      if (visibleNodes.length === 0) return;
      const idx = Math.max(
        0,
        visibleNodes.findIndex((n) => n.id === activeLayerId)
      );
      const next = visibleNodes[Math.min(visibleNodes.length - 1, Math.max(0, idx + delta))];
      if (!next) return;
      if (next.kind === "page") toggleLayerExpanded(next.id);
      else selectLayer(next.id);
    },
    [visibleNodes, activeLayerId, selectLayer, toggleLayerExpanded]
  );

  const handleDrop = useCallback(
    (targetId: string) => {
      if (dragId && dragId !== targetId) onReorder(dragId, targetId);
      setDragId(null);
    },
    [dragId, onReorder]
  );

  const handleCommitRename = useCallback(
    (layerId: string, name: string) => {
      setLayerRename(layerId, name);
      setRenamingId(null);
    },
    [setLayerRename]
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="text-xs font-semibold text-neutral-800">
          Layers
          <span className="ml-1.5 font-normal text-neutral-400">({sections.length})</span>
        </p>
        <EditorHelpTooltip text="Drag to reorder. Click a section to edit it on the right. Press / to search." />
      </div>

      <div className="relative px-0.5">
        <Input
          ref={searchRef}
          id={searchFieldId}
          name="layers-search"
          autoComplete="off"
          value={layerQuery}
          onChange={(e) => setLayerQuery(e.target.value)}
          placeholder="Search layers & content…"
          className="h-8 rounded-lg border-neutral-200 bg-white text-xs"
          aria-label="Search layers and content"
        />
        {layerQuery.trim() && contentHits.length > 0 ? (
          <p className="mt-1 text-[10px] text-neutral-400">
            {contentHits.length} content match{contentHits.length === 1 ? "" : "es"}
          </p>
        ) : null}
      </div>

      <div
        className="rounded-lg border border-neutral-200 bg-white"
        role="tree"
        aria-label="Page layers"
        aria-live="polite"
        onKeyDown={(e) => {
          if (renamingId) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            moveTreeSelection(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            moveTreeSelection(-1);
          } else if (e.key === "Home") {
            e.preventDefault();
            const first = visibleNodes.find((n) => n.kind !== "page") ?? visibleNodes[0];
            if (first && first.kind !== "page") selectLayer(first.id);
          } else if (e.key === "End") {
            e.preventDefault();
            const last = [...visibleNodes].reverse().find((n) => n.kind !== "page");
            if (last) selectLayer(last.id);
          }
        }}
      >
        {filteredChildren.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-neutral-500">No layers match “{layerQuery}”.</p>
        ) : (
          filteredChildren.map((child) => (
            <LayerRow
              key={child.id}
              node={child}
              depth={0}
              activeLayerId={activeLayerId}
              collapsedLayers={collapsedLayers}
              dragId={dragId}
              renamingId={renamingId}
              sections={sections}
              onSelect={selectLayer}
              onToggleExpand={toggleLayerExpanded}
              onStartRename={setRenamingId}
              onCommitRename={handleCommitRename}
              onCancelRename={() => setRenamingId(null)}
              onDragStart={setDragId}
              onDragEnd={() => setDragId(null)}
              onDrop={handleDrop}
              onToggleVisible={onToggleVisible}
              onDuplicate={onDuplicate}
              onSaveAsComponent={onSaveAsComponent}
              onDetachComponent={onDetachComponent}
              onEditComponent={onEditComponent}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      <div className="pt-0.5">
        <EditorOpenAddPanelTrigger />
      </div>
    </div>
  );
}
