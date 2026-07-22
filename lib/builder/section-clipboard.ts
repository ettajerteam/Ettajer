/**
 * System clipboard payload for section copy/paste across tabs and refreshes.
 */

import { isKnownSectionType } from "@/lib/sections/parse";
import type { SectionType, StoreSection } from "@/lib/sections/types";

export const SECTION_CLIPBOARD_MIME = "application/x-ettajer-section+json";
export const SECTION_CLIPBOARD_VERSION = 1 as const;

export type SectionClipboardPayload = {
  v: typeof SECTION_CLIPBOARD_VERSION;
  kind: "section";
  section: StoreSection;
  copiedAt: number;
};

const TEXT_PREFIX = "ettajer/section-v1:";

export function encodeSectionClipboard(section: StoreSection): string {
  const payload: SectionClipboardPayload = {
    v: SECTION_CLIPBOARD_VERSION,
    kind: "section",
    section,
    copiedAt: Date.now(),
  };
  return `${TEXT_PREFIX}${JSON.stringify(payload)}`;
}

function extractClipboardJson(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  if (text.startsWith(TEXT_PREFIX)) {
    return text.slice(TEXT_PREFIX.length);
  }

  // Allow pasting the bare JSON payload (or JSON wrapped in quotes/whitespace)
  if (text.startsWith("{") && text.includes('"kind"') && text.includes('"section"')) {
    return text;
  }

  // Sometimes OS/apps wrap clipboard text with extra prefixes
  const idx = text.indexOf(TEXT_PREFIX);
  if (idx >= 0) {
    return text.slice(idx + TEXT_PREFIX.length).trim();
  }

  return null;
}

export function decodeSectionClipboard(raw: string | null | undefined): StoreSection | null {
  if (!raw) return null;
  const json = extractClipboardJson(raw);
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as SectionClipboardPayload;
    if (parsed?.v !== SECTION_CLIPBOARD_VERSION || parsed.kind !== "section") return null;
    const section = parsed.section;
    if (!section || typeof section !== "object") return null;
    if (typeof section.id !== "string" || !isKnownSectionType(section.type)) return null;
    const settings =
      section.settings && typeof section.settings === "object" && !Array.isArray(section.settings)
        ? section.settings
        : {};
    return {
      id: section.id,
      type: section.type as SectionType,
      visible: section.visible !== false,
      label: typeof section.label === "string" ? section.label : undefined,
      settings: settings as StoreSection["settings"],
    };
  } catch {
    return null;
  }
}

export async function writeSectionToSystemClipboard(section: StoreSection): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(encodeSectionClipboard(section));
    return true;
  } catch {
    return false;
  }
}

export async function readSectionFromSystemClipboard(): Promise<StoreSection | null> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.readText) return null;
  try {
    const text = await navigator.clipboard.readText();
    return decodeSectionClipboard(text);
  } catch {
    return null;
  }
}
