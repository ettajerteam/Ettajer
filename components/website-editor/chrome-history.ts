import type { NavItem } from "@/lib/navigation";

export type ChromeThemeSnapshot = {
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  logo: string | null;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  buttonRadius?: string;
};

export type ChromeHistoryEntry =
  | { kind: "theme"; before: ChromeThemeSnapshot; after: ChromeThemeSnapshot }
  | { kind: "nav"; before: NavItem[]; after: NavItem[] };

const CHROME_HISTORY_MAX = 40;

export function toChromeThemeSnapshot(draft: ChromeThemeSnapshot): ChromeThemeSnapshot {
  return {
    theme: draft.theme,
    primaryColor: draft.primaryColor,
    secondaryColor: draft.secondaryColor,
    font: draft.font,
    logo: draft.logo,
    textColor: draft.textColor,
    mutedColor: draft.mutedColor,
    borderColor: draft.borderColor,
    buttonRadius: draft.buttonRadius,
  };
}

export function pushChromeHistoryEntry(
  past: ChromeHistoryEntry[],
  future: ChromeHistoryEntry[],
  entry: ChromeHistoryEntry
): { past: ChromeHistoryEntry[]; future: ChromeHistoryEntry[] } {
  const nextPast = [...past, entry];
  if (nextPast.length > CHROME_HISTORY_MAX) {
    nextPast.splice(0, nextPast.length - CHROME_HISTORY_MAX);
  }
  return { past: nextPast, future: [] };
}

export function themeSnapshotsEqual(a: ChromeThemeSnapshot, b: ChromeThemeSnapshot): boolean {
  return (
    a.theme === b.theme &&
    a.primaryColor === b.primaryColor &&
    a.secondaryColor === b.secondaryColor &&
    a.font === b.font &&
    a.logo === b.logo &&
    a.textColor === b.textColor &&
    a.mutedColor === b.mutedColor &&
    a.borderColor === b.borderColor &&
    a.buttonRadius === b.buttonRadius
  );
}
