"use client";

import {
  Banknote,
  Globe2,
  Languages,
  MessageCircle,
  Printer,
  Search,
  ShoppingBag,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SETTINGS_TABS = [
  "general",
  "website",
  "currency",
  "shipping",
  "payment",
  "checkout",
  "seo",
  "contact",
  "printers",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const SETTINGS_NAV: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "store" | "selling" | "storefront";
}[] = [
  {
    id: "general",
    label: "Store profile",
    description: "Name, logo, contact",
    icon: Store,
    group: "store",
  },
  {
    id: "website",
    label: "Website",
    description: "URL and domain",
    icon: Globe2,
    group: "store",
  },
  {
    id: "currency",
    label: "Currency & language",
    description: "Prices and locale",
    icon: Languages,
    group: "store",
  },
  {
    id: "shipping",
    label: "Shipping",
    description: "Zones and rates",
    icon: Truck,
    group: "selling",
  },
  {
    id: "payment",
    label: "Payments",
    description: "COD and cards",
    icon: Banknote,
    group: "selling",
  },
  {
    id: "checkout",
    label: "Checkout",
    description: "Orders and messages",
    icon: ShoppingBag,
    group: "selling",
  },
  {
    id: "printers",
    label: "Printers",
    description: "Ticket stations",
    icon: Printer,
    group: "selling",
  },
  {
    id: "seo",
    label: "SEO",
    description: "Search and sharing",
    icon: Search,
    group: "storefront",
  },
  {
    id: "contact",
    label: "Storefront contact",
    description: "WhatsApp and visibility",
    icon: MessageCircle,
    group: "storefront",
  },
];

const SETTINGS_GROUPS: {
  id: "store" | "selling" | "storefront";
  label: string;
}[] = [
  { id: "store", label: "Store" },
  { id: "selling", label: "Selling" },
  { id: "storefront", label: "Storefront" },
];

interface SettingsNavProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export function SettingsNav({ activeTab, onChange }: SettingsNavProps) {
  return (
    <>
      {/* Mobile — scrollable chips with edge fade */}
      <div className="relative lg:hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#FAFAFA] to-transparent dark:from-[#0a0a0a]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#FAFAFA] to-transparent dark:from-[#0a0a0a]" />
        <nav
          className="flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none"
          aria-label="Settings sections"
        >
          {SETTINGS_NAV.map((item) => {
            const active = item.id === activeTab;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
                  active
                    ? "border-[#007AFF] bg-[#007AFF] text-white shadow-[0_4px_14px_-4px_rgba(0,122,255,0.55)]"
                    : "border-neutral-200/90 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-white/10 dark:bg-[#161616] dark:text-neutral-300"
                )}
              >
                <Icon className="h-3.5 w-3.5 opacity-90" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop — grouped side list */}
      <nav className="hidden lg:block" aria-label="Settings sections">
        <div className="space-y-5">
          {SETTINGS_GROUPS.map((group) => {
            const items = SETTINGS_NAV.filter((item) => item.group === group.id);
            return (
              <div key={group.id}>
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const active = item.id === activeTab;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onChange(item.id)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-200",
                          active
                            ? "bg-[#007AFF]/[0.08] text-neutral-900 dark:bg-[#007AFF]/15 dark:text-white"
                            : "text-neutral-600 hover:bg-neutral-100/90 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.04] dark:hover:text-white"
                        )}
                      >
                        {active ? (
                          <span
                            className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[#007AFF]"
                            aria-hidden
                          />
                        ) : null}
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                            active
                              ? "bg-[#007AFF] text-white shadow-[0_4px_12px_-4px_rgba(0,122,255,0.65)]"
                              : "bg-neutral-100 text-neutral-500 group-hover:bg-white group-hover:text-neutral-700 dark:bg-white/[0.06] dark:text-neutral-400"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-[13px] font-medium tracking-[-0.01em]",
                              active && "text-neutral-900 dark:text-white"
                            )}
                          >
                            {item.label}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-neutral-400 dark:text-neutral-500">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}
