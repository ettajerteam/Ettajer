"use client";

import {
  Banknote,
  Globe2,
  Languages,
  Printer,
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
  "printers",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const SETTINGS_NAV: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "general",
    label: "Store profile",
    description: "Name, logo, contact",
    icon: Store,
  },
  {
    id: "website",
    label: "Website",
    description: "URL and domain",
    icon: Globe2,
  },
  {
    id: "currency",
    label: "Currency & language",
    description: "Prices and locale",
    icon: Languages,
  },
  {
    id: "shipping",
    label: "Shipping",
    description: "Zones and rates",
    icon: Truck,
  },
  {
    id: "payment",
    label: "Payments",
    description: "COD and cards",
    icon: Banknote,
  },
  {
    id: "printers",
    label: "Printers",
    description: "Ticket stations",
    icon: Printer,
  },
];

interface SettingsNavProps {
  activeTab: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

export function SettingsNav({ activeTab, onChange }: SettingsNavProps) {
  return (
    <>
      {/* Mobile — horizontal chips */}
      <nav
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none lg:hidden"
        aria-label="Settings sections"
      >
        {SETTINGS_NAV.map((item) => {
          const active = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition",
                active
                  ? "border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Desktop — side list */}
      <nav
        className="hidden space-y-1 lg:block"
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
              className={cn(
                "group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition",
                active
                  ? "bg-[#007AFF]/[0.08] ring-1 ring-[#007AFF]/20"
                  : "hover:bg-neutral-100/80"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
                  active
                    ? "border-[#007AFF]/25 bg-white text-[#007AFF] shadow-sm"
                    : "border-neutral-200/80 bg-white text-neutral-500 group-hover:text-neutral-800"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 pt-0.5">
                <span
                  className={cn(
                    "block text-sm font-medium tracking-[-0.01em]",
                    active ? "text-neutral-900" : "text-neutral-700"
                  )}
                >
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[12px] text-neutral-500">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
