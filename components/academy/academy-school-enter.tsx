"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/academy/use-prefers-reduced-motion";

export type SchoolEnterPayload = {
  title: string;
  lines: string[];
};

export function AcademySchoolEnterOverlay({
  payload,
}: {
  payload: SchoolEnterPayload | null;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {payload && !reduced ? (
        <motion.div
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#F7F7F8] px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.p
            className="text-[12px] font-medium text-neutral-400"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Ettajer Academy
          </motion.p>
          <motion.h2
            className="mt-4 text-center text-[32px] font-semibold tracking-tight text-neutral-900 sm:text-[40px]"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {payload.title}
          </motion.h2>
          <div className="mt-6 flex flex-col items-center gap-1.5">
            {payload.lines.map((line, i) => (
              <motion.p
                key={line}
                className="text-[15px] text-neutral-500"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.22 + i * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
