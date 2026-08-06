import Link from "next/link";
import { ArrowUpRight, Radio, Sparkles, TriangleAlert } from "lucide-react";
import type { IntegrationBriefTone } from "@/lib/marketing-integrations";
import {
  dashboardCard,
  dashboardKicker,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface MarketingIntegrationsBriefProps {
  message: string;
  tone: IntegrationBriefTone;
  connectedCount: number;
  totalCount: number;
  recommendedName?: string;
  recommendedHref?: string;
}

const TONE_STYLES: Record<
  IntegrationBriefTone,
  { icon: typeof Radio; chip: string; label: string }
> = {
  positive: {
    icon: Radio,
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    label: "Ready",
  },
  attention: {
    icon: TriangleAlert,
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    label: "Finish setup",
  },
  neutral: {
    icon: Sparkles,
    chip: "bg-[#F5F5F7] text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300",
    label: "Get started",
  },
};

export function MarketingIntegrationsBrief({
  message,
  tone,
  connectedCount,
  totalCount,
  recommendedName,
  recommendedHref,
}: MarketingIntegrationsBriefProps) {
  const style = TONE_STYLES[tone];
  const Icon = style.icon;
  const progress = totalCount > 0 ? Math.round((connectedCount / totalCount) * 100) : 0;

  return (
    <section className={cn(dashboardCard, "p-4")}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              style.chip
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className={dashboardKicker}>Tracking status</p>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  style.chip
                )}
              >
                {style.label}
              </span>
            </div>
            <p className={cn(dashboardTitle, "mt-1 leading-snug")}>{message}</p>
            {recommendedName && recommendedHref && connectedCount < totalCount ? (
              <Link
                href={recommendedHref}
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#007AFF] hover:underline"
              >
                Continue with {recommendedName}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:min-w-[200px]">
          <div className="relative h-10 w-10 shrink-0">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-black/[0.06] dark:stroke-white/10"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className={cn(
                  tone === "positive"
                    ? "stroke-emerald-500"
                    : tone === "attention"
                      ? "stroke-amber-500"
                      : "stroke-[#007AFF]"
                )}
                strokeWidth="3"
                strokeDasharray={`${progress} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tabular-nums text-neutral-700 dark:text-neutral-200">
              {progress}%
            </span>
          </div>
          <div>
            <p className={dashboardKicker}>Coverage</p>
            <p className="text-[13px] font-semibold text-neutral-900 dark:text-white">
              {connectedCount}/{totalCount} platforms
            </p>
            <p className={dashboardSubtitle}>Storefront + checkout events</p>
          </div>
        </div>
      </div>
    </section>
  );
}
