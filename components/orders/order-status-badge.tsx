import type { OrderStatus } from "@/types";
import { getStatusLabel } from "@/types/orders";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400",
  processing: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  shipped: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  delivered: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  returned: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  cancelled: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
