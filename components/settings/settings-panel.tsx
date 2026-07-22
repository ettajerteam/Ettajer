import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
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
  action,
  className,
}: SettingsPanelProps) {
  return (
    <section className={cn(dashboardCard, "overflow-hidden", className)}>
      <div className={cn(dashboardCardPad, "border-b border-neutral-200/70 dark:border-white/10")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={dashboardKicker}>{kicker}</p>
            <h2 className={cn(dashboardTitle, "mt-1 text-lg")}>{title}</h2>
            {description ? (
              <p className={cn(dashboardSubtitle, "mt-1.5 max-w-xl text-[13px] leading-relaxed")}>
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>

      <div className={cn(dashboardCardPad, "space-y-6 sm:p-6")}>{children}</div>

      {onSave ? (
        <div
          className={cn(
            dashboardCardPad,
            "sticky bottom-0 flex items-center justify-end gap-2 border-t border-neutral-200/70 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#161616]/90"
          )}
        >
          <Button
            type="button"
            onClick={() => void onSave()}
            loading={saving}
            className={dashboardPrimaryBtn}
          >
            {saveLabel}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
