"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Clock,
  Copy,
  EyeOff,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OnlineStorePageShell } from "@/components/online-store/online-store-page-shell";
import type { BlogPostRow } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo/site-config";
import {
  getStoreBlogPostUrl,
  getStoreBlogUrl,
} from "@/lib/storefront-urls";
import {
  dashboardCard,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "published" | "draft";
type SortMode = "newest" | "oldest" | "title";

function StatusChip({ status }: { status: string }) {
  const live = status === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        live
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-[#F5F5F7] text-neutral-500 dark:bg-white/10 dark:text-neutral-400"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          live ? "bg-emerald-500" : "bg-neutral-400"
        )}
      />
      {live ? "Published" : "Draft"}
    </span>
  );
}

function formatAbsolute(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(iso: string, nowMs: number) {
  const date = new Date(iso);
  const diffMs = nowMs - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatAbsolute(iso);
}

/** Relative time only after mount — avoids SSR/client clock hydration mismatch. */
function UpdatedLabel({ iso }: { iso: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span suppressHydrationWarning>
      Updated {now == null ? formatAbsolute(iso) : formatRelative(iso, now)}
    </span>
  );
}

function readingMinutes(html: string) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

interface BlogClientProps {
  initial: BlogPostRow[];
  storeSlug: string;
}

export function BlogClient({ initial, storeSlug }: BlogClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initial);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const blogIndexUrl = absoluteUrl(getStoreBlogUrl(storeSlug));
  const deleteTarget = posts.find((p) => p.id === deleteId) ?? null;

  const counts = useMemo(() => {
    const published = posts.filter((p) => p.status === "published").length;
    return {
      all: posts.length,
      published,
      draft: posts.length - published,
    };
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = posts.filter((p) => {
      if (filter === "published" && p.status !== "published") return false;
      if (filter === "draft" && p.status !== "draft") return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? "").toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const aT = new Date(a.updatedAt).getTime();
      const bT = new Date(b.updatedAt).getTime();
      return sort === "oldest" ? aT - bT : bT - aT;
    });
  }, [posts, filter, query, sort]);

  const togglePublish = async (post: BlogPostRow) => {
    const next = post.status === "published" ? "draft" : "published";
    setTogglingId(post.id);
    try {
      const res = await fetch("/api/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, status: next }),
      });
      const data = (await res.json()) as {
        message?: string;
        post?: BlogPostRow;
      };
      if (!res.ok) throw new Error(data.message ?? "Update failed");
      if (data.post) {
        setPosts((prev) =>
          prev.map((p) => (p.id === data.post!.id ? data.post! : p))
        );
      }
      toast.success(next === "published" ? "Published" : "Unpublished");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setTogglingId(null);
    }
  };

  const copyLink = async (post: BlogPostRow) => {
    const url = absoluteUrl(getStoreBlogPostUrl(storeSlug, post.slug));
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn’t copy link");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blog?id=${deleteId}`, { method: "DELETE" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Delete failed");
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
      setDeleteId(null);
      toast.success("Post deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const filterOptions = [
    {
      id: "all" as const,
      label: "Total",
      value: counts.all,
      hint: "All posts",
    },
    {
      id: "published" as const,
      label: "Live",
      value: counts.published,
      hint: "On storefront",
    },
    {
      id: "draft" as const,
      label: "Drafts",
      value: counts.draft,
      hint: "Not public",
    },
  ] as const;

  const activeFilter =
    filterOptions.find((o) => o.id === filter) ?? filterOptions[0];

  return (
    <OnlineStorePageShell>
      <div className="space-y-4">
        {/* Overview */}
        <section className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <h2 className={dashboardTitle}>Journal</h2>
              <p className={cn(dashboardSubtitle, "mt-1 max-w-md")}>
                Stories for your storefront blog — drafts stay private until you
                publish.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <a
                href={blogIndexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-black/[0.06] px-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/25 hover:text-[#007AFF] dark:border-white/10 dark:text-neutral-300"
              >
                View blog
                <ExternalLink className="h-3 w-3" />
              </a>
              <Button
                onClick={() => router.push("/dashboard/blog/new")}
                className={cn(dashboardPrimaryBtn, "h-8 px-3")}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Write post
              </Button>
            </div>
          </div>
        </section>

        {/* Toolbar + list */}
        <section className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-wrap items-center gap-2 border-b border-black/[0.05] px-3 py-2.5 dark:border-white/10 sm:px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-8 min-w-[7.5rem] items-center justify-between gap-2 rounded-md border border-black/[0.06] bg-white px-2.5 text-left text-[11px] font-medium text-neutral-700 transition hover:border-black/[0.1] dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate">{activeFilter.label}</span>
                    <span className="tabular-nums text-neutral-400">
                      {activeFilter.value}
                    </span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[220px] rounded-xl border-black/[0.06] p-1 shadow-lg dark:border-white/10"
              >
                {filterOptions.map((opt) => (
                  <DropdownMenuItem
                    key={opt.id}
                    className="cursor-pointer rounded-lg px-2.5 py-2 focus:bg-[#F5F5F7] dark:focus:bg-white/[0.06]"
                    onClick={() => setFilter(opt.id)}
                  >
                    <div className="flex w-full items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                          {opt.label}
                        </p>
                        <p className="mt-0.5 text-[10px] text-neutral-400">
                          {opt.hint}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="text-[13px] font-semibold tabular-nums tracking-[-0.02em] text-neutral-800 dark:text-neutral-100">
                          {opt.value}
                        </span>
                        {filter === opt.id ? (
                          <Check className="h-3.5 w-3.5 text-[#007AFF]" />
                        ) : (
                          <span className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className={cn(dashboardPillGroup, "hidden sm:inline-flex")}>
              {(
                [
                  { id: "newest" as const, label: "Newest" },
                  { id: "oldest" as const, label: "Oldest" },
                  { id: "title" as const, label: "A–Z" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSort(opt.id)}
                  className={cn(
                    dashboardPill,
                    "inline-flex items-center gap-1",
                    sort === opt.id
                      ? dashboardPillActive
                      : dashboardPillInactive
                  )}
                >
                  {opt.id === "newest" ? (
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  ) : null}
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[10rem] flex-1 sm:max-w-xs sm:ms-auto">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, excerpt, slug…"
                className="h-8 rounded-md border-black/[0.06] bg-white pl-8 pr-8 text-[12px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-white/[0.04]"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-700"
                  onClick={() => setQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007AFF]/10 text-[#007AFF]">
                <FileText className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {posts.length === 0
                  ? "Start your journal"
                  : "No posts match"}
              </h3>
              <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-neutral-500">
                {posts.length === 0
                  ? "Share sizing guides, COD tips, and lookbooks. Published posts appear on your storefront at /blog."
                  : "Try another filter, sort, or clear the search."}
              </p>
              {posts.length === 0 ? (
                <div className="mx-auto mt-5 grid max-w-lg gap-2 text-left sm:grid-cols-3">
                  {[
                    "COD shipping tips",
                    "Sizing guide",
                    "Lookbook story",
                  ].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => router.push("/dashboard/blog/new")}
                      className="rounded-[10px] border border-dashed border-black/[0.08] bg-[#FAFAFA] px-3 py-2.5 text-[11px] font-medium text-neutral-600 transition hover:border-[#007AFF]/30 hover:bg-[#007AFF]/5 hover:text-[#007AFF] dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-4 h-8 rounded-md border-black/[0.06] px-3 text-[12px] shadow-none dark:border-white/10"
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                >
                  Reset filters
                </Button>
              )}
              {posts.length === 0 ? (
                <Button
                  onClick={() => router.push("/dashboard/blog/new")}
                  className={cn(dashboardPrimaryBtn, "mt-4 h-8 px-3")}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Write first post
                </Button>
              ) : null}
            </div>
          ) : (
            <ul>
              {filtered.map((post, i) => {
                const liveUrl =
                  post.status === "published"
                    ? absoluteUrl(getStoreBlogPostUrl(storeSlug, post.slug))
                    : null;
                const mins = readingMinutes(post.content ?? "");

                return (
                  <li
                    key={post.id}
                    className={cn(
                      "group relative flex items-stretch gap-0 transition-colors hover:bg-[#FAFAFA] dark:hover:bg-white/[0.025]",
                      i < filtered.length - 1 &&
                        "border-b border-black/[0.04] dark:border-white/5"
                    )}
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3.5 px-3 py-3 text-left sm:px-4"
                      onClick={() =>
                        router.push(`/dashboard/blog/${post.id}/edit`)
                      }
                    >
                      <PostCover post={post} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 group-hover:text-[#007AFF] dark:text-white">
                            {post.title}
                          </p>
                          <StatusChip status={post.status} />
                        </div>
                        {post.excerpt ? (
                          <p className="mt-1 line-clamp-1 text-[12px] leading-snug text-neutral-500">
                            {post.excerpt}
                          </p>
                        ) : (
                          <p className="mt-1 line-clamp-1 text-[12px] italic text-neutral-400">
                            No excerpt yet
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-neutral-400">
                          <span className="font-sans">/blog/{post.slug}</span>
                          <span className="text-neutral-300 dark:text-neutral-600">
                            ·
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {mins} min read
                          </span>
                          <span className="text-neutral-300 dark:text-neutral-600">
                            ·
                          </span>
                          <UpdatedLabel iso={post.updatedAt} />
                        </div>
                      </div>
                    </button>

                    <div
                      className="flex shrink-0 items-center pr-2 sm:pr-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={togglingId === post.id}
                            className="h-8 w-8 rounded-md text-neutral-400 opacity-70 transition hover:bg-black/[0.04] hover:text-neutral-700 group-hover:opacity-100 dark:hover:bg-white/[0.06] dark:hover:text-neutral-200"
                            aria-label="Post actions"
                          >
                            {togglingId === post.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl border-black/[0.06] p-1 shadow-lg dark:border-white/10"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-lg text-[12px]"
                            onClick={() =>
                              router.push(`/dashboard/blog/${post.id}/edit`)
                            }
                          >
                            <Pencil className="h-3.5 w-3.5 text-neutral-400" />
                            Edit
                          </DropdownMenuItem>
                          {liveUrl ? (
                            <DropdownMenuItem
                              className="cursor-pointer gap-2 rounded-lg text-[12px]"
                              onClick={() =>
                                window.open(
                                  liveUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                            >
                              <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                              View live
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-lg text-[12px]"
                            onClick={() => void copyLink(post)}
                          >
                            <Copy className="h-3.5 w-3.5 text-neutral-400" />
                            Copy link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-lg text-[12px]"
                            disabled={togglingId === post.id}
                            onClick={() => void togglePublish(post)}
                          >
                            {post.status === "published" ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5 text-neutral-400" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Globe className="h-3.5 w-3.5 text-neutral-400" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1 bg-black/[0.06] dark:bg-white/10" />
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 rounded-lg text-[12px] text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-500/10"
                            onClick={() => setDeleteId(post.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {filtered.length > 0 ? (
          <p className="px-1 text-center text-[10px] text-neutral-400">
            Showing {filtered.length} of {posts.length} post
            {posts.length === 1 ? "" : "s"}
          </p>
        ) : null}
      </div>

      <Dialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent
          className={cn(
            "w-[min(100vw-1.5rem,380px)] max-w-[380px] gap-0 overflow-hidden rounded-2xl border-black/[0.06] p-0 shadow-xl dark:border-white/10"
          )}
        >
          <DialogHeader className="space-y-0 px-4 pb-0 pt-4 pr-12 text-left">
            <DialogTitle className="text-[14px] font-semibold tracking-[-0.02em]">
              Delete post?
            </DialogTitle>
            <DialogDescription className="mt-1 text-[12px] text-neutral-500">
              {deleteTarget ? (
                <>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {deleteTarget.title}
                  </span>{" "}
                  will be removed from your storefront. This can’t be undone.
                </>
              ) : (
                "This removes the post from your storefront. You can’t undo this."
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteTarget?.image ? (
            <div className="relative mx-4 mt-3 h-24 overflow-hidden rounded-[10px] bg-[#F5F5F7]">
              <Image
                src={deleteTarget.image}
                alt=""
                fill
                className="object-cover opacity-90"
                sizes="340px"
                unoptimized
              />
            </div>
          ) : null}
          <div className="flex gap-1.5 px-4 pb-4 pt-3">
            <Button
              className="h-8 flex-1 rounded-md bg-red-600 px-2.5 text-[12px] font-medium text-white shadow-none [background-image:none] hover:bg-red-700 hover:scale-100"
              loading={deleting}
              onClick={() => void confirmDelete()}
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              className="h-8 rounded-md px-2.5 text-[11px] text-neutral-500"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </OnlineStorePageShell>
  );
}

function PostCover({ post }: { post: BlogPostRow }) {
  if (post.image) {
    return (
      <div className="relative h-[4.25rem] w-[5.75rem] shrink-0 overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.04]">
        <Image
          src={post.image}
          alt=""
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="92px"
          unoptimized
        />
      </div>
    );
  }
  return (
    <div className="flex h-[4.25rem] w-[5.75rem] shrink-0 items-center justify-center rounded-[10px] border border-dashed border-black/[0.08] bg-[#F5F5F7] text-neutral-400 dark:border-white/10 dark:bg-white/[0.04]">
      <FileText className="h-4 w-4" />
    </div>
  );
}
