"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import { OnlineStoreEmptyState } from "@/components/online-store/online-store-empty-state";
import { DashboardCardSection } from "@/components/dashboard/dashboard-card-section";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/navigation";

export function NavigationClient({ initial }: { initial: NavItem[] }) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  function updateItem(id: string, field: "label" | "href", value: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: `nav-${Date.now()}`, label: "New link", href: "/" }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function moveItem(id: string, direction: -1 | 1) {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      if (index < 0) return prev;
      const next = index + direction;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  function reorder(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.id === draggedId);
      const to = prev.findIndex((i) => i.id === targetId);
      if (from < 0 || to < 0) return prev;
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (res.ok) toast.success("Navigation saved");
      else toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnlineStorePageShell>
      {items.length === 0 ? (
        <OnlineStoreEmptyState
          title="No menu links yet"
          description="Build your storefront header menu. Add Home, Shop, About, or custom links."
          action={
            <Button onClick={addItem} className="bg-[#007AFF] hover:bg-[#0071EB]">
              <Plus className="mr-2 h-4 w-4" />
              Add first link
            </Button>
          }
        />
      ) : (
        <DashboardCardSection
          title="Store menu"
          description="Drag to reorder, or use the arrows. Links appear in your storefront header."
          footer={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add link
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#007AFF] hover:bg-[#0071EB]">
                {saving ? "Saving..." : "Save navigation"}
              </Button>
            </div>
          }
          bodyClassName="!p-0"
        >
          <div>
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) reorder(dragId, item.id);
                  setDragId(null);
                }}
                onDragEnd={() => setDragId(null)}
                className={cn(
                  "flex items-center gap-2 border-b border-border/60 px-4 py-3 last:border-0",
                  dragId === item.id && "opacity-50"
                )}
              >
                <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(item.id, "label", e.target.value)}
                  className="flex-1"
                  placeholder="Label"
                />
                <Input
                  value={item.href}
                  onChange={(e) => updateItem(item.id, "href", e.target.value)}
                  className="flex-1"
                  placeholder="/path"
                />
                <div className="flex shrink-0 gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => moveItem(item.id, -1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(item.id, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCardSection>
      )}
    </OnlineStorePageShell>
  );
}
