"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, Settings } from "lucide-react";
import { NotificationListItem } from "@/components/shared/notification-list-item";
import {
  isNotificationUnread,
  patchNotifications,
  type DashboardNotificationItem,
  type DashboardNotificationKind,
  type DashboardNotificationsPayload,
  type DashboardNotificationSummary,
} from "@/lib/dashboard-notifications";
import {
  dashboardCard,
  dashboardPill,
  dashboardPillActive,
  dashboardPillGroup,
  dashboardPillInactive,
  dashboardPrimaryBtn,
  dashboardStack,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FilterId = "all" | DashboardNotificationKind;

const EMPTY_SUMMARY: DashboardNotificationSummary = {
  orders: 0,
  orderStatus: 0,
  messages: 0,
  stock: 0,
  abandoned: 0,
};

export function NotificationsPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("all");
  const [count, setCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<DashboardNotificationItem[]>([]);
  const [summary, setSummary] =
    useState<DashboardNotificationSummary>(EMPTY_SUMMARY);

  const fetchNotifications = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch("/api/dashboard/notifications?limit=50");
      if (!res.ok) return;
      const data = (await res.json()) as DashboardNotificationsPayload;
      setCount(data.count ?? 0);
      setUnread(data.unread ?? 0);
      setItems(Array.isArray(data.items) ? data.items : []);
      setSummary(data.summary ?? EMPTY_SUMMARY);
    } catch {
      // keep last
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => items.filter((item) => isNotificationUnread(item)).length,
    [items]
  );

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.kind === filter)),
    [items, filter]
  );

  async function handleMarkAllRead() {
    await patchNotifications({ action: "mark_all_read" });
    setUnread(0);
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
    router.push(item.href);
  }

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: "all", label: "All", count },
    { id: "order", label: "Orders", count: summary.orders },
    {
      id: "order_status",
      label: "Status",
      count: summary.orderStatus,
    },
    { id: "abandoned", label: "Carts", count: summary.abandoned },
    { id: "message", label: "Messages", count: summary.messages },
    { id: "stock", label: "Stock", count: summary.stock },
  ];

  return (
    <div className={dashboardStack}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className={cn(dashboardPillGroup, "flex-wrap")} role="tablist">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={cn(
                dashboardPill,
                filter === f.id ? dashboardPillActive : dashboardPillInactive
              )}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              {f.count > 0 ? (
                <span className="ml-1 tabular-nums text-neutral-400">
                  {f.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 || unread > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-md text-[12px]"
              onClick={() => void handleMarkAllRead()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all as read
            </Button>
          ) : null}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md text-[12px]"
          >
            <Link href="/dashboard/settings?tab=notifications">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className={cn(dashboardCard, "overflow-hidden")}>
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3 dark:border-white/10">
          <div>
            <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              {filter === "all"
                ? "All notifications"
                : filters.find((f) => f.id === filter)?.label}
            </p>
            <p className="text-[11px] text-neutral-400">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : filtered.length === 0
                  ? "Nothing here yet"
                  : "You're up to date"}
            </p>
          </div>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          ) : null}
        </div>

        {filtered.length === 0 && !loading ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-neutral-400 dark:bg-white/10">
              <Bell className="h-5 w-5" />
            </span>
            <p className="mt-4 text-[14px] font-semibold text-neutral-900 dark:text-white">
              No notifications
            </p>
            <p className="mt-1 max-w-sm text-[12px] leading-relaxed text-neutral-400">
              When customers place orders, leave carts, message you, or stock
              runs low, it will show up here.
            </p>
            <Button
              asChild
              size="sm"
              className={cn(dashboardPrimaryBtn, "mt-4 h-8")}
            >
              <Link href="/dashboard/orders">Go to orders</Link>
            </Button>
          </div>
        ) : null}

        {filtered.length === 0 && loading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : null}

        {filtered.length > 0 ? (
          <ul className="divide-y divide-black/[0.05] p-1.5 dark:divide-white/10 sm:p-2">
            {filtered.map((item) => (
              <li key={item.id}>
                <NotificationListItem
                  item={item}
                  unread={isNotificationUnread(item)}
                  onClick={() => void openItem(item)}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
