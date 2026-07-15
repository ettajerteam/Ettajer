"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import { OnlineStoreEmptyState } from "@/components/online-store/online-store-empty-state";
import { dashboardCard } from "@/lib/dashboard-ui";
import type { StorePageRow } from "@/lib/pages";

export function PagesClient({ initial }: { initial: StorePageRow[] }) {
  const [pages, setPages] = useState(initial);
  const [title, setTitle] = useState("");

  async function handleCreate() {
    if (!title.trim()) return;
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: "", status: "draft" }),
    });
    const data = await res.json();
    if (res.ok) {
      setPages((prev) => [data.page, ...prev]);
      setTitle("");
      toast.success("Page created");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/pages?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setPages((prev) => prev.filter((p) => p.id !== id));
      toast.success("Deleted");
    }
  }

  return (
    <OnlineStorePageShell>
      <div className="flex max-w-lg gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New page title..." />
        <Button onClick={handleCreate} className="shrink-0 bg-[#007AFF] hover:bg-[#007AFF]/90">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className={dashboardCard + (pages.length === 0 ? " hidden" : "")}>
        {pages.map((p) => (
          <div key={p.id} className="flex items-center justify-between border-b border-border/60 px-5 py-4 last:border-0">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground">/{p.slug} · {p.status}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {pages.length === 0 && (
        <OnlineStoreEmptyState
          title="No custom pages yet"
          description="Create About, FAQ, or landing pages for your storefront. Pages publish to your live store when ready."
        />
      )}
    </OnlineStorePageShell>
  );
}
