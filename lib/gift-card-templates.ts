export type GiftCardTemplateId =
  | "ocean"
  | "midnight"
  | "ember"
  | "sage"
  | "pearl"
  | "ink";

export interface GiftCardTemplate {
  id: GiftCardTemplateId;
  name: string;
  tagline: string;
  background: string;
  color: string;
  mutedColor: string;
  border?: string;
  pattern?: "dots" | "lines" | "glow" | "none";
  patternColor?: string;
}

export const GIFT_CARD_TEMPLATES: GiftCardTemplate[] = [
  {
    id: "ocean",
    name: "Ocean",
    tagline: "Clean blue",
    background: "linear-gradient(145deg, #0A84FF 0%, #0055D4 55%, #003D99 100%)",
    color: "#FFFFFF",
    mutedColor: "rgba(255,255,255,0.72)",
    pattern: "glow",
    patternColor: "rgba(255,255,255,0.22)",
  },
  {
    id: "midnight",
    name: "Midnight",
    tagline: "Dark elegant",
    background: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 50%, #000000 100%)",
    color: "#FFFFFF",
    mutedColor: "rgba(255,255,255,0.55)",
    pattern: "dots",
    patternColor: "rgba(255,255,255,0.28)",
  },
  {
    id: "ember",
    name: "Ember",
    tagline: "Warm sunset",
    background: "linear-gradient(145deg, #FF6B35 0%, #F7931E 45%, #E85D04 100%)",
    color: "#FFFFFF",
    mutedColor: "rgba(255,255,255,0.78)",
    pattern: "glow",
    patternColor: "rgba(255,255,255,0.28)",
  },
  {
    id: "sage",
    name: "Sage",
    tagline: "Soft green",
    background: "linear-gradient(145deg, #2D6A4F 0%, #40916C 50%, #1B4332 100%)",
    color: "#FFFFFF",
    mutedColor: "rgba(255,255,255,0.7)",
    pattern: "lines",
    patternColor: "rgba(255,255,255,0.18)",
  },
  {
    id: "pearl",
    name: "Pearl",
    tagline: "Minimal light",
    background: "linear-gradient(145deg, #FFFFFF 0%, #F2F2F7 60%, #E5E5EA 100%)",
    color: "#111827",
    mutedColor: "#6B7280",
    border: "1px solid rgba(0,0,0,0.08)",
    pattern: "none",
  },
  {
    id: "ink",
    name: "Ink",
    tagline: "Bold graphic",
    background: "linear-gradient(135deg, #111827 0%, #1F2937 42%, #0284C7 120%)",
    color: "#FFFFFF",
    mutedColor: "rgba(186,230,253,0.75)",
    pattern: "lines",
    patternColor: "rgba(255,255,255,0.14)",
  },
];

export const DEFAULT_GIFT_CARD_TEMPLATE: GiftCardTemplateId = "ocean";

export function getGiftCardTemplate(
  id?: GiftCardTemplateId | string | null
): GiftCardTemplate {
  return (
    GIFT_CARD_TEMPLATES.find((t) => t.id === id) ??
    GIFT_CARD_TEMPLATES.find((t) => t.id === DEFAULT_GIFT_CARD_TEMPLATE)!
  );
}
