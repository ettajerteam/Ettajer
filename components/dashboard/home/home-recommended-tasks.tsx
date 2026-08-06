"use client";

import Link from "next/link";
import { Check, Circle } from "lucide-react";
import type { HomeTaskItem } from "@/lib/home-insights";
import { homeCard, homeCardPad, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";
import { cn } from "@/lib/utils";

interface HomeRecommendedTasksProps {
  tasks: HomeTaskItem[];
  completion: number;
}

export function HomeRecommendedTasks({ tasks, completion }: HomeRecommendedTasksProps) {
  const t = useHomeCopy();
  return (
    <section className={cn(homeCard, homeCardPad, "h-full")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={homeTitle}>{t.growBusiness}</h2>
          <p className={homeSubtitle}>{t.setupTasks}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-neutral-400">{t.storeCompletion}</p>
          <p className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
            {completion}%
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-neutral-900 transition-all dark:bg-white"
          style={{ width: `${completion}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2.5">
        {tasks.map((task) => {
          const row = (
            <span className="flex items-center gap-2.5">
              {task.done ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-neutral-300" />
              )}
              <span
                className={cn(
                  "text-[12px]",
                  task.done
                    ? "text-neutral-400 line-through"
                    : "font-medium text-neutral-800 dark:text-neutral-100"
                )}
              >
                {task.label}
              </span>
            </span>
          );

          return (
            <li key={task.id}>
              {task.href && !task.done ? (
                <Link href={task.href} className="block rounded-lg px-1 py-0.5 hover:bg-neutral-50 dark:hover:bg-white/[0.03]">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
