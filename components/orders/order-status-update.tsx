"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: OrderStatus;
  onUpdated: () => void;
}

export function OrderStatusUpdate({ orderId, currentStatus, onUpdated }: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const nextStatuses = getNextStatuses(currentStatus);

  const handleConfirm = async () => {
    if (!selectedStatus) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, note: note || undefined, notifyCustomer }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to update status");

      toast.success(
        data.emailSent
          ? `Status updated to ${getStatusLabel(selectedStatus)} — customer notified`
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
    return <p className="text-sm text-muted-foreground">This order is in a final state.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          value={selectedStatus}
          onValueChange={(v) => {
            setSelectedStatus(v as OrderStatus);
            setDialogOpen(true);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-xl border-border/80 sm:w-[220px]">
            <SelectValue placeholder="Update status" />
          </SelectTrigger>
          <SelectContent>
            {nextStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {getStatusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl border-border/80 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.4)]">
          <DialogHeader>
            <DialogTitle className="text-xl tracking-[-0.02em]">Update order status</DialogTitle>
            <DialogDescription>
              Change status to <strong>{selectedStatus && getStatusLabel(selectedStatus)}</strong>?
              {notifyCustomer && " The customer will receive an email notification."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="e.g. Shipped via Amana Express"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} loading={loading}>
              Confirm update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
