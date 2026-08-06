"use client";

import { formatRelativeTime } from "@/lib/format-relative-time";
import {
  dashboardCard,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { formatCurrency, cn } from "@/lib/utils";
import type { LiveActivityEvent } from "@/lib/live-view-types";
import { MapPin, ShoppingBag } from "lucide-react";

interface LiveActivityFeedProps {
  events: LiveActivityEvent[];
  currency: string;
  focusCode: string | null;
  onFocusCountry: (code: string | null) => void;
}

export function LiveActivityFeed({
  events,
  currency,
  focusCode,
  onFocusCountry,
}: LiveActivityFeedProps) {
  return (
    <section className={cn(dashboardCard, "overflow-hidden")}>
      <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <h3 className={dashboardTitle}>Live activity</h3>
        <p className={dashboardSubtitle}>Real-time order stream</p>
      </div>

      {events.length === 0 ? (
        <div className="px-4 py-10 text-center text-[12px] text-neutral-400">
          No activity yet
        </div>
      ) : (
        <ul className="max-h-[300px] divide-y divide-black/[0.04] overflow-y-auto dark:divide-white/5">
          {events.map((event) => {
            const isFocused = focusCode === event.countryCode;

            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onFocusCountry(event.countryCode)}
                  className={cn(
                    "flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors",
                    isFocused
                      ? "bg-[#007AFF]/[0.06]"
                      : "hover:bg-[#F5F5F7]/80 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F5F5F7] text-neutral-500 dark:bg-white/[0.08] dark:text-neutral-300">
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                        {event.title}
                      </p>
                      <span className="shrink-0 text-[12px] font-semibold tabular-nums text-neutral-900 dark:text-white">
                        {formatCurrency(event.amount, currency)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-neutral-400">
                      {event.subtitle}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-neutral-400">
                      <span suppressHydrationWarning>
                        {formatRelativeTime(event.createdAt)}
                      </span>
                      {event.countryName ? (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.countryName}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
