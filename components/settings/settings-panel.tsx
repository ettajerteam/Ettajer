import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
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

/** Compact settings content panel matching dashboard density. */
export function SettingsPanel({
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
    <section className={cn(dashboardCard, "overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={dashboardTitle}>{title}</h2>
            {dirty ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                Unsaved
              </span>
            ) : null}
          </div>
          {description ? (
            <p className={cn(dashboardSubtitle, "mt-0.5 max-w-lg")}>
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="space-y-4 px-4 py-4">{children}</div>

      {onSave ? (
        <div
          className={cn(
            "sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t border-black/[0.05] bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-white/10 dark:bg-[#1C1C1E]/95",
            dirty && "border-amber-200/70 dark:border-amber-500/20"
          )}
        >
          <p className="hidden text-[11px] text-neutral-400 sm:block">
            {dirty ? (
              <>
                Unsaved ·{" "}
                <kbd className="rounded border border-black/[0.06] bg-[#F5F5F7] px-1 py-0.5 font-mono text-[10px] text-neutral-500 dark:border-white/10 dark:bg-white/5">
                  ⌘S
                </kbd>
              </>
            ) : (
              "Saved to your live store"
            )}
          </p>
          <Button
            type="button"
            onClick={() => void onSave()}
            loading={saving}
            className={cn(dashboardPrimaryBtn, "h-8 min-w-[120px] px-3")}
          >
            {saveLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
