import type { ThemeId } from "@/lib/themes";
import type { HomeLayout } from "@/lib/sections/types";

export interface StoreThemeData {
  id?: string;
  slug: string;
  logo: string | null;
  theme: ThemeId;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  updatedAt?: string;
  homeLayout?: HomeLayout;
  productLayout?: HomeLayout;
  collectionLayout?: HomeLayout;
}

export type PreviewPage = "home" | "product" | "category" | "collection";

export interface PreviewPaths {
  product?: string | null;
  category?: string | null;
  collection?: string | null;
}
