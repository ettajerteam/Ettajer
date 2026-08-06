"use client";

import Link from "next/link";
import { HelpCircle, Percent, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsField,
  SettingsSection,
} from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { StoreWithSettings } from "@/lib/store-settings";
import type { TaxPreferences } from "@/lib/shop-preferences";
import { calculateOrderTax } from "@/lib/tax";
import { cn, formatCurrency } from "@/lib/utils";

interface TaxSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

const SAMPLE_SUBTOTAL = 100;

export function TaxSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty = false,
}: TaxSettingsProps) {
  const tax = store.settings.shop.tax;
  const currency = store.currency || "MAD";

  const patchTax = (patch: Partial<TaxPreferences>) => {
    onChange({
      settings: {
        ...store.settings,
        shop: {
          ...store.settings.shop,
          tax: { ...tax, ...patch },
        },
      },
    });
  };

  const preview = calculateOrderTax(tax, SAMPLE_SUBTOTAL, 0);
  const previewTotal = SAMPLE_SUBTOTAL + preview.addToTotal;

  return (
    <SettingsPanel
      title="Taxes"
      description="Add a store-wide tax rate for checkout and invoices."
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      saveLabel="Save taxes"
    >
      <SettingsSection
        title="Tax rate"
        description="Applied to merchandise after discounts. Shipping and COD fees are not taxed."
      >
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                tax.enabled
                  ? "bg-[#007AFF]/10 text-[#007AFF]"
                  : "bg-neutral-100 text-neutral-400 dark:bg-white/10"
              )}
            >
              <Percent className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                Charge tax on orders
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Off by default — enable when you need TVA or sales tax on
                receipts.
              </p>
            </div>
          </div>
          <Switch
            checked={tax.enabled}
            onCheckedChange={(v) => patchTax({ enabled: v })}
          />
        </label>

        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2",
            !tax.enabled && "pointer-events-none opacity-50"
          )}
        >
          <SettingsField label="Rate (%)" htmlFor="tax-rate">
            <Input
              id="tax-rate"
              type="number"
              min={0}
              max={100}
              step={0.01}
              className={FIELD}
              value={tax.ratePercent}
              onChange={(e) => {
                const n = Number(e.target.value);
                patchTax({
                  ratePercent: Number.isFinite(n)
                    ? Math.max(0, Math.min(100, n))
                    : 0,
                });
              }}
            />
          </SettingsField>
          <SettingsField label="Label on receipts" htmlFor="tax-label">
            <Input
              id="tax-label"
              className={FIELD}
              maxLength={20}
              placeholder="TVA"
              value={tax.label}
              onChange={(e) => patchTax({ label: e.target.value })}
            />
          </SettingsField>
        </div>

        <label
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent",
            !tax.enabled && "pointer-events-none opacity-50"
          )}
        >
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              Prices already include tax
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Tax is extracted for invoices — checkout total stays the same.
            </p>
          </div>
          <Switch
            checked={tax.pricesIncludeTax}
            onCheckedChange={(v) => patchTax({ pricesIncludeTax: v })}
          />
        </label>
      </SettingsSection>

      <SettingsSection
        title="Where it shows"
        description="Control customer-facing visibility."
      >
        <label
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent",
            !tax.enabled && "pointer-events-none opacity-50"
          )}
        >
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
              Show on checkout
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Tax line in the order summary before place order.
            </p>
          </div>
          <Switch
            checked={tax.showOnCheckout}
            onCheckedChange={(v) => patchTax({ showOnCheckout: v })}
          />
        </label>
        <label
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent",
            !tax.enabled && "pointer-events-none opacity-50"
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                tax.showOnInvoice
                  ? "bg-[#007AFF]/10 text-[#007AFF]"
                  : "bg-neutral-100 text-neutral-400 dark:bg-white/10"
              )}
            >
              <Receipt className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                Show on invoices
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Tax line on PDF invoices from Print settings.
              </p>
            </div>
          </div>
          <Switch
            checked={tax.showOnInvoice}
            onCheckedChange={(v) => patchTax({ showOnInvoice: v })}
          />
        </label>
      </SettingsSection>

      <SettingsSection title="Preview" description="Example on a 100 subtotal.">
        <div className="rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 px-3.5 py-3 text-[12px] dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span className="tabular-nums">
              {formatCurrency(SAMPLE_SUBTOTAL, currency)}
            </span>
          </div>
          {tax.enabled && preview.tax > 0 ? (
            <div className="mt-1.5 flex justify-between text-neutral-500">
              <span>
                {preview.label} ({preview.ratePercent}%
                {preview.pricesIncludeTax ? ", included" : ""})
              </span>
              <span className="tabular-nums">
                {formatCurrency(preview.tax, currency)}
              </span>
            </div>
          ) : (
            <div className="mt-1.5 flex justify-between text-neutral-400">
              <span>Tax</span>
              <span>—</span>
            </div>
          )}
          <div className="mt-2 flex justify-between border-t border-black/[0.06] pt-2 font-medium text-neutral-900 dark:border-white/10 dark:text-white">
            <span>Customer pays</span>
            <span className="tabular-nums">
              {formatCurrency(previewTotal, currency)}
            </span>
          </div>
        </div>

        <div className="rounded-[10px] border border-dashed border-black/[0.08] bg-white px-3.5 py-3 dark:border-white/15 dark:bg-transparent">
          <div className="flex items-start gap-2.5">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <p className="text-[11px] leading-relaxed text-neutral-500">
              Morocco often uses 20% TVA. This is a single store-wide rate —
              per-region tax rules are not available yet. This is not tax advice;
              confirm rates with your accountant.
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Related:{" "}
        <SettingsRelatedLink tab="checkout">Checkout</SettingsRelatedLink>
        {" · "}
        <SettingsRelatedLink tab="print">Print / invoices</SettingsRelatedLink>
        {" · "}
        <Link
          href="/dashboard/orders"
          className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
        >
          Orders
        </Link>
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
