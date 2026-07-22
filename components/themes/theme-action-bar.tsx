"use client";

import { Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeActionBarProps {
  publishing: boolean;
  onDiscard: () => void;
  onPublish: () => void;
  className?: string;
}

/** Sticky publish strip when theme draft has unpublished changes. */
export function ThemeActionBar({
  publishing,
  onDiscard,
  onPublish,
  className,
}: ThemeActionBarProps) {
  return (
    <div
      className={cn(
        "sticky bottom-4 z-40 mx-auto w-full max-w-3xl px-2",
        className,
      )}
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-white/95 p-3 shadow-[0_20px_50px_-16px_rgba(15,23,42,0.35)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
        <p className="px-1 text-sm font-medium text-amber-900 sm:px-2">
          Unpublished changes — preview updated. Publish to go live.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            className="h-10 gap-1.5 rounded-xl"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Discard
          </Button>
          <Button
            size="sm"
            onClick={onPublish}
            disabled={publishing}
            className="h-10 gap-1.5 rounded-xl bg-[#007AFF] px-4 hover:bg-[#0071EB]"
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
