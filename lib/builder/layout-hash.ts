/**
 * Fast content hashing for layout dirty checks (avoid double JSON.stringify on hot paths).
 */

import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import { serializeHomeLayout } from "@/lib/sections/parse";

/** FNV-1a 32-bit — fast enough for dirty comparisons. */
export function hashString(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function hashSection(section: StoreSection): string {
  return hashString(JSON.stringify(section));
}

export function hashLayout(layout: HomeLayout): string {
  return hashString(JSON.stringify(serializeHomeLayout(layout)));
}

export function layoutsEqualFast(a: HomeLayout, b: HomeLayout): boolean {
  if (a === b) return true;
  if (a.sections.length !== b.sections.length) return false;
  if (a.sections.length === 0) return true;
  // Fast path: compare section id order + per-section hashes
  for (let i = 0; i < a.sections.length; i++) {
    if (a.sections[i]!.id !== b.sections[i]!.id) return false;
    if (hashSection(a.sections[i]!) !== hashSection(b.sections[i]!)) return false;
  }
  return true;
}
