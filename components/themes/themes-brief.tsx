import { Palette, Sparkles, TriangleAlert } from "lucide-react";
import { dashboardCard, dashboardCardPad, dashboardKicker } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

export type ThemesBriefTone = "positive" | "attention" | "neutral";

interface ThemesBriefProps {
  message: string;
  tone: ThemesBriefTone;
  brandProgress: number;
  liveTemplateName: string;
  hasUnpublishedChanges: boolean;
}

const TONE_STYLES: Record<
  ThemesBriefTone,
  { icon: typeof Palette; chip: string; text: string; glow: string; stroke: string }
> = {
  positive: {
    icon: Palette,
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    text: "text-emerald-700 dark:text-emerald-400",
    glow: "from-emerald-500/[0.08]",
    stroke: "stroke-emerald-500",
  },
  attention: {
    icon: TriangleAlert,
    chip: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    text: "text-amber-800 dark:text-amber-300",
    glow: "from-amber-500/[0.08]",
    stroke: "stroke-amber-500",
  },
  neutral: {
    icon: Sparkles,
    chip: "bg-[#007AFF]/10 text-[#007AFF]",
    text: "text-neutral-700 dark:text-neutral-200",
    glow: "from-[#007AFF]/[0.06]",
    stroke: "stroke-[#007AFF]",
  },
};

export function ThemesBrief({
  message,
  tone,
  brandProgress,
  liveTemplateName,
  hasUnpublishedChanges,
}: ThemesBriefProps) {
  const style = TONE_STYLES[tone];
  const Icon = style.icon;

  return (
    <section className={cn(dashboardCard, dashboardCardPad, "relative overflow-hidden")}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent",
          style.glow
        )}
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", style.chip)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className={dashboardKicker}>Storefront theme</p>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", style.chip)}>
                {hasUnpublishedChanges ? "Draft changes" : "Live"}
              </span>
            </div>
            <p className={cn("mt-1 text-sm font-medium", style.text)}>{message}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:min-w-[220px]">
          <div className="relative h-12 w-12 shrink-0">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36" aria-hidden>
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-neutral-200 dark:stroke-white/10"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className={style.stroke}
                strokeWidth="3"
                strokeDasharray={`${brandProgress} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
              {brandProgress}%
            </span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-neutral-400">Brand setup</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{liveTemplateName}</p>
            <p className="text-[11px] text-neutral-500">Logo, colors, typography</p>
          </div>
        </div>
      </div>
    </section>
  );
}
