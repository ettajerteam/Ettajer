import type { NavItem } from "@/lib/navigation";
import type { HomeLayout } from "@/lib/sections/types";
import type { ThemeId } from "@/lib/themes";
import type { StoreThemeSettings } from "@/types/storefront";
import type { BlockId, SectionVisualStyles } from "../types";

/** Alias for store theme settings used in generation context */
export type ThemeSettings = StoreThemeSettings;

export interface AiGenerationPrompt {
  text: string;
  locale?: string;
  industry?: string;
  tone?: "luxury" | "minimal" | "bold" | "playful" | "professional";
  storeName?: string;
  storeDescription?: string;
}

export interface AiGenerationContext {
  prompt: AiGenerationPrompt;
  availableBlocks: BlockId[];
  existingLayout?: HomeLayout;
  existingTheme?: ThemeSettings;
}

export interface AiGeneratedContent {
  [key: string]: unknown;
}

export interface AiGeneratedTheme {
  theme: ThemeId;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  logo?: string | null;
}

export interface AiGeneratedSection {
  blockId: BlockId;
  content: AiGeneratedContent;
  styles: SectionVisualStyles;
  visible?: boolean;
}

export interface AiGeneratedPage {
  id: string;
  slug: string;
  title: string;
  type: "home" | "custom";
  sections: AiGeneratedSection[];
  /** For custom pages (HTML) */
  content?: string;
}

export interface AiGeneratedSite {
  pages: AiGeneratedPage[];
  navigation: NavItem[];
  theme: AiGeneratedTheme;
  metadata: {
    prompt: string;
    provider: string;
    generatedAt: string;
    confidence?: number;
  };
}

export interface AiGenerationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}
