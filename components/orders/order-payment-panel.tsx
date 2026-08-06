"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getNextStatuses,
} from "@/types/orders";
import { formatCurrency, cn } from "@/lib/utils";
import type { OrderDetail } from "@/types/orders";

interface OrderPaymentPanelProps {
  order: OrderDetail;
  currency: string;
  onUpdated: () => void;
}

const paymentStatusStyles: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  refunded: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  partially_refunded: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

export function OrderPaymentPanel({ order, currency, onUpdated }: OrderPaymentPanelProps) {
  const [loading, setLoading] = useState<"paid" | "refunded" | null>(null);
  const [refundAmount, setRefundAmount] = useState(
    order.refundedAmount > 0 ? String(order.refundedAmount) : String(order.total)
  );

  const patch = async (body: Record<string, unknown>, mode: "paid" | "refunded") => {
    setLoading(mode);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Update failed");
      toast.success(
        mode === "paid"
          ? "Marked as paid"
          : data.restocked
            ? "Refund recorded — inventory restored"
            : "Refund recorded"
      );
      onUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setLoading(null);
    }
  };

  const canMarkPaid =
    order.paymentStatus === "unpaid" &&
    order.status !== "cancelled" &&
    order.status !== "refunded";

  const canRefund =
    order.status !== "refunded" && getNextStatuses(order.status).includes("refunded");

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] text-neutral-400">Method</p>
          <p className="flex items-center gap-1.5 text-[12px] font-medium text-neutral-900 dark:text-white">
            {order.paymentMethod === "cod" ? (
              <Banknote className="h-3.5 w-3.5 text-neutral-400" />
            ) : (
              <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
            )}
            {getPaymentMethodLabel(order.paymentMethod)}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
            paymentStatusStyles[order.paymentStatus] ?? paymentStatusStyles.unpaid
          )}
        >
          {getPaymentStatusLabel(order.paymentStatus)}
        </span>
      </div>

      {order.refundedAmount > 0 && (
        <p className="text-[11px] text-neutral-400">
          Refunded:{" "}
          <span className="font-medium text-neutral-900 dark:text-white">
            {formatCurrency(order.refundedAmount, currency)}
          </span>
        </p>
      )}

      {order.inventoryRestored && (
        <p className="text-[10px] text-neutral-400">Inventory has been restored for this order.</p>
      )}

      <div className="flex flex-col gap-1.5">
        {canMarkPaid && (
          <Button
            variant="outline"
            className="h-7 rounded-md border-black/[0.06] text-[11px] dark:border-white/10"
            loading={loading === "paid"}
            disabled={loading !== null}
            onClick={() =>
              patch({ paymentStatus: "paid", note: "Marked as paid", notifyCustomer: false }, "paid")
            }
          >
            Mark as paid
          </Button>
        )}

        {canRefund && (
          <div className="space-y-2 rounded-[10px] border border-black/[0.06] p-2.5 dark:border-white/10">
            <div className="space-y-1">
              <Label htmlFor="refundAmount" className="text-[10px] text-neutral-400">
                Refund amount
              </Label>
              <Input
                id="refundAmount"
                type="number"
                min={0}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="h-7 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] shadow-none dark:border-white/10 dark:bg-white/[0.05]"
              />
            </div>
            <Button
              variant="outline"
              className="h-7 w-full rounded-md border-black/[0.06] text-[11px] text-pink-700 hover:text-pink-800 dark:border-white/10"
              loading={loading === "refunded"}
              disabled={loading !== null}
              onClick={() => {
                const amount = Number(refundAmount);
                if (!Number.isFinite(amount) || amount < 0) {
                  toast.error("Enter a valid refund amount");
                  return;
                }
                void patch(
                  {
                    status: "refunded",
                    paymentStatus: "refunded",
                    refundedAmount: amount,
                    note: `Refunded ${formatCurrency(amount, currency)}`,
                    notifyCustomer: true,
                  },
                  "refunded"
                );
              }}
            >
              Record refund
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
