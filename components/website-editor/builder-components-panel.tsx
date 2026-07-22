"use client";

import { useMemo, useState } from "react";
import { Boxes, MoreHorizontal, Pencil, Puzzle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMPONENT_DRAG_MIME } from "@/lib/builder/components";
import { useComponentStore } from "@/lib/builder/component-store";
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import { EditorPanelListSkeleton } from "@/components/website-editor/editor-skeleton";
import { cn } from "@/lib/utils";

interface BuilderComponentsPanelProps {
  onInsertComponent: (componentId: string) => void;
}

export function BuilderComponentsPanel({ onInsertComponent }: BuilderComponentsPanelProps) {
  const componentsById = useComponentStore((s) => s.components);
  const components = useMemo(() => Object.values(componentsById), [componentsById]);
  const loading = useComponentStore((s) => s.loading);
  const syncError = useComponentStore((s) => s.syncError);
  const updateComponent = useComponentStore((s) => s.updateComponent);
  const deleteComponent = useComponentStore((s) => s.deleteComponent);

  const [menuId, setMenuId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameDescription, setRenameDescription] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDragStart = (componentId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData(COMPONENT_DRAG_MIME, componentId);
    e.dataTransfer.effectAllowed = "copy";
  };

  function openRename(id: string) {
    const component = components.find((c) => c.id === id);
    if (!component) return;
    setRenameId(id);
    setRenameName(component.name);
    setRenameDescription(component.description ?? "");
    setMenuId(null);
  }

  async function saveRename() {
    if (!renameId || !renameName.trim()) return;
    setSaving(true);
    try {
      const ok = await updateComponent(renameId, {
        name: renameName.trim(),
        description: renameDescription.trim() || undefined,
      });
      if (!ok) throw new Error("Failed to update");
      toast.success("Component updated");
      setRenameId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    const component = components.find((c) => c.id === id);
    if (!component) return;
    if (!window.confirm(`Delete “${component.name}”? Linked instances stay as detached copies.`)) {
      setMenuId(null);
      return;
    }
    setDeleting(true);
    try {
      const ok = await deleteComponent(id);
      if (!ok) throw new Error("Failed to delete");
      toast.success("Component deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setDeleting(false);
      setMenuId(null);
    }
  }

  if (loading) {
    return <EditorPanelListSkeleton rows={4} label="Loading components" />;
  }

  if (syncError) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-4 text-center text-xs text-amber-900">
        {syncError}
      </p>
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
    <>
      <EditorPanelSection
        label="Your components"
        description="Click or drag to insert · manage with ⋯"
      >
        <div className="grid grid-cols-1 gap-2">
          {components.map((component) => (
            <div
              key={component.id}
              className={cn(
                "group relative flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left transition-all",
                "hover:border-[#007AFF]/40 hover:shadow-sm"
              )}
            >
              <button
                type="button"
                draggable
                onClick={() => onInsertComponent(component.id)}
                onDragStart={handleDragStart(component.id)}
                className="flex min-w-0 flex-1 items-start gap-3 text-left active:cursor-grabbing"
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

              <div className="relative shrink-0">
                <button
                  type="button"
                  className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label={`Manage ${component.name}`}
                  onClick={() => setMenuId((id) => (id === component.id ? null : component.id))}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuId === component.id ? (
                  <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-neutral-700 hover:bg-neutral-50"
                      onClick={() => openRename(component.id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Rename
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                      disabled={deleting}
                      onClick={() => void confirmDelete(component.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </EditorPanelSection>

      <Dialog open={Boolean(renameId)} onOpenChange={(open) => !open && setRenameId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename component</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="component-name">Name</Label>
              <Input
                id="component-name"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="component-desc">Description</Label>
              <Textarea
                id="component-desc"
                rows={2}
                value={renameDescription}
                onChange={(e) => setRenameDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void saveRename()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
