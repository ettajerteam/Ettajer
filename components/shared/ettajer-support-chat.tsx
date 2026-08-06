"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Send } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { formatNotificationTime } from "@/lib/dashboard-notifications";
import { cn } from "@/lib/utils";

const BRAND_ICON = "/brand/App-Logo.png";

type SupportChatMessage = {
  id: string;
  name: string;
  message: string;
  direction: string;
  createdAt: string;
  verified?: boolean;
};

export function EttajerSupportChat() {
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch("/api/support/messages");
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as { messages?: SupportChatMessage[] };
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setError(null);
    } catch {
      setError("Couldn’t load your conversation with Ettajer team.");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
    const timer = window.setInterval(() => {
      void fetchMessages({ silent: true });
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);
    setDraft("");
    try {
      const res = await fetch("/api/support/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message || "Failed to send");
      }
      const data = (await res.json()) as { message: SupportChatMessage };
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      setDraft(text);
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-[min(72vh,640px)] flex-col overflow-hidden rounded-[12px] border border-black/[0.06] bg-white dark:border-white/10 dark:bg-[#1C1C1E]">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-black/[0.06] px-3.5 py-3 dark:border-white/10">
        <span className="relative h-9 w-9 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/[0.08] dark:bg-white/95">
            <Image
              src={BRAND_ICON}
              alt="Ettajer"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="absolute -bottom-0.5 -right-0.5">
            <VerifiedBadge className="h-3.5 w-3.5 ring-2 ring-white dark:ring-[#1C1C1E]" />
          </span>
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Ettajer team
            </p>
            <VerifiedBadge />
          </div>
          <p className="text-[11px] text-neutral-400">
            Official support · usually replies within a day
          </p>
        </div>
      </div>

      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-[#FAFAFA] px-3 py-4 dark:bg-[#141414] sm:px-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : null}

        {!loading && messages.length === 0 ? (
          <div className="mx-auto max-w-sm rounded-[12px] border border-black/[0.06] bg-white px-4 py-5 text-center dark:border-white/10 dark:bg-[#1C1C1E]">
            <div className="mx-auto flex items-center justify-center gap-1.5">
              <p className="text-[13px] font-semibold text-neutral-900 dark:text-white">
                Ettajer team
              </p>
              <VerifiedBadge />
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-neutral-400">
              Loading your conversation…
            </p>
          </div>
        ) : null}

        {messages.map((msg) => {
          const fromTeam = msg.direction === "outbound" || msg.verified;
          const time = formatNotificationTime(msg.createdAt);
          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                fromTeam ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={cn(
                  "max-w-[min(100%,28rem)] rounded-[12px] px-3 py-2",
                  fromTeam
                    ? "rounded-tl-md border border-black/[0.06] bg-white dark:border-white/10 dark:bg-[#1C1C1E]"
                    : "rounded-tr-md bg-[#007AFF] text-white"
                )}
              >
                {fromTeam ? (
                  <div className="mb-1 flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-neutral-900 dark:text-white">
                      Ettajer team
                    </span>
                    <VerifiedBadge className="h-3 w-3" />
                  </div>
                ) : null}
                <p
                  className={cn(
                    "whitespace-pre-wrap text-[12px] leading-relaxed",
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
                      fromTeam ? "text-neutral-400" : "text-white/70"
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

      {error ? (
        <p className="border-t border-black/[0.06] px-3.5 py-2 text-[11px] text-rose-600 dark:border-white/10">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={(e) => void handleSend(e)}
        className="flex shrink-0 items-end gap-2 border-t border-black/[0.06] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#1C1C1E]"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend(e);
            }
          }}
          rows={1}
          placeholder="Message Ettajer team…"
          className="max-h-28 min-h-[36px] flex-1 resize-none rounded-md border border-black/[0.06] bg-[#F5F5F7] px-3 py-2 text-[12px] text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#007AFF]/35 focus:ring-1 focus:ring-[#007AFF]/25 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#007AFF] text-white transition-colors hover:bg-[#0071EB] disabled:opacity-40"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </button>
      </form>
    </div>
  );
}
