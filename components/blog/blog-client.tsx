"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import { OnlineStoreEmptyState } from "@/components/online-store/online-store-empty-state";
import { dashboardCard } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import type { BlogPostRow } from "@/lib/blog";

export function BlogClient({ initial }: { initial: BlogPostRow[] }) {
  const [posts, setPosts] = useState(initial);
  const [title, setTitle] = useState("");

  async function handleCreate() {
    if (!title.trim()) return;
    const res = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: "", status: "draft" }),
    });
    const data = await res.json();
    if (res.ok) {
      setPosts((prev) => [data.post, ...prev]);
      setTitle("");
      toast.success("Post created");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Deleted");
    }
  }

  return (
    <OnlineStorePageShell>
      <div className="flex max-w-lg gap-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New post title..." />
        <Button onClick={handleCreate} className="shrink-0 bg-[#007AFF] hover:bg-[#007AFF]/90">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className={cn(dashboardCard, posts.length === 0 && "hidden")}>
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between border-b border-border/60 px-5 py-4 last:border-0">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{p.status} · {new Date(p.updatedAt).toLocaleDateString()}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {posts.length === 0 && (
        <OnlineStoreEmptyState
          title="No blog posts yet"
          description="Share stories, guides, and updates with your customers. Your first post appears on your storefront blog."
        />
      )}
    </OnlineStorePageShell>
  );
}
