"use client";

import { useEffect } from "react";

export interface EditorShortcutDefinition {
  keys: string;
  action: string;
}

export const EDITOR_SHORTCUTS: EditorShortcutDefinition[] = [
  { keys: "Ctrl+Z", action: "Undo" },
  { keys: "Ctrl+Shift+Z", action: "Redo" },
  { keys: "Ctrl+Y", action: "Redo" },
  { keys: "Ctrl+S", action: "Publish" },
  { keys: "Ctrl+C", action: "Copy section" },
  { keys: "Ctrl+V", action: "Paste section" },
  { keys: "Ctrl+D", action: "Duplicate section" },
  { keys: "Delete", action: "Delete section" },
  { keys: "Escape", action: "Deselect" },
  { keys: "Enter", action: "Focus selection" },
  { keys: "↑ / ↓", action: "Select section" },
  { keys: "Tab", action: "Cycle element focus" },
  { keys: "Ctrl+↑ / ↓", action: "Move section" },
  { keys: "Shift+Ctrl+↑ / ↓", action: "Move section faster" },
];

const FAST_MOVE_DELTA = 3;

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return true;
  return target.isContentEditable;
}

function isListNavigationTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest('[role="listbox"]') !== null;
}

function isModKey(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey;
}

export interface UseEditorShortcutsOptions {
  enabled?: boolean;
  /** When true, section editing shortcuts are active (all pages with section builder). */
  canEditSections: boolean;
  selectedSectionId: string | null;
  hasClipboard: boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  onPublish: () => void;
  canPublish: boolean;
  deselect: () => void;
  onFocusSelection: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: (id: string) => void;
  onPaste: () => void;
  selectAdjacentSection: (delta: number) => void;
  cycleElementFocus: (delta: number) => void;
  moveSectionUp: (id: string) => void;
  moveSectionDown: (id: string) => void;
  moveSectionBy: (id: string, delta: number) => void;
}

export function useEditorShortcuts({
  enabled = true,
  canEditSections,
  selectedSectionId,
  hasClipboard,
  canUndo,
  canRedo,
  undo,
  redo,
  onPublish,
  canPublish,
  deselect,
  onFocusSelection,
  onDelete,
  onDuplicate,
  onCopy,
  onPaste,
  selectAdjacentSection,
  cycleElementFocus,
  moveSectionUp,
  moveSectionDown,
  moveSectionBy,
}: UseEditorShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const typing = isTypingTarget(target);
      const mod = isModKey(event);
      const key = event.key.toLowerCase();

      if (mod && key === "s") {
        event.preventDefault();
        if (canPublish) onPublish();
        return;
      }

      if (mod && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          if (canRedo()) redo();
        } else if (canUndo()) {
          undo();
        }
        return;
      }

      if (mod && key === "y") {
        event.preventDefault();
        if (canRedo()) redo();
        return;
      }

      if (typing) return;

      if (mod && key === "c") {
        if (!selectedSectionId || !canEditSections) return;
        event.preventDefault();
        onCopy(selectedSectionId);
        return;
      }

      if (mod && key === "v") {
        if (!canEditSections || !hasClipboard) return;
        event.preventDefault();
        onPaste();
        return;
      }

      if (mod && key === "d") {
        if (!selectedSectionId || !canEditSections) return;
        event.preventDefault();
        onDuplicate(selectedSectionId);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        deselect();
        return;
      }

      if (event.key === "Enter" && canEditSections) {
        event.preventDefault();
        onFocusSelection();
        return;
      }

      if (event.key === "Delete" && selectedSectionId && canEditSections) {
        event.preventDefault();
        onDelete(selectedSectionId);
        return;
      }

      if (event.key === "Tab" && canEditSections && selectedSectionId && !mod) {
        event.preventDefault();
        cycleElementFocus(event.shiftKey ? -1 : 1);
        return;
      }

      if (!canEditSections || isListNavigationTarget(target)) return;

      const shift = event.shiftKey;
      const vertical =
        event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight";
      if (!vertical) return;

      const isUp = event.key === "ArrowUp" || event.key === "ArrowLeft";
      const direction = isUp ? -1 : 1;

      if (mod) {
        if (!selectedSectionId) return;
        event.preventDefault();
        const delta = shift ? FAST_MOVE_DELTA : 1;
        if (shift) {
          moveSectionBy(selectedSectionId, direction * delta);
        } else if (direction < 0) {
          moveSectionUp(selectedSectionId);
        } else {
          moveSectionDown(selectedSectionId);
        }
        return;
      }

      event.preventDefault();
      selectAdjacentSection(direction);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    enabled,
    canEditSections,
    selectedSectionId,
    hasClipboard,
    canUndo,
    canRedo,
    undo,
    redo,
    onPublish,
    canPublish,
    deselect,
    onFocusSelection,
    onDelete,
    onDuplicate,
    onCopy,
    onPaste,
    selectAdjacentSection,
    cycleElementFocus,
    moveSectionUp,
    moveSectionDown,
    moveSectionBy,
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
