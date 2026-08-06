"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import type { HomeAiInsight } from "@/lib/home-insights";
import { homeCard, homeCardPad, homeIconWrap, homeSubtitle, homeTitle } from "./home-ui";
import { useHomeCopy } from "./home-i18n";
import { cn } from "@/lib/utils";

interface HomeAiInsightsProps {
  insight: HomeAiInsight;
}

export function HomeAiInsights({ insight }: HomeAiInsightsProps) {
  const t = useHomeCopy();
  return (
    <section className={cn(homeCard, homeCardPad)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={homeIconWrap}>
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <h2 className={homeTitle}>{t.aiInsights}</h2>
              <p className={homeSubtitle}>{insight.headline}</p>
            </div>
          </div>

          <ul className="mt-3 space-y-1.5">
            {insight.facts.map((fact) => (
              <li
                key={fact}
                className="flex gap-2 text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-300"
              >
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full shrink-0 rounded-lg border border-black/[0.05] bg-[#F5F5F7]/80 p-3 lg:max-w-[240px] dark:border-white/[0.06] dark:bg-white/[0.03]">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-neutral-400">
            {t.recommended}
          </p>
          <ul className="mt-2 space-y-1.5">
            {insight.recommendations.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block text-[12px] font-medium text-neutral-800 transition-colors duration-200 hover:text-[#007AFF] dark:text-neutral-100"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={insight.href}
            className="mt-3 inline-flex rounded-md bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
          >
            {t.viewRecommendations}
          </Link>
        </div>
      </div>
    </section>
  );
}
