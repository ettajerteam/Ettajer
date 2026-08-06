"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Eye,
  Layers,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageEditNav } from "@/components/pages/page-edit-nav";
import type { StorePageRow } from "@/lib/pages";
import {
  parsePageContent,
  serializePageContent,
  type PageContentData,
} from "@/lib/page-content";
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

interface PageEditorClientProps {
  storeSlug: string;
  page?: StorePageRow | null;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function PageEditorClient({
  storeSlug,
  page,
}: PageEditorClientProps) {
  const router = useRouter();
  const isEdit = Boolean(page?.id);

  const initialParsed = useMemo(
    () => parsePageContent(page?.content ?? ""),
    [page?.content]
  );

  const layoutRef = useRef(initialParsed.layout);
  const seoExtrasRef = useRef({
    metaTitle: initialParsed.metaTitle,
    metaDescription: initialParsed.metaDescription,
    keywords: initialParsed.keywords,
    ogImage: initialParsed.ogImage,
    noIndex: initialParsed.noIndex,
  });
  const [title, setTitle] = useState(page?.title ?? "");
  const [slugInput, setSlugInput] = useState(page?.slug ?? "");
  const [body, setBody] = useState(initialParsed.body || "");
  const [status, setStatus] = useState<Status>(
    page?.status === "published" ? "published" : "draft"
  );
  const [pageId, setPageId] = useState<string | null>(page?.id ?? null);
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const hasSectionLayout = Boolean(layoutRef.current?.sections?.length);

  const markDirty = useCallback(() => setDirty(true), []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const packContent = useCallback((): string => {
    const data: PageContentData = {
      body,
      metaTitle: seoExtrasRef.current.metaTitle,
      metaDescription: seoExtrasRef.current.metaDescription,
      keywords: seoExtrasRef.current.keywords,
      ogImage: seoExtrasRef.current.ogImage,
      noIndex: seoExtrasRef.current.noIndex,
      layout: layoutRef.current,
    };
    return serializePageContent(data);
  }, [body]);

  const previewSlug = useMemo(() => {
    if (slugInput.trim()) return slugify(slugInput) || "untitled";
    if (slug) return slug;
    return slugify(title.trim() || "untitled") || "untitled";
  }, [slugInput, slug, title]);

  const liveUrl =
    status === "published" && (slug || page?.slug)
      ? absoluteUrl(getStorePageUrl(storeSlug, slug || page!.slug))
      : null;
  const previewUrl = pageId
    ? `${absoluteUrl(getStorePageUrl(storeSlug, slug || page?.slug || previewSlug))}?preview=true`
    : null;

  const wordCount = useMemo(() => {
    const text = stripHtml(body);
    if (!text) return 0;
    return text.split(" ").filter(Boolean).length;
  }, [body]);

  const checklist = useMemo(
    () => [
      { id: "title", label: "Title", done: Boolean(title.trim()) },
      { id: "body", label: "Body content", done: wordCount > 0 || hasSectionLayout },
      { id: "slug", label: "URL handle", done: Boolean(previewSlug && previewSlug !== "untitled") },
    ],
    [title, wordCount, hasSectionLayout, previewSlug]
  );
  const readyCount = checklist.filter((c) => c.done).length;

  const save = async (nextStatus?: Status) => {
    if (!title.trim()) {
      toast.error("Add a title");
      return;
    }
    const resolvedStatus = nextStatus ?? status;
    setSaving(true);
    try {
      const editing = Boolean(pageId);
      const payload = {
        title: title.trim(),
        content: packContent(),
        status: resolvedStatus,
        slug: slugInput.trim() || undefined,
      };

      const res = await fetch(
        editing ? `/api/pages/${pageId}` : "/api/pages",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as {
        message?: string;
        page?: StorePageRow;
      };
      if (!res.ok) throw new Error(data.message ?? "Could not save");
      if (!data.page) throw new Error("Missing page");

      setPageId(data.page.id);
      setSlug(data.page.slug);
      setSlugInput(data.page.slug);
      setStatus(data.page.status === "published" ? "published" : "draft");
      const parsed = parsePageContent(data.page.content);
      layoutRef.current = parsed.layout;
      seoExtrasRef.current = {
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        keywords: parsed.keywords,
        ogImage: parsed.ogImage,
        noIndex: parsed.noIndex,
      };
      setDirty(false);

      toast.success(
        resolvedStatus === "published"
          ? editing
            ? "Page published"
            : "Page created & published"
          : editing
            ? "Draft saved"
            : "Draft created"
      );

      if (!editing) {
        router.replace(`/dashboard/pages/${data.page.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!title.trim() || saving) return;
        void save(status);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save closes over latest fields
  }, [title, status, saving, body, slugInput, pageId]);

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
            <Link
              href="/dashboard/pages"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-neutral-500 transition hover:bg-black/[0.03] hover:text-neutral-800 dark:hover:bg-white/[0.04]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Pages
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <p className="truncate text-[12px] font-medium text-neutral-800 dark:text-neutral-200">
              {isEdit || pageId ? "Edit page" : "New page"}
            </p>
            {dirty ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                Unsaved
              </span>
            ) : null}
          </div>
          <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/25 hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ) : null}
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/25 hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
              >
                View live
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ) : null}
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
              {status === "published" ? "Update & publish" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {pageId ? <PageEditNav pageId={pageId} active="content" /> : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          {hasSectionLayout ? (
            <div className="flex items-start gap-2 rounded-[10px] border border-[#007AFF]/20 bg-[#007AFF]/5 px-3 py-2.5 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
              <Layers className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#007AFF]" />
              <p>
                This page has a{" "}
                <strong className="font-semibold text-neutral-800 dark:text-white">
                  visual builder layout
                </strong>
                . Saving here keeps that layout and updates title, SEO, and
                article body. Edit sections in{" "}
                <Link
                  href="/dashboard/themes"
                  className="font-medium text-[#007AFF] hover:underline"
                >
                  Themes
                </Link>
                .
              </p>
            </div>
          ) : null}

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="page-title"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Title
                </Label>
                <Input
                  id="page-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    markDirty();
                  }}
                  placeholder="About us"
                  className="h-11 rounded-lg border-black/[0.06] text-[18px] font-semibold tracking-[-0.03em] shadow-none placeholder:font-normal placeholder:tracking-normal focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
                <p className="font-sans text-[11px] text-neutral-400">
                  /pages/{previewSlug}
                  <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">
                    ·
                  </span>
                  {wordCount} words
                  <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">
                    ·
                  </span>
                  <span className="text-neutral-400">⌘/Ctrl+S to save</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="page-slug"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  URL handle
                </Label>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-[11px] text-neutral-400">
                    /pages/
                  </span>
                  <Input
                    id="page-slug"
                    value={slugInput}
                    onChange={(e) => {
                      setSlugInput(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]+/g, "-")
                          .replace(/-{2,}/g, "-")
                      );
                      markDirty();
                    }}
                    placeholder={slugify(title || "") || "about-us"}
                    className="h-8 rounded-md border-black/[0.06] font-sans text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Body</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Headings, lists, links, and quotes — shown as HTML on your
                storefront.
              </p>
            </div>
            <div className="p-3 sm:p-4">
              <RichTextEditor
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

          {pageId ? (
            <section className={cn(dashboardCard, "overflow-hidden")}>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <h2 className={dashboardTitle}>SEO & settings</h2>
                  <p className={cn(dashboardSubtitle, "mt-0.5")}>
                    Meta title, description, indexing, social image, and more.
                  </p>
                </div>
                <Link
                  href={`/dashboard/pages/${pageId}/settings`}
                  className="inline-flex h-8 items-center rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/25 hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
                >
                  Open settings
                </Link>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Publish</h2>
            </div>
            <div className="space-y-3 px-4 py-3">
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                  Status
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
                    ? "Shoppers can open this page on your storefront."
                    : "Drafts stay hidden — use Preview to check before going live."}
                </p>
              </div>
              <Button
                loading={saving}
                disabled={!title.trim()}
                className={cn(dashboardPrimaryBtn, "h-8 w-full")}
                onClick={() => void save(status)}
              >
                {status === "published" ? "Save published" : "Save draft"}
              </Button>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <h2 className={dashboardTitle}>Ready checklist</h2>
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

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Add to menu</h2>
            </div>
            <div className="px-4 py-3">
              <p className="text-[10px] leading-relaxed text-neutral-400">
                After publishing, link this page from your store nav.
              </p>
              <Link
                href="/dashboard/themes"
                className="mt-2 inline-flex h-8 items-center rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/25 hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
              >
                Open Themes
              </Link>
            </div>
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/95 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0A0A]/95 sm:hidden">
        <div className="flex items-center gap-1.5">
          {previewUrl ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/[0.06] text-neutral-600 dark:border-white/10"
              aria-label="Preview"
            >
              <Eye className="h-4 w-4" />
            </a>
          ) : null}
          <Button
            variant="outline"
            loading={saving}
            disabled={!title.trim()}
            className="h-9 flex-1 rounded-md border-black/[0.06] text-[12px] shadow-none dark:border-white/10"
            onClick={() => void save("draft")}
          >
            Draft
          </Button>
          <Button
            loading={saving}
            disabled={!title.trim()}
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
