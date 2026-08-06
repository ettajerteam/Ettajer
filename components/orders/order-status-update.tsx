"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getNextStatuses, getStatusLabel } from "@/types/orders";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
  onUpdated: () => void;
}

const destructive: OrderStatus[] = ["cancelled", "returned", "refunded"];

function primaryActionLabel(status: OrderStatus): string {
  if (status === "processing") return "Confirm order";
  if (status === "shipped") return "Mark as shipped";
  if (status === "delivered") return "Mark as delivered";
  return `Mark as ${getStatusLabel(status).toLowerCase()}`;
}

export function OrderStatusUpdate({ orderId, currentStatus, onUpdated }: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const nextStatuses = getNextStatuses(currentStatus);
  const primary = nextStatuses.find((s) => !destructive.includes(s));
  const secondary = nextStatuses.filter((s) => s !== primary);
  const noteRequired = selectedStatus === "shipped";

  const openConfirm = (status: OrderStatus) => {
    setSelectedStatus(status);
    setNotifyCustomer(status !== "cancelled");
    setNote("");
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;
    if (selectedStatus === "shipped" && !note.trim()) {
      toast.error("Add a delivery note (courier or tracking) before shipping");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          note: note.trim() || undefined,
          notifyCustomer,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update status");

      toast.success(
        data.emailSent
          ? `Status updated to ${getStatusLabel(selectedStatus)} — customer notified`
          : data.restocked
            ? `Status updated to ${getStatusLabel(selectedStatus)} — inventory restored`
            : `Status updated to ${getStatusLabel(selectedStatus)}`
      );
      setDialogOpen(false);
      setSelectedStatus("");
      setNote("");
      onUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (nextStatuses.length === 0) {
    return (
      <div className="rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={currentStatus} />
          <p className="text-[11px] text-neutral-400">Final state — no further updates</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] text-neutral-400">Current</span>
        <OrderStatusBadge status={currentStatus} />
      </div>

      <div className="flex flex-col gap-1.5">
        {primary && (
          <Button
            className="h-8 w-full rounded-md bg-neutral-900 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            onClick={() => openConfirm(primary)}
          >
            {primaryActionLabel(primary)}
          </Button>
        )}
        {secondary.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {secondary.map((s) => (
              <Button
                key={s}
                variant="outline"
                className={cn(
                  "h-7 flex-1 rounded-md border-black/[0.06] px-2.5 text-[11px] dark:border-white/10",
                  destructive.includes(s) && "text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                )}
                onClick={() => openConfirm(s)}
              >
                {getStatusLabel(s)}
              </Button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-[14px] border-black/[0.06] shadow-lg dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[15px] tracking-[-0.02em]">Update order status</DialogTitle>
            <DialogDescription className="text-[12px]">
              Change status to <strong>{selectedStatus && getStatusLabel(selectedStatus)}</strong>?
              {notifyCustomer && " The customer will receive an email notification."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-[11px]">
                {noteRequired ? "Delivery note (required)" : "Note (optional)"}
              </Label>
              <Input
                id="note"
                placeholder={
                  noteRequired
                    ? "e.g. Amana Express · tracking 123456"
                    : "e.g. Confirmed by WhatsApp"
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-8 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] shadow-none dark:border-white/10 dark:bg-white/[0.05]"
              />
              {noteRequired ? (
                <p className="text-[10px] text-neutral-400">
                  Add courier name or tracking so your team can follow the delivery.
                </p>
              ) : null}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-neutral-600 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={notifyCustomer}
                onChange={(e) => setNotifyCustomer(e.target.checked)}
                className="rounded border-input"
              />
              Send email notification to customer
            </label>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="h-8 rounded-md text-[12px]"
              onClick={() => setDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className={cn(
                "h-8 rounded-md text-[12px]",
                selectedStatus && destructive.includes(selectedStatus)
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              )}
              onClick={handleConfirm}
              loading={loading}
              disabled={noteRequired && !note.trim()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
