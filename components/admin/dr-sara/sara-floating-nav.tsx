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
      <div className="sara-glass-nav overflow-x-auto rounded-full px-2 py-1.5">
        <div className="flex min-w-max items-center gap-0.5">
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AC8FA]",
                active === item.id
                  ? "bg-[#007AFF] text-white shadow-[0_6px_18px_-6px_rgba(0,122,255,0.65)]"
                  : "text-white/45 hover:bg-white/[0.06] hover:text-white/85"
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
