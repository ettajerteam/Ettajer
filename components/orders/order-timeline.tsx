"use client";

import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { STATUS_FLOW, getStatusLabel } from "@/types/orders";
import type { OrderStatusEvent } from "@/types/orders";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  history: OrderStatusEvent[];
}

export function OrderTimeline({ currentStatus, history }: OrderTimelineProps) {
  const completedStatuses = new Set<OrderStatus>(
    history.map((h) => h.status).filter((s) => s !== "cancelled")
  );
  if (currentStatus !== "cancelled") {
    completedStatuses.add(currentStatus);
  }

  const steps = currentStatus === "cancelled"
    ? [{ status: "cancelled" as OrderStatus, label: "Cancelled" }]
    : STATUS_FLOW.map((s) => ({ status: s, label: getStatusLabel(s) }));

  const currentIdx = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="space-y-1.5">
      {steps.map((step, index) => {
        const isCancelled = currentStatus === "cancelled";
        const isComplete = isCancelled
          ? step.status === "cancelled"
          : index <= currentIdx;
        const isCurrent = !isCancelled && step.status === currentStatus;
        const historyEntry = history.find((h) => h.status === step.status);

        return (
          <motion.div
            key={step.status}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/35"
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-200",
                  isComplete
                    ? "border-[#007AFF] bg-[#007AFF] text-white"
                    : "border-muted-foreground/30 bg-background"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/30" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "my-1 h-8 w-0.5",
                    isComplete && index < currentIdx ? "bg-[#007AFF]" : "bg-muted"
                  )}
                />
              )}
            </div>

            <div className="flex-1 pb-5">
              <div className="flex items-center gap-2">
                <p className={cn("font-medium text-sm", isCurrent && "text-[#007AFF]")}>
                  {step.label}
                </p>
                {isCurrent && <OrderStatusBadge status={currentStatus} />}
              </div>
              {historyEntry && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(historyEntry.createdAt).toLocaleString()}
                  {historyEntry.note && ` · ${historyEntry.note}`}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
