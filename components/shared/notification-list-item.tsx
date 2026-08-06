"use client";

import {
  AlertTriangle,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import {
  formatNotificationTime,
  type DashboardNotificationItem,
  type DashboardNotificationKind,
} from "@/lib/dashboard-notifications";
import { cn } from "@/lib/utils";

export const NOTIFICATION_KIND_META: Record<
  DashboardNotificationKind,
  { icon: LucideIcon; className: string; label: string }
> = {
  order: {
    icon: ShoppingBag,
    className: "bg-[#E7F3FF] text-[#0866FF]",
    label: "Orders",
  },
  order_status: {
    icon: RefreshCw,
    className: "bg-[#E7F3FF] text-[#0866FF]",
    label: "Status",
  },
  stock: {
    icon: Package,
    className: "bg-[#FFF4D6] text-[#B54708]",
    label: "Stock",
  },
  message: {
    icon: MessageSquare,
    className: "bg-[#F3E8FF] text-[#7C3AED]",
    label: "Messages",
  },
  abandoned: {
    icon: ShoppingCart,
    className: "bg-[#FFE4E6] text-[#E11D48]",
    label: "Carts",
  },
};

interface NotificationListItemProps {
  item: DashboardNotificationItem;
  unread: boolean;
  compact?: boolean;
  onClick: () => void;
}

export function NotificationListItem({
  item,
  unread,
  compact = false,
  onClick,
}: NotificationListItemProps) {
  const meta = NOTIFICATION_KIND_META[item.kind] ?? {
    icon: AlertTriangle,
    className: "bg-[#F0F2F5] text-[#65676B]",
    label: "Alert",
  };
  const Icon = meta.icon;
  const time = formatNotificationTime(item.createdAt);

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 text-left transition-colors",
        compact
          ? "rounded-xl px-2 py-2.5 hover:bg-[#F2F2F2] dark:hover:bg-white/[0.06]"
          : "rounded-xl px-2 py-2.5 hover:bg-[#F2F2F2] dark:hover:bg-white/[0.06]"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-full",
          compact ? "h-12 w-12" : "h-14 w-14",
          meta.className
        )}
      >
        <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[15px] leading-snug text-[#050505] dark:text-white",
            unread ? "font-bold" : "font-semibold"
          )}
        >
          {item.title}{" "}
          <span
            className={cn(
              "font-normal",
              unread
                ? "text-[#050505] dark:text-neutral-100"
                : "text-[#65676B] dark:text-neutral-400"
            )}
          >
            {item.body}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[13px]">
          {time ? (
            <span
              className={cn(
                unread
                  ? "font-semibold text-[#0866FF]"
                  : "text-[#65676B] dark:text-neutral-500"
              )}
            >
              {time}
            </span>
          ) : null}
          {time ? (
            <span className="text-[#65676B]" aria-hidden>
              ·
            </span>
          ) : null}
          <span className="text-[#65676B] dark:text-neutral-500">
            {meta.label}
          </span>
        </span>
      </span>
      {unread ? (
        <span
          className="h-3 w-3 shrink-0 rounded-full bg-[#0866FF]"
          aria-hidden
        />
      ) : null}
    </button>
  );
}
