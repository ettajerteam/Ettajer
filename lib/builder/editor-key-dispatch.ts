/**
 * Shared keyboard dispatch for parent window + iframe-forwarded keys.
 */

export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return true;
  return target.isContentEditable;
}

function isListNavigationTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.closest('[role="listbox"]') !== null;
}

export type EditorKeyPayload = {
  key: string;
  code?: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  /** When true, treat as not typing (iframe already filtered). */
  fromPreview?: boolean;
};

export type EditorKeyHandlers = {
  canEditSections: boolean;
  selectedSectionId: string | null;
  hasClipboard: boolean;
  canUndo: () => boolean;
  canRedo: () => boolean;
  undo: () => void;
  redo: () => void;
  onPublish: () => void;
  canPublish: boolean;
  onSaveDraft?: () => void;
  onOpenShortcutsHelp?: () => void;
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
};

const FAST_MOVE_DELTA = 3;

/** Returns true if the key was handled. */
export function dispatchEditorKey(
  event: EditorKeyPayload,
  handlers: EditorKeyHandlers,
  target: EventTarget | null = null
): boolean {
  const typing = event.fromPreview ? false : isTypingTarget(target);
  const mod = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();

  const {
    canEditSections,
    selectedSectionId,
    hasClipboard,
    canUndo,
    canRedo,
    undo,
    redo,
    onPublish,
    canPublish,
    onSaveDraft,
    onOpenShortcutsHelp,
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
  } = handlers;

  if (mod && key === "s") {
    if (event.shiftKey) {
      if (canPublish) onPublish();
    } else if (onSaveDraft) {
      onSaveDraft();
    } else if (canPublish) {
      onPublish();
    }
    return true;
  }

  if (mod && key === "z") {
    if (event.shiftKey) {
      if (canRedo()) redo();
    } else if (canUndo()) {
      undo();
    }
    return true;
  }

  if (mod && key === "y") {
    if (canRedo()) redo();
    return true;
  }

  if (typing) return false;

  if (mod && key === "c") {
    if (!selectedSectionId || !canEditSections) return false;
    onCopy(selectedSectionId);
    return true;
  }

  if (mod && key === "v") {
    if (!canEditSections) return false;
    // Allow paste even when in-memory clipboard empty (system clipboard may have a section).
    if (!hasClipboard) {
      onPaste();
      return true;
    }
    onPaste();
    return true;
  }

  if (mod && key === "d") {
    if (!selectedSectionId || !canEditSections) return false;
    onDuplicate(selectedSectionId);
    return true;
  }

  if (event.key === "Escape") {
    deselect();
    return true;
  }

  if ((event.key === "?" || (event.shiftKey && event.key === "/")) && onOpenShortcutsHelp) {
    onOpenShortcutsHelp();
    return true;
  }

  if (event.key === "Enter" && canEditSections) {
    onFocusSelection();
    return true;
  }

  if ((event.key === "Delete" || event.key === "Backspace") && selectedSectionId && canEditSections) {
    onDelete(selectedSectionId);
    return true;
  }

  if ((event.key === "[" || event.key === "]") && canEditSections && selectedSectionId && !mod) {
    cycleElementFocus(event.key === "[" ? -1 : 1);
    return true;
  }

  if (!canEditSections || isListNavigationTarget(target)) return false;

  const shift = event.shiftKey;
  const vertical =
    event.key === "ArrowUp" ||
    event.key === "ArrowDown" ||
    event.key === "ArrowLeft" ||
    event.key === "ArrowRight";
  if (!vertical) return false;

  const down = event.key === "ArrowDown" || event.key === "ArrowRight";
  const delta = down ? 1 : -1;

  if (mod && selectedSectionId) {
    if (shift) {
      moveSectionBy(selectedSectionId, delta * FAST_MOVE_DELTA);
    } else if (delta < 0) {
      moveSectionUp(selectedSectionId);
    } else {
      moveSectionDown(selectedSectionId);
    }
    return true;
  }

  if (!mod) {
    selectAdjacentSection(delta);
    return true;
  }

  return false;
}
