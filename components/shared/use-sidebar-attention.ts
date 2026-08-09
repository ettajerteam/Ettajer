"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  patchNotifications,
  type DashboardNotificationsPayload,
} from "@/lib/dashboard-notifications";

type AttentionState = {
  orders: boolean;
  messages: boolean;
};

const EMPTY: AttentionState = { orders: false, messages: false };

/**
 * Sidebar attention dots for new orders / customer messages.
 * Cleared when the merchant opens Orders or Messages.
 */
export function useSidebarAttention() {
  const pathname = usePathname();
  const [attention, setAttention] = useState<AttentionState>(EMPTY);

  const fetchAttention = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/notifications?limit=5");
      if (!res.ok) return;
      const data = (await res.json()) as DashboardNotificationsPayload;
      const unread = data.unreadSummary;
      setAttention({
        orders: (unread?.orders ?? 0) > 0,
        messages: (unread?.messages ?? 0) > 0,
      });
    } catch {
      // keep last known
    }
  }, []);

  const clearKind = useCallback(
    async (target: "orders" | "messages") => {
      setAttention((prev) => ({ ...prev, [target]: false }));
      const kinds =
        target === "orders"
          ? (["order"] as const)
          : (["message"] as const);
      await patchNotifications({
        action: "mark_kind_read",
        kinds: [...kinds],
      });
      void fetchAttention();
    },
    [fetchAttention]
  );

  useEffect(() => {
    void fetchAttention();
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchAttention();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const timer = window.setInterval(() => void fetchAttention(), 45_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.clearInterval(timer);
    };
  }, [fetchAttention]);

  useEffect(() => {
    if (pathname.startsWith("/dashboard/orders") && attention.orders) {
      void clearKind("orders");
    } else if (
      pathname.startsWith("/dashboard/messages") &&
      attention.messages
    ) {
      void clearKind("messages");
    }
  }, [pathname, attention.orders, attention.messages, clearKind]);

  return { attention, clearKind, refresh: fetchAttention };
}
