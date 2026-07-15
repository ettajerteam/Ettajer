import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercentChange } from "@/lib/live-view-utils";

interface LiveStat {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone: "sky" | "violet" | "emerald" | "blue";
  change?: number;
}

interface LiveViewStatsProps {
  stats: LiveStat[];
}

const TONE_STYLES: Record<
  LiveStat["tone"],
  { icon: string; glow: string; ring: string }
> = {
  sky: {
    icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    glow: "from-sky-500/[0.07]",
    ring: "ring-sky-500/10",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    glow: "from-violet-500/[0.07]",
    ring: "ring-violet-500/10",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    glow: "from-emerald-500/[0.07]",
    ring: "ring-emerald-500/10",
  },
  blue: {
    icon: "bg-[#007AFF]/10 text-[#007AFF]",
    glow: "from-[#007AFF]/[0.08]",
    ring: "ring-[#007AFF]/10",
  },
};

export function LiveViewStats({ stats }: LiveViewStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const tone = TONE_STYLES[stat.tone];

        return (
          <div
            key={stat.label}
            className={cn(
              "premium-card relative overflow-hidden p-4 ring-1",
              tone.ring
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent",
                tone.glow
              )}
            />
            <div className="relative flex items-start gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  tone.icon
                )}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white">
                  {stat.value}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {stat.hint ? (
                    <p className="text-[11px] text-neutral-500">{stat.hint}</p>
                  ) : null}
                  {typeof stat.change === "number" ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        stat.change >= 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      {formatPercentChange(stat.change)} vs prior
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
