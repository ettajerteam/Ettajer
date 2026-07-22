"use client";

import { useEffect } from "react";
import {
  dispatchEditorKey,
  isTypingTarget,
  type EditorKeyHandlers,
} from "@/lib/builder/editor-key-dispatch";

export interface EditorShortcutDefinition {
  keys: string;
  action: string;
}

export const EDITOR_SHORTCUTS: EditorShortcutDefinition[] = [
  { keys: "Ctrl+Z", action: "Undo" },
  { keys: "Ctrl+Shift+Z", action: "Redo" },
  { keys: "Ctrl+Y", action: "Redo" },
  { keys: "Ctrl+S", action: "Save draft" },
  { keys: "Ctrl+Shift+S", action: "Go live" },
  { keys: "?", action: "Shortcuts help" },
  { keys: "Ctrl+C", action: "Copy section" },
  { keys: "Ctrl+V", action: "Paste section" },
  { keys: "Ctrl+D", action: "Duplicate section" },
  { keys: "Delete", action: "Delete section" },
  { keys: "Escape", action: "Deselect" },
  { keys: "Enter", action: "Focus selection" },
  { keys: "↑ / ↓", action: "Select section" },
  { keys: "[ / ]", action: "Cycle element focus" },
  { keys: "Ctrl+↑ / ↓", action: "Move section" },
  { keys: "Shift+Ctrl+↑ / ↓", action: "Move section faster" },
];

export type UseEditorShortcutsOptions = EditorKeyHandlers & {
  enabled?: boolean;
};

export function useEditorShortcuts({
  enabled = true,
  ...handlers
}: UseEditorShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const handled = dispatchEditorKey(
        {
          key: event.key,
          code: event.code,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
        },
        handlers,
        event.target
      );
      if (handled) event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    enabled,
    handlers.canEditSections,
    handlers.selectedSectionId,
    handlers.hasClipboard,
    handlers.canUndo,
    handlers.canRedo,
    handlers.undo,
    handlers.redo,
    handlers.onPublish,
    handlers.canPublish,
    handlers.onSaveDraft,
    handlers.onOpenShortcutsHelp,
    handlers.deselect,
    handlers.onFocusSelection,
    handlers.onDelete,
    handlers.onDuplicate,
    handlers.onCopy,
    handlers.onPaste,
    handlers.selectAdjacentSection,
    handlers.cycleElementFocus,
    handlers.moveSectionUp,
    handlers.moveSectionDown,
    handlers.moveSectionBy,
  ]);
}

export function formatModShortcut(keys: string): string {
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  if (!isMac) return keys;
  return keys
    .replace(/Ctrl\+Shift\+/g, "⌘⇧")
    .replace(/Ctrl\+/g, "⌘")
    .replace(/Shift\+/g, "⇧")
    .replace(/\+/g, "");
}

export { isTypingTarget, dispatchEditorKey };
