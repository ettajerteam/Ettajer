"use client";

import { useMemo } from "react";
import { Check, Coins, Languages, Type } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/types";
import { STORE_LANGUAGES } from "@/lib/morocco-cities";
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
import { cn } from "@/lib/utils";

interface CurrencyLanguageSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

const TRIGGER =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

const LANGUAGE_META: Record<
  string,
  { native: string; direction: "LTR" | "RTL"; sample: string }
> = {
  en: {
    native: "English",
    direction: "LTR",
    sample: "Add to cart · Checkout",
  },
  ar: {
    native: "العربية",
    direction: "RTL",
    sample: "أضف إلى السلة · إتمام الطلب",
  },
  fr: {
    native: "Français",
    direction: "LTR",
    sample: "Ajouter au panier · Paiement",
  },
};

function formatSamplePrice(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "MAD" || currency === "DZD" ? 2 : 2,
    }).format(amount);
  } catch {
    const meta = CURRENCIES.find((c) => c.value === currency);
    return `${amount.toFixed(2)} ${meta?.symbol ?? currency}`;
  }
}

function localeForLanguage(language: string) {
  if (language === "ar") return "ar-MA";
  if (language === "fr") return "fr-MA";
  return "en-US";
}

export function CurrencyLanguageSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: CurrencyLanguageSettingsProps) {
  const currencyMeta =
    CURRENCIES.find((c) => c.value === store.currency) ?? CURRENCIES[0];
  const languageMeta =
    LANGUAGE_META[store.language] ?? LANGUAGE_META.en!;
  const languageLabel =
    STORE_LANGUAGES.find((l) => l.value === store.language)?.label ??
    "English";

  const previewPrice = useMemo(
    () =>
      formatSamplePrice(
        249.0,
        store.currency,
        localeForLanguage(store.language)
      ),
    [store.currency, store.language]
  );

  const checklist = useMemo(
    () => [
      {
        id: "currency",
        label: "Currency",
        done: Boolean(store.currency),
      },
      {
        id: "language",
        label: "Language",
        done: Boolean(store.language),
      },
      {
        id: "rtl",
        label: "Layout",
        done: true,
      },
    ],
    [store.currency, store.language]
  );
  const doneCount = checklist.filter((item) => item.done).length;

  return (
    <SettingsPanel
      title="Currency & language"
      description="How prices appear and which language your storefront uses."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save locale"
    >
      {/* Live preview */}
      <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-neutral-400">
            Storefront preview
          </p>
          <p className="text-[10px] text-neutral-400">
            {doneCount}/{checklist.length} set
          </p>
        </div>

        <div className="grid gap-3 px-3.5 py-3.5 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1E]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <Coins className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">
                Sample price
              </p>
              <p className="mt-0.5 truncate font-sans text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {previewPrice}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                {currencyMeta.label}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-[#1C1C1E]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <Languages className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">
                Interface language
              </p>
              <p className="mt-0.5 truncate font-sans text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {languageLabel}
                <span className="ml-1.5 text-[12px] font-medium text-neutral-400">
                  {languageMeta.native}
                </span>
              </p>
              <p
                className="mt-0.5 truncate text-[11px] text-neutral-500"
                dir={languageMeta.direction === "RTL" ? "rtl" : "ltr"}
              >
                {languageMeta.sample}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 border-t border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          {checklist.map((item) => (
            <span
              key={item.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                item.done
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-black/[0.03] text-neutral-400 dark:bg-white/[0.04]"
              )}
            >
              <Check className="h-2.5 w-2.5" />
              {item.label}
            </span>
          ))}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
              languageMeta.direction === "RTL"
                ? "bg-[#007AFF]/10 text-[#007AFF]"
                : "bg-black/[0.03] text-neutral-500 dark:bg-white/[0.04]"
            )}
          >
            <Type className="h-2.5 w-2.5" />
            {languageMeta.direction}
          </span>
        </div>
      </div>

      <SettingsSection
        title="Currency"
        description="Used for product prices, cart totals, and invoices."
      >
        <SettingsField label="Store currency" htmlFor="store-currency">
          <Select
            value={store.currency}
            onValueChange={(v) => onChange({ currency: v })}
          >
            <SelectTrigger id="store-currency" className={TRIGGER}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <span className="flex items-center gap-2">
                    <span className="w-8 text-[12px] text-neutral-400">
                      {c.symbol}
                    </span>
                    <span>{c.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingsField>

        <div className="grid grid-cols-3 gap-1.5">
          {[99, 249, 1299].map((amount) => (
            <div
              key={amount}
              className="rounded-[10px] border border-black/[0.05] bg-white px-2.5 py-2 text-center dark:border-white/10 dark:bg-white/[0.03]"
            >
              <p className="text-[10px] text-neutral-400">Example</p>
              <p className="mt-0.5 font-sans text-[12px] font-semibold tracking-[-0.01em] text-neutral-800 dark:text-neutral-100">
                {formatSamplePrice(
                  amount,
                  store.currency,
                  localeForLanguage(store.language)
                )}
              </p>
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Language"
        description="Buttons, cart, and checkout follow this language."
      >
        <SettingsField label="Default language" htmlFor="store-language">
          <Select
            value={store.language}
            onValueChange={(v) => onChange({ language: v })}
          >
            <SelectTrigger id="store-language" className={TRIGGER}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STORE_LANGUAGES.map((l) => {
                const meta = LANGUAGE_META[l.value];
                return (
                  <SelectItem key={l.value} value={l.value}>
                    <span className="flex items-center gap-2">
                      <span>{l.label}</span>
                      {meta ? (
                        <span className="text-[11px] text-neutral-400">
                          {meta.native}
                          {meta.direction === "RTL" ? " · RTL" : ""}
                        </span>
                      ) : null}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </SettingsField>

        <div
          className={cn(
            "rounded-[10px] border px-3 py-2.5 text-[11px] leading-relaxed",
            store.language === "ar"
              ? "border-[#007AFF]/20 bg-[#007AFF]/[0.04] text-neutral-700 dark:text-neutral-300"
              : "border-black/[0.05] bg-white text-neutral-500 dark:border-white/10 dark:bg-white/[0.03]"
          )}
        >
          {store.language === "ar" ? (
            <>
              Arabic enables right-to-left layout on your storefront — menus,
              cart, and checkout flip direction automatically.
            </>
          ) : (
            <>
              Storefront text stays left-to-right. Switch to Arabic anytime to
              enable RTL layout for Maghreb shoppers.
            </>
          )}
        </div>
      </SettingsSection>

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        Shipping rates use this currency under{" "}
        <SettingsRelatedLink tab="shipping">Shipping</SettingsRelatedLink>
        . Checkout messages live in{" "}
        <SettingsRelatedLink tab="checkout">Checkout</SettingsRelatedLink>.
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
