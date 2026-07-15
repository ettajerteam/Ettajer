"use client";

import { useEffect, useState } from "react";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { getMarketingEventLog, type MarketingEventLogEntry } from "@/lib/marketing-event-log";

export function MarketingDebugBanner() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<MarketingEventLogEntry[]>([]);

  useEffect(() => {
    function refresh() {
      setEvents(getMarketingEventLog());
    }

    refresh();
    window.addEventListener("ettajer:marketing-event", refresh);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener("ettajer:marketing-event", refresh);
      clearInterval(interval);
    };
  }, []);

  if (events.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm">
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/95 shadow-lg backdrop-blur-sm dark:border-amber-500/20 dark:bg-amber-950/90">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100">
            <Activity className="h-4 w-4" />
            Marketing test mode · {events.length} events
          </span>
          {open ? (
            <ChevronDown className="h-4 w-4 text-amber-700" />
          ) : (
            <ChevronUp className="h-4 w-4 text-amber-700" />
          )}
        </button>
        {open && (
          <div className="max-h-48 overflow-y-auto border-t border-amber-200/60 px-4 py-2 dark:border-amber-500/20">
            {events.slice(0, 8).map((event) => (
              <div key={event.id} className="border-b border-amber-100 py-2 last:border-0 dark:border-amber-900/40">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-medium text-amber-900 dark:text-amber-100">
                    {event.platform}/{event.event}
                  </span>
                  <span className="text-amber-700/70">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
