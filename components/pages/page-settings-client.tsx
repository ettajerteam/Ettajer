"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SingleImageUpload } from "@/components/catalog/single-image-upload";
import { PageEditNav } from "@/components/pages/page-edit-nav";
import type { StorePageRow } from "@/lib/pages";
import {
  parsePageContent,
  serializePageContent,
  pageKeywordsList,
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

type Status = "draft" | "published";

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface PageSettingsClientProps {
  storeSlug: string;
  page: StorePageRow;
  siblingSlugs: string[];
}

export function PageSettingsClient({
  storeSlug,
  page,
  siblingSlugs,
}: PageSettingsClientProps) {
  const router = useRouter();
  const initial = useMemo(() => parsePageContent(page.content), [page.content]);
  const layoutRef = useRef(initial.layout);
  const bodyRef = useRef(initial.body);

  const [title, setTitle] = useState(page.title);
  const [slugInput, setSlugInput] = useState(page.slug);
  const [status, setStatus] = useState<Status>(
    page.status === "published" ? "published" : "draft"
  );
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial.metaDescription ?? ""
  );
  const [keywords, setKeywords] = useState(initial.keywords ?? "");
  const [ogImage, setOgImage] = useState<string | null>(initial.ogImage ?? null);
  const [noIndex, setNoIndex] = useState(Boolean(initial.noIndex));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const previewSlug = useMemo(() => {
    if (slugInput.trim()) return slugify(slugInput) || page.slug;
    return page.slug;
  }, [slugInput, page.slug]);

  const slugConflict = useMemo(() => {
    const candidate = previewSlug.toLowerCase();
    if (candidate === page.slug.toLowerCase()) return false;
    return siblingSlugs.some((s) => s.toLowerCase() === candidate);
  }, [previewSlug, page.slug, siblingSlugs]);

  const storePath = getStorePageUrl(storeSlug, previewSlug);
  const absolutePageUrl = absoluteUrl(storePath);
  const liveUrl =
    status === "published"
      ? absolutePageUrl
      : `${absolutePageUrl}?preview=true`;

  const bodyPlain = stripHtml(bodyRef.current);
  const googlePreview = useMemo(() => {
    const displayUrl = absolutePageUrl.replace(/^https?:\/\//, "");
    const seoTitle = (metaTitle.trim() || title.trim() || "Untitled").slice(0, 60);
    const seoDescription = (
      metaDescription.trim() ||
      bodyPlain ||
      "Custom page on your Ettajer storefront."
    ).slice(0, 160);
    return {
      url: displayUrl,
      title: seoTitle,
      description: seoDescription,
      titleLen: (metaTitle.trim() || title.trim()).length,
      descLen: (metaDescription.trim() || bodyPlain).length,
    };
  }, [absolutePageUrl, metaTitle, title, metaDescription, bodyPlain]);

  const keywordList = pageKeywordsList(keywords);

  const packContent = useCallback((): string => {
    const data: PageContentData = {
      body: bodyRef.current,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
      keywords: keywords.trim() || undefined,
      ogImage: ogImage?.trim() || undefined,
      noIndex: noIndex || undefined,
      layout: layoutRef.current,
    };
    return serializePageContent(data);
  }, [metaTitle, metaDescription, keywords, ogImage, noIndex]);

  const save = async () => {
    if (!title.trim()) {
      toast.error("Add a title");
      return;
    }
    if (slugConflict) {
      toast.error("That URL handle is already used by another page");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slugInput.trim() || undefined,
          status,
          content: packContent(),
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        page?: StorePageRow;
      };
      if (!res.ok) throw new Error(data.message ?? "Could not save");
      if (data.page) {
        setSlugInput(data.page.slug);
        setStatus(data.page.status === "published" ? "published" : "draft");
        const parsed = parsePageContent(data.page.content);
        layoutRef.current = parsed.layout;
        bodyRef.current = parsed.body;
      }
      setDirty(false);
      toast.success("Settings saved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(absolutePageUrl);
      toast.success("URL copied");
    } catch {
      toast.error("Couldn’t copy");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/pages?id=${page.id}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Delete failed");
      toast.success("Page deleted");
      router.push("/dashboard/pages");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (saving || !title.trim()) return;
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, title, status, slugInput, metaTitle, metaDescription, keywords, ogImage, noIndex]);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div
        className={cn(
          dashboardGlassHeader,
          "-mx-4 px-4 py-2.5 sm:-mx-5 sm:px-5"
        )}
      >
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Link
              href="/dashboard/pages"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-neutral-500 transition hover:bg-black/[0.03] hover:text-neutral-800 dark:hover:bg-white/[0.04]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Pages
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <p className="truncate text-[12px] font-medium text-neutral-800 dark:text-neutral-200">
              {title.trim() || "Page settings"}
            </p>
            {dirty ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                Unsaved
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/25 hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
            >
              <Eye className="h-3.5 w-3.5" />
              {status === "published" ? "View live" : "Preview"}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
            <Button
              loading={saving}
              disabled={!title.trim() || slugConflict}
              className={cn(dashboardPrimaryBtn, "h-8 px-3")}
              onClick={() => void save()}
            >
              Save settings
            </Button>
          </div>
        </div>
      </div>

      <PageEditNav pageId={page.id} active="settings" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Page details</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Title and URL shoppers see on your store.
              </p>
            </div>
            <div className="space-y-3 px-4 py-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="settings-title"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Title
                </Label>
                <Input
                  id="settings-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    markDirty();
                  }}
                  className="h-9 rounded-md border-black/[0.06] text-[13px] font-semibold shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="settings-slug"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  URL handle
                </Label>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-[11px] text-neutral-400">
                    /pages/
                  </span>
                  <Input
                    id="settings-slug"
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
                    className={cn(
                      "h-8 rounded-md border-black/[0.06] font-sans text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10",
                      slugConflict &&
                        "border-amber-400 focus-visible:ring-amber-400/30"
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 shrink-0 rounded-md border-black/[0.06] px-2 shadow-none dark:border-white/10"
                    onClick={() => void copyUrl()}
                    aria-label="Copy URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {slugConflict ? (
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">
                    Another page already uses this handle.
                  </p>
                ) : (
                  <p className="truncate font-sans text-[10px] text-neutral-400">
                    {absolutePageUrl}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-neutral-400" />
                <h2 className={dashboardTitle}>Search engine listing</h2>
              </div>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                How this page appears in Google. Leave blank to use the page
                title and body start.
              </p>
            </div>
            <div className="space-y-3 px-4 py-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="settings-meta-title"
                    className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                  >
                    Meta title
                  </Label>
                  <span
                    className={cn(
                      "text-[10px] tabular-nums",
                      googlePreview.titleLen > 60
                        ? "text-amber-600"
                        : "text-neutral-400"
                    )}
                  >
                    {googlePreview.titleLen}/60
                  </span>
                </div>
                <Input
                  id="settings-meta-title"
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
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="settings-meta-desc"
                    className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                  >
                    Meta description
                  </Label>
                  <span
                    className={cn(
                      "text-[10px] tabular-nums",
                      googlePreview.descLen > 160
                        ? "text-amber-600"
                        : "text-neutral-400"
                    )}
                  >
                    {Math.min(googlePreview.descLen, 999)}/160
                  </span>
                </div>
                <Textarea
                  id="settings-meta-desc"
                  value={metaDescription}
                  onChange={(e) => {
                    setMetaDescription(e.target.value);
                    markDirty();
                  }}
                  rows={3}
                  placeholder="Brief summary for search results…"
                  className="rounded-md border-black/[0.06] text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="settings-keywords"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Keywords
                </Label>
                <Input
                  id="settings-keywords"
                  value={keywords}
                  onChange={(e) => {
                    setKeywords(e.target.value);
                    markDirty();
                  }}
                  placeholder="shipping, COD, Morocco"
                  className="h-8 rounded-md border-black/[0.06] text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
                <p className="text-[10px] text-neutral-400">
                  Optional · separate with commas
                  {keywordList.length > 0
                    ? ` · ${keywordList.length} keyword${keywordList.length === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>

              <div className="rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-[#121212]">
                <p className="mb-1.5 text-[11px] font-medium text-neutral-500">
                  Google preview
                </p>
                <p className="truncate font-sans text-[12px] font-light text-[#202124] dark:text-neutral-400">
                  {googlePreview.url}
                </p>
                <p className="truncate font-sans text-[18px] font-normal leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
                  {googlePreview.title}
                  {googlePreview.titleLen > 60 ? "…" : ""}
                </p>
                <p className="line-clamp-2 font-sans text-[12px] font-light leading-snug text-[#4d5156] dark:text-neutral-500">
                  {googlePreview.description}
                  {googlePreview.descLen > 160 ? "…" : ""}
                </p>
                {noIndex || status === "draft" ? (
                  <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-300">
                    {status === "draft"
                      ? "Draft — not listed until published."
                      : "Indexing is off — search engines won’t list this page."}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Social share image</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Shown when the page is shared on WhatsApp, Facebook, or X.
                Falls back to your store logo if empty.
              </p>
            </div>
            <div className="px-4 py-3 [&_p.text-sm]:text-[11px] [&_p.text-sm]:font-medium [&_p.text-sm]:text-neutral-600">
              <SingleImageUpload
                image={ogImage}
                onChange={(url) => {
                  setOgImage(url);
                  markDirty();
                }}
                label="Share image"
              />
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden border-red-200/80 dark:border-red-500/20")}>
            <div className="border-b border-red-100 px-4 py-2.5 dark:border-red-500/15">
              <h2 className="text-[12px] font-semibold tracking-[-0.02em] text-red-700 dark:text-red-300">
                Danger zone
              </h2>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Delete this page from your store. This can’t be undone.
              </p>
            </div>
            <div className="px-4 py-3">
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-md border-red-200 px-3 text-[12px] text-red-600 shadow-none hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:hover:bg-red-500/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete page
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-16 lg:self-start">
          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Visibility</h2>
            </div>
            <div className="space-y-3 px-4 py-3">
              <div className={dashboardPillGroup}>
                {(
                  [
                    { id: "draft" as const, label: "Draft", icon: EyeOff },
                    { id: "published" as const, label: "Published", icon: Globe },
                  ] as const
                ).map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setStatus(opt.id);
                        markDirty();
                      }}
                      className={cn(
                        dashboardPill,
                        "flex-1 gap-1",
                        status === opt.id
                          ? dashboardPillActive
                          : dashboardPillInactive
                      )}
                    >
                      <Icon className="h-3 w-3 opacity-70" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] leading-relaxed text-neutral-400">
                {status === "published"
                  ? "Anyone with the link can open this page."
                  : "Only you can preview it with ?preview=true."}
              </p>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Indexing</h2>
            </div>
            <div className="px-4 py-3">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={!noIndex}
                  onChange={(e) => {
                    setNoIndex(!e.target.checked);
                    markDirty();
                  }}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-black/20 text-[#007AFF] focus:ring-[#007AFF]/30"
                />
                <span>
                  <span className="block text-[12px] font-medium text-neutral-800 dark:text-neutral-100">
                    Allow search engines
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-relaxed text-neutral-400">
                    When off, we send noindex so Google won’t list this URL.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Content</h2>
            </div>
            <div className="px-4 py-3">
              <p className="text-[10px] leading-relaxed text-neutral-400">
                Edit the page body and rich text on the content tab.
              </p>
              <Link
                href={`/dashboard/pages/${page.id}/edit`}
                className="mt-2 inline-flex h-8 items-center rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/25 hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
              >
                Edit content
              </Link>
            </div>
          </section>

          <Button
            loading={saving}
            disabled={!title.trim() || slugConflict}
            className={cn(dashboardPrimaryBtn, "hidden h-8 w-full lg:inline-flex")}
            onClick={() => void save()}
          >
            Save settings
          </Button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/95 px-3 py-2 backdrop-blur-md dark:border-white/10 dark:bg-[#0A0A0A]/95 sm:hidden">
        <Button
          loading={saving}
          disabled={!title.trim() || slugConflict}
          className={cn(dashboardPrimaryBtn, "h-9 w-full")}
          onClick={() => void save()}
        >
          Save settings
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="w-[min(100vw-1.5rem,360px)] max-w-[360px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10">
          <DialogHeader className="space-y-0 px-3.5 pb-0 pt-3.5 pr-10 text-left">
            <DialogTitle className="text-[13px] font-semibold tracking-[-0.02em]">
              Delete page?
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-[11px] text-neutral-500">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {title.trim() || page.title}
              </span>{" "}
              will be removed. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-1.5 px-3.5 pb-3.5 pt-3">
            <Button
              className="h-7 flex-1 rounded-md bg-red-600 px-2.5 text-[12px] font-medium text-white shadow-none [background-image:none] hover:bg-red-700 hover:scale-100"
              loading={deleting}
              onClick={() => void confirmDelete()}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              className="h-7 rounded-md px-2.5 text-[11px] text-neutral-500"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
