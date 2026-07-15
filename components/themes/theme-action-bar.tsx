"use client";

import { Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardCard, dashboardCardPad } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemeActionBarProps {
  publishing: boolean;
  onDiscard: () => void;
  onPublish: () => void;
  className?: string;
}

/** Single action strip for draft changes — sits between status brief and content zones. */
export function ThemeActionBar({
  publishing,
  onDiscard,
  onPublish,
  className,
}: ThemeActionBarProps) {
  return (
    <div
      className={cn(
        dashboardCard,
        dashboardCardPad,
        "relative overflow-hidden border-amber-200/60 bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-transparent dark:border-amber-500/15 dark:from-amber-500/[0.08] dark:via-transparent",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
        Unpublished theme changes — preview below, then publish to go live.
      </p>
      <div className="flex shrink-0 gap-2">
        <Button variant="ghost" size="sm" onClick={onDiscard} className="gap-1.5 rounded-lg">
          <RotateCcw className="h-3.5 w-3.5" />
          Discard
        </Button>
        <Button
          size="sm"
          onClick={onPublish}
          disabled={publishing}
          className="gap-1.5 rounded-xl premium-glow-blue bg-[#007AFF] hover:bg-[#0071EB]"
        >
          {publishing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Publishing…
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              Publish theme
            </>
          )}
        </Button>
      </div>
      </div>
    </div>
  );
}
