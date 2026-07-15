/** Shared compact dashboard layout tokens */
export const dashboardPageContent =
  "mx-auto max-w-[1320px] space-y-4 px-5 py-4 sm:px-6 sm:py-5";

export const dashboardStack = "space-y-4";

export const dashboardCard =
  "rounded-xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)] ring-1 ring-neutral-200/50 transition-shadow duration-300 dark:border-white/10 dark:bg-[#161616] dark:ring-white/[0.06]";

export const dashboardCardInteractive =
  "hover:shadow-[0_2px_6px_rgba(15,23,42,0.06),0_16px_32px_-16px_rgba(15,23,42,0.14)] hover:ring-neutral-300/60 dark:hover:ring-white/10";

export const dashboardCardPad = "p-4 sm:p-5";

export const dashboardKicker =
  "text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400 dark:text-neutral-500";

export const dashboardTitle =
  "text-base font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white";

export const dashboardSubtitle = "text-xs text-neutral-500 dark:text-neutral-400";

export const dashboardMetric =
  "text-xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white";

export const dashboardHeading =
  "text-lg font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white";

/** Segmented nav (tabs with counts) — matches DashboardSectionNav active state */
export const dashboardSegmentNav = "premium-card flex flex-wrap gap-1 p-1";

export const dashboardSegmentTab =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200";

export const dashboardSegmentTabActive = "premium-nav-active text-foreground";

export const dashboardSegmentTabInactive =
  "text-muted-foreground hover:bg-muted/60 hover:text-foreground";

/** Inline range / filter pill group */
export const dashboardPillGroup = "premium-card inline-flex p-0.5";

export const dashboardPill =
  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200";

export const dashboardPillActive = "premium-nav-active text-foreground";

export const dashboardPillInactive =
  "text-muted-foreground hover:bg-muted/60 hover:text-foreground";

/** Primary CTA — Apple / Shopify blue */
export const dashboardPrimaryBtn =
  "rounded-xl bg-[#007AFF] font-medium text-white shadow-[0_1px_2px_rgba(0,122,255,0.2),0_4px_12px_-2px_rgba(0,122,255,0.35)] hover:bg-[#0071EB] active:scale-[0.98] transition-all";

/** Glass sticky bar for editors */
export const dashboardGlassHeader =
  "sticky top-0 z-40 border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-white/10 dark:bg-[#121212]/85";
