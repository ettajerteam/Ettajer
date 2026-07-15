"use client";

import { useId, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  EDITOR_SHORTCUTS,
  formatModShortcut,
} from "@/lib/builder/use-editor-shortcuts";
import { cn } from "@/lib/utils";

interface EditorShortcutsHelpProps {
  className?: string;
}

export function EditorShortcutsHelp({ className }: EditorShortcutsHelpProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className={cn("relative inline-flex", className)}>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        aria-label="Keyboard shortcuts"
        aria-describedby={open ? id : undefined}
        title="Keyboard shortcuts"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Keyboard className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-neutral-200 bg-white p-2.5 shadow-md"
        >
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Keyboard shortcuts
          </p>
          <ul className="space-y-1">
            {EDITOR_SHORTCUTS.map(({ keys, action }) => (
              <li
                key={`${keys}-${action}`}
                className="flex items-center justify-between gap-3 text-[11px] leading-snug"
              >
                <span className="text-neutral-600">{action}</span>
                <kbd className="shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px] text-neutral-700">
                  {formatModShortcut(keys)}
                </kbd>
              </li>
            ))}
          </ul>
        </span>
      ) : null}
    </span>
  );
}
