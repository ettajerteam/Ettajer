import { escapeHtml } from "@/lib/email/base-template";

export type NewsletterThemeId =
  | "store"
  | "classic"
  | "warm"
  | "forest"
  | "midnight"
  | "rose"
  | "coral";

export interface NewsletterThemeColors {
  accentFrom: string;
  accentTo: string;
  badgeColor: string;
}

export interface NewsletterThemeDef {
  id: NewsletterThemeId;
  name: string;
  description: string;
  /** Preview swatches when not store-brand */
  accentFrom: string;
  accentTo: string;
  badgeColor: string;
}

export const NEWSLETTER_THEMES: NewsletterThemeDef[] = [
  {
    id: "store",
    name: "Store brand",
    description: "Uses your store primary color",
    accentFrom: "#007AFF",
    accentTo: "#5856D6",
    badgeColor: "#E8F1FF",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Clean blue accents",
    accentFrom: "#2563eb",
    accentTo: "#4f46e5",
    badgeColor: "#dbeafe",
  },
  {
    id: "warm",
    name: "Warm sale",
    description: "Amber to red for offers",
    accentFrom: "#f59e0b",
    accentTo: "#ef4444",
    badgeColor: "#fef3c7",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Fresh greens",
    accentFrom: "#059669",
    accentTo: "#0d9488",
    badgeColor: "#ecfdf5",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep slate tones",
    accentFrom: "#334155",
    accentTo: "#0f172a",
    badgeColor: "#e2e8f0",
  },
  {
    id: "rose",
    name: "Rose",
    description: "Soft pink accents",
    accentFrom: "#e11d48",
    accentTo: "#db2777",
    badgeColor: "#ffe4e6",
  },
  {
    id: "coral",
    name: "Coral",
    description: "Bright orange energy",
    accentFrom: "#ea580c",
    accentTo: "#f43f5e",
    badgeColor: "#ffedd5",
  },
];

export function getNewsletterTheme(
  id: string
): NewsletterThemeDef | undefined {
  return NEWSLETTER_THEMES.find((t) => t.id === id);
}

export function isNewsletterThemeId(id: string): id is NewsletterThemeId {
  return NEWSLETTER_THEMES.some((t) => t.id === id);
}

function normalizeHex(color: string | null | undefined): string | null {
  if (!color?.trim()) return null;
  let hex = color.trim();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(hex) && !/^#[0-9a-fA-F]{3}$/.test(hex)) {
    return null;
  }
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex.toLowerCase();
}

function mixToward(hex: string, toward: "black" | "white", amount: number): string {
  const n = normalizeHex(hex) ?? "#007aff";
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  const t = toward === "white" ? 255 : 0;
  const mix = (c: number) =>
    Math.round(c + (t - c) * Math.min(1, Math.max(0, amount)));
  return `#${[mix(r), mix(g), mix(b)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Soft badge wash from a brand color */
export function badgeFromAccent(accent: string): string {
  return mixToward(accent, "white", 0.88);
}

export function resolveNewsletterTheme(
  themeId: string | null | undefined,
  storePrimaryColor?: string | null
): NewsletterThemeColors & { id: NewsletterThemeId } {
  const id = isNewsletterThemeId(themeId ?? "") ? themeId! : "store";
  const preset = getNewsletterTheme(id)!;

  if (id === "store") {
    const primary =
      normalizeHex(storePrimaryColor) ?? normalizeHex(preset.accentFrom) ?? "#007aff";
    return {
      id: "store",
      accentFrom: primary,
      accentTo: mixToward(primary, "black", 0.22),
      badgeColor: badgeFromAccent(primary),
    };
  }

  return {
    id: id as NewsletterThemeId,
    accentFrom: preset.accentFrom,
    accentTo: preset.accentTo,
    badgeColor: preset.badgeColor,
  };
}

export function themeSwatchStyle(theme: NewsletterThemeDef, storePrimary?: string | null) {
  const resolved = resolveNewsletterTheme(theme.id, storePrimary);
  return {
    background: `linear-gradient(135deg, ${resolved.accentFrom}, ${resolved.accentTo})`,
  };
}

/** Safe for inline email HTML attributes */
export function safeThemeColor(value: string): string {
  const n = normalizeHex(value);
  return n ?? "#007aff";
}

export function escapeThemeColor(value: string): string {
  return escapeHtml(safeThemeColor(value));
}
