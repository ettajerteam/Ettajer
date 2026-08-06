"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SingleImageUpload } from "@/components/catalog/single-image-upload";
import type { BlogPostRow } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo/site-config";
import {
  getStoreBlogPostUrl,
  getStoreBlogUrl,
} from "@/lib/storefront-urls";
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

interface BlogEditorClientProps {
  storeSlug: string;
  post?: BlogPostRow | null;
}

export function BlogEditorClient({ storeSlug, post }: BlogEditorClientProps) {
  const router = useRouter();
  const isEdit = Boolean(post?.id);

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [image, setImage] = useState<string | null>(post?.image ?? null);
  const [status, setStatus] = useState<Status>(
    post?.status === "published" ? "published" : "draft"
  );
  const [postId, setPostId] = useState<string | null>(post?.id ?? null);
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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
    if (slug) return slug;
    const fromTitle = slugify(title.trim() || "untitled");
    return fromTitle || "untitled";
  }, [slug, title]);

  const liveUrl =
    status === "published" && (slug || post?.slug)
      ? absoluteUrl(
          getStoreBlogPostUrl(storeSlug, slug || post!.slug)
        )
      : null;

  const wordCount = useMemo(() => {
    const text = content
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return 0;
    return text.split(" ").filter(Boolean).length;
  }, [content]);

  const googlePreview = useMemo(() => {
    const displayUrl = absoluteUrl(
      getStoreBlogPostUrl(storeSlug, previewSlug)
    ).replace(/^https?:\/\//, "");

    const seoTitle = (title.trim() || "Untitled post").slice(0, 60);
    const fromExcerpt = excerpt.trim();
    const fromBody = content
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const seoDescription = (
      fromExcerpt ||
      fromBody ||
      "Read this story on your storefront blog."
    ).slice(0, 160);

    return {
      url: displayUrl,
      title: seoTitle,
      description: seoDescription,
      titleLen: (title.trim() || "").length,
      descLen: (fromExcerpt || fromBody || "").length,
    };
  }, [storeSlug, previewSlug, title, excerpt, content]);

  const save = async (nextStatus?: Status) => {
    if (!title.trim()) {
      toast.error("Add a title");
      return;
    }
    const resolvedStatus = nextStatus ?? status;
    setSaving(true);
    try {
      const editing = Boolean(postId);
      const res = await fetch("/api/blog", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postId ?? undefined,
          title: title.trim(),
          excerpt: excerpt.trim() || null,
          content,
          image,
          status: resolvedStatus,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        post?: BlogPostRow;
      };
      if (!res.ok) throw new Error(data.message ?? "Could not save");
      if (!data.post) throw new Error("Missing post");

      setPostId(data.post.id);
      setSlug(data.post.slug);
      setStatus(data.post.status === "published" ? "published" : "draft");
      setDirty(false);

      toast.success(
        resolvedStatus === "published"
          ? editing
            ? "Post published"
            : "Post created & published"
          : editing
            ? "Draft saved"
            : "Draft created"
      );

      if (!editing) {
        router.replace(`/dashboard/blog/${data.post.id}/edit`);
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

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
              href="/dashboard/blog"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-neutral-500 transition hover:bg-black/[0.03] hover:text-neutral-800 dark:hover:bg-white/[0.04]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Posts
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <p className="truncate text-[12px] font-medium text-neutral-800 dark:text-neutral-200">
              {isEdit || postId ? "Edit post" : "Write post"}
            </p>
            {dirty ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                Unsaved
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/25 hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
              >
                <Eye className="h-3.5 w-3.5" />
                View live
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ) : (
              <a
                href={absoluteUrl(getStoreBlogUrl(storeSlug))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-500 transition hover:text-[#007AFF] dark:border-white/10"
              >
                Blog index
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            )}
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="space-y-4 px-4 py-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="blog-write-title"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Title
                </Label>
                <Input
                  id="blog-write-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    markDirty();
                  }}
                  placeholder="Summer COD shipping guide"
                  className="h-11 rounded-lg border-black/[0.06] text-[18px] font-semibold tracking-[-0.03em] shadow-none placeholder:font-normal placeholder:tracking-normal focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
                <p className="font-sans text-[11px] text-neutral-400">
                  /blog/{previewSlug}
                  <span className="mx-1.5 text-neutral-300 dark:text-neutral-600">
                    ·
                  </span>
                  {wordCount} words
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="blog-write-excerpt"
                  className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400"
                >
                  Excerpt
                </Label>
                <Textarea
                  id="blog-write-excerpt"
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    markDirty();
                  }}
                  placeholder="One or two sentences for the blog index and SEO…"
                  rows={2}
                  className="resize-none rounded-md border-black/[0.06] text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10"
                />
              </div>
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Body</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Headings, lists, links, quotes, and more — shown as HTML on your
                storefront.
              </p>
            </div>
            <div className="p-3 sm:p-4">
              <RichTextEditor
                value={content}
                onChange={(html) => {
                  setContent(html);
                  markDirty();
                }}
                placeholder="Tell the story — tips, lookbook notes, sizing guides…"
                minHeightClassName="min-h-[320px]"
                className="rounded-[10px] border-black/[0.06] dark:border-white/10"
                variant="full"
              />
            </div>
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
                    ? "Shoppers can open this post on your storefront blog."
                    : "Drafts stay hidden until you publish."}
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
              <h2 className={dashboardTitle}>Cover image</h2>
              <p className={cn(dashboardSubtitle, "mt-0.5")}>
                Shows in the post hero and blog cards.
              </p>
            </div>
            <div className="px-4 py-3 [&_p.text-sm]:text-[11px] [&_p.text-sm]:font-medium [&_p.text-sm]:text-neutral-600">
              <SingleImageUpload
                image={image}
                onChange={(url) => {
                  setImage(url);
                  markDirty();
                }}
                label="Cover"
              />
            </div>
          </section>

          <section className={cn(dashboardCard, "overflow-hidden")}>
            <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
              <h2 className={dashboardTitle}>Preview</h2>
            </div>
            <div className="px-4 py-3">
              <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.04]">
                <div className="relative h-28 w-full bg-neutral-200 dark:bg-neutral-800">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="280px"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                      <FileText className="h-6 w-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  <p className="absolute bottom-2 left-2 right-2 line-clamp-2 text-[12px] font-semibold text-white">
                    {title.trim() || "Untitled post"}
                  </p>
                </div>
                <div className="space-y-1.5 p-2.5">
                  <p className="line-clamp-2 text-[11px] leading-relaxed text-neutral-500">
                    {excerpt.trim() ||
                      "Excerpt appears on the blog index and in search previews."}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    /blog/{previewSlug}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className={cn(dashboardCard, "overflow-hidden")}>
        <div className="border-b border-black/[0.05] px-4 py-2.5 dark:border-white/10">
          <h2 className={dashboardTitle}>Google preview</h2>
          <p className={cn(dashboardSubtitle, "mt-0.5")}>
            Title ~50–60 characters · description ~150–160
          </p>
        </div>
        <div className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-2">
            <div className="rounded-md bg-[#F5F5F7] px-2.5 py-2 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-neutral-500">Title length</p>
                <p
                  className={cn(
                    "text-[11px] tabular-nums font-medium",
                    googlePreview.titleLen > 60
                      ? "text-amber-600"
                      : "text-neutral-500"
                  )}
                >
                  {googlePreview.titleLen}/60
                </p>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    googlePreview.titleLen > 60
                      ? "bg-amber-500"
                      : "bg-[#007AFF]"
                  )}
                  style={{
                    width: `${Math.min(100, (googlePreview.titleLen / 60) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-md bg-[#F5F5F7] px-2.5 py-2 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] text-neutral-500">Description length</p>
                <p
                  className={cn(
                    "text-[11px] tabular-nums font-medium",
                    googlePreview.descLen > 160
                      ? "text-amber-600"
                      : "text-neutral-500"
                  )}
                >
                  {Math.min(googlePreview.descLen, 999)}/160
                </p>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    googlePreview.descLen > 160
                      ? "bg-amber-500"
                      : "bg-[#007AFF]"
                  )}
                  style={{
                    width: `${Math.min(100, (googlePreview.descLen / 160) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-[10px] leading-snug text-neutral-400">
                Uses excerpt when set; otherwise the start of the body. Drafts
                aren’t indexed until published.
              </p>
            </div>
          </div>

          <div className="rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-[#121212]">
            <div className="mb-1.5 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <p className="text-[11px] font-medium text-neutral-500">
                How it looks in Google
              </p>
            </div>
            <div className="max-w-xl">
              <p className="truncate font-sans text-[12px] font-light leading-tight text-[#202124] dark:text-neutral-400">
                {googlePreview.url}
              </p>
              <p className="truncate font-sans text-[18px] font-normal leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
                {googlePreview.title}
                {title.trim().length > 60 ? "…" : ""}
              </p>
              <p className="line-clamp-2 font-sans text-[12px] font-light leading-snug text-[#4d5156] dark:text-neutral-500">
                {googlePreview.description}
                {(excerpt.trim() || content.replace(/<[^>]+>/g, " ").trim())
                  .length > 160
                  ? "…"
                  : ""}
              </p>
            </div>
            {status === "draft" ? (
              <p className="mt-2 text-[10px] text-amber-700 dark:text-amber-300">
                Draft — Google won’t list this until you publish.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
