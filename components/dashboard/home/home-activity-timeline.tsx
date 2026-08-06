"use client";

import {
  CreditCard,
  Package,
  RefreshCcw,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import type { ActivityEvent, ActivityEventType } from "@/types/dashboard";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";

const ICONS: Record<ActivityEventType, typeof ShoppingBag> = {
  order_created: ShoppingBag,
  refund_issued: RefreshCcw,
  inventory_updated: Package,
  customer_registered: UserPlus,
  payment_received: CreditCard,
};

interface HomeActivityTimelineProps {
  events: ActivityEvent[];
}

function formatClock(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function HomeActivityTimeline({ events }: HomeActivityTimelineProps) {
  const t = useHomeCopy();
  return (
    <section id="activity" className={`${homeCard} ${homeCardPad} scroll-mt-24 h-full`}>
      <h2 className={homeTitle}>{t.activity}</h2>
      <p className={homeSubtitle}>{t.liveTimeline}</p>

      {events.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">{t.noActivity}</p>
      ) : (
        <ul className="mt-4 space-y-0">
          {events.map((event) => {
            const Icon = ICONS[event.type];
            return (
              <li key={event.id} className="flex gap-3 border-b border-black/[0.04] py-3 last:border-0 dark:border-white/5">
                <time
                  className="w-12 shrink-0 pt-0.5 text-[12px] font-medium tabular-nums text-neutral-400"
                  dateTime={event.timestamp}
                >
                  {formatClock(event.timestamp)}
                </time>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5">
                  <Icon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{event.title}</p>
                  <p className="truncate text-xs text-neutral-500">{event.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
