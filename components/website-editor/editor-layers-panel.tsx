"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import {
  buildPageLayerTree,
  parseLayerSelection,
  resolveActiveLayerId,
  type LayerNode,
  type LayerNodeKind,
} from "@/lib/builder/layer-tree";
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
        className={cn(
          "group flex items-center gap-0.5 rounded-lg border py-1 pr-1 transition-all duration-150",
          isDragging && "opacity-40",
          isActive
            ? "border-[#007AFF]/40 bg-[#007AFF]/[0.08] shadow-[0_0_0_1px_rgba(0,122,255,0.1)]"
            : "border-transparent hover:bg-neutral-50",
          !node.visible && isSection && "opacity-60"
        )}
        style={{ paddingLeft: depth * 14 + 4 }}
        draggable={isSection && node.draggable}
        onDragStart={() => isSection && onDragStart(node.id)}
        onDragOver={(e) => {
          if (isSection) e.preventDefault();
        }}
        onDrop={() => isSection && onDrop(node.id)}
        onDragEnd={onDragEnd}
      >
        {isSection ? (
          <GripVertical
            className="h-3.5 w-3.5 shrink-0 cursor-grab text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            aria-hidden
          />
        ) : (
          <span className="w-3.5 shrink-0" />
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
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") onCancelRename();
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-6 min-w-0 flex-1 px-1.5 text-xs"
            />
          ) : (
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-xs font-medium",
                isActive ? "text-[#007AFF]" : "text-neutral-800",
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
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onToggleVisible(node.id)}
              title={node.visible ? "Hide" : "Show"}
            >
              {node.visible ? (
                <Eye className="h-3 w-3 text-neutral-400" />
              ) : (
                <EyeOff className="h-3 w-3 text-neutral-400" />
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

      {hasChildren && !isCollapsed
        ? node.children.map((child) => (
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
          ))
        : null}
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
    <div className="flex flex-col gap-4">
      <EditorPanelSection
        label="Layers"
        description="Page structure — select, rename, reorder, or delete"
        count={sections.length}
      >
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <GripVertical className="h-3.5 w-3.5" />
          Drag sections to reorder
          <EditorHelpTooltip text="Double-click a layer to rename. Expand sections to edit individual elements in the inspector." />
        </div>

        <div
          className="rounded-lg border border-neutral-200 bg-white py-1"
          role="tree"
          aria-label="Page layers"
        >
          <LayerRow
            node={tree}
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
        </div>
      </EditorPanelSection>

      <EditorPanelSection label="Add block" divider>
        <EditorOpenAddPanelTrigger />
      </EditorPanelSection>
    </div>
  );
}
