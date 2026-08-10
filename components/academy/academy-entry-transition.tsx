"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AcademyHomeSkeleton } from "@/components/academy/academy-skeletons";

/**
 * Entry transition when mounting the Academy layout (leaving the merchant dashboard).
 * Layout persists while navigating inside Academy, so this runs once per entry.
 */
export function AcademyEntryTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<"enter" | "skeleton" | "ready">("enter");

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setPhase("ready");
      return;
    }

    const t1 = window.setTimeout(() => setPhase("skeleton"), 420);
    const t2 = window.setTimeout(() => setPhase("ready"), 720);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100dvh-3.5rem)]">
      {phase !== "ready" && (
        <div
          className={cn(
            "absolute inset-0 z-30 bg-[#F7F7F8]",
            phase === "enter" &&
              "animate-in fade-in duration-500 motion-reduce:animate-none",
            phase === "skeleton" &&
              "animate-in fade-in duration-300 motion-reduce:animate-none",
          )}
          aria-hidden
        >
          {phase === "enter" ? (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center px-6">
              <p
                className={cn(
                  "text-[12px] font-medium text-neutral-400",
                  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none",
                )}
              >
                Ettajer Academy
              </p>
              <p
                className={cn(
                  "mt-3 max-w-sm text-center text-[22px] font-semibold tracking-tight text-neutral-900 sm:text-[26px]",
                  "animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-both delay-100 motion-reduce:animate-none",
                )}
              >
                Welcome to your ecommerce school.
              </p>
            </div>
          ) : (
            <AcademyHomeSkeleton />
          )}
        </div>
      )}

      <div
        className={cn(
          "transition-all duration-500 ease-out motion-reduce:transition-none",
          phase === "ready"
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-[0.985] opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}
