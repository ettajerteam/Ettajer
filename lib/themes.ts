export type ThemeId = "minimal" | "modern" | "bold";

export interface ThemeTemplate {
  id: ThemeId;
  name: string;
  description: string;
  longDescription: string;
  tagline: string;
  version: string;
  author: string;
  industry: string[];
  defaultPrimary: string;
  defaultSecondary: string;
  defaultFont: string;
  preview: {
    bg: string;
    text: string;
    accent: string;
  };
  previewImage: string;
  heroImage: string;
  benefits: string[];
  features: string[];
  glow: string;
  ring: string;
  popular?: boolean;
}

export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, white, product-focused",
    longDescription:
      "A refined storefront with generous whitespace, crisp typography, and product-first layouts. Perfect for electronics, beauty, and premium catalogs.",
    tagline: "Like Apple",
    version: "1.0.0",
    author: "Ettajer",
    industry: ["Fashion", "Beauty", "Electronics"],
    defaultPrimary: "#007AFF",
    defaultSecondary: "#FFFFFF",
    defaultFont: "Inter",
    preview: { bg: "#FFFFFF", text: "#1A1A1A", accent: "#007AFF" },
    previewImage: "/assets/themes/minimal-preview.webp",
    heroImage: "/assets/themes/minimal-hero.webp",
    benefits: ["Mobile-first", "Product focus", "Clean checkout"],
    features: ["Sticky header", "Hero banner", "Quick add to cart", "Collection grids"],
    glow: "from-[#007AFF]/[0.08]",
    ring: "ring-[#007AFF]/20",
    popular: true,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Bold typography, full-width images",
    longDescription:
      "Editorial layouts with oversized imagery and confident type. Built for lifestyle brands, sportswear, and storytelling commerce.",
    tagline: "Like Nike",
    version: "1.0.0",
    author: "Ettajer",
    industry: ["Sportswear", "Lifestyle", "Home"],
    defaultPrimary: "#111111",
    defaultSecondary: "#F5F5F5",
    defaultFont: "Outfit",
    preview: { bg: "#F5F5F5", text: "#111111", accent: "#111111" },
    previewImage: "/assets/themes/modern-preview.webp",
    heroImage: "/assets/themes/modern-hero.webp",
    benefits: ["Editorial layout", "Large imagery", "Premium feel"],
    features: ["Full-bleed hero", "Category rails", "Featured collections", "Image-forward PDP"],
    glow: "from-neutral-900/[0.06]",
    ring: "ring-neutral-900/15",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Dark theme, neon accents",
    longDescription:
      "High-contrast dark storefront with vibrant accents. Ideal for streetwear, gaming, music, and youth-focused brands.",
    tagline: "Streetwear",
    version: "1.0.0",
    author: "Ettajer",
    industry: ["Streetwear", "Gaming", "Music"],
    defaultPrimary: "#00FF87",
    defaultSecondary: "#0A0A0A",
    defaultFont: "Space Grotesk",
    preview: { bg: "#0A0A0A", text: "#FFFFFF", accent: "#00FF87" },
    previewImage: "/assets/themes/bold-preview.webp",
    heroImage: "/assets/themes/bold-hero.webp",
    benefits: ["Dark mode", "Neon accents", "Streetwear"],
    features: ["Dark UI", "Neon CTAs", "Moody product cards", "Immersive checkout"],
    glow: "from-[#00FF87]/[0.10]",
    ring: "ring-[#00FF87]/25",
    popular: true,
  },
];

export const STORE_FONTS = [
  { value: "Inter", label: "Inter", className: "font-inter" },
  { value: "Poppins", label: "Poppins", className: "font-poppins" },
  { value: "Outfit", label: "Outfit", className: "font-outfit" },
  { value: "Space Grotesk", label: "Space Grotesk", className: "font-space" },
  { value: "Playfair Display", label: "Playfair Display", className: "font-playfair" },
] as const;

export function getThemeTemplate(id: string): ThemeTemplate {
  return THEME_TEMPLATES.find((t) => t.id === id) ?? THEME_TEMPLATES[0];
}

export function isValidThemeId(id: string): id is ThemeId {
  return THEME_TEMPLATES.some((t) => t.id === id);
}
