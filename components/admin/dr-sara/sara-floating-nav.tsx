"use client";

import { useEffect, useState } from "react";
import type { ExperienceSectionId } from "@/lib/intelligence/presentation/experience-model";
import { scrollToSection } from "@/components/admin/dr-sara/sara-command-palette";
import { cn } from "@/lib/utils";

export function SaraFloatingNav({
  navigation,
  active,
}: {
  navigation: { id: ExperienceSectionId; label: string }[];
  active: ExperienceSectionId | null;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 180);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Intelligence journey"
      className={cn(
        "fixed bottom-5 left-1/2 z-30 w-[min(920px,calc(100%-1.5rem))] -translate-x-1/2 transition-all duration-300",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      )}
    >
      <div className="overflow-x-auto rounded-full border border-white/[0.08] bg-[#0b0c0e]/85 px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex min-w-max items-center gap-0.5">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300",
                active === item.id
                  ? "bg-white text-neutral-950"
                  : "text-white/45 hover:text-white/80"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
