"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Percent, RefreshCw, Tag, Wallet } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import {
  dashboardCard,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import type { CouponRow } from "@/lib/marketing";

export interface DiscountFormState {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  minPurchase: string;
  maxDiscount: string;
  usageLimit: string;
  expiresAt: string;
}

export const EMPTY_DISCOUNT_FORM: DiscountFormState = {
  code: "",
  type: "percentage",
  value: "",
  minPurchase: "",
  maxDiscount: "",
  usageLimit: "",
  expiresAt: "",
};

export function formFromCoupon(coupon: CouponRow): DiscountFormState {
  return {
    code: coupon.code,
    type: coupon.type === "fixed" ? "fixed" : "percentage",
    value: String(coupon.value),
    minPurchase: coupon.minPurchase != null ? String(coupon.minPurchase) : "",
    maxDiscount: coupon.maxDiscount != null ? String(coupon.maxDiscount) : "",
    usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
    expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
  };
}

const PERCENT_PRESETS = [10, 15, 20, 25, 50];
const FIXED_PRESETS = [20, 50, 100, 200];

function generateCode(): string {
  const words = ["SAVE", "DEAL", "VIP", "WELCOME", "FLASH", "EXTRA"];
  const word = words[Math.floor(Math.random() * words.length)]!;
  const num = Math.floor(10 + Math.random() * 90);
  return `${word}${num}`;
}

interface DiscountFormProps {
  currency: string;
  formId: string;
  initial: DiscountFormState;
  onSubmit: (data: DiscountFormState) => Promise<void>;
}

export function DiscountForm({
  currency,
  formId,
  initial,
  onSubmit,
}: DiscountFormProps) {
  const [form, setForm] = useState<DiscountFormState>(initial);
  const [error, setError] = useState<string | null>(null);

  const valueNum = Number(form.value);
  const hasValue = Number.isFinite(valueNum) && valueNum > 0;

  const preview = useMemo(() => {
    const code = form.code.trim() || "YOURCODE";
    if (!hasValue) {
      return {
        headline: "Set an offer",
        detail: "Customers will enter this code at checkout.",
        badge: code,
      };
    }
    if (form.type === "percentage") {
      const cap =
        form.maxDiscount && Number(form.maxDiscount) > 0
          ? ` · max ${formatCurrency(Number(form.maxDiscount), currency)}`
          : "";
      return {
        headline: `${valueNum}% off`,
        detail: `Apply ${code} at checkout${cap}`,
        badge: code,
      };
    }
    return {
      headline: `${formatCurrency(valueNum, currency)} off`,
      detail: `Apply ${code} at checkout`,
      badge: code,
    };
  }, [form, currency, hasValue, valueNum]);

  const presets = form.type === "percentage" ? PERCENT_PRESETS : FIXED_PRESETS;

  function patch(partial: Partial<DiscountFormState>) {
    setForm((f) => ({ ...f, ...partial }));
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) {
      setError("Enter a discount code");
      return;
    }
    if (!hasValue) {
      setError("Enter a discount value greater than 0");
      return;
    }
    if (form.type === "percentage" && valueNum > 100) {
      setError("Percentage cannot exceed 100");
      return;
    }
    setError(null);
    await onSubmit(form);
  }

  const fieldClass =
    "h-9 rounded-md border-black/[0.06] bg-[#F5F5F7] text-[13px] dark:border-white/10 dark:bg-white/[0.05]";

  return (
    <form
      id={formId}
      onSubmit={(e) => void handleSubmit(e)}
      className={dashboardStack}
    >
      <section className={cn(dashboardCard, "overflow-hidden")}>
        <div className="border-b border-black/[0.05] bg-gradient-to-br from-[#007AFF]/[0.08] to-transparent px-4 py-4 dark:border-white/10">
          <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
            Preview
          </p>
          <p className="mt-1.5 text-[20px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
            {preview.headline}
          </p>
          <p className="mt-1 text-[12px] text-neutral-500 dark:text-neutral-400">
            {preview.detail}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-dashed border-[#007AFF]/30 bg-white/80 px-2.5 py-1.5 font-mono text-[12px] font-semibold tracking-wide text-[#007AFF] dark:bg-white/[0.06]">
            <Tag className="h-3 w-3" />
            {preview.badge}
          </div>
        </div>
        {(form.minPurchase || form.usageLimit || form.expiresAt) && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 py-2.5 text-[11px] text-neutral-400">
            {form.minPurchase ? (
              <span>Min {formatCurrency(Number(form.minPurchase) || 0, currency)}</span>
            ) : null}
            {form.usageLimit ? <span>Limit {form.usageLimit} uses</span> : null}
            {form.expiresAt ? (
              <span>Expires {new Date(form.expiresAt).toLocaleDateString()}</span>
            ) : null}
          </div>
        )}
      </section>

      <section className={cn(dashboardCard, "space-y-3 p-4")}>
        <div>
          <h3 className={dashboardTitle}>Code</h3>
          <p className={dashboardSubtitle}>
            Short and memorable — customers type this at checkout.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="discount-code" className="text-[11px] font-medium text-neutral-500">
            Discount code
          </Label>
          <div className="flex gap-1.5">
            <Input
              id="discount-code"
              value={form.code}
              onChange={(e) =>
                patch({
                  code: e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9_-]/g, ""),
                })
              }
              placeholder="SUMMER20"
              className={cn(fieldClass, "font-mono uppercase tracking-wide")}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => patch({ code: generateCode() })}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-black/[0.06] bg-white px-2.5 text-[11px] font-medium text-neutral-600 transition hover:bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-300 dark:hover:bg-white/[0.08]"
              title="Generate code"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>
        </div>
      </section>

      <section className={cn(dashboardCard, "space-y-3 p-4")}>
        <div>
          <h3 className={dashboardTitle}>Offer type</h3>
          <p className={dashboardSubtitle}>
            Percentage of the cart, or a fixed amount off.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              {
                id: "percentage" as const,
                title: "Percentage",
                body: "e.g. 15% off",
                icon: Percent,
              },
              {
                id: "fixed" as const,
                title: "Fixed amount",
                body: `e.g. 50 ${currency}`,
                icon: Wallet,
              },
            ] as const
          ).map((option) => {
            const selected = form.type === option.id;
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  patch({
                    type: option.id,
                    maxDiscount: option.id === "fixed" ? "" : form.maxDiscount,
                  })
                }
                className={cn(
                  "relative rounded-[10px] border px-3 py-2.5 text-left transition-colors",
                  selected
                    ? "border-[#007AFF]/45 bg-[#007AFF]/[0.06]"
                    : "border-black/[0.06] bg-white hover:border-black/[0.12] dark:border-white/10 dark:bg-transparent dark:hover:border-white/20"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md",
                      selected
                        ? "bg-[#007AFF] text-white"
                        : "bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {selected ? (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-[12px] font-medium text-neutral-900 dark:text-white">
                  {option.title}
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-400">{option.body}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className={cn(dashboardCard, "space-y-3 p-4")}>
        <div>
          <h3 className={dashboardTitle}>Value</h3>
          <p className={dashboardSubtitle}>
            {form.type === "percentage"
              ? "How much percent off the order subtotal."
              : `Fixed amount in ${currency} taken off the order.`}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="discount-value" className="text-[11px] font-medium text-neutral-500">
            {form.type === "percentage" ? "Percent off" : `Amount (${currency})`}
          </Label>
          <div className="relative">
            {form.type === "percentage" ? (
              <Percent className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            ) : (
              <Wallet className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            )}
            <Input
              id="discount-value"
              type="number"
              min={0}
              max={form.type === "percentage" ? 100 : undefined}
              step="any"
              inputMode="decimal"
              value={form.value}
              onChange={(e) => patch({ value: e.target.value })}
              placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 50"}
              className={cn(fieldClass, "pl-8")}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presets.map((amount) => {
            const active = form.value === String(amount);
            return (
              <button
                key={amount}
                type="button"
                onClick={() => patch({ value: String(amount) })}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                  active
                    ? "border-[#007AFF]/40 bg-[#007AFF]/[0.08] text-[#007AFF]"
                    : "border-black/[0.06] bg-white text-neutral-600 hover:bg-[#F5F5F7] dark:border-white/10 dark:bg-transparent dark:text-neutral-300 dark:hover:bg-white/[0.04]"
                )}
              >
                {form.type === "percentage"
                  ? `${amount}%`
                  : formatCurrency(amount, currency)}
              </button>
            );
          })}
        </div>

        {form.type === "percentage" ? (
          <div className="space-y-1.5 border-t border-black/[0.05] pt-3 dark:border-white/10">
            <Label
              htmlFor="discount-max"
              className="text-[11px] font-medium text-neutral-500"
            >
              Max discount ({currency}) — optional
            </Label>
            <Input
              id="discount-max"
              type="number"
              min={0}
              step="any"
              value={form.maxDiscount}
              onChange={(e) => patch({ maxDiscount: e.target.value })}
              placeholder="Cap the % off amount"
              className={fieldClass}
            />
            <p className={dashboardSubtitle}>
              e.g. 20% off, maximum {formatCurrency(100, currency)}.
            </p>
          </div>
        ) : null}
      </section>

      <section className={cn(dashboardCard, "space-y-3 p-4")}>
        <div>
          <h3 className={dashboardTitle}>Rules</h3>
          <p className={dashboardSubtitle}>
            Optional limits so the offer stays under control.
          </p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="discount-min"
              className="text-[11px] font-medium text-neutral-500"
            >
              Min purchase ({currency})
            </Label>
            <Input
              id="discount-min"
              type="number"
              min={0}
              step="any"
              value={form.minPurchase}
              onChange={(e) => patch({ minPurchase: e.target.value })}
              placeholder="No minimum"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="discount-limit"
              className="text-[11px] font-medium text-neutral-500"
            >
              Usage limit
            </Label>
            <Input
              id="discount-limit"
              type="number"
              min={1}
              step={1}
              value={form.usageLimit}
              onChange={(e) => patch({ usageLimit: e.target.value })}
              placeholder="Unlimited"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="discount-expires"
            className="text-[11px] font-medium text-neutral-500"
          >
            Expires on
          </Label>
          <Input
            id="discount-expires"
            type="date"
            value={form.expiresAt}
            onChange={(e) => patch({ expiresAt: e.target.value })}
            className={fieldClass}
          />
          <p className={dashboardSubtitle}>Leave empty for no expiry.</p>
        </div>
      </section>

      {error ? (
        <p className="rounded-[10px] border border-red-500/20 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : null}
    </form>
  );
}
