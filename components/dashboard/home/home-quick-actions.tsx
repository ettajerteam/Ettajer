"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { HomeQuickAction } from "@/lib/home-insights";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";
import { cn } from "@/lib/utils";

interface HomeQuickActionsProps {
  actions: HomeQuickAction[];
}

export function HomeQuickActions({ actions }: HomeQuickActionsProps) {
  const t = useHomeCopy();
  return (
    <section className={cn(homeCard, homeCardPad)}>
      <h2 className={homeTitle}>{t.quickActions}</h2>
      <p className={homeSubtitle}>{t.jumpTasks}</p>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="group flex items-start gap-2 rounded-lg border border-black/[0.04] bg-[#F5F5F7]/80 px-2.5 py-2.5 transition-colors duration-200 hover:bg-neutral-100 dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white text-neutral-500 dark:bg-white/10 dark:text-neutral-300">
              <Plus className="h-3 w-3" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                {action.label}
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-neutral-400">
                {action.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
