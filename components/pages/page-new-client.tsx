"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  HelpCircle,
  Loader2,
  Mail,
  Scale,
  Shield,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StorePageRow } from "@/lib/pages";
import { serializePageContent } from "@/lib/page-content";
import {
  getPageTemplate,
  PAGE_TEMPLATE_CATEGORIES,
  PAGE_TEMPLATES,
  type PageTemplate,
  type PageTemplateId,
} from "@/lib/page-templates";
import { absoluteUrl } from "@/lib/seo/site-config";
import { getStorePageUrl } from "@/lib/storefront-urls";
import { cn, slugify } from "@/lib/utils";
import {
  dashboardCard,
  dashboardGlassHeader,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";

const RichTextEditor = dynamic(
  () =>
    import("@/components/products/rich-text-editor").then(
      (m) => m.RichTextEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-black/[0.06] bg-white text-[12px] text-neutral-400 dark:border-white/10 dark:bg-[#1C1C1E]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading editor…
      </div>
    ),
  }
);

type Status = "draft" | "published";
type Phase = "choose" | "write";

export type ExistingPageRef = {
  id: string;
  title: string;
  slug: string;
};

const TEMPLATE_ICONS: Record<
  PageTemplateId,
  ComponentType<{ className?: string }>
> = {
  about: Users,
  faq: HelpCircle,
  shipping: Truck,
  contact: Mail,
  privacy: Shield,
  terms: Scale,
};

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface PageNewClientProps {
  storeSlug: string;
  existingPages: ExistingPageRef[];
  initialTemplateId?: string | null;
}

export function PageNewClient({
  storeSlug,
  existingPages,
  initialTemplateId,
}: PageNewClientProps) {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement>(null);
  const starter = getPageTemplate(initialTemplateId);

  const [phase, setPhase] = useState<Phase>(starter ? "write" : "choose");
  const [activeTemplateId, setActiveTemplateId] = useState<PageTemplateId | null>(
    starter?.id ?? null
  );
  const [title, setTitle] = useState(starter?.title ?? "");
  const [slugInput, setSlugInput] = useState(starter?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(starter?.slug));
  const [body, setBody] = useState(starter?.body ?? "");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState(
    starter?.metaDescription ?? ""
  );
  const [status, setStatus] = useState<Status>("draft");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(Boolean(starter));
  const [editorKey, setEditorKey] = useState(0);
  const [seoOpen, setSeoOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | PageTemplate["category"]
  >("all");

  const existingBySlug = useMemo(() => {
    const map = new Map<string, ExistingPageRef>();
    for (const p of existingPages) {
      map.set(p.slug.toLowerCase(), p);
    }
    return map;
  }, [existingPages]);

  const markDirty = useCallback(() => setDirty(true), []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty || phase !== "write") return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty, phase]);

  useEffect(() => {
    if (phase === "write") {
      const t = window.setTimeout(() => titleRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [phase, editorKey]);

  const previewSlug = useMemo(() => {
    if (slugInput.trim()) return slugify(slugInput) || "untitled";
    return slugify(title.trim() || "untitled") || "untitled";
  }, [slugInput, title]);

  const slugConflict = existingBySlug.get(previewSlug.toLowerCase()) ?? null;

  const wordCount = useMemo(() => {
    const text = stripHtml(body);
    if (!text) return 0;
    return text.split(" ").filter(Boolean).length;
  }, [body]);

  const checklist = useMemo(
    () => [
      { id: "title", label: "Title", done: Boolean(title.trim()) },
      { id: "body", label: "Body content", done: wordCount > 0 },
      {
        id: "slug",
        label: "Unique URL",
        done: Boolean(previewSlug && previewSlug !== "untitled" && !slugConflict),
      },
    ],
    [title, wordCount, previewSlug, slugConflict]
  );
  const readyCount = checklist.filter((c) => c.done).length;

  const googlePreview = useMemo(() => {
    const displayUrl = absoluteUrl(
      getStorePageUrl(storeSlug, previewSlug)
    ).replace(/^https?:\/\//, "");
    const seoTitle = (metaTitle.trim() || title.trim() || "Untitled page").slice(
      0,
      60
    );
    const fromMeta = metaDescription.trim();
    const fromBody = stripHtml(body);
    const seoDescription = (
      fromMeta ||
      fromBody ||
      "Custom page on your Ettajer storefront."
    ).slice(0, 160);
    return {
      url: displayUrl,
      title: seoTitle,
      description: seoDescription,
      titleLen: (metaTitle.trim() || title.trim() || "").length,
      descLen: (fromMeta || fromBody).length,
    };
  }, [storeSlug, previewSlug, metaTitle, title, metaDescription, body]);

  const filteredTemplates = useMemo(() => {
    if (categoryFilter === "all") return PAGE_TEMPLATES;
    return PAGE_TEMPLATES.filter((t) => t.category === categoryFilter);
  }, [categoryFilter]);

  const applyTemplate = (template: PageTemplate | null) => {
    if (template) {
      setActiveTemplateId(template.id);
      setTitle(template.title);
      setSlugInput(template.slug);
      setSlugTouched(true);
      setBody(template.body);
      setMetaDescription(template.metaDescription);
      setMetaTitle("");
    } else {
      setActiveTemplateId(null);
      setTitle("");
      setSlugInput("");
      setSlugTouched(false);
      setBody("");
      setMetaDescription("");
      setMetaTitle("");
    }
    setEditorKey((k) => k + 1);
    setDirty(Boolean(template));
    setPhase("write");
    setSeoOpen(false);
  };

  const onTitleChange = (value: string) => {
    setTitle(value);
    markDirty();
    if (!slugTouched) {
      setSlugInput(slugify(value));
    }
  };

  const packContent = () =>
    serializePageContent({
      body,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    });

  const save = async (nextStatus?: Status) => {
    if (!title.trim()) {
      toast.error("Add a title");
      titleRef.current?.focus();
      return;
    }
    if (slugConflict) {
      toast.error(
        `“/${previewSlug}” is already used by “${slugConflict.title}”. Change the URL handle.`
      );
      return;
    }
    const resolvedStatus = nextStatus ?? status;
    setSaving(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: packContent(),
          status: resolvedStatus,
          slug: slugInput.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        page?: StorePageRow;
      };
      if (!res.ok) throw new Error(data.message ?? "Could not create");
      if (!data.page) throw new Error("Missing page");

      setDirty(false);
      toast.success(
        resolvedStatus === "published"
          ? "Page created & published"
          : "Draft created"
      );
      router.replace(`/dashboard/pages/${data.page.id}/edit`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (phase !== "write") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!title.trim() || saving) return;
        void save(status);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, title, status, saving, body, metaTitle, metaDescription, slugInput]);

  if (phase === "choose") {
    return (
      <div className="space-y-4">
        <div
          className={cn(
            dashboardGlassHeader,
            "-mx-4 px-4 py-2.5 sm:-mx-5 sm:px-5"
          )}
        >
          <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Link
                href="/dashboard/pages"
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-neutral-500 transition hover:bg-black/[0.03] hover:text-neutral-800 dark:hover:bg-white/[0.04]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Pages
              </Link>
              <span className="text-neutral-300 dark:text-neutral-600">/</span>
              <p className="truncate text-[12px] font-medium text-neutral-800 dark:text-neutral-200">
                New page
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
              <span className="rounded-full bg-[#007AFF]/10 px-2 py-0.5 font-medium text-[#007AFF]">
                1 · Choose
              </span>
              <ChevronRight className="h-3 w-3" />
              <span>2 · Write</span>
              <ChevronRight className="h-3 w-3" />
              <span>3 · Publish</span>
            </div>
          </div>
        </div>

        <section className={cn(dashboardCard, "overflow-hidden")}>
          <div className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse 70% 80% at 10% 0%, rgba(0,122,255,0.08), transparent 55%), radial-gradient(ellipse 50% 60% at 90% 20%, rgba(0,0,0,0.03), transparent 50%)",
              }}
            />
            <div className="relative max-w-xl">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#007AFF]">
                <Sparkles className="h-3.5 w-3.5" />
                New page
              </p>
              <h1 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-neutral-900 dark:text-white sm:text-[26px]">
                What are you creating?
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                Pick a starter with ready-made copy, or start blank. You can edit
                everything before publishing.
              </p>
            </div>
          </div>
        </section>

        <section className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.05] px-3 py-2.5 dark:border-white/10 sm:px-4">
            <div className={dashboardPillGroup}>
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={cn(
                  dashboardPill,
                  categoryFilter === "all"
                    ? dashboardPillActive
                    : dashboardPillInactive
                )}
              >
                All
              </button>
              {PAGE_TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={cn(
                    dashboardPill,
                    categoryFilter === cat.id
                      ? dashboardPillActive
                      : dashboardPillInactive
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => applyTemplate(null)}
              className="group flex flex-col rounded-[12px] border border-dashed border-black/[0.12] bg-white p-3.5 text-left transition hover:border-[#007AFF]/40 hover:bg-[#007AFF]/[0.03] dark:border-white/15 dark:bg-transparent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F7] text-neutral-500 transition group-hover:bg-[#007AFF]/10 group-hover:text-[#007AFF] dark:bg-white/10">
                <FileText className="h-4 w-4" />
              </span>
              <p className="mt-3 text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                Blank page
              </p>
              <p className="mt-1 text-[11px] leading-snug text-neutral-400">
                Empty title and body — write from scratch.
              </p>
            </button>

            {filteredTemplates.map((t) => {
              const Icon = TEMPLATE_ICONS[t.id];
              const existing = existingBySlug.get(t.slug);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (existing) {
                      router.push(`/dashboard/pages/${existing.id}/edit`);
                      return;
                    }
                    applyTemplate(t);
                  }}
                  className={cn(
                    "group flex flex-col rounded-[12px] border p-3.5 text-left transition",
                    existing
                      ? "border-black/[0.06] bg-[#FAFAFA] dark:border-white/10 dark:bg-white/[0.03]"
                      : "border-black/[0.06] bg-white hover:border-[#007AFF]/35 hover:bg-[#007AFF]/[0.03] dark:border-white/10 dark:bg-transparent dark:hover:bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg transition",
                        existing
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : "bg-[#007AFF]/10 text-[#007AFF] group-hover:bg-[#007AFF]/15"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {existing ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        Exists · Edit
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#F5F5F7] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-neutral-400 dark:bg-white/10">
                        {
                          PAGE_TEMPLATE_CATEGORIES.find(
                            (c) => c.id === t.category
                          )?.label
                        }
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                    {t.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-neutral-400">
                    {t.description}
                  </p>
                  <p className="mt-2 font-sans text-[10px] text-neutral-300 dark:text-neutral-600">
                    /pages/{t.slug}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div
        className={cn(
          dashboardGlassHeader,
          "-mx-4 px-4 py-2.5 sm:-mx-5 sm:px-5"
        )}
      >
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (
                  dirty &&
                  !window.confirm("Leave writing? Unsaved changes will be lost.")
                ) {
                  return;
                }
                setPhase("choose");
                setDirty(false);
              }}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-neutral-500 transition hover:bg-black/[0.03] hover:text-neutral-800 dark:hover:bg-white/[0.04]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Templates
            </button>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <p className="truncate text-[12px] font-medium text-neutral-800 dark:text-neutral-200">
              {activeTemplateId
                ? getPageTemplate(activeTemplateId)?.title ?? "Write"
                : "Blank page"}
            </p>
            {dirty ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                Unsaved
              </span>
            ) : null}
          </div>
          <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
            <div className="me-1 hidden items-center gap-1 text-[10px] text-neutral-400 md:flex">
              <span className="text-neutral-300">1</span>
              <ChevronRight className="h-3 w-3" />
              <span className="rounded-full bg-[#007AFF]/10 px-2 py-0.5 font-medium text-[#007AFF]">
                2 · Write
              </span>
              <ChevronRight className="h-3 w-3" />
              <span>3 · Publish</span>
            </div>
            <Button
              variant="outline"
              loading={saving}
              disabled={!title.trim()}
              className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] shadow-none dark:border-white/10"
              onClick={() => void save("draft")}
            >
              Save draft
            </Button>
            <Button
              loading={saving}
              disabled={!title.trim()}
              className={cn(dashboardPrimaryBtn, "h-8 px-3")}
              onClick={() => void save("published")}
            >
              Create & publish
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="new-page-title"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Title
                </Label>
                <Input
                  ref={titleRef}
                  id="new-page-title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="About us"
                  className="h-11 rounded-lg border-black/[0.06] text-[18px] font-semibold tracking-[-0.03em] shadow-none placeholder:font-normal placeholder:tracking-normal focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
                <p className="font-sans text-[11px] text-neutral-400">
                  /pages/{previewSlug}
                  <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">
                    ·
                  </span>
                  {wordCount} words
                </p>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="new-page-slug"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  URL handle
                </Label>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-[11px] text-neutral-400">
                    /pages/
                  </span>
                  <Input
                    id="new-page-slug"
                    value={slugInput}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlugInput(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, "-")
                          .replace(/-{2,}/g, "-")
                      );
                      markDirty();
                    }}
                    placeholder={slugify(title || "") || "about-us"}
                    className={cn(
                      "h-8 rounded-md border-black/[0.06] font-sans text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10",
                      slugConflict && "border-amber-400 focus-visible:ring-amber-400/30"
                    )}
                  />
                </div>
                {slugConflict ? (
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">
                    Already used by{" "}
                    <Link
                      href={`/dashboard/pages/${slugConflict.id}/edit`}
                      className="font-medium underline"
                    >
                      {slugConflict.title}
                    </Link>
                    . Pick another handle.
                  </p>
                ) : (
                  <p className="text-[10px] text-neutral-400">
                    Auto-fills from the title until you edit it.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Body</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                {activeTemplateId
                  ? "Starter copy loaded — rewrite in your voice."
                  : "Headings, lists, and links for your storefront."}
              </p>
            </div>
            <div className="p-3 sm:p-4">
              <RichTextEditor
                key={editorKey}
                value={body}
                onChange={(html) => {
                  setBody(html);
                  markDirty();
                }}
                placeholder="Write your page content…"
                minHeightClassName="min-h-[320px]"
                className="rounded-[10px] border-black/[0.06] dark:border-white/10"
                variant="full"
              />
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <button
              type="button"
              onClick={() => setSeoOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 border-b border-black/[0.05] px-4 py-2.5 text-left dark:border-white/10"
            >
              <div>
                <h2 className={dashboardTitle}>SEO (optional)</h2>
                <p className={cn(dashboardSubtitle, "mt-0.5")}>
                  Meta title & description for Google
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-neutral-400 transition",
                  seoOpen && "rotate-180"
                )}
              />
            </button>
            {seoOpen ? (
              <div className="space-y-3 px-4 py-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="new-meta-title"
                    className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                  >
                    Meta title
                  </Label>
                  <Input
                    id="new-meta-title"
                    value={metaTitle}
                    onChange={(e) => {
                      setMetaTitle(e.target.value);
                      markDirty();
                    }}
                    placeholder={title.trim() || "Page title"}
                    className="h-8 rounded-md border-black/[0.06] text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="new-meta-desc"
                    className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                  >
                    Meta description
                  </Label>
                  <Textarea
                    id="new-meta-desc"
                    value={metaDescription}
                    onChange={(e) => {
                      setMetaDescription(e.target.value);
                      markDirty();
                    }}
                    rows={3}
                    placeholder="Brief summary for Google…"
                    className="rounded-md border-black/[0.06] text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                  />
                </div>
                <div className="rounded-[10px] border border-black/[0.06] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#121212]">
                  <p className="truncate font-sans text-[11px] font-light text-[#202124] dark:text-neutral-400">
                    {googlePreview.url}
                  </p>
                  <p className="truncate font-sans text-[16px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
                    {googlePreview.title}
                  </p>
                  <p className="line-clamp-2 font-sans text-[11px] font-light text-[#4d5156] dark:text-neutral-500">
                    {googlePreview.description}
                  </p>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Publish</h2>
            </div>
            <div className="space-y-3 px-4 py-3">
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  After create
                </p>
                <div className={dashboardPillGroup}>
                  {(
                    [
                      { id: "draft" as const, label: "Draft" },
                      { id: "published" as const, label: "Published" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setStatus(opt.id);
                        markDirty();
                      }}
                      className={cn(
                        dashboardPill,
                        "flex-1",
                        status === opt.id
                          ? dashboardPillActive
                          : dashboardPillInactive
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-neutral-400">
                  {status === "published"
                    ? "Shoppers can open it as soon as you create."
                    : "Save as draft, polish, then publish from edit."}
                </p>
              </div>
              <Button
                loading={saving}
                disabled={!title.trim() || Boolean(slugConflict)}
                className={cn(dashboardPrimaryBtn, "h-8 w-full")}
                onClick={() => void save(status)}
              >
                {status === "published" ? "Create & publish" : "Create draft"}
              </Button>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <h2 className={dashboardTitle}>Ready</h2>
                <span className="text-[10px] tabular-nums text-neutral-400">
                  {readyCount}/{checklist.length}
                </span>
              </div>
            </div>
            <ul className="space-y-1.5 px-4 py-3">
              {checklist.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-300"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full",
                      item.done
                        ? "bg-emerald-500 text-white"
                        : "bg-black/[0.06] text-transparent dark:bg-white/10"
                    )}
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </section>

          {activeTemplateId ? (
            <section className={cn(dashboardCard, "overflow-hidden")}>
              <div className="px-4 py-3">
                <p className="text-[10px] leading-relaxed text-neutral-400">
                  Using the{" "}
                  <span className="font-medium text-neutral-600 dark:text-neutral-300">
                    {getPageTemplate(activeTemplateId)?.title}
                  </span>{" "}
                  template.
                </p>
                <button
                  type="button"
                  className="mt-2 text-[11px] font-medium text-[#007AFF] hover:underline"
                  onClick={() => {
                    if (
                      dirty &&
                      !window.confirm("Switch template? Current edits will be replaced.")
                    ) {
                      return;
                    }
                    setPhase("choose");
                  }}
                >
                  Change template
                </button>
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/95 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0A0A]/95 sm:hidden">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            loading={saving}
            disabled={!title.trim() || Boolean(slugConflict)}
            className="h-9 flex-1 rounded-md border-black/[0.06] text-[12px] shadow-none dark:border-white/10"
            onClick={() => void save("draft")}
          >
            Draft
          </Button>
          <Button
            loading={saving}
            disabled={!title.trim() || Boolean(slugConflict)}
            className={cn(dashboardPrimaryBtn, "h-9 flex-1")}
            onClick={() => void save("published")}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
