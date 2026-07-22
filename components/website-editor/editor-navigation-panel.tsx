"use client";

import { Plus, Trash2, ChevronUp, ChevronDown, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import { InspectorLinkField } from "@/components/website-editor/inspector/inspector-link-field";
import type { NavItem } from "@/lib/navigation";

interface EditorNavigationPanelProps {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
}

export function EditorNavigationPanel({ items, onChange }: EditorNavigationPanelProps) {
  function updateItem(id: string, field: "label" | "href", value: string) {
    onChange(
      items.map((item) => {
        if (item.id === id) return { ...item, [field]: value };
        if (item.children?.length) {
          return {
            ...item,
            children: item.children.map((child) =>
              child.id === id ? { ...child, [field]: value } : child
            ),
          };
        }
        return item;
      })
    );
  }

  function addItem() {
    onChange([
      ...items,
      { id: `nav-${Date.now()}`, label: "New link", href: "/" },
    ]);
  }

  function addChild(parentId: string) {
    onChange(
      items.map((item) => {
        if (item.id !== parentId) return item;
        const children = item.children ?? [];
        return {
          ...item,
          children: [
            ...children,
            { id: `nav-${Date.now()}`, label: "Sub-link", href: "/products" },
          ],
        };
      })
    );
  }

  function removeItem(id: string) {
    onChange(
      items
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => child.id !== id),
        }))
    );
  }

  function moveTopLevel(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return;
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onChange(copy);
  }

  function moveChild(parentId: string, childId: string, direction: -1 | 1) {
    onChange(
      items.map((item) => {
        if (item.id !== parentId || !item.children) return item;
        const index = item.children.findIndex((c) => c.id === childId);
        if (index < 0) return item;
        const next = index + direction;
        if (next < 0 || next >= item.children.length) return item;
        const copy = [...item.children];
        const [child] = copy.splice(index, 1);
        copy.splice(next, 0, child);
        return { ...item, children: copy };
      })
    );
  }

  function renderLinkEditor(
    item: NavItem,
    options: {
      depth: number;
      index: number;
      total: number;
      parentId?: string;
    }
  ) {
    const { depth, index, total, parentId } = options;
    return (
      <div
        key={item.id}
        className={
          depth === 0
            ? "space-y-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
            : "space-y-2 rounded-lg border border-neutral-100 bg-neutral-50 p-2.5 ml-4"
        }
      >
        <div className="flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
            {depth > 0 ? <CornerDownRight className="h-3 w-3" /> : null}
            {depth === 0 ? `Link ${index + 1}` : `Sub-link ${index + 1}`}
          </p>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
              disabled={index === 0}
              onClick={() =>
                parentId ? moveChild(parentId, item.id, -1) : moveTopLevel(item.id, -1)
              }
              aria-label="Move up"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-30"
              disabled={index === total - 1}
              onClick={() =>
                parentId ? moveChild(parentId, item.id, 1) : moveTopLevel(item.id, 1)
              }
              aria-label="Move down"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
              onClick={() => removeItem(item.id)}
              aria-label="Remove link"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`nav-label-${item.id}`} className="text-[10px] text-neutral-400">
            Label
          </Label>
          <Input
            id={`nav-label-${item.id}`}
            value={item.label}
            onChange={(e) => updateItem(item.id, "label", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <InspectorLinkField
          id={`nav-href-${item.id}`}
          label="Path"
          value={item.href}
          placeholder="/about"
          onChange={(href) => updateItem(item.id, "href", href)}
        />
        {depth === 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-full justify-start px-1 text-[11px] text-neutral-500"
            onClick={() => addChild(item.id)}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add dropdown link
          </Button>
        ) : null}
        {item.children?.map((child, childIndex) =>
          renderLinkEditor(child, {
            depth: 1,
            index: childIndex,
            total: item.children!.length,
            parentId: item.id,
          })
        )}
      </div>
    );
  }

  return (
    <EditorPanelSection
      label="Store menu"
      description="Header links on your live store. Add dropdowns under a parent link. Changes go live with Go live."
    >
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-200 px-3 py-6 text-center text-xs text-neutral-500">
            No menu links yet. Add Home, Shop, About, or custom pages.
          </p>
        ) : (
          items.map((item, index) =>
            renderLinkEditor(item, { depth: 0, index, total: items.length })
          )
        )}

        <Button type="button" variant="outline" size="sm" className="h-8 w-full text-xs" onClick={addItem}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add link
        </Button>
      </div>
    </EditorPanelSection>
  );
}
