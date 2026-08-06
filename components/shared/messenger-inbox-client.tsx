"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { EttajerTeamProfile } from "@/components/shared/ettajer-team-profile";
import { formatNotificationTime } from "@/lib/dashboard-notifications";
import { dashboardCard, dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

const BRAND_ICON = "/brand/App-Logo.png";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  createdAt: string;
};

type SupportChatMessage = {
  id: string;
  name: string;
  message: string;
  direction: string;
  createdAt: string;
  verified?: boolean;
};

type Selection =
  | { kind: "ettajer" }
  | { kind: "customer"; id: string };

const ETTAJER_ID = "ettajer";

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

function EttajerAvatar({
  size = 40,
  badgeClassName,
  ringClassName = "ring-2 ring-white dark:ring-[#1C1C1E]",
}: {
  size?: number;
  badgeClassName?: string;
  ringClassName?: string;
}) {
  const badgeSize = size >= 40 ? "h-3.5 w-3.5" : "h-3 w-3";
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
        <VerifiedBadge className={cn(badgeSize, ringClassName, badgeClassName)} />
      </span>
    </span>
  );
}

export function MessengerInboxClient({
  initialContacts,
}: {
  initialContacts: ContactMessage[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusId = searchParams.get("id");
  const chatParam = searchParams.get("chat");

  const [contacts, setContacts] = useState(initialContacts);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(
    Boolean(focusId) || chatParam === "ettajer"
  );

  const [selection, setSelection] = useState<Selection>(() => {
    if (chatParam === "ettajer" || focusId === ETTAJER_ID) return { kind: "ettajer" };
    if (focusId && initialContacts.some((c) => c.id === focusId)) {
      return { kind: "customer", id: focusId };
    }
    return { kind: "ettajer" };
  });

  const [teamMessages, setTeamMessages] = useState<SupportChatMessage[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [teamError, setTeamError] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedContact =
    selection.kind === "customer"
      ? contacts.find((c) => c.id === selection.id) ?? null
      : null;

  const fetchTeam = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setTeamLoading(true);
    try {
      const res = await fetch("/api/support/messages");
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { messages?: SupportChatMessage[] };
      setTeamMessages(Array.isArray(data.messages) ? data.messages : []);
      setTeamError(null);
    } catch {
      setTeamError("Couldn’t load Ettajer team chat.");
    } finally {
      if (!opts?.silent) setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTeam();
    const t = window.setInterval(() => void fetchTeam({ silent: true }), 30_000);
    return () => window.clearInterval(t);
  }, [fetchTeam]);

  useEffect(() => {
    if (selection.kind === "ettajer") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [teamMessages.length, selection.kind]);

  useEffect(() => {
    if (focusId && contacts.some((c) => c.id === focusId)) {
      setSelection({ kind: "customer", id: focusId });
      setMobileShowDetail(true);
    } else if (chatParam === "ettajer" || focusId === ETTAJER_ID) {
      setSelection({ kind: "ettajer" });
      setMobileShowDetail(true);
    }
  }, [focusId, chatParam, contacts]);

  useEffect(() => {
    if (selection.kind !== "customer") return;
    const row = contacts.find((c) => c.id === selection.id);
    if (!row || row.status !== "new") return;
    setContacts((prev) =>
      prev.map((c) => (c.id === selection.id ? { ...c, status: "read" } : c))
    );
    void fetch("/api/contact-submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", ids: [selection.id] }),
    });
  }, [selection, contacts]);

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (c.status === "archived") return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
      );
    });
  }, [contacts, query]);

  const ettajerPreview = useMemo(() => {
    const last = teamMessages[teamMessages.length - 1];
    return last?.message ?? "Say hi to the verified Ettajer team";
  }, [teamMessages]);

  const ettajerTime = useMemo(() => {
    const last = teamMessages[teamMessages.length - 1];
    return last ? formatNotificationTime(last.createdAt) : "";
  }, [teamMessages]);

  const showEttajerInList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      "ettajer".includes(q) ||
      "team".includes(q) ||
      "support".includes(q) ||
      ettajerPreview.toLowerCase().includes(q)
    );
  }, [query, ettajerPreview]);

  function selectEttajer() {
    setSelection({ kind: "ettajer" });
    setMobileShowDetail(true);
    router.replace("/dashboard/messages?chat=ettajer", { scroll: false });
  }

  function selectCustomer(id: string) {
    setSelection({ kind: "customer", id });
    setMobileShowDetail(true);
    router.replace(`/dashboard/messages?id=${id}`, { scroll: false });
  }

  async function sendToEttajer(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setTeamError(null);
    setDraft("");
    try {
      const res = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "Failed to send");
      }
      const data = (await res.json()) as { message: SupportChatMessage };
      setTeamMessages((prev) => [...prev, data.message]);
    } catch (err) {
      setDraft(text);
      setTeamError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  async function archiveSelected() {
    if (!selectedContact) return;
    setBusy(true);
    try {
      await fetch("/api/contact-submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", ids: [selectedContact.id] }),
      });
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContact.id ? { ...c, status: "archived" } : c
        )
      );
      selectEttajer();
    } finally {
      setBusy(false);
    }
  }

  const rowActive =
    "bg-[#007AFF]/[0.07] dark:bg-[#007AFF]/12";
  const rowIdle = "hover:bg-black/[0.025] dark:hover:bg-white/[0.035]";

  return (
    <div
      className={cn(
        dashboardCard,
        "grid h-[min(calc(100vh-9.5rem),820px)] min-h-[520px] overflow-hidden lg:grid-cols-[minmax(0,320px)_1fr]"
      )}
    >
      {/* Conversation list */}
      <div
        className={cn(
          "flex min-h-0 flex-col border-black/[0.06] dark:border-white/10 lg:border-r",
          mobileShowDetail ? "hidden lg:flex" : "flex"
        )}
      >
        <div className="shrink-0 space-y-2.5 border-b border-black/[0.06] px-3.5 pb-3 pt-3.5 dark:border-white/10">
          <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
            Chats
          </h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-9 w-full rounded-full border-0 bg-[#F5F5F7] pl-9 pr-3.5 text-[13px] outline-none placeholder:text-neutral-400 focus:bg-[#EFEFF2] focus:ring-2 focus:ring-[#007AFF]/20 dark:bg-white/[0.06] dark:text-white dark:focus:bg-white/[0.09]"
            />
          </div>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto py-1">
          {showEttajerInList ? (
            <li>
              <div
                className={cn(
                  "mx-1.5 flex w-[calc(100%-0.75rem)] items-center gap-3 rounded-[12px] px-2.5 py-2.5 transition-colors",
                  selection.kind === "ettajer" ? rowActive : rowIdle
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    selectEttajer();
                    setProfileOpen(true);
                  }}
                  className="shrink-0"
                  aria-label="Open Ettajer team profile"
                >
                  <EttajerAvatar size={44} />
                </button>
                <button
                  type="button"
                  onClick={selectEttajer}
                  className="min-w-0 flex-1 text-left"
                >
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
                    {ettajerPreview}
                  </span>
                </button>
              </div>
            </li>
          ) : null}

          {filteredContacts.map((row) => {
            const unread = row.status === "new";
            const active =
              selection.kind === "customer" && selection.id === row.id;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => selectCustomer(row.id)}
                  className={cn(
                    "mx-1.5 flex w-[calc(100%-0.75rem)] items-center gap-3 rounded-[12px] px-2.5 py-2.5 text-left transition-colors",
                    active ? rowActive : rowIdle
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white",
                      avatarColor(row.id)
                    )}
                  >
                    {initials(row.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-[13px] text-neutral-900 dark:text-white",
                          unread ? "font-semibold" : "font-medium"
                        )}
                      >
                        {row.name}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-[11px]",
                          unread
                            ? "font-semibold text-[#007AFF]"
                            : "text-neutral-400"
                        )}
                      >
                        {formatNotificationTime(row.createdAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[12px]",
                          unread
                            ? "font-medium text-neutral-700 dark:text-neutral-200"
                            : "text-neutral-500 dark:text-neutral-400"
                        )}
                      >
                        {row.message}
                      </span>
                      {unread ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#007AFF]" />
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}

          {!showEttajerInList && filteredContacts.length === 0 ? (
            <li className="px-4 py-12 text-center text-[13px] text-neutral-400">
              No chats found
            </li>
          ) : null}
        </ul>
      </div>

      {/* Detail / chat pane */}
      <div
        className={cn(
          "flex min-h-0 flex-col bg-[#F7F7F8] dark:bg-[#121212]",
          mobileShowDetail ? "flex" : "hidden lg:flex"
        )}
      >
        {selection.kind === "ettajer" ? (
          <>
            <div className="flex shrink-0 items-center gap-2.5 border-b border-black/[0.06] bg-white/95 px-3 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#1C1C1E]/95 sm:px-4">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-black/[0.04] lg:hidden dark:hover:bg-white/10"
                aria-label="Back"
                onClick={() => setMobileShowDetail(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="-mx-1 flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] px-1 py-0.5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                aria-label="View Ettajer team profile"
              >
                <EttajerAvatar size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                      Ettajer team
                    </p>
                    <VerifiedBadge className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[11px] font-medium text-[#34C759]">
                    Active now
                  </p>
                </div>
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5">
              {teamLoading ? (
                <div className="flex justify-center py-16 text-neutral-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : null}
              {teamMessages.map((msg) => {
                const fromTeam = msg.direction === "outbound" || msg.verified;
                const time = formatNotificationTime(msg.createdAt);
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full items-end gap-2",
                      fromTeam ? "justify-start" : "justify-end"
                    )}
                  >
                    {fromTeam ? (
                      <span className="mb-0.5 hidden sm:block">
                        <span className="relative block h-6 w-6">
                          <span className="flex h-6 w-6 overflow-hidden rounded-full bg-white ring-1 ring-black/[0.08]">
                            <Image
                              src={BRAND_ICON}
                              alt=""
                              width={24}
                              height={24}
                              className="h-full w-full object-cover"
                            />
                          </span>
                        </span>
                      </span>
                    ) : null}
                    <div
                      className={cn(
                        "max-w-[min(100%,26rem)] px-3.5 py-2",
                        fromTeam
                          ? "rounded-[18px] rounded-bl-md border border-black/[0.05] bg-white dark:border-white/10 dark:bg-[#1C1C1E]"
                          : "rounded-[18px] rounded-br-md bg-[#007AFF] text-white"
                      )}
                    >
                      {fromTeam ? (
                        <div className="mb-0.5 flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">
                            Ettajer team
                          </span>
                          <VerifiedBadge className="h-2.5 w-2.5" />
                        </div>
                      ) : null}
                      <p
                        className={cn(
                          "whitespace-pre-wrap text-[13px] leading-relaxed",
                          fromTeam
                            ? "text-neutral-700 dark:text-neutral-200"
                            : "text-white"
                        )}
                      >
                        {msg.message}
                      </p>
                      {time ? (
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            fromTeam ? "text-neutral-400" : "text-white/65"
                          )}
                        >
                          {time}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {teamError ? (
              <p className="border-t border-black/[0.06] px-4 py-2 text-[12px] text-rose-600 dark:border-white/10">
                {teamError}
              </p>
            ) : null}

            <form
              onSubmit={(e) => void sendToEttajer(e)}
              className="flex shrink-0 items-end gap-2 border-t border-black/[0.06] bg-white/95 px-3 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#1C1C1E]/95 sm:px-4"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendToEttajer(e);
                  }
                }}
                rows={1}
                placeholder="Message Ettajer team…"
                className="max-h-28 min-h-[40px] flex-1 resize-none rounded-full border-0 bg-[#F5F5F7] px-4 py-2.5 text-[13px] outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-[#007AFF]/20 dark:bg-white/[0.06] dark:text-white"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-white transition-colors hover:bg-[#0071EB] disabled:opacity-35"
                aria-label="Send"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </>
        ) : selectedContact ? (
          <>
            <div className="flex shrink-0 items-center gap-2.5 border-b border-black/[0.06] bg-white/95 px-3 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#1C1C1E]/95 sm:px-4">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-black/[0.04] lg:hidden dark:hover:bg-white/10"
                aria-label="Back"
                onClick={() => setMobileShowDetail(false)}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
                  avatarColor(selectedContact.id)
                )}
              >
                {initials(selectedContact.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                  {selectedContact.name}
                </p>
                <p className="truncate text-[11px] text-neutral-400">
                  Customer · {selectedContact.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  asChild
                  size="sm"
                  className={cn(dashboardPrimaryBtn, "h-8 gap-1.5 rounded-full px-3")}
                >
                  <a href={`mailto:${selectedContact.email}`}>
                    <Mail className="h-3.5 w-3.5" />
                    Reply
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-full border-black/[0.08] text-[12px] dark:border-white/10"
                  disabled={busy}
                  onClick={() => void archiveSelected()}
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Archive</span>
                </Button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
              <div className="mx-auto max-w-xl">
                <div className="mb-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
                  <a
                    href={`mailto:${selectedContact.email}`}
                    className="inline-flex items-center gap-1 transition-colors hover:text-[#007AFF]"
                  >
                    <Mail className="h-3 w-3" />
                    {selectedContact.email}
                  </a>
                  {selectedContact.phone ? (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="inline-flex items-center gap-1 transition-colors hover:text-[#007AFF]"
                    >
                      <Phone className="h-3 w-3" />
                      {selectedContact.phone}
                    </a>
                  ) : null}
                  <span>
                    {new Date(selectedContact.createdAt).toLocaleString("en", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="rounded-[18px] rounded-bl-md border border-black/[0.05] bg-white px-4 py-3.5 dark:border-white/10 dark:bg-[#1C1C1E]">
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-200">
                    {selectedContact.message}
                  </p>
                </div>
                <p className="mt-2 text-center text-[11px] text-neutral-400">
                  Via storefront contact form
                </p>
              </div>
            </div>

            <div className="shrink-0 border-t border-black/[0.06] bg-white/95 px-3 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#1C1C1E]/95 sm:px-4">
              <a
                href={`mailto:${selectedContact.email}?subject=${encodeURIComponent("Re: Your message to the store")}`}
                className="flex h-10 items-center rounded-full bg-[#F5F5F7] px-4 text-[13px] text-neutral-400 transition-colors hover:bg-[#EFEFF2] hover:text-neutral-600 dark:bg-white/[0.06] dark:hover:bg-white/[0.09]"
              >
                Reply to{" "}
                {selectedContact.name.split(/\s+/)[0] || "customer"}…
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
              <MessageSquare className="h-5 w-5 text-neutral-400" />
            </span>
            <p className="mt-3 text-[14px] font-semibold text-neutral-900 dark:text-white">
              Select a chat
            </p>
            <p className="mt-1 max-w-xs text-[12px] text-neutral-400">
              Customers and Ettajer team appear in one inbox.
            </p>
          </div>
        )}
      </div>

      <EttajerTeamProfile open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
