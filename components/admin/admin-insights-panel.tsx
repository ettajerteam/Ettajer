import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { AdminInsight } from "@/lib/admin/platform-intelligence";
import {
  homeCard,
  homeCardPad,
  homeIconWrap,
  homeKicker,
  homeSubtitle,
  homeTitle,
} from "@/components/dashboard/home/home-ui";
import { cn } from "@/lib/utils";

const severityStyles = {
  high: "border-rose-200/80 bg-rose-50 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200",
  medium:
    "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
  low: "border-black/[0.06] bg-[#F5F5F7] text-neutral-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200",
  positive:
    "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
};

interface AdminInsightsPanelProps {
  insights: AdminInsight[];
}

export function AdminInsightsPanel({ insights }: AdminInsightsPanelProps) {
  const primary = insights[0];
  const rest = insights.slice(1);

  return (
    <section className={cn(homeCard, homeCardPad)}>
      <div className="flex items-center gap-2">
        <span className={homeIconWrap}>
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div>
          <h2 className={homeTitle}>Intelligence</h2>
          <p className={homeSubtitle}>
            Rule-based platform reads — activation, support, GMV, and risk.
          </p>
        </div>
      </div>

      {primary ? (
        <div
          className={cn(
            "mt-4 rounded-lg border px-3 py-3",
            severityStyles[primary.severity]
          )}
        >
          <p className="text-[13px] font-semibold tracking-tight">
            {primary.title}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed opacity-90">
            {primary.detail}
          </p>
          <Link
            href={primary.href}
            className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium underline-offset-2 hover:underline"
          >
            {primary.cta}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}

      {rest.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {rest.map((insight) => (
            <li
              key={insight.id}
              className="flex gap-2 rounded-lg border border-black/[0.05] px-2.5 py-2 dark:border-white/[0.06]"
            >
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-neutral-400" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                  {insight.title}
                </p>
                <p className={cn("mt-0.5", homeSubtitle)}>{insight.detail}</p>
                <Link
                  href={insight.href}
                  className="mt-1 inline-flex text-[11px] font-medium text-[#007AFF]"
                >
                  {insight.cta}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p className={cn("mt-3", homeKicker)}>Not an LLM — derived from live platform data</p>
    </section>
  );
}
