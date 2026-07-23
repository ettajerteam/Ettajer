"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";
import {
  getSettingsHealth,
  getSettingsHealthScore,
} from "@/lib/settings-health";
import type { StoreWithSettings } from "@/lib/store-settings";
import type { SettingsTab } from "@/components/settings/settings-nav";
import { cn } from "@/lib/utils";

interface SettingsHealthBarProps {
  store: StoreWithSettings;
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
}

export function SettingsHealthBar({
  store,
  activeTab,
  onSelectTab,
}: SettingsHealthBarProps) {
  const items = getSettingsHealth(store);
  const { done, total, percent } = getSettingsHealthScore(items);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-[#161616] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              Setup progress
            </p>
            <p className="text-[12px] tabular-nums text-neutral-500">
              {done}/{total} · {percent}%
            </p>
          </div>
          <div className="mt-2.5 h-1.5 max-w-sm overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-[#007AFF] transition-all duration-500 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        {percent < 100 ? (
          <p className="text-[12px] text-neutral-500">
            Finish the open items to make your shop feel complete.
          </p>
        ) : (
          <p className="text-[12px] font-medium text-emerald-600">Store setup looks solid.</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => {
          const active = item.tab === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.tab)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition",
                item.done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : active
                    ? "border-[#007AFF]/35 bg-[#007AFF]/10 text-[#007AFF]"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-400"
              )}
            >
              {item.done ? (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <Circle className="h-3 w-3 opacity-50" />
              )}
              {item.label}
            </button>
          );
        })}
        <Link
          href="/dashboard/themes"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 dark:border-white/10 dark:bg-transparent dark:text-neutral-400"
        >
          Themes
        </Link>
      </div>
    </div>
  );
}
