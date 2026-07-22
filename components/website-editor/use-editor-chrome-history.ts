"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { NavItem } from "@/lib/navigation";
import {
  type ChromeHistoryEntry,
  type ChromeThemeSnapshot,
  pushChromeHistoryEntry,
  toChromeThemeSnapshot,
} from "@/components/website-editor/chrome-history";

type ThemeDraft = {
  theme?: string;
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  logo?: string | null;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  buttonRadius?: string;
};

export function useEditorChromeHistory({
  draft,
  draftNavigation,
  setDraft,
  setDraftNavigation,
  canUndoLayout,
  canRedoLayout,
  undoLayout,
  redoLayout,
  onA11yStatus,
}: {
  draft: ThemeDraft;
  draftNavigation: NavItem[];
  setDraft: (updates: Partial<ThemeDraft>) => void;
  setDraftNavigation: (items: NavItem[]) => void;
  canUndoLayout: () => boolean;
  canRedoLayout: () => boolean;
  undoLayout: () => void;
  redoLayout: () => void;
  onA11yStatus: (status: string) => void;
}) {
  const chromePastRef = useRef<ChromeHistoryEntry[]>([]);
  const chromeFutureRef = useRef<ChromeHistoryEntry[]>([]);
  const isChromeUndoRef = useRef(false);
  const lastEditKindRef = useRef<"layout" | "chrome">("layout");
  const historyPastLenRef = useRef(0);
  const [chromeHistTick, setChromeHistTick] = useState(0);

  const syncLayoutHistoryLength = useCallback((layoutPastLen: number) => {
    if (layoutPastLen > historyPastLenRef.current) {
      lastEditKindRef.current = "layout";
    }
    historyPastLenRef.current = layoutPastLen;
  }, []);

  const handleDraftChange = useCallback(
    (updates: Partial<ThemeDraft>) => {
      if (!isChromeUndoRef.current) {
        const before = toChromeThemeSnapshot({
          theme: draft.theme ?? "default",
          primaryColor: draft.primaryColor ?? "#007AFF",
          secondaryColor: draft.secondaryColor ?? "#5856D6",
          font: draft.font ?? "Inter",
          logo: draft.logo ?? null,
          textColor: draft.textColor,
          mutedColor: draft.mutedColor,
          borderColor: draft.borderColor,
          buttonRadius: draft.buttonRadius,
        });
        const after: ChromeThemeSnapshot = {
          ...before,
          ...updates,
          theme: updates.theme ?? before.theme,
          primaryColor: updates.primaryColor ?? before.primaryColor,
          secondaryColor: updates.secondaryColor ?? before.secondaryColor,
          font: updates.font ?? before.font,
          logo: updates.logo !== undefined ? updates.logo : before.logo,
        };
        const entry: ChromeHistoryEntry = { kind: "theme", before, after };
        const next = pushChromeHistoryEntry(
          chromePastRef.current,
          chromeFutureRef.current,
          entry
        );
        chromePastRef.current = next.past;
        chromeFutureRef.current = next.future;
        lastEditKindRef.current = "chrome";
        setChromeHistTick((t) => t + 1);
      }
      setDraft(updates);
      onA11yStatus("Design updated");
    },
    [setDraft, draft, onA11yStatus]
  );

  const handleNavigationChange = useCallback(
    (items: NavItem[]) => {
      if (!isChromeUndoRef.current) {
        const entry: ChromeHistoryEntry = {
          kind: "nav",
          before: draftNavigation,
          after: items,
        };
        const next = pushChromeHistoryEntry(
          chromePastRef.current,
          chromeFutureRef.current,
          entry
        );
        chromePastRef.current = next.past;
        chromeFutureRef.current = next.future;
        lastEditKindRef.current = "chrome";
        setChromeHistTick((t) => t + 1);
      }
      setDraftNavigation(items);
      onA11yStatus("Navigation updated");
    },
    [draftNavigation, setDraftNavigation, onA11yStatus]
  );

  const handleUndo = useCallback(() => {
    const preferChrome =
      lastEditKindRef.current === "chrome" && chromePastRef.current.length > 0;
    if (preferChrome || (!canUndoLayout() && chromePastRef.current.length > 0)) {
      const chrome = chromePastRef.current;
      const entry = chrome[chrome.length - 1]!;
      chromePastRef.current = chrome.slice(0, -1);
      chromeFutureRef.current = [...chromeFutureRef.current, entry];
      isChromeUndoRef.current = true;
      if (entry.kind === "theme") setDraft(entry.before);
      else setDraftNavigation(entry.before);
      isChromeUndoRef.current = false;
      lastEditKindRef.current = chromePastRef.current.length > 0 ? "chrome" : "layout";
      setChromeHistTick((t) => t + 1);
      onA11yStatus(entry.kind === "theme" ? "Undid design change" : "Undid navigation change");
      toast.message("Undone", {
        description:
          entry.kind === "theme"
            ? "Restored previous design settings"
            : "Restored previous navigation",
      });
      return;
    }
    if (!canUndoLayout()) return;
    undoLayout();
    lastEditKindRef.current = "layout";
    onA11yStatus("Undid layout change");
    toast.message("Undone", {
      description: "Restored the previous page layout (brand colors use Design)",
    });
  }, [canUndoLayout, undoLayout, setDraft, setDraftNavigation, onA11yStatus]);

  const handleRedo = useCallback(() => {
    const preferChrome =
      lastEditKindRef.current === "layout" &&
      chromeFutureRef.current.length > 0 &&
      !canRedoLayout();
    if (
      (lastEditKindRef.current === "chrome" &&
        chromeFutureRef.current.length > 0 &&
        !canRedoLayout()) ||
      preferChrome ||
      (!canRedoLayout() && chromeFutureRef.current.length > 0)
    ) {
      const chromeFuture = chromeFutureRef.current;
      const entry = chromeFuture[chromeFuture.length - 1]!;
      chromeFutureRef.current = chromeFuture.slice(0, -1);
      chromePastRef.current = [...chromePastRef.current, entry];
      isChromeUndoRef.current = true;
      if (entry.kind === "theme") setDraft(entry.after);
      else setDraftNavigation(entry.after);
      isChromeUndoRef.current = false;
      lastEditKindRef.current = "chrome";
      setChromeHistTick((t) => t + 1);
      onA11yStatus("Redid change");
      toast.message("Redone");
      return;
    }
    if (!canRedoLayout()) return;
    redoLayout();
    lastEditKindRef.current = "layout";
    onA11yStatus("Redid layout change");
    toast.message("Redone", { description: "Reapplied the layout change" });
  }, [canRedoLayout, redoLayout, setDraft, setDraftNavigation, onA11yStatus]);

  const canUndoIncludingChrome = useCallback(
    () => canUndoLayout() || chromePastRef.current.length > 0,
    [canUndoLayout, chromeHistTick]
  );
  const canRedoIncludingChrome = useCallback(
    () => canRedoLayout() || chromeFutureRef.current.length > 0,
    [canRedoLayout, chromeHistTick]
  );

  const chromeUndoAvailable = chromePastRef.current.length > 0;
  const chromeRedoAvailable = chromeFutureRef.current.length > 0;

  return {
    isChromeUndoRef,
    lastEditKindRef,
    syncLayoutHistoryLength,
    handleDraftChange,
    handleNavigationChange,
    handleUndo,
    handleRedo,
    canUndoIncludingChrome,
    canRedoIncludingChrome,
    chromeUndoAvailable,
    chromeRedoAvailable,
    chromeHistTick,
  };
}

/** Track layout history growth so undo prefers the last edit kind. */
export function useSyncChromeLayoutHistoryKind(
  layoutPastLen: number,
  syncLayoutHistoryLength: (len: number) => void
) {
  useEffect(() => {
    syncLayoutHistoryLength(layoutPastLen);
  }, [layoutPastLen, syncLayoutHistoryLength]);
}
