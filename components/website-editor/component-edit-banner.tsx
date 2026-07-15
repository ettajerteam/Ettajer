"use client";

import { Puzzle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComponentEditBannerProps {
  instanceCount: number;
  componentName: string;
  onExit: () => void;
}

export function ComponentEditBanner({
  instanceCount,
  componentName,
  onExit,
}: ComponentEditBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#007AFF]/20 bg-[#007AFF]/[0.06] px-4 py-2">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <Puzzle className="h-4 w-4 shrink-0 text-[#007AFF]" />
        <span className="truncate text-neutral-800">
          Editing component <strong className="font-semibold">{componentName}</strong>
          {" — "}
          changes apply to{" "}
          <strong className="font-semibold">{instanceCount}</strong> instance
          {instanceCount !== 1 ? "s" : ""}
        </span>
      </div>
      <Button type="button" variant="ghost" size="sm" className="shrink-0 gap-1" onClick={onExit}>
        <X className="h-3.5 w-3.5" />
        Done editing
      </Button>
    </div>
  );
}
