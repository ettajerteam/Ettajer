"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import { DashboardCardSection } from "@/components/dashboard/dashboard-card-section";
import { cn } from "@/lib/utils";
import {
  isDestinationInMenu,
  type NavItem,
  type StoreMenuDestination,
} from "@/lib/navigation";

const GROUP_LABELS: Record<StoreMenuDestination["group"], string> = {
  core: "Core",
  shop: "Shop",
  content: "Content",
  discover: "Discover",
  legal: "Policies",
  custom: "Your pages",
};

const GROUP_ORDER: StoreMenuDestination["group"][] = [
  "core",
  "shop",
  "content",
  "discover",
  "legal",
  "custom",
];

export function NavigationClient({
  initial,
  destinations,
}: {
  initial: NavItem[];
  destinations: StoreMenuDestination[];
}) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<StoreMenuDestination["group"], StoreMenuDestination[]>();
    for (const dest of destinations) {
      const list = map.get(dest.group) ?? [];
      list.push(dest);
      map.set(dest.group, list);
    }
    return GROUP_ORDER.map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: map.get(group) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [destinations]);

  function updateItem(id: string, field: "label" | "href", value: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function addItem(seed?: Pick<NavItem, "label" | "href">) {
    setItems((prev) => [
      ...prev,
      {
        id: `nav-${Date.now()}`,
        label: seed?.label ?? "New link",
        href: seed?.href ?? "/",
      },
    ]);
  }

  function addDestination(dest: StoreMenuDestination) {
    if (isDestinationInMenu(items, dest.href)) {
      toast.message(`${dest.label} is already in your menu`);
      return;
    }
    setItems((prev) => [
      ...prev,
      { id: `nav-${dest.id}-${Date.now()}`, label: dest.label, href: dest.href },
    ]);
    toast.success(`Added ${dest.label}`);
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
        <DashboardCardSection
          title="Store menu"
          description="These links appear in your storefront header. Reorder, rename, or remove them."
          footer={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => addItem()}>
                <Plus className="mr-2 h-4 w-4" />
                Custom link
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#007AFF] hover:bg-[#0071EB]">
                {saving ? "Saving..." : "Save navigation"}
              </Button>
            </div>
          }
          bodyClassName="!p-0"
        >
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No links in the menu yet. Add pages from the list on the right.
            </div>
          ) : (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCardSection>

        <DashboardCardSection
          title="Available pages"
          description="Everything that already exists for your store — add it to the menu when you want it in the header."
          bodyClassName="!p-0"
        >
          <div className="divide-y divide-border/60">
            {grouped.map((section) => (
              <div key={section.group} className="px-4 py-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {section.label}
                </p>
                <ul className="space-y-1">
                  {section.items.map((dest) => {
                    const inMenu = isDestinationInMenu(items, dest.href);
                    return (
                      <li
                        key={dest.id}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{dest.label}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {dest.description ?? dest.href}
                          </p>
                        </div>
                        {inMenu ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            In menu
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 shrink-0"
                            onClick={() => addDestination(dest)}
                          >
                            <Plus className="mr-1 h-3.5 w-3.5" />
                            Add
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </DashboardCardSection>
      </div>
    </OnlineStorePageShell>
  );
}
