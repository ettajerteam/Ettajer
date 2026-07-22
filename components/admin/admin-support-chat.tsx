"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  CircleDot,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SUPPORT_MESSAGE_DIRECTION,
  SUPPORT_MESSAGE_STATUS,
} from "@/lib/admin/constants";
import type {
  SupportConversation,
  SupportMessageRow,
} from "@/lib/admin/support-inbox-shared";
import { groupSupportConversations } from "@/lib/admin/support-inbox-shared";

type FilterId = "all" | "unread" | "reviewing" | "archived";

const QUICK_REPLIES = [
  {
    id: "reviewing",
    label: "Under review",
    text: "Hi — thanks for writing in. We’ve received your request and it’s under review by Ettajer Support. We’ll follow up by email as soon as we have an update.",
  },
  {
    id: "name",
    label: "Name update",
    text: "Hi — we studied your name correction request. Please use the secure link we sent by email to update your official name on your account and founder card. If you didn’t receive it, reply here and we’ll resend.",
  },
  {
    id: "resolved",
    label: "Resolved",
    text: "Hi — your request has been handled. If anything still looks wrong, reply to this email and we’ll take another look.",
  },
] as const;

function asDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(asDate(value));
}

function formatDayLabel(value: string | Date) {
  const d = asDate(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

function statusLabel(status: string) {
  switch (status) {
    case SUPPORT_MESSAGE_STATUS.NEW:
      return "New";
    case SUPPORT_MESSAGE_STATUS.REVIEWING:
      return "Reviewing";
    case SUPPORT_MESSAGE_STATUS.READ:
      return "Read";
    case SUPPORT_MESSAGE_STATUS.RESOLVED:
      return "Resolved";
    case SUPPORT_MESSAGE_STATUS.ARCHIVED:
      return "Archived";
    default:
      return status;
  }
}

function statusTone(status: string) {
  switch (status) {
    case SUPPORT_MESSAGE_STATUS.NEW:
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200";
    case SUPPORT_MESSAGE_STATUS.REVIEWING:
      return "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-200";
    case SUPPORT_MESSAGE_STATUS.RESOLVED:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200";
    case SUPPORT_MESSAGE_STATUS.ARCHIVED:
      return "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300";
    default:
      return "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300";
  }
}

interface AdminSupportChatProps {
  initialMessages: SupportMessageRow[];
}

export function AdminSupportChat({ initialMessages }: AdminSupportChatProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Soft auto-refresh so new emails appear without a full reload ritual
  useEffect(() => {
    const id = window.setInterval(() => {
      startTransition(() => router.refresh());
    }, 30000);
    return () => window.clearInterval(id);
  }, [router, startTransition]);

  const conversations = useMemo(
    () => groupSupportConversations(messages),
    [messages]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "unread" && c.unreadCount === 0) return false;
      if (
        filter === "reviewing" &&
        c.status !== SUPPORT_MESSAGE_STATUS.REVIEWING &&
        !c.messages.some((m) => m.status === SUPPORT_MESSAGE_STATUS.REVIEWING)
      ) {
        return false;
      }
      if (
        filter === "archived" &&
        c.status !== SUPPORT_MESSAGE_STATUS.ARCHIVED
      ) {
        return false;
      }
      if (!q) return true;
      return (
        c.email.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.lastTopic.toLowerCase().includes(q) ||
        c.lastPreview.toLowerCase().includes(q)
      );
    });
  }, [conversations, filter, query]);

  const [activeEmail, setActiveEmail] = useState<string | null>(
    filtered[0]?.email ?? null
  );

  useEffect(() => {
    if (!activeEmail && filtered[0]) setActiveEmail(filtered[0].email);
    if (activeEmail && !filtered.some((c) => c.email === activeEmail)) {
      setActiveEmail(filtered[0]?.email ?? null);
    }
  }, [filtered, activeEmail]);

  const active: SupportConversation | null =
    filtered.find((c) => c.email === activeEmail) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, activeEmail]);

  const filterCounts = useMemo(
    () => ({
      all: conversations.length,
      unread: conversations.filter((c) => c.unreadCount > 0).length,
      reviewing: conversations.filter(
        (c) =>
          c.status === SUPPORT_MESSAGE_STATUS.REVIEWING ||
          c.messages.some((m) => m.status === SUPPORT_MESSAGE_STATUS.REVIEWING)
      ).length,
      archived: conversations.filter(
        (c) => c.status === SUPPORT_MESSAGE_STATUS.ARCHIVED
      ).length,
    }),
    [conversations]
  );

  async function patchStatus(messageId: string, status: string) {
    setError("");
    const res = await fetch(`/api/admin/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Could not update status");
      return false;
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status } : m))
    );
    startTransition(() => router.refresh());
    return true;
  }

  async function markThreadRead(thread: SupportConversation) {
    const inbound = thread.messages.filter(
      (m) =>
        m.direction !== SUPPORT_MESSAGE_DIRECTION.OUTBOUND &&
        (m.status === SUPPORT_MESSAGE_STATUS.NEW ||
          m.status === SUPPORT_MESSAGE_STATUS.REVIEWING)
    );
    if (inbound.length === 0) return;

    setMessages((prev) =>
      prev.map((m) =>
        inbound.some((i) => i.id === m.id)
          ? { ...m, status: SUPPORT_MESSAGE_STATUS.READ }
          : m
      )
    );

    await Promise.all(
      inbound.map((m) =>
        fetch(`/api/admin/messages/${m.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: SUPPORT_MESSAGE_STATUS.READ }),
        })
      )
    );
    startTransition(() => router.refresh());
  }

  async function sendReply() {
    if (!active || !reply.trim()) return;
    setSending(true);
    setError("");
    const body = reply.trim();
    try {
      const res = await fetch("/api/admin/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: active.email,
          name: active.name,
          topic: active.lastTopic,
          message: body,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Failed to send reply");
        return;
      }

      const outbound = data.message as SupportMessageRow | undefined;
      if (outbound) {
        setMessages((prev) => [
          ...prev.map((m) =>
            m.email.toLowerCase() === active.email.toLowerCase() &&
            m.direction !== SUPPORT_MESSAGE_DIRECTION.OUTBOUND &&
            (m.status === SUPPORT_MESSAGE_STATUS.NEW ||
              m.status === SUPPORT_MESSAGE_STATUS.REVIEWING)
              ? { ...m, status: SUPPORT_MESSAGE_STATUS.READ }
              : m
          ),
          outbound,
        ]);
      }
      setReply("");
      startTransition(() => router.refresh());
    } catch {
      setError("Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  function insertQuickReply(text: string) {
    setReply(text);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  if (conversations.length === 0) {
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-gradient-to-b from-neutral-50 to-white px-6 text-center dark:border-white/10 dark:from-white/[0.03] dark:to-transparent">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
          <MessageCircle className="h-6 w-6" />
        </div>
        <p className="text-base font-semibold text-neutral-900 dark:text-white">
          Inbox is clear
        </p>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-neutral-500">
          New emails from /contact and Help land here as chat threads. You’ll see
          Salwa and other merchants as soon as they write in.
        </p>
      </div>
    );
  }

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: "all", label: "All", count: filterCounts.all },
    { id: "unread", label: "Unread", count: filterCounts.unread },
    { id: "reviewing", label: "Reviewing", count: filterCounts.reviewing },
    { id: "archived", label: "Archived", count: filterCounts.archived },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-36px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#161616]">
      <div className="grid min-h-[720px] lg:grid-cols-[340px_1fr]">
        {/* List */}
        <aside
          className={cn(
            "border-neutral-200/80 dark:border-white/10",
            mobileShowThread ? "hidden lg:block" : "block",
            "border-b lg:border-b-0 lg:border-r"
          )}
        >
          <div className="space-y-3 border-b border-neutral-200/80 p-3 dark:border-white/10">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, topic…"
                className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition",
                    filter === f.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 dark:bg-white/10 dark:text-neutral-300"
                  )}
                >
                  {f.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-px text-[10px]",
                      filter === f.id
                        ? "bg-white/20"
                        : "bg-white dark:bg-black/20"
                    )}
                  >
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto lg:max-h-[calc(720px-110px)]">
            {filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-neutral-400">
                No conversations in this filter.
              </p>
            ) : (
              filtered.map((c) => {
                const selected = c.email === activeEmail;
                return (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => {
                      setActiveEmail(c.email);
                      setError("");
                      setMobileShowThread(true);
                      if (c.unreadCount > 0) void markThreadRead(c);
                    }}
                    className={cn(
                      "flex w-full gap-3 border-b border-neutral-100 px-3 py-3.5 text-left transition dark:border-white/5",
                      selected
                        ? "bg-violet-50/90 dark:bg-violet-500/10"
                        : "hover:bg-neutral-50 dark:hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="relative">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 text-[12px] font-semibold uppercase tracking-wide text-white dark:from-white dark:to-neutral-200 dark:text-neutral-900">
                        {(c.name || c.email).slice(0, 2)}
                      </div>
                      {c.unreadCount > 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-violet-600 dark:border-[#161616]" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            c.unreadCount > 0
                              ? "font-semibold text-neutral-950 dark:text-white"
                              : "font-medium text-neutral-800 dark:text-neutral-100"
                          )}
                        >
                          {c.name}
                        </p>
                        <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
                          {formatTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-neutral-500">
                        {c.email}
                      </p>
                      <p
                        className={cn(
                          "mt-1 line-clamp-2 text-[12px] leading-snug",
                          c.unreadCount > 0
                            ? "text-neutral-700 dark:text-neutral-300"
                            : "text-neutral-500"
                        )}
                      >
                        {c.lastDirection === SUPPORT_MESSAGE_DIRECTION.OUTBOUND ? (
                          <span className="font-semibold text-violet-600 dark:text-violet-400">
                            Support ·{" "}
                          </span>
                        ) : null}
                        {c.lastPreview}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Thread */}
        <section
          className={cn(
            "flex min-h-[480px] flex-col",
            mobileShowThread ? "flex" : "hidden lg:flex"
          )}
        >
          {active ? (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 px-4 py-3 dark:border-white/10">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 lg:hidden dark:hover:bg-white/10"
                    onClick={() => setMobileShowThread(false)}
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-neutral-900 dark:text-white">
                      {active.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {active.email} · {active.lastTopic}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize",
                      statusTone(active.status)
                    )}
                  >
                    {statusLabel(active.status)}
                  </span>
                  <a
                    href={`mailto:${encodeURIComponent(active.email)}?subject=${encodeURIComponent(`Re: ${active.lastTopic}`)}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-200 dark:hover:bg-white/5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Mail app
                  </a>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void markThreadRead(active)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-white/10 dark:text-neutral-200"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Read
                  </button>
                  <button
                    type="button"
                    disabled={pending || !active.messages.length}
                    onClick={() =>
                      void patchStatus(
                        active.messages[active.messages.length - 1]!.id,
                        SUPPORT_MESSAGE_STATUS.RESOLVED
                      )
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-white/10 dark:text-neutral-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Resolve
                  </button>
                  <button
                    type="button"
                    disabled={pending || !active.messages.length}
                    onClick={() =>
                      void patchStatus(
                        active.messages[active.messages.length - 1]!.id,
                        SUPPORT_MESSAGE_STATUS.ARCHIVED
                      )
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-white/10 dark:text-neutral-200"
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </button>
                </div>
              </header>

              <div className="flex-1 space-y-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.06),_transparent_55%),linear-gradient(180deg,#f7f7f8_0%,#f3f3f5_100%)] px-4 py-5 dark:bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.12),_transparent_50%),linear-gradient(180deg,#0d0d0d_0%,#121212_100%)]">
                {active.messages.map((msg, index) => {
                  const outbound =
                    msg.direction === SUPPORT_MESSAGE_DIRECTION.OUTBOUND;
                  const prev = active.messages[index - 1];
                  const showDay =
                    !prev ||
                    asDate(prev.createdAt).toDateString() !==
                      asDate(msg.createdAt).toDateString();

                  return (
                    <div key={msg.id}>
                      {showDay ? (
                        <div className="my-4 flex justify-center">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 shadow-sm backdrop-blur dark:bg-white/10 dark:text-neutral-300">
                            {formatDayLabel(msg.createdAt)}
                          </span>
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          "mb-2 flex",
                          outbound ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[min(100%,32rem)] rounded-2xl px-4 py-3 shadow-sm",
                            outbound
                              ? "rounded-br-md bg-violet-600 text-white"
                              : "rounded-bl-md border border-black/5 bg-white text-neutral-800 dark:border-white/10 dark:bg-[#1c1c1c] dark:text-neutral-100"
                          )}
                        >
                          <div
                            className={cn(
                              "mb-1.5 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-wide",
                              outbound ? "text-white/70" : "text-neutral-400"
                            )}
                          >
                            <span className="inline-flex items-center gap-1">
                              {outbound ? (
                                <>
                                  <Sparkles className="h-3 w-3" />
                                  Ettajer Support
                                </>
                              ) : (
                                <>
                                  <CircleDot className="h-3 w-3" />
                                  {msg.topic}
                                </>
                              )}
                            </span>
                            <span className="tabular-nums">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-[14px] leading-relaxed">
                            {msg.message}
                          </p>
                          {outbound ? (
                            <p className="mt-2 text-[10px] font-medium text-white/55">
                              Sent to {active.email}
                            </p>
                          ) : null}
                          {msg.articleRef ? (
                            <p
                              className={cn(
                                "mt-2 text-[11px]",
                                outbound ? "text-white/60" : "text-neutral-400"
                              )}
                            >
                              Help article: {msg.articleRef}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <footer className="border-t border-neutral-200/80 bg-white/90 p-3 backdrop-blur dark:border-white/10 dark:bg-[#161616]/95">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => insertQuickReply(q.text)}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
                {error ? (
                  <p className="mb-2 text-xs text-red-600">{error}</p>
                ) : null}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder={`Reply to ${active.name}…`}
                    className="min-h-[88px] flex-1 resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/15 dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        void sendReply();
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={sending || !reply.trim()}
                    onClick={() => void sendReply()}
                    className="inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-neutral-400">
                  Sends a professional email and keeps it in this chat. ⌘/Ctrl +
                  Enter to send · auto-refreshes every 30s
                </p>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-neutral-400">
              <MessageCircle className="h-6 w-6 opacity-40" />
              Select a conversation
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
