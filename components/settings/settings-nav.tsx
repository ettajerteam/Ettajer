"use client";

import {
  Banknote,
  Globe2,
  Languages,
  Mail,
  MessageCircle,
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
  "email",
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
    label: "Profile",
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
    id: "email",
    label: "Email",
    description: "Providers & domains",
    icon: Mail,
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
    id: "seo",
    label: "SEO",
    description: "Search and sharing",
    icon: Search,
    group: "storefront",
  },
  {
    id: "contact",
    label: "Contact",
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
  { id: "selling", label: "Orders" },
  { id: "storefront", label: "Storefront" },
];

interface SettingsNavProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export function SettingsNav({ activeTab, onChange }: SettingsNavProps) {
  return (
    <>
      <div className="relative lg:hidden">
        <nav
          className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none"
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
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-medium transition",
                  active
                    ? "border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]"
                    : "border-black/[0.06] bg-white text-neutral-600 hover:text-neutral-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300"
                )}
              >
                <Icon className="h-3.5 w-3.5 opacity-80" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <nav className="hidden lg:block" aria-label="Settings sections">
        <div className="space-y-3">
          {SETTINGS_GROUPS.map((group) => {
            const items = SETTINGS_NAV.filter((item) => item.group === group.id);
            return (
              <div key={group.id}>
                <p className="mb-1 px-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
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
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition",
                          active
                            ? "bg-[#007AFF]/10 text-[#007AFF]"
                            : "text-neutral-600 hover:bg-black/[0.03] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/[0.04] dark:hover:text-white"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium tracking-[-0.01em]">
                          {item.label}
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
