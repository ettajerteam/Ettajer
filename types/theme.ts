import type { ThemeId } from "@/lib/themes";
import type { HomeLayout } from "@/lib/sections/types";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";

export interface StoreThemeData {
  id?: string;
  slug: string;
  name?: string;
  description?: string | null;
  logo: string | null;
  theme: ThemeId;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  buttonRadius?: string;
  updatedAt?: string;
  /** Optimistic concurrency token for layout go-live (seo.layoutRevision). */
  layoutRevision?: number;
  websiteTemplateId?: WebsiteTemplateId | null;
  businessModel?: string | null;
  homeLayout?: HomeLayout;
  productLayout?: HomeLayout;
  collectionLayout?: HomeLayout;
}

export type PreviewPage = "home" | "product" | "category" | "collection";

export interface PreviewPaths {
  product?: string | null;
  category?: string | null;
  collection?: string | null;
  blogPost?: string | null;
}
