"use client";

import { Check, Circle } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { STATUS_FLOW, getStatusLabel } from "@/types/orders";
import type { OrderStatusEvent } from "@/types/orders";
import type { OrderStatus } from "@/types";
import { cn, formatDateTime } from "@/lib/utils";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  history: OrderStatusEvent[];
}

export function OrderTimeline({ currentStatus, history }: OrderTimelineProps) {
  const isTerminal =
    currentStatus === "cancelled" ||
    currentStatus === "returned" ||
    currentStatus === "refunded";

  const steps = isTerminal
    ? [{ status: currentStatus, label: getStatusLabel(currentStatus) }]
    : STATUS_FLOW.map((s) => ({ status: s, label: getStatusLabel(s) }));

  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="space-y-0.5">
        {steps.map((step, index) => {
          const isComplete = isTerminal ? step.status === currentStatus : index <= currentIdx;
          const isCurrent = step.status === currentStatus;
          const historyEntry = [...sortedHistory].reverse().find((h) => h.status === step.status);

          return (
            <div key={`${step.status}-${index}`} className="flex gap-2.5">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                    isComplete
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                      : "border-neutral-200 bg-white dark:border-white/15 dark:bg-transparent"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-2.5 w-2.5" />
                  ) : (
                    <Circle className="h-2 w-2 text-neutral-300" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "my-0.5 w-px flex-1 min-h-[14px]",
                      isComplete && index < currentIdx
                        ? "bg-neutral-900 dark:bg-white"
                        : "bg-neutral-200 dark:bg-white/10"
                    )}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p
                    className={cn(
                      "text-[12px] font-medium text-neutral-600 dark:text-neutral-300",
                      isCurrent && "text-neutral-900 dark:text-white"
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && <OrderStatusBadge status={currentStatus} />}
                </div>
                {historyEntry && (
                  <p className="mt-0.5 text-[10px] text-neutral-400" suppressHydrationWarning>
                    {formatDateTime(historyEntry.createdAt)}
                    {historyEntry.note ? ` · ${historyEntry.note}` : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sortedHistory.length > 1 && (
        <div className="space-y-1 border-t border-black/[0.05] pt-2.5 dark:border-white/10">
          <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
            Activity
          </p>
          {sortedHistory.map((event) => (
            <div
              key={event.id}
              className="flex items-start justify-between gap-2 rounded-md px-1 py-1 text-[10px]"
              suppressHydrationWarning
            >
              <div className="min-w-0">
                <span className="font-medium text-neutral-700 dark:text-neutral-200">
                  {getStatusLabel(event.status)}
                </span>
                {event.note ? (
                  <span className="text-neutral-400"> · {event.note}</span>
                ) : null}
              </div>
              <span className="shrink-0 text-neutral-400">{formatDateTime(event.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
