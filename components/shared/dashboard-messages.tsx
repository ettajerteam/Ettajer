"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, Loader2, MessageSquare, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { formatNotificationTime } from "@/lib/dashboard-notifications";
import { cn } from "@/lib/utils";

const BRAND_ICON = "/brand/App-Logo.png";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
};

type SupportPreview = {
  message: string;
  createdAt: string;
};

const FETCH_LIMIT = 24;
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

function EttajerAvatar({ size = 48 }: { size?: number }) {
  const badge = size >= 48 ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <span
        className="flex items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/[0.08] dark:bg-white/95"
        style={{ width: size, height: size }}
      >
        <Image
          src={BRAND_ICON}
          alt="Ettajer"
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>
      <span className="absolute -bottom-0.5 -right-0.5">
        <VerifiedBadge
          className={cn(badge, "ring-2 ring-white dark:ring-[#242526]")}
        />
      </span>
    </span>
  );
}

export function DashboardMessages() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [badgeCleared, setBadgeCleared] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [query, setQuery] = useState("");
  const [ettajerPreview, setEttajerPreview] = useState<SupportPreview | null>(
    null
  );

  const fetchMessages = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const [contactRes, supportRes] = await Promise.all([
        fetch(`/api/contact-submissions?limit=${FETCH_LIMIT}`),
        fetch("/api/support/messages"),
      ]);

      if (contactRes.ok) {
        const data = (await contactRes.json()) as {
          submissions?: ContactMessage[];
          unread?: number;
        };
        const next = Array.isArray(data.submissions) ? data.submissions : [];
        setItems(next);
        const nextUnread = data.unread ?? 0;
        setUnread((prev) => {
          if (nextUnread > prev) setBadgeCleared(false);
          return nextUnread;
        });
      }

      if (supportRes.ok) {
        const data = (await supportRes.json()) as {
          messages?: Array<{ message: string; createdAt: string }>;
        };
        const list = Array.isArray(data.messages) ? data.messages : [];
        const last = list[list.length - 1];
        setEttajerPreview(
          last
            ? { message: last.message, createdAt: last.createdAt }
            : {
                message: "Say hi to the verified Ettajer team",
                createdAt: "",
              }
        );
      }
    } catch {
      // keep last
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages({ silent: true });
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void fetchMessages({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (open) void fetchMessages();
    const ms = open ? 20 * 1000 : 60 * 1000;
    const timer = window.setInterval(() => {
      void fetchMessages({ silent: true });
    }, ms);
    return () => window.clearInterval(timer);
  }, [open, fetchMessages]);

  const hasRedDot = unread > 0 && !badgeCleared;

  const showEttajer = useMemo(() => {
    if (tab === "unread") return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const preview = (ettajerPreview?.message ?? "").toLowerCase();
    return (
      "ettajer".includes(q) ||
      "team".includes(q) ||
      "support".includes(q) ||
      preview.includes(q)
    );
  }, [tab, query, ettajerPreview]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => {
      if (tab === "unread" && m.status !== "new") return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    });
  }, [items, tab, query]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setBadgeCleared(true);
      setTab("all");
      setQuery("");
      void fetchMessages();
    }
  }

  async function markAllRead() {
    await fetch("/api/contact-submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
    setUnread(0);
    setItems((prev) =>
      prev.map((m) => (m.status === "new" ? { ...m, status: "read" } : m))
    );
  }

  async function openItem(item: ContactMessage) {
    if (item.status === "new") {
      await fetch("/api/contact-submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", ids: [item.id] }),
      });
      setItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, status: "read" } : m))
      );
      setUnread((n) => Math.max(0, n - 1));
    }
    setOpen(false);
    router.push(`/dashboard/messages?id=${item.id}`);
  }

  function openEttajer() {
    setOpen(false);
    router.push("/dashboard/messages?chat=ettajer");
  }

  const ettajerTime = ettajerPreview?.createdAt
    ? formatNotificationTime(ettajerPreview.createdAt)
    : "";
  const ettajerText =
    ettajerPreview?.message?.replace(/\s+/g, " ").trim() ||
    "Say hi to the verified Ettajer team";

  const empty =
    !loading && !showEttajer && visibleItems.length === 0;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors duration-200 hover:bg-black/[0.06] hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={hasRedDot ? "New messages" : "Messages"}
        >
          <MessageSquare className="h-4 w-4" />
          {hasRedDot ? (
            <span
              className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#F02849] ring-2 ring-white dark:ring-[#121212]"
              aria-hidden
            />
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        collisionPadding={12}
        className={cn(
          "w-[min(100vw-1rem,360px)] overflow-hidden rounded-[16px] border border-black/[0.06] bg-white p-0",
          "shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18),0_4px_12px_-2px_rgba(0,0,0,0.08)]",
          "dark:border-white/10 dark:bg-[#1C1C1E]",
          "md:w-[400px]"
        )}
      >
        <div className="space-y-2.5 px-3.5 pb-2 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              Chats
            </h2>
            <div className="flex items-center gap-0.5">
              {unread > 0 ? (
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold text-[#007AFF] transition-colors hover:bg-[#007AFF]/10"
                  onClick={() => void markAllRead()}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark all</span>
                </button>
              ) : null}
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />
              ) : null}
            </div>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              className={cn(
                "h-7 rounded-full px-3 text-[12px] font-semibold transition-colors",
                tab === "all"
                  ? "bg-[#E8F2FF] text-[#007AFF] dark:bg-[#007AFF]/20 dark:text-[#5AA7FF]"
                  : "bg-[#F5F5F7] text-neutral-700 hover:bg-[#EFEFF2] dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-white/15"
              )}
              onClick={() => setTab("all")}
            >
              Inbox
            </button>
            <button
              type="button"
              className={cn(
                "h-7 rounded-full px-3 text-[12px] font-semibold transition-colors",
                tab === "unread"
                  ? "bg-[#E8F2FF] text-[#007AFF] dark:bg-[#007AFF]/20 dark:text-[#5AA7FF]"
                  : "bg-[#F5F5F7] text-neutral-700 hover:bg-[#EFEFF2] dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-white/15"
              )}
              onClick={() => setTab("unread")}
            >
              Unread{unread > 0 ? ` · ${unread}` : ""}
            </button>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded-full border-0 bg-[#F5F5F7] pl-9 pr-3 text-[13px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:bg-[#EFEFF2] focus:ring-2 focus:ring-[#007AFF]/20 dark:bg-white/[0.06] dark:text-white dark:focus:bg-white/[0.09]"
            />
          </div>
        </div>

        <div className="max-h-[min(68vh,480px)] overflow-y-auto overscroll-contain px-1.5 pb-1">
          {empty ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7] text-neutral-400 dark:bg-white/10">
                <MessageSquare className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[14px] font-semibold text-neutral-900 dark:text-white">
                {tab === "unread" ? "No unread messages" : "No messages"}
              </p>
              <p className="mt-1 max-w-[240px] text-[12px] leading-snug text-neutral-400">
                Customer contact messages and Ettajer support appear here.
              </p>
            </div>
          ) : null}

          {visibleItems.length === 0 && !showEttajer && loading ? (
            <div className="flex items-center justify-center py-14 text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : null}

          <ul className="space-y-0.5">
            {showEttajer ? (
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                  onClick={openEttajer}
                >
                  <EttajerAvatar size={48} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1">
                        <span className="truncate text-[13px] font-semibold text-neutral-900 dark:text-white">
                          Ettajer team
                        </span>
                        <VerifiedBadge className="h-3 w-3" />
                      </span>
                      {ettajerTime ? (
                        <span className="shrink-0 text-[11px] text-neutral-400">
                          {ettajerTime}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-[12px] text-neutral-500 dark:text-neutral-400">
                      {ettajerText}
                    </span>
                  </span>
                </button>
              </li>
            ) : null}

            {visibleItems.map((item) => {
              const unreadItem = item.status === "new";
              const preview = item.message.replace(/\s+/g, " ").trim();
              const time = formatNotificationTime(item.createdAt);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    onClick={() => void openItem(item)}
                  >
                    <span
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white",
                        avatarColor(item.id)
                      )}
                    >
                      {initials(item.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-[13px] text-neutral-900 dark:text-white",
                            unreadItem ? "font-semibold" : "font-medium"
                          )}
                        >
                          {item.name}
                        </span>
                        {time ? (
                          <span
                            className={cn(
                              "shrink-0 text-[11px]",
                              unreadItem
                                ? "font-semibold text-[#007AFF]"
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
                            "min-w-0 flex-1 truncate text-[12px]",
                            unreadItem
                              ? "font-medium text-neutral-700 dark:text-neutral-200"
                              : "text-neutral-500 dark:text-neutral-400"
                          )}
                        >
                          {preview}
                        </span>
                        {unreadItem ? (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-[#007AFF]"
                            aria-hidden
                          />
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-black/[0.06] px-2 py-2 dark:border-white/10">
          <Link
            href="/dashboard/messages"
            className="flex h-9 items-center justify-center rounded-[10px] text-[13px] font-semibold text-[#007AFF] transition-colors hover:bg-[#007AFF]/10"
            onClick={() => setOpen(false)}
          >
            See all in Messages
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
