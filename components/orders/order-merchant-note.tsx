"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OrderMerchantNoteProps {
  orderId: string;
  initialNote: string | null;
  onUpdated: () => void;
}

export function OrderMerchantNote({ orderId, initialNote, onUpdated }: OrderMerchantNoteProps) {
  const [note, setNote] = useState(initialNote ?? "");
  const [loading, setLoading] = useState(false);
  const dirty = note !== (initialNote ?? "");

  useEffect(() => {
    setNote(initialNote ?? "");
  }, [initialNote]);

  const save = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantNote: note.trim() || null, notifyCustomer: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save note");
      toast.success("Note saved");
      onUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="space-y-1.5">
        <Label htmlFor="merchantNote" className="text-[10px] text-neutral-400">
          Internal note
        </Label>
        <Textarea
          id="merchantNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="COD confirmation time, courier, tracking, refund details…"
          className="min-h-[80px] rounded-md border-black/[0.06] bg-[#F5F5F7] text-[12px] shadow-none dark:border-white/10 dark:bg-white/[0.05]"
          maxLength={2000}
        />
      </div>
      <Button
        variant="outline"
        className="h-7 rounded-md border-black/[0.06] text-[11px] dark:border-white/10"
        disabled={!dirty || loading}
        loading={loading}
        onClick={save}
      >
        Save note
      </Button>
    </div>
  );
}
