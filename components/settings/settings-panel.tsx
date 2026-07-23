import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardPrimaryBtn,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";
import { Button } from "@/components/ui/button";

interface SettingsPanelProps {
  kicker?: string;
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => void | Promise<void>;
  saving?: boolean;
  saveLabel?: string;
  dirty?: boolean;
  action?: ReactNode;
  className?: string;
}

/** Premium settings content panel with optional sticky save footer. */
export function SettingsPanel({
  kicker = "Settings",
  title,
  description,
  children,
  onSave,
  saving,
  saveLabel = "Save changes",
  dirty = false,
  action,
  className,
}: SettingsPanelProps) {
  return (
    <section
      className={cn(
        dashboardCard,
        "overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-18px_rgba(15,23,42,0.12)]",
        className
      )}
    >
      <div
        className={cn(
          dashboardCardPad,
          "relative border-b border-neutral-200/70 bg-gradient-to-b from-neutral-50/80 to-white dark:border-white/10 dark:from-white/[0.03] dark:to-transparent sm:px-6 sm:pt-5 sm:pb-5"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#007AFF]/80">
                {kicker}
              </p>
              {dirty ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Unsaved
                </span>
              ) : null}
            </div>
            <h2 className={cn(dashboardTitle, "mt-1.5 text-xl tracking-[-0.03em]")}>
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  dashboardSubtitle,
                  "mt-2 max-w-lg text-[13px] leading-relaxed text-neutral-500"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0 pt-1">{action}</div> : null}
        </div>
      </div>

      <div className={cn(dashboardCardPad, "space-y-5 sm:space-y-6 sm:p-6 sm:px-6")}>
        {children}
      </div>

      {onSave ? (
        <div
          className={cn(
            "sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-neutral-200/80 bg-white/95 px-4 py-3.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#161616]/95 sm:px-6",
            dirty && "border-amber-200/80 dark:border-amber-500/20"
          )}
        >
          <p className="hidden text-[12px] text-neutral-400 sm:block">
            {dirty ? (
              <>
                You have unsaved changes ·{" "}
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 dark:border-white/10 dark:bg-white/5">
                  ⌘S
                </kbd>
              </>
            ) : (
              "Changes apply to your live store after you save."
            )}
          </p>
          <Button
            type="button"
            onClick={() => void onSave()}
            loading={saving}
            className={cn(
              dashboardPrimaryBtn,
              "min-w-[140px]",
              dirty && "shadow-[0_4px_16px_-4px_rgba(0,122,255,0.55)]"
            )}
          >
            {saveLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
