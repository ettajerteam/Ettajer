"use client";

import { useId, useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorHelpTooltipProps {
  text: string;
  className?: string;
}

export function EditorHelpTooltip({ text, className }: EditorHelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        aria-label="Help"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1.5 w-48 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[11px] leading-snug text-neutral-600 shadow-md"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
