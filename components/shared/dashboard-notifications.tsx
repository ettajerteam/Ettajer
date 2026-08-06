"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationListItem } from "@/components/shared/notification-list-item";
import {
  isNotificationUnread,
  patchNotifications,
  type DashboardNotificationItem,
  type DashboardNotificationsPayload,
  type DashboardNotificationSummary,
} from "@/lib/dashboard-notifications";
import { cn } from "@/lib/utils";

const EMPTY_SUMMARY: DashboardNotificationSummary = {
  orders: 0,
  orderStatus: 0,
  messages: 0,
  stock: 0,
  abandoned: 0,
};

const FETCH_LIMIT = 24;

export function DashboardNotifications() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [badgeCleared, setBadgeCleared] = useState(false);
  const [items, setItems] = useState<DashboardNotificationItem[]>([]);
  const [summary, setSummary] =
    useState<DashboardNotificationSummary>(EMPTY_SUMMARY);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const fetchNotifications = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard/notifications?limit=${FETCH_LIMIT}`
      );
      if (!res.ok) return;
      const data = (await res.json()) as DashboardNotificationsPayload;
      setCount(data.count ?? 0);
      const nextUnread = data.unread ?? 0;
      setUnread((prev) => {
        if (nextUnread > prev) setBadgeCleared(false);
        return nextUnread;
      });
      setItems(Array.isArray(data.items) ? data.items : []);
      setSummary(data.summary ?? EMPTY_SUMMARY);
    } catch {
      // Keep last known state
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications({ silent: true });
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void fetchNotifications({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    if (open) void fetchNotifications();
    const ms = open ? 20 * 1000 : 60 * 1000;
    const timer = window.setInterval(() => {
      void fetchNotifications({ silent: true });
    }, ms);
    return () => window.clearInterval(timer);
  }, [open, fetchNotifications]);

  const hasRedDot = unread > 0 && !badgeCleared;

  const unreadCount = useMemo(
    () => items.filter((item) => isNotificationUnread(item)).length,
    [items]
  );

  const visibleItems = useMemo(() => {
    if (tab === "unread") {
      return items.filter((item) => isNotificationUnread(item));
    }
    return items;
  }, [items, tab]);

  const hasMore = count > items.length;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setBadgeCleared(true);
      setTab("all");
      void patchNotifications({ action: "open" });
      void fetchNotifications();
    }
  }

  async function handleMarkAllRead() {
    await patchNotifications({ action: "mark_all_read" });
    setUnread(0);
    setBadgeCleared(true);
    setItems((prev) =>
      prev.map((item) =>
        item.readAt == null
          ? { ...item, readAt: new Date().toISOString() }
          : item
      )
    );
  }

  async function openItem(item: DashboardNotificationItem) {
    if (isNotificationUnread(item)) {
      await patchNotifications({ action: "open", ids: [item.id] });
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? { ...row, readAt: new Date().toISOString() }
            : row
        )
      );
      setUnread((n) => Math.max(0, n - 1));
    }
    setOpen(false);
    router.push(item.href);
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors duration-200 hover:bg-black/[0.06] hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={hasRedDot ? "New notifications" : "Notifications"}
        >
          <Bell className="h-4 w-4" />
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
          "w-[min(100vw-1rem,360px)] overflow-hidden rounded-2xl border-0 bg-white p-0",
          "shadow-[0_12px_28px_0_rgba(0,0,0,0.2),0_2px_4px_0_rgba(0,0,0,0.1)]",
          "dark:border dark:border-white/10 dark:bg-[#242526]",
          "md:w-[420px]"
        )}
      >
        <div className="px-4 pb-2 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#050505] dark:text-white">
              Notifications
            </h2>
            <div className="flex items-center gap-0.5">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-semibold text-[#0866FF] hover:bg-[#0866FF]/10"
                  onClick={() => void handleMarkAllRead()}
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark all</span>
                </button>
              ) : null}
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : null}
            </div>
          </div>

          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                tab === "all"
                  ? "bg-[#E7F3FF] text-[#0866FF] dark:bg-[#0866FF]/20 dark:text-[#5AA7FF]"
                  : "bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6E9] dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              )}
              onClick={() => setTab("all")}
            >
              All
            </button>
            <button
              type="button"
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                tab === "unread"
                  ? "bg-[#E7F3FF] text-[#0866FF] dark:bg-[#0866FF]/20 dark:text-[#5AA7FF]"
                  : "bg-[#F0F2F5] text-[#050505] hover:bg-[#E4E6E9] dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              )}
              onClick={() => setTab("unread")}
            >
              Unread{unreadCount > 0 ? ` · ${unreadCount}` : ""}
            </button>
          </div>
        </div>

        <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain px-1 pb-1 md:max-h-[min(72vh,560px)]">
          {visibleItems.length === 0 && !loading ? (
            <div className="flex flex-col items-center px-4 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F0F2F5] text-[#65676B] dark:bg-white/10">
                <Bell className="h-6 w-6" />
              </span>
              <p className="mt-3 text-[17px] font-bold text-[#050505] dark:text-white">
                {tab === "unread" ? "No unread notifications" : "No notifications"}
              </p>
              <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-[#65676B] dark:text-neutral-400">
                New orders, carts, messages, and stock alerts will show up here.
              </p>
            </div>
          ) : null}

          {visibleItems.length === 0 && loading ? (
            <div className="flex items-center justify-center py-16 text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : null}

          <ul>
            {visibleItems.map((item) => (
              <li key={item.id}>
                <NotificationListItem
                  item={item}
                  unread={isNotificationUnread(item)}
                  onClick={() => void openItem(item)}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-black/[0.08] px-2 py-2 dark:border-white/10">
          <Link
            href="/dashboard/notifications"
            className="flex h-10 items-center justify-center rounded-lg text-[15px] font-semibold text-[#0866FF] transition-colors hover:bg-[#0866FF]/10"
            onClick={() => setOpen(false)}
          >
            {hasMore ||
            summary.orders +
              summary.orderStatus +
              summary.abandoned +
              summary.messages >
              0
              ? "See all notifications"
              : "Open notifications"}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
