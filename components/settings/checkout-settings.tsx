"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  EyeOff,
  LayoutTemplate,
  Megaphone,
  Settings2,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DEFAULT_CHECKOUT_FIELDS,
  type CheckoutCustomerFields,
  type CheckoutFieldMode,
  type CheckoutThemeId,
} from "@/lib/shop-preferences";
import { checkoutThemeOptions, getCheckoutThemeStyles } from "@/lib/checkout-theme-styles";
import { getStoreCheckoutUrl } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";

interface CheckoutSettingsProps {
  store: StoreWithSettings;
  onChange: (updates: Partial<StoreWithSettings>) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  dirty?: boolean;
}

type CheckoutSubTab = "fields" | "general" | "theme" | "experience";

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";
const AREA =
  "rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

const SUB_TABS: {
  id: CheckoutSubTab;
  label: string;
  icon: typeof ShoppingBag;
}[] = [
  { id: "fields", label: "Customer info", icon: UserRound },
  { id: "general", label: "General", icon: ShoppingBag },
  { id: "theme", label: "Theme", icon: LayoutTemplate },
  { id: "experience", label: "Experience", icon: Settings2 },
];

const FIELD_ROWS: {
  key: keyof CheckoutCustomerFields;
  label: string;
  hint: string;
  group: "contact" | "address" | "extra";
  modes: Array<"required" | "optional" | "hidden">;
}[] = [
  {
    key: "email",
    label: "Email",
    hint: "Order confirmations and receipts",
    group: "contact",
    modes: ["required", "optional", "hidden"],
  },
  {
    key: "phone",
    label: "Phone",
    hint: "Recommended for delivery & WhatsApp",
    group: "contact",
    modes: ["required", "optional", "hidden"],
  },
  {
    key: "street",
    label: "Street address",
    hint: "Where the courier delivers",
    group: "address",
    modes: ["required", "optional", "hidden"],
  },
  {
    key: "city",
    label: "City",
    hint: "Used for shipping zones",
    group: "address",
    modes: ["required", "optional", "hidden"],
  },
  {
    key: "postalCode",
    label: "Postal code",
    hint: "Often optional for Morocco",
    group: "address",
    modes: ["required", "optional", "hidden"],
  },
  {
    key: "country",
    label: "Country",
    hint: "Can remove if you only ship to one country",
    group: "address",
    modes: ["required", "optional", "hidden"],
  },
  {
    key: "orderNote",
    label: "Order note",
    hint: "Delivery instructions from the buyer",
    group: "extra",
    modes: ["required", "optional", "hidden"],
  },
];

const FIELD_PRESETS: {
  id: string;
  label: string;
  description: string;
  fields: CheckoutCustomerFields;
}[] = [
  {
    id: "cod-ma",
    label: "COD Morocco",
    description: "Phone + city required · postal optional · email optional",
    fields: {
      email: "optional",
      phone: "required",
      street: "required",
      city: "required",
      postalCode: "optional",
      country: "required",
      orderNote: "optional",
    },
  },
  {
    id: "full",
    label: "Full form",
    description: "Ask for every contact and address field",
    fields: {
      email: "required",
      phone: "required",
      street: "required",
      city: "required",
      postalCode: "required",
      country: "required",
      orderNote: "optional",
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Name + phone + city only — fastest checkout",
    fields: {
      email: "hidden",
      phone: "required",
      street: "hidden",
      city: "required",
      postalCode: "hidden",
      country: "hidden",
      orderNote: "hidden",
    },
  },
  {
    id: "no-address",
    label: "No address",
    description: "Contact only — hide street, city, postal, country",
    fields: {
      email: "optional",
      phone: "required",
      street: "hidden",
      city: "hidden",
      postalCode: "hidden",
      country: "hidden",
      orderNote: "optional",
    },
  },
];

const THEMES = checkoutThemeOptions();

function CharCount({ value, max }: { value: string; max: number }) {
  const n = value.length;
  return (
    <span
      className={cn(
        "text-[10px] tabular-nums",
        n > max * 0.9 ? "text-amber-600" : "text-neutral-400"
      )}
    >
      {n}/{max}
    </span>
  );
}

function CheckoutPhonePreview({
  primary,
  theme,
  fields,
  layout,
  showProgress,
  showCoupon,
  announceBarEnabled,
  announceBarText,
  continueLabel,
  placeOrderLabel,
  currency,
}: {
  primary: string;
  theme: CheckoutThemeId;
  fields: CheckoutCustomerFields;
  layout: "steps" | "single";
  showProgress: boolean;
  showCoupon: boolean;
  announceBarEnabled: boolean;
  announceBarText: string;
  continueLabel: string;
  placeOrderLabel: string;
  currency: string;
}) {
  const styles = getCheckoutThemeStyles(theme);
  const soft = theme === "soft";
  const compact = theme === "compact";
  const fieldRadius = soft
    ? "rounded-xl"
    : compact
      ? "rounded"
      : "rounded-lg";
  const cardRadius = soft
    ? "rounded-2xl"
    : compact
      ? "rounded-md"
      : "rounded-xl";
  const btnRadius = soft
    ? "rounded-xl"
    : compact
      ? "rounded-md"
      : "rounded-full";
  const gap = soft ? "gap-2.5" : compact ? "gap-1" : "gap-1.5";
  const fieldH = soft ? "h-7" : compact ? "h-[18px]" : "h-6";
  const maxFields = compact ? 6 : soft ? 4 : 5;
  const screenBg = soft
    ? "color-mix(in srgb, " + primary + " 6%, #faf9f7)"
    : compact
      ? "#FFFFFF"
      : "#F5F5F7";
  const cta =
    layout === "single"
      ? placeOrderLabel.trim() || "Place order"
      : continueLabel.trim() || "Continue";

  const previewFields: {
    key: keyof CheckoutCustomerFields | "name";
    label: string;
  }[] = [
    { key: "name", label: "Full name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "street", label: "Street" },
    { key: "city", label: "City" },
    { key: "postalCode", label: "Postal" },
    { key: "country", label: "Country" },
    { key: "orderNote", label: "Note" },
  ];

  const visible = previewFields.filter((f) =>
    f.key === "name" ? true : fields[f.key] !== "hidden"
  );

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[228px] select-none" aria-hidden>
        <div className="rounded-[2rem] border-[3px] border-neutral-900 bg-neutral-900 p-[7px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)] dark:border-neutral-700 dark:bg-neutral-800">
          <div className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l-sm bg-neutral-800 dark:bg-neutral-600" />
          <div className="absolute -left-[3px] top-36 h-12 w-[3px] rounded-l-sm bg-neutral-800 dark:bg-neutral-600" />
          <div className="absolute -right-[3px] top-32 h-14 w-[3px] rounded-r-sm bg-neutral-800 dark:bg-neutral-600" />

          <div
            className="relative overflow-hidden rounded-[1.55rem]"
            style={{ backgroundColor: screenBg }}
          >
            <div className="absolute left-1/2 top-2 z-20 h-[18px] w-[72px] -translate-x-1/2 rounded-full bg-neutral-950" />

            <div className="flex items-center justify-between px-4 pb-1 pt-2.5 text-[8px] font-semibold text-neutral-900">
              <span>9:41</span>
              <span className="inline-block h-1.5 w-3 rounded-[1px] border border-neutral-900/80">
                <span className="m-[1px] block h-full w-2 rounded-[0.5px] bg-neutral-900/80" />
              </span>
            </div>

            <div className="h-[400px] overflow-hidden">
              {announceBarEnabled && announceBarText.trim() ? (
                <div
                  className="px-2 py-1 text-center text-[7px] font-medium leading-tight text-white"
                  style={{ backgroundColor: primary }}
                >
                  {announceBarText.trim().slice(0, 48)}
                  {announceBarText.trim().length > 48 ? "…" : ""}
                </div>
              ) : null}

              <div
                className={cn(
                  soft ? "px-2.5 pt-2" : compact ? "px-2 pt-1.5" : "px-2.5 pt-2",
                  soft ? "space-y-2.5" : compact ? "space-y-1.5" : "space-y-2"
                )}
              >
                <div>
                  <p
                    className={cn(
                      "font-semibold text-neutral-900",
                      soft
                        ? "text-[12px] tracking-[-0.03em]"
                        : compact
                          ? "text-[10px]"
                          : "text-[11px] tracking-[-0.02em]"
                    )}
                  >
                    Checkout
                  </p>
                  <p className="text-[7px] text-neutral-500">
                    {styles.name} · {layout === "single" ? "One page" : "3 steps"}
                  </p>
                </div>

                {layout !== "single" && showProgress ? (
                  <div className="flex items-center gap-1">
                    {["Details", "Delivery", "Pay"].map((step, i) => (
                      <div
                        key={step}
                        className="flex flex-1 flex-col items-center gap-0.5"
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center font-bold text-white",
                            soft
                              ? "h-5 w-5 rounded-lg text-[8px]"
                              : compact
                                ? "h-3.5 w-3.5 rounded text-[6px]"
                                : "h-4 w-4 rounded-full text-[7px]"
                          )}
                          style={{
                            backgroundColor: i === 0 ? primary : "#D1D5DB",
                            boxShadow:
                              soft && i === 0
                                ? `0 4px 10px -2px ${primary}66`
                                : undefined,
                          }}
                        >
                          {i + 1}
                        </div>
                        <span
                          className={cn(
                            compact
                              ? "text-[5px] font-semibold uppercase tracking-wider"
                              : "text-[6px]",
                            i === 0
                              ? "font-semibold text-neutral-800"
                              : "text-neutral-400"
                          )}
                        >
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div
                  className={cn(
                    "flex flex-col bg-white",
                    soft
                      ? "p-2.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.03]"
                      : compact
                        ? "border border-neutral-200 p-1.5"
                        : "border border-black/[0.06] p-2 shadow-sm",
                    cardRadius,
                    gap
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <div
                      className={cn(
                        "flex items-center justify-center bg-neutral-100",
                        soft ? "h-4 w-4 rounded-md" : compact ? "h-3 w-3 rounded-sm" : "h-3.5 w-3.5 rounded"
                      )}
                    >
                      <div
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: primary }}
                      />
                    </div>
                    <p
                      className={cn(
                        "font-semibold text-neutral-800",
                        compact ? "text-[6px] uppercase tracking-wider" : "text-[7px]"
                      )}
                    >
                      Contact
                    </p>
                  </div>
                  {visible.slice(0, maxFields).map((f) => (
                    <div key={f.key}>
                      <p
                        className={cn(
                          "mb-0.5 font-medium text-neutral-500",
                          soft
                            ? "text-[6px] tracking-wide"
                            : compact
                              ? "text-[5.5px] font-semibold uppercase tracking-wider"
                              : "text-[6.5px]"
                        )}
                      >
                        {f.label}
                        {f.key !== "name" &&
                        fields[f.key as keyof CheckoutCustomerFields] ===
                          "required"
                          ? " *"
                          : ""}
                      </p>
                      <div
                        className={cn(
                          fieldH,
                          fieldRadius,
                          soft
                            ? "bg-neutral-50/90 ring-1 ring-black/[0.04]"
                            : "border border-neutral-200/90 bg-neutral-50"
                        )}
                      />
                    </div>
                  ))}
                  {visible.length > maxFields ? (
                    <p className="text-center text-[6px] text-neutral-400">
                      +{visible.length - maxFields} more
                    </p>
                  ) : null}
                </div>

                {showCoupon ? (
                  <div
                    className={cn(
                      "flex items-center gap-1 p-1.5",
                      soft
                        ? "bg-white/80 ring-1 ring-black/[0.04]"
                        : "border border-dashed border-neutral-300 bg-white/80",
                      fieldRadius
                    )}
                  >
                    <div
                      className={cn(
                        "h-5 flex-1 bg-neutral-50",
                        soft
                          ? "ring-1 ring-black/[0.04]"
                          : "border border-neutral-200",
                        fieldRadius
                      )}
                    />
                    <div
                      className={cn(
                        "h-5 w-10 shrink-0 text-center text-[6px] font-semibold leading-5 text-white",
                        fieldRadius
                      )}
                      style={{ backgroundColor: primary }}
                    >
                      Apply
                    </div>
                  </div>
                ) : null}

                <div
                  className={cn(
                    "bg-white p-2",
                    soft
                      ? "shadow-sm ring-1 ring-black/[0.03]"
                      : "border border-black/[0.06]",
                    cardRadius
                  )}
                >
                  <div className="mb-1 flex justify-between text-[7px] text-neutral-500">
                    <span>2 items</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-semibold text-neutral-900">
                    <span>Total</span>
                    <span style={{ color: primary }}>249 {currency}</span>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 px-2.5 pb-3 pt-2",
                  soft
                    ? "bg-gradient-to-t from-white via-white/95 to-transparent"
                    : compact
                      ? "border-t border-neutral-200 bg-white"
                      : "bg-gradient-to-t from-white via-white/95 to-transparent"
                )}
              >
                <div
                  className={cn(
                    "py-2 text-center text-[8px] font-semibold text-white",
                    soft && "shadow-md",
                    btnRadius
                  )}
                  style={{
                    backgroundColor: primary,
                    boxShadow: soft
                      ? `0 6px 16px -6px ${primary}99`
                      : undefined,
                  }}
                >
                  {cta}
                </div>
              </div>
            </div>

            <div
              className="flex justify-center pb-1.5 pt-0.5"
              style={{ backgroundColor: screenBg }}
            >
              <div className="h-1 w-16 rounded-full bg-neutral-900/25" />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 max-w-[228px] text-center text-[11px] text-neutral-500">
        Live phone preview — {styles.description}
      </p>
    </div>
  );
}

function modeLabel(mode: string) {
  if (mode === "required") return "Required";
  if (mode === "optional") return "Optional";
  return "Removed";
}

function ModeSelect({
  value,
  modes,
  onChange,
}: {
  value: string;
  modes: Array<"required" | "optional" | "hidden">;
  onChange: (mode: CheckoutFieldMode) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CheckoutFieldMode)}
      className={cn(FIELD, "w-[132px] shrink-0")}
    >
      {modes.map((m) => (
        <option key={m} value={m}>
          {modeLabel(m)}
        </option>
      ))}
    </select>
  );
}

export function CheckoutSettings({
  store,
  onChange,
  onSave,
  saving,
  dirty,
}: CheckoutSettingsProps) {
  const shop = store.settings.shop;
  const [subTab, setSubTab] = useState<CheckoutSubTab>("fields");
  const primary = store.primaryColor || "#007AFF";
  const checkoutPath = getStoreCheckoutUrl(store.slug);

  const patchShop = (patch: Partial<typeof shop>) => {
    onChange({
      settings: {
        ...store.settings,
        shop: { ...shop, ...patch },
      },
    });
  };

  const patchField = (key: keyof CheckoutCustomerFields, mode: CheckoutFieldMode) => {
    patchShop({
      checkoutFields: {
        ...shop.checkoutFields,
        [key]: mode,
      } as CheckoutCustomerFields,
    });
  };

  const visibleCount = useMemo(() => {
    const f = shop.checkoutFields;
    return (
      1 + // name always
      (["email", "phone", "street", "city", "postalCode", "country", "orderNote"] as const)
        .filter((k) => f[k] !== "hidden").length
    );
  }, [shop.checkoutFields]);

  const removedCount = useMemo(() => {
    const f = shop.checkoutFields;
    return (
      ["email", "phone", "street", "city", "postalCode", "country", "orderNote"] as const
    ).filter((k) => f[k] === "hidden").length;
  }, [shop.checkoutFields]);

  const checklist = useMemo(
    () => [
      {
        id: "fields" as const,
        label: "Fields",
        done: visibleCount >= 2,
        tab: "fields" as CheckoutSubTab,
      },
      {
        id: "general" as const,
        label: "Rules",
        done: true,
        tab: "general" as CheckoutSubTab,
      },
      {
        id: "theme" as const,
        label: "Theme",
        done: true,
        tab: "theme" as CheckoutSubTab,
      },
      {
        id: "experience" as const,
        label: "Flow",
        done: true,
        tab: "experience" as CheckoutSubTab,
      },
    ],
    [visibleCount]
  );
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <SettingsPanel
      title="Checkout"
      description="Choose which customer details to ask for, then tune the checkout look and flow. Payment methods live in Payments."
      onSave={onSave}
      saving={saving}
      dirty={dirty}
      saveLabel="Save checkout"
    >
      <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.025]">
        <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          <p className="text-[11px] font-medium text-neutral-400">
            Checkout overview
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-neutral-400">
              {doneCount}/{checklist.length} ready
            </p>
            <Link
              href={checkoutPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#007AFF] hover:underline"
            >
              View checkout
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Link>
          </div>
        </div>

        <div className="grid gap-3 px-3.5 py-3.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setSubTab("fields")}
            className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 text-left transition hover:border-black/[0.1] dark:border-white/10 dark:bg-[#1C1C1E]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <UserRound className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">
                Customer fields
              </p>
              <p className="mt-0.5 font-sans text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {visibleCount} shown
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                {removedCount > 0
                  ? `${removedCount} removed`
                  : "All fields visible"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("general")}
            className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 text-left transition hover:border-black/[0.1] dark:border-white/10 dark:bg-[#1C1C1E]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <ShoppingBag className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">
                Minimum order
              </p>
              <p className="mt-0.5 font-sans text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {shop.minOrderAmount > 0
                  ? `${shop.minOrderAmount} ${store.currency}`
                  : "None"}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("theme")}
            className="flex items-start gap-2.5 rounded-[10px] border border-black/[0.05] bg-white p-3 text-left transition hover:border-black/[0.1] dark:border-white/10 dark:bg-[#1C1C1E]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#007AFF]/10 text-[#007AFF]">
              <LayoutTemplate className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-neutral-400">Theme</p>
              <p className="mt-0.5 font-sans text-[15px] font-semibold tracking-[-0.02em] capitalize text-neutral-900 dark:text-white">
                {shop.checkoutTheme}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-neutral-500 capitalize">
                {shop.checkoutLayout === "single" ? "One page" : "3 steps"}
              </p>
            </div>
          </button>
        </div>

        <div className="flex flex-wrap gap-1 border-t border-black/[0.05] px-3.5 py-2 dark:border-white/10">
          {checklist.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSubTab(item.tab)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition hover:opacity-80",
                item.done
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-black/[0.03] text-neutral-400 dark:bg-white/[0.04]"
              )}
            >
              {item.done ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full border border-current opacity-40" />
              )}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Checkout settings sections"
        className="flex gap-1 overflow-x-auto rounded-[10px] border border-black/[0.06] bg-[#FAFAFA] p-1 dark:border-white/10 dark:bg-white/[0.03]"
      >
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSubTab(tab.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition",
                active
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-[#1C1C1E] dark:text-white"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              )}
            >
              <Icon className="h-3.5 w-3.5 opacity-70" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {subTab === "fields" ? (
        <SettingsSection
          title="What buyers fill in"
          description="Required stays on the form. Optional can be left blank. Removed hides the field from checkout. Name is always required."
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {FIELD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  patchShop({ checkoutFields: preset.fields });
                  toast.success(`Applied “${preset.label}”`);
                }}
                className="rounded-[10px] border border-black/[0.06] bg-white p-3 text-left transition hover:border-[#007AFF]/30 hover:bg-[#007AFF]/[0.03] dark:border-white/10 dark:bg-white/[0.03]"
              >
                <p className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                  {preset.label}
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>

          {(
            [
              { id: "contact", title: "Contact" },
              { id: "address", title: "Address" },
              { id: "extra", title: "Extra" },
            ] as const
          ).map((group) => (
            <div key={group.id} className="space-y-2">
              <p className="text-[11px] font-medium text-neutral-400">
                {group.title}
              </p>
              {group.id === "contact" ? (
                <div className="flex items-center justify-between gap-3 rounded-[10px] border border-black/[0.05] bg-[#FAFAFA]/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/[0.02]">
                  <div>
                    <p className="text-[13px] font-medium text-neutral-900 dark:text-white">
                      Full name
                    </p>
                    <p className="text-[11px] text-neutral-500">Always required</p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Required
                  </span>
                </div>
              ) : null}
              {FIELD_ROWS.filter((r) => r.group === group.id).map((row) => {
                const mode = String(shop.checkoutFields[row.key]);
                const removed = mode === "hidden";
                return (
                  <div
                    key={row.key}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 rounded-[10px] border px-3 py-2.5",
                      removed
                        ? "border-dashed border-black/[0.08] bg-[#FAFAFA]/60 opacity-80 dark:border-white/10 dark:bg-white/[0.02]"
                        : "border-black/[0.06] bg-white dark:border-white/10 dark:bg-white/[0.03]"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-900 dark:text-white">
                        {row.label}
                        {removed ? (
                          <EyeOff className="h-3.5 w-3.5 text-neutral-400" />
                        ) : null}
                      </p>
                      <p className="text-[11px] text-neutral-500">{row.hint}</p>
                    </div>
                    <ModeSelect
                      value={mode}
                      modes={row.modes}
                      onChange={(next) => {
                        if (
                          next === "hidden" &&
                          (row.key === "city" || row.key === "street")
                        ) {
                          toast.message(`${row.label} removed from checkout`, {
                            description:
                              "Shipping may be less accurate without this field.",
                          });
                        }
                        patchField(row.key, next);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              onClick={() => {
                patchShop({
                  checkoutFields: { ...DEFAULT_CHECKOUT_FIELDS },
                });
                toast.message("Reset to defaults");
              }}
            >
              Reset to defaults
            </button>
            <p className="text-[11px] text-neutral-400">
              COD / PayPal messages &amp; fees →{" "}
              <SettingsRelatedLink tab="payment">Payments</SettingsRelatedLink>
            </p>
          </div>
        </SettingsSection>
      ) : null}

      {subTab === "general" ? (
        <>
          <SettingsSection
            title="Order rules"
            description="Protect margins and set expectations before payment."
          >
            <SettingsField
              label={`Minimum order (${store.currency})`}
              htmlFor="min-order"
              hint="Set 0 to allow any order size."
            >
              <Input
                id="min-order"
                type="number"
                min={0}
                value={shop.minOrderAmount}
                onChange={(e) =>
                  patchShop({ minOrderAmount: Number(e.target.value) || 0 })
                }
                className={cn(FIELD, "max-w-xs")}
              />
            </SettingsField>

            <SettingsField
              label={
                <>
                  <span>Checkout note</span>
                  <CharCount value={shop.checkoutNote} max={280} />
                </>
              }
              htmlFor="checkout-note"
            >
              <Textarea
                id="checkout-note"
                value={shop.checkoutNote}
                onChange={(e) => patchShop({ checkoutNote: e.target.value })}
                placeholder="Delivery in 24–48h · COD available nationwide"
                className={cn(AREA, "min-h-[72px]")}
                maxLength={280}
              />
            </SettingsField>
          </SettingsSection>

          <SettingsSection
            title="Announcement bar"
            description="A slim promo strip across the top of your storefront."
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#007AFF] focus:ring-[#007AFF]"
                checked={shop.announceBarEnabled}
                onChange={(e) =>
                  patchShop({ announceBarEnabled: e.target.checked })
                }
              />
              <span>
                <span className="block text-[13px] font-medium text-neutral-900 dark:text-white">
                  Show announcement bar
                </span>
                <span className="mt-0.5 block text-[11px] text-neutral-500">
                  Great for free shipping, flash sales, or festival hours.
                </span>
              </span>
            </label>

            <SettingsField
              label={
                <>
                  <span>Bar text</span>
                  <CharCount value={shop.announceBarText} max={120} />
                </>
              }
              htmlFor="announce-text"
            >
              <Input
                id="announce-text"
                value={shop.announceBarText}
                onChange={(e) => patchShop({ announceBarText: e.target.value })}
                placeholder="Free shipping over 200 MAD this week"
                className={FIELD}
                maxLength={120}
                disabled={!shop.announceBarEnabled}
              />
            </SettingsField>

            {shop.announceBarEnabled && shop.announceBarText.trim() ? (
              <div
                className="rounded-[10px] px-3.5 py-2 text-center text-[12px] font-medium tracking-wide text-white"
                style={{ backgroundColor: primary }}
              >
                {shop.announceBarText}
              </div>
            ) : null}
          </SettingsSection>
        </>
      ) : null}

      {subTab === "theme" ? (
        <SettingsSection
          title="Checkout theme"
          description="Pick a look, then check the phone preview — how checkout appears on a buyer’s phone."
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <div className="min-w-0 flex-1 space-y-2">
              {THEMES.map((theme) => {
                const active = shop.checkoutTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => patchShop({ checkoutTheme: theme.id })}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[10px] border p-3.5 text-left transition",
                      !active &&
                        "border-black/[0.06] bg-white hover:border-black/[0.12] dark:border-white/10 dark:bg-white/[0.03]"
                    )}
                    style={
                      active
                        ? {
                            borderColor: `${primary}66`,
                            backgroundColor: `${primary}0F`,
                            boxShadow: `0 0 0 1px ${primary}33`,
                          }
                        : undefined
                    }
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-12 w-12 shrink-0 flex-col justify-between overflow-hidden border border-black/[0.06] p-1.5 dark:border-white/10",
                        theme.id === "soft" && "rounded-2xl",
                        theme.id === "compact" && "rounded-md bg-white dark:bg-white/[0.03]",
                        theme.id === "classic" && "rounded-xl bg-[#F5F5F7] dark:bg-white/[0.04]"
                      )}
                      style={
                        theme.id === "soft"
                          ? { backgroundColor: `${primary}0A` }
                          : undefined
                      }
                    >
                      <div
                        className={cn(
                          "w-6 bg-neutral-200/90 dark:bg-white/15",
                          theme.id === "soft" && "h-1.5 rounded-full",
                          theme.id === "compact" && "h-1 rounded-sm",
                          theme.id === "classic" && "h-1.5 rounded"
                        )}
                      />
                      <div
                        className={cn(
                          "w-full bg-white dark:bg-[#1C1C1E]",
                          theme.id === "soft" &&
                            "h-3 rounded-lg shadow-sm ring-1 ring-black/[0.04]",
                          theme.id === "compact" &&
                            "h-2 rounded-sm border border-neutral-200 dark:border-white/10",
                          theme.id === "classic" &&
                            "h-2.5 rounded-md border border-neutral-200/80 dark:border-white/10"
                        )}
                      />
                      <div
                        className={cn(
                          "w-full",
                          theme.id === "soft" && "h-2 rounded-lg",
                          theme.id === "compact" && "h-1.5 rounded-sm",
                          theme.id === "classic" && "h-2 rounded-full"
                        )}
                        style={{ backgroundColor: primary }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                          {theme.label}
                        </p>
                        {active ? (
                          <span
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: primary }}
                          >
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        {theme.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex shrink-0 justify-center lg:sticky lg:top-4 lg:justify-end">
              <CheckoutPhonePreview
                primary={primary}
                theme={shop.checkoutTheme}
                fields={shop.checkoutFields}
                layout={shop.checkoutLayout}
                showProgress={shop.showProgress}
                showCoupon={shop.showCoupon}
                announceBarEnabled={shop.announceBarEnabled}
                announceBarText={shop.announceBarText}
                continueLabel={shop.continueLabel}
                placeOrderLabel={shop.placeOrderLabel}
                currency={store.currency}
              />
            </div>
          </div>
        </SettingsSection>
      ) : null}

      {subTab === "experience" ? (
        <SettingsSection
          title="Checkout experience"
          description="How the checkout flows — steps, coupon, buttons, and thank-you copy."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                {
                  id: "steps" as const,
                  label: "3 steps",
                  description: "Details → Delivery → Payment",
                },
                {
                  id: "single" as const,
                  label: "One page",
                  description: "Everything on a single scroll",
                },
              ] as const
            ).map((layout) => {
              const active = shop.checkoutLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => patchShop({ checkoutLayout: layout.id })}
                  className={cn(
                    "rounded-[10px] border p-3.5 text-left transition",
                    active
                      ? "border-[#007AFF]/40 bg-[#007AFF]/[0.06]"
                      : "border-black/[0.06] bg-white hover:border-black/[0.12] dark:border-white/10 dark:bg-white/[0.03]"
                  )}
                >
                  <p className="text-[13px] font-semibold text-neutral-900 dark:text-white">
                    {layout.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    {layout.description}
                  </p>
                </button>
              );
            })}
          </div>

          {(
            [
              {
                key: "showProgress" as const,
                title: "Show progress steps",
                hint: "Only applies to 3-step layout",
                checked: shop.showProgress,
              },
              {
                key: "showCoupon" as const,
                title: "Show coupon / discount box",
                hint: "Buyers can enter promo codes at payment",
                checked: shop.showCoupon,
              },
              {
                key: "summaryOpenByDefault" as const,
                title: "Order summary open on mobile",
                hint: "Expand the bag summary by default",
                checked: shop.summaryOpenByDefault,
              },
              {
                key: "requireTerms" as const,
                title: "Require accept terms",
                hint: "Checkbox before Place order / PayPal",
                checked: shop.requireTerms,
              },
            ] as const
          ).map((row) => (
            <label
              key={row.key}
              className="flex cursor-pointer items-start justify-between gap-3 rounded-[10px] border border-black/[0.05] bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span>
                <span className="block text-[13px] font-medium text-neutral-900 dark:text-white">
                  {row.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-neutral-500">
                  {row.hint}
                </span>
              </span>
              <Switch
                checked={row.checked}
                onCheckedChange={(checked) =>
                  patchShop({ [row.key]: checked })
                }
              />
            </label>
          ))}

          <SettingsField label="Continue button" htmlFor="continue-label">
            <Input
              id="continue-label"
              value={shop.continueLabel}
              onChange={(e) => patchShop({ continueLabel: e.target.value })}
              placeholder="Continue"
              className={FIELD}
              maxLength={40}
            />
          </SettingsField>

          <SettingsField label="Place order button" htmlFor="place-order-label">
            <Input
              id="place-order-label"
              value={shop.placeOrderLabel}
              onChange={(e) => patchShop({ placeOrderLabel: e.target.value })}
              placeholder="Place order"
              className={FIELD}
              maxLength={40}
            />
          </SettingsField>

          <SettingsField
            label={
              <>
                <span>Thank-you message</span>
                <CharCount value={shop.successMessage} max={280} />
              </>
            }
            htmlFor="success-message"
          >
            <Textarea
              id="success-message"
              value={shop.successMessage}
              onChange={(e) => patchShop({ successMessage: e.target.value })}
              placeholder="We’ll call you to confirm before shipping. Thank you!"
              className={cn(AREA, "min-h-[72px]")}
              maxLength={280}
            />
          </SettingsField>

          <SettingsField label="Phone placeholder" htmlFor="phone-placeholder">
            <Input
              id="phone-placeholder"
              value={shop.phonePlaceholder}
              onChange={(e) => patchShop({ phonePlaceholder: e.target.value })}
              placeholder="+212 6XX XXX XXX"
              className={FIELD}
              maxLength={60}
            />
          </SettingsField>

          <SettingsField label="Phone helper text" htmlFor="phone-hint">
            <Input
              id="phone-hint"
              value={shop.phoneHint}
              onChange={(e) => patchShop({ phoneHint: e.target.value })}
              placeholder="WhatsApp number for delivery updates"
              className={FIELD}
              maxLength={120}
            />
          </SettingsField>
        </SettingsSection>
      ) : null}

      <SettingsRelatedCard className="rounded-[10px] px-3.5 py-3 text-[12px]">
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <Megaphone className="h-3.5 w-3.5 text-neutral-400" />
          Turn COD / PayPal on under{" "}
          <SettingsRelatedLink tab="payment">Payments</SettingsRelatedLink>.
          Shipping zones in{" "}
          <SettingsRelatedLink tab="shipping">Shipping</SettingsRelatedLink>.
        </span>
      </SettingsRelatedCard>
    </SettingsPanel>
  );
}
