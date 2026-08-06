"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DiscountForm,
  EMPTY_DISCOUNT_FORM,
  formFromCoupon,
  type DiscountFormState,
} from "@/components/marketing/discount-form";
import { cn } from "@/lib/utils";
import type { CouponRow } from "@/lib/marketing";

interface DiscountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  editing: CouponRow | null;
  onSaved: (coupon: CouponRow, mode: "create" | "update") => void;
}

export function DiscountSheet({
  open,
  onOpenChange,
  currency,
  editing,
  onSaved,
}: DiscountSheetProps) {
  const [saving, setSaving] = useState(false);
  const formId = "discount-form";
  const isEditing = Boolean(editing);

  async function handleSubmit(form: DiscountFormState) {
    const value = Number(form.value);
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        type: form.type,
        value,
        minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
        maxDiscount:
          form.type === "percentage" && form.maxDiscount
            ? Number(form.maxDiscount)
            : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt || undefined,
      };

      const res = await fetch(
        editing ? `/api/marketing?id=${editing.id}` : "/api/marketing",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to save discount");

      onSaved(data.coupon as CouponRow, editing ? "update" : "create");
      onOpenChange(false);
      toast.success(
        editing
          ? "Discount updated"
          : `Discount created — ${String(data.coupon?.code ?? form.code).toUpperCase()}`,
        {
          description: editing
            ? undefined
            : "Share the code with customers for checkout.",
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden border-l border-black/[0.06] bg-[#F5F5F7] p-0 dark:border-white/10 dark:bg-[#121212] sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-black/[0.06] bg-white px-4 py-3.5 text-left dark:border-white/10 dark:bg-[#1C1C1E]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#007AFF]/12 text-[#007AFF]">
              <Tag className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-[14px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                {isEditing ? "Edit discount" : "Create discount"}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-[12px] text-neutral-400">
                {isEditing
                  ? "Update the code, offer, and rules customers see at checkout."
                  : "Build a promo code with a live preview — amounts use " +
                    currency +
                    "."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {open ? (
            <DiscountForm
              key={editing?.id ?? "new"}
              formId={formId}
              currency={currency}
              initial={editing ? formFromCoupon(editing) : EMPTY_DISCOUNT_FORM}
              onSubmit={handleSubmit}
            />
          ) : null}
        </div>

        <SheetFooter className="shrink-0 gap-1.5 border-t border-black/[0.06] bg-white px-4 py-3 dark:border-white/10 dark:bg-[#1C1C1E] sm:flex-row sm:justify-end sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            className={cn(
              "h-8 rounded-md bg-[#007AFF] px-3 text-[12px] font-medium text-white shadow-none [background-image:none] hover:scale-100 hover:bg-[#0071EB] hover:shadow-none"
            )}
            loading={saving}
          >
            {isEditing ? "Save changes" : "Create discount"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
