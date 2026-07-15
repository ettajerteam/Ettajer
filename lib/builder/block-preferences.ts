import type { BlockId } from "./types";

const FAVORITES_KEY = "ettajer:builder:block-favorites";
const RECENT_KEY = "ettajer:builder:block-recent";
const MAX_RECENT = 8;

function readIds(key: string): BlockId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is BlockId => typeof id === "string");
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: BlockId[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Ignore quota / private mode errors
  }
}

export function getFavoriteBlockIds(): BlockId[] {
  return readIds(FAVORITES_KEY);
}

export function toggleFavoriteBlockId(id: BlockId): BlockId[] {
  const current = getFavoriteBlockIds();
  const next = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  writeIds(FAVORITES_KEY, next);
  return next;
}

export function getRecentBlockIds(): BlockId[] {
  return readIds(RECENT_KEY);
}

export function recordRecentBlockId(id: BlockId): BlockId[] {
  const current = getRecentBlockIds().filter((item) => item !== id);
  const next = [id, ...current].slice(0, MAX_RECENT);
  writeIds(RECENT_KEY, next);
  return next;
}
