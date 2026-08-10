"use client";

import { useEffect, useState } from "react";
import { Lock, X, GraduationCap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Ettajer Academy",
    body: "Your ecommerce school inside Ettajer — platform mastery, business fundamentals, dropshipping, and POD.",
  },
  {
    title: "Learn by doing",
    body: "Lessons that teach you, then take you into your store to apply what you learned.",
  },
  {
    title: "Four schools",
    body: "Platform, Ecommerce, Dropshipping, and POD — open one path at a time.",
  },
  {
    title: "Coming soon",
    body: "We’re finishing the curriculum and filming lessons. You’ll be the first to know when Academy opens.",
  },
];

export function AcademyComingSoonModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const slide = SLIDES[index]!;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
            aria-label="Close"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="academy-soon-title"
            className="relative w-full max-w-md overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_24px_80px_-28px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 rounded-full p-2 text-neutral-400 transition-colors hover:bg-black/[0.04] hover:text-neutral-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-7 pb-8 pt-10 text-center sm:px-9">
              <motion.div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 380, damping: 24 }}
              >
                <div className="relative">
                  <GraduationCap className="h-6 w-6 text-neutral-700" strokeWidth={1.75} />
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm">
                    <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                </div>
              </motion.div>

              <div className="relative mt-7 min-h-[120px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="text-[11px] font-medium text-neutral-400">
                      Coming soon
                    </p>
                    <h2
                      id="academy-soon-title"
                      className="mt-2 text-[22px] font-semibold tracking-tight text-neutral-900"
                    >
                      {slide.title}
                    </h2>
                    <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-neutral-500">
                      {slide.body}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-6 flex items-center justify-center gap-1.5">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === index
                        ? "w-5 bg-neutral-900"
                        : "w-1.5 bg-neutral-200 hover:bg-neutral-300",
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
