import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AdminInsight } from "@/lib/admin/platform-intelligence";
import {
  homeCard,
  homeCardPad,
  homeKicker,
  homeSubtitle,
  homeTitle,
} from "@/components/dashboard/home/home-ui";
import { cn } from "@/lib/utils";

const severityStyles = {
  high: "border-rose-200/80 bg-rose-50/80 dark:border-rose-500/20 dark:bg-rose-500/10",
  medium:
    "border-amber-200/80 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10",
  low: "border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.04]",
  positive:
    "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10",
};

const categoryLabel: Record<string, string> = {
  growth: "Growth",
  activation: "Activation",
  revenue: "Revenue",
  support: "Support",
  risk: "Risk",
  technical: "Technical",
};

interface AdminInsightsPanelProps {
  insights: AdminInsight[];
  compact?: boolean;
}

export function AdminInsightsPanel({
  insights,
  compact = false,
}: AdminInsightsPanelProps) {
  const list = compact ? insights.slice(0, 4) : insights;

  return (
    <section className={cn(homeCard, homeCardPad)}>
      <div>
        <h2 className={homeTitle}>Insights</h2>
        <p className={homeSubtitle}>
          Signal → why it matters → recommended action
        </p>
      </div>

      {list.length === 0 ? (
        <p className={cn("mt-4", homeSubtitle)}>No insights for this window.</p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {list.map((insight) => (
            <li
              key={insight.id}
              className={cn(
                "rounded-lg border px-3 py-2.5",
                severityStyles[insight.severity]
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={homeKicker}>
                  {insight.severity === "high"
                    ? "High priority"
                    : insight.severity === "positive"
                      ? "Positive"
                      : categoryLabel[insight.category] ?? insight.category}
                </span>
                {insight.category ? (
                  <span className="text-[10px] text-neutral-400">
                    {categoryLabel[insight.category] ?? insight.category}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500">
                Signal
              </p>
              <p className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white">
                {insight.signal ?? insight.title}
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500">
                Why it matters
              </p>
              <p className="text-[12px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                {insight.why ?? insight.detail}
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500">
                Recommended action
              </p>
              <p className="text-[12px] leading-relaxed text-neutral-700 dark:text-neutral-200">
                {insight.action ?? insight.detail}
              </p>
              <Link
                href={insight.href}
                className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-medium text-[#007AFF] underline-offset-2 hover:underline"
              >
                {insight.cta}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className={cn("mt-3", homeKicker)}>
        Derived from live platform data — not an LLM
      </p>
    </section>
  );
}
