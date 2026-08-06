"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  GiftCardForm,
  type GiftCardFormValues,
} from "@/components/gift-cards/gift-card-form";
import { cn } from "@/lib/utils";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import type { GiftCardItem } from "@/types/gift-cards";

interface GiftCardSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onCreated: (card: GiftCardItem) => void;
}

export function GiftCardSheet({
  open,
  onOpenChange,
  currency,
  onCreated,
}: GiftCardSheetProps) {
  const [loading, setLoading] = useState(false);
  const formId = "gift-card-form";

  const handleSubmit = async (data: GiftCardFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: data.balance,
          expiresAt: data.expiresAt,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof result.message === "string" ? result.message : "Failed to create gift card"
        );
      }

      const raw = result.giftCard;
      const card: GiftCardItem = {
        id: raw.id,
        code: raw.code,
        initialBalance: raw.initialBalance,
        balance: raw.balance,
        active: raw.active,
        expiresAt: raw.expiresAt
          ? typeof raw.expiresAt === "string"
            ? raw.expiresAt
            : new Date(raw.expiresAt).toISOString()
          : null,
        templateId: data.templateId,
      };

      toast.success("Gift card created", {
        description: `Code ${card.code}`,
      });
      onOpenChange(false);
      onCreated(card);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden border-l border-black/[0.06] bg-[#F5F5F7] p-0 dark:border-white/10 dark:bg-[#121212] sm:max-w-lg"
      >
        <SheetHeader className="shrink-0 space-y-0 border-b border-black/[0.06] bg-white px-4 py-3.5 text-left dark:border-white/10 dark:bg-[#1C1C1E]">
          <SheetTitle className="text-[14px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
            Create gift card
          </SheetTitle>
          <SheetDescription className="mt-0.5 text-[12px] text-neutral-400">
            Issue a redeemable code with a starting balance.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <GiftCardForm
            key={open ? "open" : "closed"}
            currency={currency}
            formId={formId}
            onSubmit={handleSubmit}
          />
        </div>

        <SheetFooter className="shrink-0 gap-1.5 border-t border-black/[0.06] bg-white px-4 py-3 dark:border-white/10 dark:bg-[#1C1C1E] sm:flex-row sm:justify-end sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            className={cn(dashboardPrimaryBtn, "h-8 px-3")}
            loading={loading}
          >
            Create gift card
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
