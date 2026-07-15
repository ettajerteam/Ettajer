import {
  CreditCard,
  Package,
  RefreshCcw,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import type { ActivityEvent, ActivityEventType } from "@/types/dashboard";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";

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

export function HomeActivityTimeline({ events }: HomeActivityTimelineProps) {
  return (
    <section id="activity" className={`${homeCard} ${homeCardPad} scroll-mt-24`}>
      <h2 className={homeTitle}>Activity</h2>
      <p className={homeSubtitle}>Recent store events</p>

      {events.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No recent activity.</p>
      ) : (
        <ul className="mt-3 space-y-0">
          {events.map((event, index) => {
            const Icon = ICONS[event.type];
            return (
              <li
                key={event.id}
                className="flex gap-3 border-b border-neutral-200/60 py-2.5 last:border-0 dark:border-white/5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/5">
                  <Icon className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">{event.title}</p>
                  <p className="truncate text-xs text-neutral-500">{event.description}</p>
                </div>
                <time
                  className="shrink-0 text-[11px] text-neutral-400"
                  dateTime={event.timestamp}
                  title={new Date(event.timestamp).toLocaleString()}
                >
                  {formatRelativeTime(event.timestamp)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
