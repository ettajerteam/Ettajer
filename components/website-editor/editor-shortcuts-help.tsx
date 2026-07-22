"use client";

import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EDITOR_SHORTCUTS,
  formatModShortcut,
} from "@/lib/builder/use-editor-shortcuts";
import { cn } from "@/lib/utils";

interface EditorShortcutsHelpProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditorShortcutsHelp({
  className,
  open,
  onOpenChange,
}: EditorShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
            className
          )}
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Speed up editing without leaving the canvas.
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-[min(60vh,420px)] space-y-1.5 overflow-y-auto pr-1">
          {EDITOR_SHORTCUTS.map(({ keys, action }) => (
            <li
              key={`${keys}-${action}`}
              className="flex items-center justify-between gap-3 rounded-lg px-1 py-1 text-sm"
            >
              <span className="text-neutral-600">{action}</span>
              <kbd className="shrink-0 rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[11px] text-neutral-700">
                {formatModShortcut(keys)}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
