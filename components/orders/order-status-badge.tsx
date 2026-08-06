import type { OrderStatus } from "@/types";
import { getStatusLabel } from "@/types/orders";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  draft: "bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-400",
  processing: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  shipped: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  returned: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  refunded: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        statusStyles[status],
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
