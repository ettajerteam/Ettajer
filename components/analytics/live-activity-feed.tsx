"use client";

import { formatRelativeTime } from "@/lib/format-relative-time";
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
    <section className="premium-card overflow-hidden ring-1 ring-neutral-200/60 dark:ring-white/10">
      <div className="border-b border-neutral-200/80 bg-gradient-to-r from-white to-neutral-50/50 px-4 py-3.5 dark:border-white/10 dark:from-[#161616] dark:to-white/[0.02]">
        <h3 className="text-base font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
          Live activity
        </h3>
        <p className="text-xs text-neutral-500">Real-time order stream</p>
      </div>

      {events.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-neutral-500">No activity yet</div>
      ) : (
        <ul className="max-h-[320px] divide-y divide-neutral-200/70 overflow-y-auto dark:divide-white/10">
          {events.map((event) => {
            const isFocused = focusCode === event.countryCode;

            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onFocusCountry(event.countryCode)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                    isFocused
                      ? "bg-[#007AFF]/8"
                      : "hover:bg-neutral-50/80 dark:hover:bg-white/[0.02]"
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShoppingBag className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {event.title}
                      </p>
                      <span className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-white">
                        {formatCurrency(event.amount, currency)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">{event.subtitle}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>{formatRelativeTime(event.createdAt)}</span>
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
