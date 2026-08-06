"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ThemeActionBarProps {
  publishing: boolean;
  onDiscard: () => void;
  onPublish: () => void;
  className?: string;
}

/** Sticky publish strip — flat blue + text discard. */
export function ThemeActionBar({
  publishing,
  onDiscard,
  onPublish,
  className,
}: ThemeActionBarProps) {
  return (
    <div className={cn("sticky bottom-3 z-40 mx-auto w-full max-w-xl px-1", className)}>
      <div className="flex items-center justify-between gap-3 rounded-[12px] border border-black/[0.06] bg-white/95 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#1C1C1E]/95">
        <p className="text-[12px] text-neutral-500">Unpublished brand changes</p>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            className="h-8 rounded-md px-2.5 text-[12px] font-medium text-neutral-500 hover:bg-transparent hover:text-neutral-900"
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            className={cn(dashboardPrimaryBtn, "h-8 gap-1 px-3")}
            onClick={onPublish}
            disabled={publishing}
          >
            {publishing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
