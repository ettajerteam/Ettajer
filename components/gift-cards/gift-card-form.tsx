"use client";

import { useState, type FormEvent } from "react";
import { Check, Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GiftCardDesign } from "@/components/gift-cards/gift-card-design";
import { cn, formatCurrency } from "@/lib/utils";
import {
  dashboardCard,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import {
  DEFAULT_GIFT_CARD_TEMPLATE,
  GIFT_CARD_TEMPLATES,
  type GiftCardTemplateId,
} from "@/lib/gift-card-templates";

export interface GiftCardFormValues {
  balance: number;
  expiresAt: string | null;
  templateId: GiftCardTemplateId;
}

interface GiftCardFormProps {
  currency: string;
  formId: string;
  onSubmit: (data: GiftCardFormValues) => Promise<void>;
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

export function GiftCardForm({ currency, formId, onSubmit }: GiftCardFormProps) {
  const [balance, setBalance] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [templateId, setTemplateId] = useState<GiftCardTemplateId>(
    DEFAULT_GIFT_CARD_TEMPLATE
  );
  const [error, setError] = useState<string | null>(null);

  const previewAmount = Number(balance);
  const previewLabel =
    Number.isFinite(previewAmount) && previewAmount > 0
      ? formatCurrency(previewAmount, currency)
      : formatCurrency(0, currency).replace(/[\d.,]+/g, "0");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(balance);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a balance greater than 0");
      return;
    }
    setError(null);
    await onSubmit({
      balance: amount,
      expiresAt: expiresAt.trim() ? expiresAt.trim() : null,
      templateId,
    });
  }

  return (
    <form id={formId} onSubmit={(e) => void handleSubmit(e)} className={dashboardStack}>
      <section className={cn(dashboardCard, "space-y-3 p-4")}>
        <div>
          <h3 className={dashboardTitle}>Preview</h3>
          <p className={dashboardSubtitle}>
            Design updates as you change the balance and template.
          </p>
        </div>

        <GiftCardDesign
          templateId={templateId}
          balanceLabel={previewLabel}
          currency={currency}
          size="lg"
          className="mx-auto w-full max-w-[280px]"
        />
      </section>

      <section className={cn(dashboardCard, "space-y-3 p-4")}>
        <div>
          <h3 className={dashboardTitle}>Design</h3>
          <p className={dashboardSubtitle}>Choose a look for this gift card.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GIFT_CARD_TEMPLATES.map((template) => {
            const selected = templateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                className={cn(
                  "group relative rounded-[10px] border p-1.5 text-left transition-colors",
                  selected
                    ? "border-[#007AFF]/45 bg-[#007AFF]/[0.06]"
                    : "border-black/[0.06] bg-white hover:border-black/[0.12] dark:border-white/10 dark:bg-transparent dark:hover:border-white/20"
                )}
              >
                <GiftCardDesign
                  templateId={template.id}
                  balanceLabel={formatCurrency(100, currency)}
                  code="GC-••••"
                  storeName={template.name}
                  size="sm"
                />
                <div className="mt-1.5 flex items-center justify-between gap-1 px-0.5">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-neutral-900 dark:text-white">
                      {template.name}
                    </p>
                    <p className="truncate text-[10px] text-neutral-400">
                      {template.tagline}
                    </p>
                  </div>
                  {selected ? (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className={cn(dashboardCard, "space-y-3 p-4")}>
        <div>
          <h3 className={dashboardTitle}>Balance</h3>
          <p className={dashboardSubtitle}>
            A unique code is generated when you create the card.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="gift-balance"
            className="text-[11px] font-medium text-neutral-500"
          >
            Amount ({currency})
          </Label>
          <div className="relative">
            <Wallet className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              id="gift-balance"
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              value={balance}
              onChange={(e) => {
                setBalance(e.target.value);
                if (error) setError(null);
              }}
              className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] pl-8 text-[13px] dark:border-white/10 dark:bg-white/[0.05]"
              placeholder="e.g. 200"
            />
          </div>
          {error ? (
            <p className="text-[11px] text-red-600">{error}</p>
          ) : (
            <p className={dashboardSubtitle}>
              Amount customers can spend with this code.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((amount) => {
            const active = balance === String(amount);
            return (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setBalance(String(amount));
                  if (error) setError(null);
                }}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "border-[#007AFF]/40 bg-[#007AFF]/[0.08] text-[#007AFF]"
                    : "border-black/[0.06] bg-white text-neutral-600 hover:bg-[#F5F5F7] dark:border-white/10 dark:bg-transparent dark:text-neutral-300 dark:hover:bg-white/[0.04]"
                )}
              >
                {formatCurrency(amount, currency)}
              </button>
            );
          })}
        </div>
      </section>

      <section className={cn(dashboardCard, "space-y-3 p-4")}>
        <div>
          <h3 className={dashboardTitle}>Expiry</h3>
          <p className={dashboardSubtitle}>
            Optional. Leave empty for a card that never expires.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="gift-expires"
            className="text-[11px] font-medium text-neutral-500"
          >
            Expires on
          </Label>
          <Input
            id="gift-expires"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[13px] dark:border-white/10 dark:bg-white/[0.05]"
          />
        </div>
      </section>
    </form>
  );
}
