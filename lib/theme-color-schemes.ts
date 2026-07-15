import type { ThemeId } from "@/lib/themes";

export interface ThemeColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  description?: string;
}

export const THEME_COLOR_SCHEMES: Record<ThemeId, ThemeColorScheme[]> = {
  minimal: [
    { id: "ocean", name: "Ocean", primary: "#007AFF", secondary: "#FFFFFF", description: "Classic Apple blue" },
    { id: "slate", name: "Slate", primary: "#334155", secondary: "#F8FAFC", description: "Professional neutral" },
    { id: "rose", name: "Rose", primary: "#E11D48", secondary: "#FFF1F2", description: "Warm boutique" },
    { id: "forest", name: "Forest", primary: "#059669", secondary: "#FFFFFF", description: "Natural & organic" },
  ],
  modern: [
    { id: "mono", name: "Monochrome", primary: "#111111", secondary: "#F5F5F5", description: "Editorial black" },
    { id: "sand", name: "Sand", primary: "#92400E", secondary: "#FFFBEB", description: "Luxury earth tones" },
    { id: "navy", name: "Navy", primary: "#1E3A5F", secondary: "#F0F4F8", description: "Premium fashion" },
    { id: "crimson", name: "Crimson", primary: "#DC2626", secondary: "#FAFAFA", description: "Bold sport" },
  ],
  bold: [
    { id: "neon", name: "Neon", primary: "#00FF87", secondary: "#0A0A0A", description: "Streetwear classic" },
    { id: "electric", name: "Electric", primary: "#7C3AED", secondary: "#0A0A0A", description: "Night club vibe" },
    { id: "fire", name: "Fire", primary: "#FF6B35", secondary: "#141414", description: "High energy" },
    { id: "ice", name: "Ice", primary: "#38BDF8", secondary: "#0F172A", description: "Tech futuristic" },
  ],
};

export function getColorSchemesForTheme(themeId: ThemeId): ThemeColorScheme[] {
  return THEME_COLOR_SCHEMES[themeId] ?? THEME_COLOR_SCHEMES.minimal;
}

export function findMatchingScheme(
  themeId: ThemeId,
  primary: string,
  secondary: string
): ThemeColorScheme | null {
  const schemes = getColorSchemesForTheme(themeId);
  return (
    schemes.find(
      (s) => s.primary.toLowerCase() === primary.toLowerCase() && s.secondary.toLowerCase() === secondary.toLowerCase()
    ) ?? null
  );
}
