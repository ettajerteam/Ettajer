"use client";

import { useState, type ReactNode } from "react";
import {
  MoreHorizontal,
  Copy,
  Ban,
  Gift,
  Plus,
  CircleOff,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GiftCardTableSkeleton } from "@/components/gift-cards/gift-card-table-skeleton";
import { GiftCardDesign } from "@/components/gift-cards/gift-card-design";
import { ProductsEmptyState } from "@/components/products/products-empty-state";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import {
  DEFAULT_GIFT_CARD_TEMPLATE,
  GIFT_CARD_TEMPLATES,
  type GiftCardTemplateId,
} from "@/lib/gift-card-templates";
import type { GiftCardItem } from "@/types/gift-cards";

interface GiftCardListProps {
  cards: GiftCardItem[];
  currency: string;
  loading?: boolean;
  hasFilters?: boolean;
  onAdd: () => void;
  onDeactivated: (id: string) => void;
  onClearFilters?: () => void;
  toolbar?: ReactNode;
}

function templateForCard(card: GiftCardItem): GiftCardTemplateId {
  if (card.templateId) {
    const match = GIFT_CARD_TEMPLATES.find((t) => t.id === card.templateId);
    if (match) return match.id;
  }
  let hash = 0;
  for (let i = 0; i < card.id.length; i++) hash = (hash + card.id.charCodeAt(i) * (i + 1)) % 997;
  return GIFT_CARD_TEMPLATES[hash % GIFT_CARD_TEMPLATES.length]?.id ?? DEFAULT_GIFT_CARD_TEMPLATE;
}

export function GiftCardList({
  cards,
  currency,
  loading = false,
  hasFilters = false,
  onAdd,
  onDeactivated,
  onClearFilters,
  toolbar,
}: GiftCardListProps) {
  const [deactivateTarget, setDeactivateTarget] = useState<GiftCardItem | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      const res = await fetch(`/api/gift-cards?id=${deactivateTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to deactivate"
        );
      }
      toast.success("Gift card deactivated");
      onDeactivated(deactivateTarget.id);
      setDeactivateTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Deactivate failed");
    } finally {
      setDeactivating(false);
    }
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied");
    } catch {
      toast.error("Could not copy code");
    }
  }

  if (loading && cards.length === 0) {
    return <GiftCardTableSkeleton />;
  }

  if (cards.length === 0) {
    if (hasFilters) {
      return (
        <div className={cn(dashboardCard, "overflow-hidden")}>
          <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={dashboardTitle}>Gift cards</h2>
              <p className={dashboardSubtitle}>No codes match your search</p>
            </div>
            {toolbar}
          </div>
          <ProductsEmptyState
            icon={CircleOff}
            title="No matches"
            description="Try another search or clear filters."
            action={
              onClearFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
                  onClick={onClearFilters}
                >
                  Clear search
                </Button>
              ) : undefined
            }
            embedded
          />
        </div>
      );
    }

    return (
      <ProductsEmptyState
        icon={Gift}
        title="No gift cards yet"
        description="Create redeemable codes customers can use at checkout — great for gifts and store credit."
        action={
          <Button
            onClick={onAdd}
            className="h-8 rounded-md bg-neutral-900 px-3 text-[12px] text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create gift card
          </Button>
        }
        tips={[
          {
            step: "01",
            title: "Set a balance",
            body: "Choose the amount the customer can spend in your store.",
          },
          {
            step: "02",
            title: "Share the code",
            body: "Copy the code and send it by email, WhatsApp, or print.",
          },
          {
            step: "03",
            title: "Redeem at checkout",
            body: "Customers apply the code when they buy from your storefront.",
          },
        ]}
      />
    );
  }

  return (
    <>
      <div className={cn(dashboardCard, "overflow-hidden")}>
        <div className="flex flex-col gap-2.5 border-b border-black/[0.05] px-4 py-3 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={dashboardTitle}>
              Gift cards
              <span className="ml-1.5 font-normal text-neutral-400">
                {loading ? "Updating…" : cards.length}
              </span>
            </h2>
            <p className={dashboardSubtitle}>Copy a code or deactivate from ···</p>
          </div>
          {toolbar}
        </div>

        {/* Mobile */}
        <div className="divide-y divide-black/[0.04] dark:divide-white/5 md:hidden">
          {cards.map((card) => (
            <div key={card.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="w-[4.5rem] shrink-0">
                  <GiftCardDesign
                    templateId={templateForCard(card)}
                    balanceLabel={formatCurrency(card.balance, currency)}
                    code={card.code}
                    size="sm"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[12px] font-medium text-neutral-900 dark:text-white">
                        {card.code}
                      </p>
                      <p className="mt-0.5 text-[10px] text-neutral-400">
                        {formatCurrency(card.balance, currency)}
                        {card.balance !== card.initialBalance
                          ? ` of ${formatCurrency(card.initialBalance, currency)}`
                          : ""}
                        {" · "}
                        <span suppressHydrationWarning>{formatExpiry(card.expiresAt)}</span>
                      </p>
                      <div className="mt-2">
                        <StatusChip active={card.active} />
                      </div>
                    </div>
                    <ItemActions
                      card={card}
                      onCopy={() => void copyCode(card.code)}
                      onDeactivate={setDeactivateTarget}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                <th className="px-4 py-2.5">Card</th>
                <th className="px-4 py-2.5">Balance</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Expires</th>
                <th className="px-4 py-2.5 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr
                  key={card.id}
                  className="border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="w-[4.25rem] shrink-0">
                        <GiftCardDesign
                          templateId={templateForCard(card)}
                          balanceLabel={formatCurrency(card.balance, currency)}
                          code={card.code}
                          size="sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => void copyCode(card.code)}
                        className="group/code inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition hover:bg-black/[0.04]"
                        title="Copy code"
                      >
                        <span className="truncate font-mono text-[12px] font-medium text-neutral-900 dark:text-white">
                          {card.code}
                        </span>
                        <Copy className="h-3 w-3 shrink-0 text-neutral-400 opacity-0 transition group-hover/code:opacity-100" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium tabular-nums text-neutral-900 dark:text-white">
                      {formatCurrency(card.balance, currency)}
                    </p>
                    {card.balance !== card.initialBalance ? (
                      <p className="text-[10px] tabular-nums text-neutral-400">
                        of {formatCurrency(card.initialBalance, currency)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusChip active={card.active} />
                  </td>
                  <td className="px-4 py-2.5 text-neutral-400">
                    <span suppressHydrationWarning>{formatExpiry(card.expiresAt)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <ItemActions
                      card={card}
                      onCopy={() => void copyCode(card.code)}
                      onDeactivate={setDeactivateTarget}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && !deactivating && setDeactivateTarget(null)}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-[12px]">
          <DialogHeader className="space-y-1 border-b border-black/[0.05] px-4 py-3.5 text-left dark:border-white/10">
            <DialogTitle className="text-[14px] font-semibold tracking-[-0.01em]">
              Deactivate gift card
            </DialogTitle>
            <DialogDescription className="text-[12px]">
              Deactivate{" "}
              <span className="font-mono font-medium text-neutral-900 dark:text-white">
                {deactivateTarget?.code}
              </span>
              ? It can no longer be redeemed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-1.5 px-4 py-3 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="h-8 rounded-md border-black/[0.06] px-3 text-[12px] dark:border-white/10"
              onClick={() => setDeactivateTarget(null)}
              disabled={deactivating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-8 rounded-md px-3 text-[12px]"
              onClick={() => void handleDeactivate()}
              loading={deactivating}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatExpiry(iso: string | null): string {
  if (!iso) return "No expiry";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "No expiry";
  return formatDate(d);
}

function StatusChip({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        <Check className="h-3 w-3" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-white/10 dark:text-neutral-300">
      Inactive
    </span>
  );
}

function ItemActions({
  card,
  onCopy,
  onDeactivate,
}: {
  card: GiftCardItem;
  onCopy: () => void;
  onDeactivate: (card: GiftCardItem) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-neutral-400"
          aria-label="Actions"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={onCopy}>
          <Copy className="mr-2 h-3.5 w-3.5" />
          Copy code
        </DropdownMenuItem>
        {card.active ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onSelect={() => onDeactivate(card)}
            >
              <Ban className="mr-2 h-3.5 w-3.5" />
              Deactivate
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
