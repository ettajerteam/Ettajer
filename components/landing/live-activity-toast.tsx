"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLandingLocale } from "@/components/landing/landing-locale-context";

export function LiveActivityToast() {
  const { copy } = useLandingLocale();
  const events = copy.liveActivity.events;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [events]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % events.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [events.length]);

  const event = events[index];

  return (
    <div
      className="pointer-events-none fixed bottom-5 start-5 z-50 hidden sm:block"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${event.id}-${event.message}`}
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex max-w-xs items-start gap-3 rounded-2xl border border-neutral-200/90 bg-white/95 px-4 py-3 shadow-lg shadow-neutral-900/5 backdrop-blur-md"
        >
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500"
            aria-hidden
          />
          <div className="min-w-0 text-start">
            <p className="text-xs leading-relaxed text-neutral-600">
              {copy.liveActivity.template(event.city, event.message)}
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400">{event.timeAgo}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
