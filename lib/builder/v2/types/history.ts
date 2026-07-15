import type { BuilderDocumentV2 } from "./document";
import { cloneDocument, generateHistoryEntryId } from "../utils/ids";

export interface BuilderHistoryEntry {
  id: string;
  timestamp: number;
  label: string;
  snapshot: BuilderDocumentV2;
}

/** Undo/redo stack for V2 document mutations. */
export interface BuilderHistory {
  past: BuilderHistoryEntry[];
  future: BuilderHistoryEntry[];
  limit: number;
}

export const DEFAULT_HISTORY_LIMIT = 50;

export function createEmptyHistory(limit = DEFAULT_HISTORY_LIMIT): BuilderHistory {
  return { past: [], future: [], limit };
}

export interface BuilderHistoryPushResult {
  history: BuilderHistory;
  entry: BuilderHistoryEntry;
}

export interface BuilderHistoryUndoResult {
  history: BuilderHistory;
  restored: BuilderDocumentV2 | null;
}

export interface BuilderHistoryRedoResult {
  history: BuilderHistory;
  restored: BuilderDocumentV2 | null;
}

/** Push a document snapshot onto the undo stack; clears redo future. */
export function pushHistory(
  history: BuilderHistory,
  snapshot: BuilderDocumentV2,
  label: string
): BuilderHistoryPushResult {
  const entry: BuilderHistoryEntry = {
    id: generateHistoryEntryId(),
    timestamp: Date.now(),
    label,
    snapshot: cloneDocument(snapshot),
  };

  const past = [...history.past, entry];
  const trimmed =
    past.length > history.limit ? past.slice(past.length - history.limit) : past;

  return {
    history: { past: trimmed, future: [], limit: history.limit },
    entry,
  };
}

/** Pop the latest past entry and move current head to future (caller supplies current doc). */
export function undoHistory(
  history: BuilderHistory,
  current: BuilderDocumentV2
): BuilderHistoryUndoResult {
  if (history.past.length === 0) {
    return { history, restored: null };
  }

  const past = [...history.past];
  const entry = past.pop()!;
  const futureEntry: BuilderHistoryEntry = {
    id: generateHistoryEntryId(),
    timestamp: Date.now(),
    label: entry.label,
    snapshot: cloneDocument(current),
  };

  return {
    history: {
      past,
      future: [futureEntry, ...history.future],
      limit: history.limit,
    },
    restored: entry.snapshot,
  };
}

/** Pop the latest future entry and move current head to past (caller supplies current doc). */
export function redoHistory(
  history: BuilderHistory,
  current: BuilderDocumentV2
): BuilderHistoryRedoResult {
  if (history.future.length === 0) {
    return { history, restored: null };
  }

  const future = [...history.future];
  const entry = future.shift()!;
  const pastEntry: BuilderHistoryEntry = {
    id: generateHistoryEntryId(),
    timestamp: Date.now(),
    label: entry.label,
    snapshot: cloneDocument(current),
  };

  const past = [...history.past, pastEntry];
  const trimmed =
    past.length > history.limit ? past.slice(past.length - history.limit) : past;

  return {
    history: { past: trimmed, future, limit: history.limit },
    restored: entry.snapshot,
  };
}
