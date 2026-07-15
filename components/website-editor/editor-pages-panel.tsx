"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, ExternalLink, FileText, Home, Loader2, Plus, Search, ShoppingBag, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EditorHelpTooltip } from "@/components/website-editor/editor-help-tooltip";
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import { pageContentEquals, parsePageContent, serializePageContent } from "@/lib/page-content";
import { createInitialPageContent, pageHasSectionLayout } from "@/lib/page-layout";
import { getStorePageUrl } from "@/lib/storefront-urls";
import type { EditorPageTarget } from "@/lib/builder/editor-types";
import type { StorePageRow } from "@/lib/pages";
import { cn } from "@/lib/utils";

export type { EditorPageTarget } from "@/lib/builder/editor-types";

interface EditorPagesPanelProps {
  storeSlug: string;
  pages: StorePageRow[];
  active: EditorPageTarget;
  onSelect: (target: EditorPageTarget) => void;
  onPagesChange: (pages: StorePageRow[]) => void;
}

interface PageEditorSnapshot {
  title: string;
  content: string;
}

function StatusChip({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      )}
    >
      {published ? "Live" : "Draft"}
    </span>
  );
}

const pageButtonClass = (isActive: boolean) =>
  cn(
    "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-200",
    isActive
      ? "border-[#007AFF]/30 bg-[#007AFF]/[0.06] ring-1 ring-[#007AFF]/15"
      : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
  );

export function EditorPagesPanel({
  storeSlug,
  pages,
  active,
  onSelect,
  onPagesChange,
}: EditorPagesPanelProps) {
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<PageEditorSnapshot | null>(null);
  const lastSavedPageId = useRef<string | null>(null);

  const customPage = active.type === "custom" ? active.page : null;
  const parsedContent = customPage ? parsePageContent(customPage.content) : null;

  const pageDirty = useMemo(() => {
    if (!customPage || !savedSnapshot) return false;
    return (
      customPage.title !== savedSnapshot.title ||
      !pageContentEquals(customPage.content, savedSnapshot.content)
    );
  }, [customPage, savedSnapshot]);

  useEffect(() => {
    if (!customPage) {
      setSavedSnapshot(null);
      lastSavedPageId.current = null;
      return;
    }
    if (lastSavedPageId.current !== customPage.id) {
      lastSavedPageId.current = customPage.id;
      setSavedSnapshot({ title: customPage.title, content: customPage.content });
    }
  }, [customPage]);

  const persistPage = useCallback(
    async (
      updates: Partial<Pick<StorePageRow, "title" | "content" | "status">>,
      options?: { silent?: boolean }
    ) => {
      if (!customPage) return;
      const isAuto = options?.silent;
      if (isAuto) setAutoSaving(true);
      else setSaving(true);

      try {
        const res = await fetch(`/api/pages/${customPage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? "Failed to save");

        const updated = data.page as StorePageRow;
        onPagesChange(pages.map((p) => (p.id === updated.id ? updated : p)));
        onSelect({ type: "custom", page: updated });
        setSavedSnapshot({ title: updated.title, content: updated.content });

        if (!isAuto) {
          toast.success(updates.status === "published" ? "Page published" : "Page saved");
        }
      } catch (error) {
        if (!isAuto) {
          toast.error(error instanceof Error ? error.message : "Failed to save");
        }
      } finally {
        if (isAuto) setAutoSaving(false);
        else setSaving(false);
      }
    },
    [customPage, onPagesChange, onSelect, pages]
  );

  useEffect(() => {
    if (!pageDirty || !customPage || saving) return;
    const timer = window.setTimeout(() => {
      void persistPage({ title: customPage.title, content: customPage.content }, { silent: true });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [customPage, pageDirty, persistPage, saving]);

  async function createPage() {
    if (!newTitle.trim()) return;
    const slug = newTitle.trim().toLowerCase().replace(/\s+/g, "-");
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        content: createInitialPageContent(slug),
        status: "draft",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message ?? "Failed to create page");
      return;
    }
    onPagesChange([data.page, ...pages]);
    onSelect({ type: "custom", page: data.page });
    setNewTitle("");
    toast.success("Page created");
  }

  const updateCustomPage = (updates: {
    title?: string;
    metaTitle?: string;
    metaDescription?: string;
  }) => {
    if (!customPage) return;
    const current = parsePageContent(customPage.content);
    const next = {
      title: updates.title ?? customPage.title,
      content: serializePageContent({
        body: current.body,
        layout: current.layout,
        metaTitle: updates.metaTitle ?? current.metaTitle,
        metaDescription: updates.metaDescription ?? current.metaDescription,
      }),
    };
    onSelect({ type: "custom", page: { ...customPage, ...next } });
  };

  const hasLegacyBody =
    customPage && parsedContent && parsedContent.body.trim() && !pageHasSectionLayout(customPage.content);

  const pageUrl = customPage ? getStorePageUrl(storeSlug, customPage.slug) : null;

  return (
    <div className="space-y-5">
      <EditorPanelSection label="Your pages" description="Home, commerce templates, and custom pages">
        <div className="space-y-1" role="list" aria-label="Store pages">
          <button
            type="button"
            onClick={() => onSelect({ type: "home" })}
            className={pageButtonClass(active.type === "home")}
          >
            <Home className="h-4 w-4 text-[#007AFF]" aria-hidden />
            <span className="font-medium">Home</span>
          </button>

          <button
            type="button"
            onClick={() => onSelect({ type: "product" })}
            className={pageButtonClass(active.type === "product")}
          >
            <ShoppingBag className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="font-medium">Product template</span>
              <span className="block truncate text-[11px] text-neutral-400">All product pages</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelect({ type: "collection" })}
            className={pageButtonClass(active.type === "collection")}
          >
            <Tag className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="font-medium">Collection template</span>
              <span className="block truncate text-[11px] text-neutral-400">All collection pages</span>
            </span>
          </button>

          {pages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 px-3 py-4 text-center">
              <FileText className="mx-auto mb-2 h-5 w-5 text-neutral-300" />
              <p className="text-xs font-medium text-neutral-600">No custom pages yet</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Create pages for About, FAQ, policies, and more.
              </p>
            </div>
          ) : (
            pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => onSelect({ type: "custom", page })}
                className={pageButtonClass(active.type === "custom" && active.page.id === page.id)}
              >
                <FileText className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 truncate font-medium">
                    {page.title}
                    <StatusChip status={page.status} />
                  </span>
                  <span className="block truncate text-[11px] text-neutral-400">/pages/{page.slug}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </EditorPanelSection>

      <EditorPanelSection label="Create page" divider>
        <div className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void createPage()}
            placeholder="New page title…"
            className="h-9"
            aria-label="New page title"
          />
          <Button
            type="button"
            size="sm"
            className="shrink-0 bg-[#007AFF] hover:bg-[#0071EB]"
            onClick={() => void createPage()}
            aria-label="Create page"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </EditorPanelSection>

      {customPage && parsedContent && (
        <EditorPanelSection label="Edit page" divider>
          <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {pageDirty ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                    Unsaved
                  </span>
                ) : autoSaving ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600">
                    <Check className="h-3 w-3" />
                    Saved
                  </span>
                )}
                <EditorHelpTooltip text="Drafts auto-save 1.5 seconds after you stop typing." />
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <a href={pageUrl ?? "#"} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Preview
                </a>
              </Button>
            </div>

            {pageUrl && (
              <p className="truncate rounded-md border border-neutral-200 bg-white px-2 py-1.5 font-mono text-[11px] text-neutral-500">
                {pageUrl}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="page-title">Title</Label>
              <Input
                id="page-title"
                value={customPage.title}
                onChange={(e) => updateCustomPage({ title: e.target.value })}
              />
            </div>

            {hasLegacyBody ? (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                This page uses legacy text content on the live site. Add sections and publish to
                switch to the section builder.
              </p>
            ) : (
              <p className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-[11px] text-neutral-500">
                Page content is built with sections. Use the <strong>Add</strong> and{" "}
                <strong>Layers</strong> panels to edit blocks, then publish to go live.
              </p>
            )}

            <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-neutral-400" />
                <p className="text-xs font-semibold text-neutral-700">SEO</p>
                <EditorHelpTooltip text="Meta title and description appear in search results and browser tabs." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-meta-title">Meta title</Label>
                <Input
                  id="page-meta-title"
                  value={parsedContent.metaTitle ?? ""}
                  placeholder={customPage.title}
                  onChange={(e) => updateCustomPage({ metaTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-meta-desc">Meta description</Label>
                <Textarea
                  id="page-meta-desc"
                  value={parsedContent.metaDescription ?? ""}
                  placeholder="Brief summary for search engines…"
                  rows={2}
                  onChange={(e) => updateCustomPage({ metaDescription: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving || !pageDirty}
                onClick={() =>
                  void persistPage({ title: customPage.title, content: customPage.content })
                }
              >
                Save draft
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={saving}
                onClick={() =>
                  void persistPage({
                    title: customPage.title,
                    content: customPage.content,
                    status: "published",
                  })
                }
              >
                Publish page
              </Button>
            </div>
          </div>
        </EditorPanelSection>
      )}
    </div>
  );
}
