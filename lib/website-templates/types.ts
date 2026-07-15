import type { ThemeId } from "@/lib/themes";
import type { HomeLayout } from "@/lib/sections/types";
import type { NavItem } from "@/lib/navigation";

export type WebsiteTemplateId =
  | "fashion"
  | "beauty"
  | "electronics"
  | "restaurant"
  | "furniture"
  | "agency"
  | "portfolio";

export interface WebsiteTemplateBranding {
  logo?: string;
  tagline?: string;
  storeNameStyle?: "editorial" | "bold" | "minimal";
}

export interface WebsiteTemplatePageDefinition {
  slug: string;
  title: string;
  layout: HomeLayout;
  status?: "draft" | "published";
}

/** Extensible template definition — add new templates via registerTemplate() only. */
export interface WebsiteTemplateDefinition {
  id: WebsiteTemplateId;
  name: string;
  industry: string;
  description: string;
  /** CSS gradient or image URL */
  thumbnail: string;
  tagline?: string;
  theme: {
    theme: ThemeId;
    primaryColor: string;
    secondaryColor: string;
    font: string;
  };
  branding?: WebsiteTemplateBranding;
  navigation: NavItem[];
  pages: WebsiteTemplatePageDefinition[];
  productLayout?: HomeLayout;
  collectionLayout?: HomeLayout;
}

/** @alias WebsiteTemplateDefinition — kept for existing imports */
export type WebsiteTemplate = WebsiteTemplateDefinition;

/** @deprecated Use WebsiteTemplatePageDefinition with embedded layout */
export interface TemplatePageDefinition {
  title: string;
  slug: string;
  content: string;
  status?: "draft" | "published";
}
