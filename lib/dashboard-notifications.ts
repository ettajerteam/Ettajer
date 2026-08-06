export type DashboardNotificationKind =
  | "order"
  | "order_status"
  | "stock"
  | "message"
  | "abandoned";

export type DashboardNotificationItem = {
  id: string;
  kind: DashboardNotificationKind;
  title: string;
  body: string;
  href: string;
  createdAt: string | null;
  /** ISO timestamp when read; null = unread (server source of truth). */
  readAt?: string | null;
};

export type DashboardNotificationSummary = {
  orders: number;
  orderStatus: number;
  messages: number;
  stock: number;
  abandoned: number;
};

export type DashboardNotificationsPayload = {
  count: number;
  unread: number;
  items: DashboardNotificationItem[];
  summary: DashboardNotificationSummary;
  alerts: {
    orders: boolean;
    orderStatus: boolean;
    messages: boolean;
    stock: boolean;
    abandoned: boolean;
  };
};

export const NOTIFICATION_KIND_LABEL: Record<DashboardNotificationKind, string> =
  {
    order: "Orders",
    order_status: "Status",
    stock: "Stock",
    message: "Messages",
    abandoned: "Carts",
  };

export function formatNotificationTime(iso: string | null): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    // Fixed locale — avoids SSR/client hydration mismatches (e.g. Jul vs juil.)
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

/** Prefer server `readAt`; fall back to local watermark only if missing. */
export function isNotificationUnread(
  item: DashboardNotificationItem,
  seenAt = 0
): boolean {
  if (item.readAt !== undefined) {
    return item.readAt == null;
  }
  if (!item.createdAt) return true;
  return new Date(item.createdAt).getTime() > seenAt;
}

export async function patchNotifications(body: {
  action: "open" | "mark_all_read" | "dismiss";
  ids?: string[];
}): Promise<boolean> {
  try {
    const res = await fetch("/api/dashboard/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const POPUP_NOTIFICATION_LIMIT = 5;
