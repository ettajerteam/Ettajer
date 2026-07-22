"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, ExternalLink, FileText, Home, LayoutGrid, Loader2, Plus, Search, ShoppingBag, Tag, BookOpen, Newspaper, Scale, Mail, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EditorHelpTooltip } from "@/components/website-editor/editor-help-tooltip";
import { EditorPanelSection } from "@/components/website-editor/editor-panel-section";
import { pageContentEquals, parsePageContent, serializePageContent } from "@/lib/page-content";
import {
  convertLegacyPageBodyToSections,
  createInitialPageContent,
  pageHasSectionLayout,
} from "@/lib/page-layout";
import { useCentralBuilderStore } from "@/lib/builder/central-builder-store";
import { isEditorHiddenPageSlug } from "@/lib/editor-system-pages";
import {
  EDITOR_MANAGED_STORE_PAGES,
  resolveManagedStorePageUrl,
  type EditorManagedStorePageDef,
} from "@/lib/editor-pages-config";
import { EditorProductPreviewPicker } from "@/components/website-editor/editor-product-preview-picker";
import { EditorCollectionPreviewPicker } from "@/components/website-editor/editor-collection-preview-picker";
import { EditorBlogPostPreviewPicker } from "@/components/website-editor/editor-blog-post-preview-picker";
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
  previewProductSlug: string;
  onPreviewProductSlugChange: (slug: string) => void;
  previewCollectionSlug: string;
  onPreviewCollectionSlugChange: (slug: string) => void;
  previewBlogPostSlug: string;
  onPreviewBlogPostSlugChange: (slug: string) => void;
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
  previewProductSlug,
  onPreviewProductSlugChange,
  previewCollectionSlug,
  onPreviewCollectionSlugChange,
  previewBlogPostSlug,
  onPreviewBlogPostSlugChange,
}: EditorPagesPanelProps) {
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<PageEditorSnapshot | null>(null);
  const lastSavedPageId = useRef<string | null>(null);
  const seedActivePageLayout = useCentralBuilderStore((s) => s.seedActivePageLayout);
  const draftSectionCount = useCentralBuilderStore((s) => s.draftLayout.sections.length);

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
          if (updates.status === "published") {
            toast.success("Page is live", {
              description: "URL is public. Use Go live for layout changes.",
            });
          } else if (updates.status === "draft") {
            toast.message("Page set to draft", {
              description: "Hidden from your live store until you set it live again.",
            });
          } else {
            toast.success("Page details saved");
          }
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

  async function convertToSections() {
    if (!customPage || converting) return;

    if (draftSectionCount > 0) {
      const ok = window.confirm(
        "This page already has draft sections in the editor. Convert will replace them with your legacy text as editable sections. Continue?"
      );
      if (!ok) return;
    }

    const result = convertLegacyPageBodyToSections(customPage.content, {
      pageTitle: customPage.title,
    });
    if (!result.ok) {
      toast.error(
        result.reason === "already-sections"
          ? "This page already uses sections"
          : "No legacy content to convert"
      );
      return;
    }

    setConverting(true);
    try {
      const res = await fetch(`/api/pages/${customPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to convert page");

      const updated = data.page as StorePageRow;
      onPagesChange(pages.map((p) => (p.id === updated.id ? updated : p)));
      onSelect({ type: "custom", page: updated });
      setSavedSnapshot({ title: updated.title, content: updated.content });
      seedActivePageLayout(result.layout);

      toast.success("Converted to sections", {
        description: "Edit in Layers / Add. Use Go live if you change the layout later.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to convert page");
    } finally {
      setConverting(false);
    }
  }

  const pageUrl = customPage
    ? resolveManagedStorePageUrl(storeSlug, customPage.slug)
    : null;
  const customPages = pages.filter((page) => !isEditorHiddenPageSlug(page.slug));

  async function ensureStorePage(def: EditorManagedStorePageDef) {
    const existing = pages.find((p) => p.slug === def.slug);
    if (existing) {
      onSelect({ type: "custom", page: existing });
      return;
    }
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: def.defaultTitle,
        slug: def.slug,
        content: createInitialPageContent(def.slug, "modern"),
        status: "published",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.message ?? `Failed to create ${def.label.toLowerCase()}`);
      return;
    }
    onPagesChange([data.page, ...pages]);
    onSelect({ type: "custom", page: data.page });
    toast.success(`${def.label} created`);
  }

  const shopPages = EDITOR_MANAGED_STORE_PAGES.filter((p) => p.group === "shop");
  const contentPages = EDITOR_MANAGED_STORE_PAGES.filter((p) => p.group === "content");
  const legalPages = EDITOR_MANAGED_STORE_PAGES.filter((p) => p.group === "legal");
  const discoverPages = EDITOR_MANAGED_STORE_PAGES.filter((p) => p.group === "discover");

  function managedPageActive(slug: string) {
    return active.type === "custom" && active.page.slug === slug;
  }

  function renderManagedButton(def: EditorManagedStorePageDef, icon: ReactNode) {
    return (
      <button
        key={def.slug}
        type="button"
        onClick={() => void ensureStorePage(def)}
        className={pageButtonClass(managedPageActive(def.slug))}
      >
        {icon}
        <span className="min-w-0 flex-1">
          <span className="font-medium">{def.label}</span>
          <span className="block truncate text-[11px] text-neutral-400">{def.subtitle}</span>
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <EditorPanelSection label="Templates" description="Reusable layouts for catalog pages">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelect({ type: "product" })}
            className={pageButtonClass(active.type === "product")}
          >
            <ShoppingBag className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="font-medium">Product template</span>
              <span className="block truncate text-[11px] text-neutral-400">Single product (PDP)</span>
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
              <span className="block truncate text-[11px] text-neutral-400">Single collection page</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelect({ type: "blog-post" })}
            className={pageButtonClass(active.type === "blog-post")}
          >
            <Newspaper className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="font-medium">Blog post</span>
              <span className="block truncate text-[11px] text-neutral-400">Single article layout</span>
            </span>
          </button>
        </div>
      </EditorPanelSection>

      <EditorPanelSection label="Shop" divider>
        <div className="space-y-1">
          {shopPages.map((def) => {
            const icon =
              def.slug === "collections" ? (
                <BookOpen className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
              ) : (
                <LayoutGrid className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
              );
            return renderManagedButton(def, icon);
          })}
        </div>
      </EditorPanelSection>

      <EditorPanelSection label="Content" divider>
        <div className="space-y-1">
          {contentPages.map((def) => {
            const icon =
              def.slug === "about" ? (
                <FileText className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
              ) : def.slug === "contact" ? (
                <Mail className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
              ) : (
                <ImageIcon className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
              );
            return renderManagedButton(def, icon);
          })}
        </div>
      </EditorPanelSection>

      <EditorPanelSection label="Legal" divider>
        <div className="space-y-1">
          {legalPages.map((def) =>
            renderManagedButton(
              def,
              <Scale className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
            )
          )}
        </div>
      </EditorPanelSection>

      <EditorPanelSection label="Discover" divider>
        <div className="space-y-1">
          {discoverPages.map((def) => {
            const icon =
              def.slug === "search" ? (
                <Search className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
              ) : (
                <Newspaper className="h-4 w-4 shrink-0 text-[#007AFF]" aria-hidden />
              );
            return renderManagedButton(def, icon);
          })}
        </div>
      </EditorPanelSection>

      <EditorPanelSection label="Home & custom" divider>
        <div className="space-y-1" role="list" aria-label="Store pages">
          <button
            type="button"
            onClick={() => onSelect({ type: "home" })}
            className={pageButtonClass(active.type === "home")}
          >
            <Home className="h-4 w-4 text-[#007AFF]" aria-hidden />
            <span className="font-medium">Home</span>
          </button>

          {customPages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50/50 px-3 py-4 text-center">
              <FileText className="mx-auto mb-2 h-5 w-5 text-neutral-300" />
              <p className="text-xs font-medium text-neutral-600">No custom pages yet</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Create pages for About, FAQ, policies, and more.
              </p>
            </div>
          ) : (
            customPages.map((page) => (
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

      {active.type === "product" ? (
        <EditorPanelSection label="Preview product" divider>
          <EditorProductPreviewPicker
            value={previewProductSlug}
            onChange={onPreviewProductSlugChange}
          />
        </EditorPanelSection>
      ) : null}

      {active.type === "collection" ? (
        <EditorPanelSection label="Preview collection" divider>
          <EditorCollectionPreviewPicker
            value={previewCollectionSlug}
            onChange={onPreviewCollectionSlugChange}
          />
        </EditorPanelSection>
      ) : null}

      {active.type === "blog-post" ? (
        <EditorPanelSection label="Preview article" divider>
          <EditorBlogPostPreviewPicker
            value={previewBlogPostSlug}
            onChange={onPreviewBlogPostSlugChange}
          />
        </EditorPanelSection>
      ) : null}

      {active.type === "blog-post" ? (
        <EditorPanelSection label="Built-in preview" divider>
          <p className="rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2.5 text-xs text-neutral-600">
            Blog post template — edit sections below like product/collection templates.
            Article title and body still come from your journal post; this layout wraps the page.
          </p>
        </EditorPanelSection>
      ) : null}

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
              <div className="space-y-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
                <p className="text-[11px] leading-relaxed text-amber-900">
                  This page still uses legacy text on the live site. Convert it once to edit with
                  sections like the rest of your store.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1.5 bg-[#007AFF] hover:bg-[#0071EB]"
                  disabled={saving || converting}
                  loading={converting}
                  onClick={() => void convertToSections()}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Convert to sections
                </Button>
              </div>
            ) : (
              <p className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-[11px] text-neutral-500">
                Build this page with sections in <strong>Add</strong> and <strong>Layers</strong>,
                then use toolbar <strong>Go live</strong> to push layout changes to your store.
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
                Save details
              </Button>
              {customPage.status === "published" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={saving}
                  onClick={() => void persistPage({ status: "draft" })}
                >
                  Set as draft
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={saving}
                  onClick={() => void persistPage({ status: "published" })}
                >
                  Set as live page
                </Button>
              )}
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              Page visibility only controls whether this URL is public. Layout and design updates
              go live from the toolbar <strong>Go live</strong> button — one action for the whole
              store.
            </p>
          </div>
        </EditorPanelSection>
      )}
    </div>
  );
}
