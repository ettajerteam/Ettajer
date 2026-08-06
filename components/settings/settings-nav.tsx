"use client";

import {
  Banknote,
  CreditCard,
  Bell,
  FileText,
  Globe2,
  Languages,
  Mail,
  Printer,
  Percent,
  Scale,
  Search,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const SETTINGS_TABS = [
  "general",
  "website",
  "currency",
  "email",
  "shipping",
  "payment",
  "checkout",
  "seo",
  "taxes",
  "notifications",
  "print",
  "profile",
  "plan",
  "legal",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export type SettingsGroupId =
  | "store"
  | "selling"
  | "online"
  | "account";

export type SettingsNavItem = {
  id: SettingsTab;
  label: string;
  description: string;
  icon: LucideIcon;
  group: SettingsGroupId;
  /** Placeholder section — no full product yet */
  comingSoon?: boolean;
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: "general",
    label: "General",
    description: "Store details and contact",
    icon: Store,
    group: "store",
  },
  {
    id: "website",
    label: "Domains",
    description: "Store URL and custom domain",
    icon: Globe2,
    group: "store",
  },
  {
    id: "currency",
    label: "Languages",
    description: "Currency and storefront language",
    icon: Languages,
    group: "store",
  },
  {
    id: "email",
    label: "Email",
    description: "Providers, domains, senders",
    icon: Mail,
    group: "store",
  },
  {
    id: "payment",
    label: "Payments",
    description: "COD, PayPal, Stripe",
    icon: Banknote,
    group: "selling",
  },
  {
    id: "checkout",
    label: "Checkout",
    description: "Order rules and messages",
    icon: ShoppingBag,
    group: "selling",
  },
  {
    id: "shipping",
    label: "Shipping",
    description: "Zones and delivery rates",
    icon: Truck,
    group: "selling",
  },
  {
    id: "taxes",
    label: "Taxes",
    description: "Tax rates and invoices",
    icon: Percent,
    group: "selling",
  },
  {
    id: "seo",
    label: "SEO",
    description: "Search and social sharing",
    icon: Search,
    group: "online",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Order and customer emails",
    icon: Bell,
    group: "online",
  },
  {
    id: "print",
    label: "Print",
    description: "E-tickets and invoices",
    icon: Printer,
    group: "online",
  },
  {
    id: "profile",
    label: "Profile",
    description: "Your name, photo, and password",
    icon: UserRound,
    group: "account",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Subscription, usage, and billing",
    icon: CreditCard,
    group: "account",
  },
  {
    id: "legal",
    label: "Legal",
    description: "Policies, terms, and checkout",
    icon: Scale,
    group: "account",
  },
];

const SETTINGS_GROUPS: { id: SettingsGroupId; label: string }[] = [
  { id: "store", label: "Store details" },
  { id: "selling", label: "Selling" },
  { id: "online", label: "Online store" },
  { id: "account", label: "Account" },
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
                {item.comingSoon ? (
                  <span className="rounded bg-black/[0.06] px-1 text-[9px] font-medium text-neutral-400 dark:bg-white/10">
                    Soon
                  </span>
                ) : null}
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
                        {item.comingSoon ? (
                          <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-medium text-neutral-400">
                            Soon
                          </span>
                        ) : null}
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
