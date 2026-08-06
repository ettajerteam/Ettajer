"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CheckCheck,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNotificationTime } from "@/lib/dashboard-notifications";
import {
  dashboardCard,
  dashboardPill,
  dashboardPillActive,
  dashboardPillInactive,
  dashboardPrimaryBtn,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
};

type FilterId = "all" | "new" | "archived";

const AVATAR_COLORS = [
  "bg-[#E94057]",
  "bg-[#1877F2]",
  "bg-[#42B72A]",
  "bg-[#F7B928]",
  "bg-[#8A3FFC]",
  "bg-[#FA383E]",
  "bg-[#00A400]",
  "bg-[#EB7F24]",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * 17) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0];
}

export function MessagesPageClient({
  initial,
}: {
  initial: ContactMessage[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");

  const [items, setItems] = useState<ContactMessage[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(
    focusId && initial.some((m) => m.id === focusId)
      ? focusId
      : initial.find((m) => m.status === "new")?.id ?? initial[0]?.id ?? null
  );
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(Boolean(focusId));

  const selected = items.find((m) => m.id === selectedId) ?? null;

  const unreadCount = useMemo(
    () => items.filter((m) => m.status === "new").length,
    [items]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => {
      if (filter === "all" && m.status === "archived") return false;
      if (filter === "new" && m.status !== "new") return false;
      if (filter === "archived" && m.status !== "archived") return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  useEffect(() => {
    if (!focusId) return;
    if (items.some((m) => m.id === focusId)) {
      setSelectedId(focusId);
      setMobileShowDetail(true);
    }
  }, [focusId, items]);

  const markRead = useCallback(async (id: string) => {
    setItems((prev) => {
      const row = prev.find((m) => m.id === id);
      if (!row || row.status !== "new") return prev;
      return prev.map((m) => (m.id === id ? { ...m, status: "read" } : m));
    });
    await fetch("/api/contact-submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", ids: [id] }),
    });
  }, []);

  useEffect(() => {
    if (selectedId) void markRead(selectedId);
  }, [selectedId, markRead]);

  function selectMessage(id: string) {
    setSelectedId(id);
    setMobileShowDetail(true);
    router.replace(`/dashboard/marketing/messages?id=${id}`, { scroll: false });
  }

  async function markAllRead() {
    setBusy(true);
    try {
      await fetch("/api/contact-submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      setItems((prev) =>
        prev.map((m) => (m.status === "new" ? { ...m, status: "read" } : m))
      );
    } finally {
      setBusy(false);
    }
  }

  async function archiveSelected() {
    if (!selected) return;
    setBusy(true);
    try {
      await fetch("/api/contact-submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", ids: [selected.id] }),
      });
      setItems((prev) =>
        prev.map((m) =>
          m.id === selected.id ? { ...m, status: "archived" } : m
        )
      );
      const next = filtered.find((m) => m.id !== selected.id);
      if (next) {
        selectMessage(next.id);
      } else {
        setSelectedId(null);
        setMobileShowDetail(false);
        router.replace("/dashboard/marketing/messages", { scroll: false });
      }
    } finally {
      setBusy(false);
    }
  }

  const filters: { id: FilterId; label: string; count?: number }[] = [
    { id: "all", label: "Inbox" },
    { id: "new", label: "Unread", count: unreadCount },
    {
      id: "archived",
      label: "Archived",
      count: items.filter((m) => m.status === "archived").length,
    },
  ];

  if (items.length === 0) {
    return (
      <div
        className={cn(
          dashboardCard,
          "flex min-h-[min(60vh,480px)] flex-col items-center justify-center px-6 py-16 text-center"
        )}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F3FF] text-[#0866FF]">
          <MessageSquare className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[14px] font-semibold text-neutral-900 dark:text-white">
          No messages yet
        </p>
        <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-neutral-400">
          When shoppers submit your storefront contact form, their messages show
          up here.
        </p>
        <Button asChild size="sm" className={cn(dashboardPrimaryBtn, "mt-4 h-8")}>
          <Link href="/dashboard/website">Open website editor</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        dashboardCard,
        "grid min-h-[min(72vh,640px)] overflow-hidden lg:grid-cols-[minmax(0,340px)_1fr]"
      )}
    >
      {/* List pane */}
      <div
        className={cn(
          "flex min-h-0 flex-col border-black/[0.06] dark:border-white/10",
          "lg:border-r",
          mobileShowDetail ? "hidden lg:flex" : "flex"
        )}
      >
        <div className="shrink-0 space-y-2.5 border-b border-black/[0.06] px-3 pb-2.5 pt-3 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              Inbox
            </h2>
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void markAllRead()}
                className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium text-[#0866FF] hover:bg-[#0866FF]/10 disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
                Mark all
              </button>
            ) : null}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages"
              className="h-8 w-full rounded-md border border-black/[0.06] bg-[#F5F5F7] pl-8 pr-2.5 text-[12px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#007AFF]/35 focus:ring-1 focus:ring-[#007AFF]/25 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={cn(
                  dashboardPill,
                  filter === f.id ? dashboardPillActive : dashboardPillInactive
                )}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {typeof f.count === "number" && f.count > 0 ? (
                  <span className="ml-1 tabular-nums text-neutral-400">
                    {f.count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {filtered.length === 0 ? (
            <li className="px-3 py-10 text-center text-[12px] text-neutral-400">
              Nothing in this folder
            </li>
          ) : null}
          {filtered.map((row) => {
            const unread = row.status === "new";
            const active = selectedId === row.id;
            const preview = row.message.replace(/\s+/g, " ").trim();
            const time = formatNotificationTime(row.createdAt);
            return (
              <li key={row.id} className="border-b border-black/[0.04] last:border-0 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => selectMessage(row.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                    active
                      ? "bg-[#007AFF]/[0.06] dark:bg-[#007AFF]/15"
                      : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
                      avatarColor(row.id)
                    )}
                  >
                    {initials(row.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-[12px] text-neutral-900 dark:text-white",
                          unread ? "font-semibold" : "font-medium"
                        )}
                      >
                        {row.name}
                      </span>
                      {time ? (
                        <span
                          className={cn(
                            "shrink-0 text-[10px]",
                            unread
                              ? "font-medium text-[#0866FF]"
                              : "text-neutral-400"
                          )}
                        >
                          {time}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[11px]",
                          unread
                            ? "font-medium text-neutral-700 dark:text-neutral-200"
                            : "text-neutral-400"
                        )}
                      >
                        {preview}
                      </span>
                      {unread ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#0866FF]" />
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Detail pane */}
      <div
        className={cn(
          "flex min-h-0 flex-col bg-[#FAFAFA] dark:bg-[#141414]",
          mobileShowDetail ? "flex" : "hidden lg:flex"
        )}
      >
        {selected ? (
          <>
            <div className="flex shrink-0 items-center gap-2.5 border-b border-black/[0.06] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#1C1C1E] sm:px-4">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 hover:bg-black/[0.04] lg:hidden dark:hover:bg-white/10"
                aria-label="Back to inbox"
                onClick={() => setMobileShowDetail(false)}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
                  avatarColor(selected.id)
                )}
              >
                {initials(selected.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                  {selected.name}
                </p>
                <p className="truncate text-[11px] text-neutral-400">
                  {selected.email}
                  {selected.status === "archived" ? " · Archived" : null}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  asChild
                  size="sm"
                  className={cn(dashboardPrimaryBtn, "h-8 gap-1.5 px-3")}
                >
                  <a href={`mailto:${selected.email}`}>
                    <Mail className="h-3.5 w-3.5" />
                    Reply
                  </a>
                </Button>
                {selected.status !== "archived" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-md text-[12px]"
                    disabled={busy}
                    onClick={() => void archiveSelected()}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Archive</span>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">
              <div className="mx-auto flex max-w-2xl flex-col">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-1 hover:text-[#007AFF]"
                  >
                    <Mail className="h-3 w-3" />
                    {selected.email}
                  </a>
                  {selected.phone ? (
                    <a
                      href={`tel:${selected.phone}`}
                      className="inline-flex items-center gap-1 hover:text-[#007AFF]"
                    >
                      <Phone className="h-3 w-3" />
                      {selected.phone}
                    </a>
                  ) : null}
                  <span>
                    {new Date(selected.createdAt).toLocaleString("en", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="rounded-[12px] border border-black/[0.06] bg-white px-3.5 py-3.5 dark:border-white/10 dark:bg-[#1C1C1E]">
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-200">
                    {selected.message}
                  </p>
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Via storefront contact form
                </p>
              </div>
            </div>

            <div className="shrink-0 border-t border-black/[0.06] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#1C1C1E] sm:px-4">
              <a
                href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: Your message to the store")}`}
                className="flex h-9 items-center rounded-md border border-black/[0.06] bg-[#F5F5F7] px-3 text-[12px] text-neutral-400 transition-colors hover:border-[#007AFF]/25 hover:text-neutral-600 dark:border-white/10 dark:bg-white/[0.06] dark:hover:text-neutral-200"
              >
                Reply to {selected.name.split(/\s+/)[0] || "customer"}…
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.04] text-neutral-400 dark:bg-white/10">
              <MessageSquare className="h-4 w-4" />
            </span>
            <p className="mt-3 text-[13px] font-semibold text-neutral-900 dark:text-white">
              Select a message
            </p>
            <p className="mt-1 max-w-xs text-[12px] text-neutral-400">
              Choose a conversation from the list to read and reply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
