import { serializePageContent } from "@/lib/page-content";
import type { NavItem } from "@/lib/navigation";
import type { StorePageRow } from "@/lib/pages";
import type { HomeLayout } from "@/lib/sections/types";
import type { ThemeId } from "@/lib/themes";
import type { StoreThemeData } from "@/types/theme";
import {
  asThemeDocument,
  emptyThemeDocument,
  type StoreThemeDocumentV1,
} from "@/lib/developer/theme-document";

export type StoreThemeSourceLabel =
  | "system"
  | "merchant"
  | "ai_draft"
  | "ai_active"
  | "ai_archived";

export function resolveStoreThemeSourceLabel(theme: {
  source: string;
  status: string;
}): StoreThemeSourceLabel {
  if (theme.source === "system") return "system";
  if (theme.source === "merchant") return "merchant";
  if (theme.status === "active") return "ai_active";
  if (theme.status === "archived") return "ai_archived";
  return "ai_draft";
}

/** Map a StoreTheme.document into props the existing visual editor already understands. */
export function documentToEditorHydration(
  docRaw: unknown,
  base: {
    storeId: string;
    slug: string;
    name: string;
    description: string | null;
    updatedAt: string;
    layoutRevision: number;
  },
): {
  store: StoreThemeData;
  initialPages: StorePageRow[];
  initialNavigation: NavItem[];
} {
  const doc = asThemeDocument(docRaw);
  const theme = (doc.theme.theme || "minimal") as ThemeId;

  const store: StoreThemeData = {
    id: base.storeId,
    slug: base.slug,
    name: base.name,
    description: base.description,
    logo: doc.theme.logo ?? null,
    theme,
    primaryColor: doc.theme.primaryColor,
    secondaryColor: doc.theme.secondaryColor,
    font: doc.theme.font,
    updatedAt: base.updatedAt,
    layoutRevision: base.layoutRevision,
    websiteTemplateId: null,
    homeLayout: doc.templates.home,
    productLayout: doc.templates.product ?? { version: 1, sections: [] },
    collectionLayout: doc.templates.collection ?? { version: 1, sections: [] },
  };

  const now = new Date().toISOString();
  const initialPages: StorePageRow[] = doc.pages.map((page) => ({
    id: page.id || `draft-page-${page.slug}`,
    title: page.title,
    slug: page.slug,
    content: serializePageContent({ body: "", layout: page.layout }),
    status: page.status === "published" ? "published" : "draft",
    createdAt: now,
    updatedAt: now,
  }));

  return {
    store,
    initialPages,
    initialNavigation: Array.isArray(doc.navigation) ? doc.navigation : [],
  };
}

/** Build StoreTheme.document from current editor state (central builder + theme + nav). */
export function editorStateToDocument(input: {
  theme: {
    theme: ThemeId | string;
    primaryColor: string;
    secondaryColor: string;
    font: string;
    logo?: string | null;
  };
  navigation: NavItem[];
  layouts: {
    home?: HomeLayout | null;
    product?: HomeLayout | null;
    collection?: HomeLayout | null;
    blogPost?: HomeLayout | null;
  };
  pages: Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
    layout: HomeLayout;
  }>;
  baseDocument?: unknown;
}): StoreThemeDocumentV1 {
  const base = input.baseDocument
    ? asThemeDocument(input.baseDocument)
    : emptyThemeDocument();

  return {
    version: 1,
    theme: {
      theme: (input.theme.theme as ThemeId) || base.theme.theme,
      primaryColor: input.theme.primaryColor || base.theme.primaryColor,
      secondaryColor: input.theme.secondaryColor || base.theme.secondaryColor,
      font: input.theme.font || base.theme.font,
      logo: input.theme.logo ?? base.theme.logo ?? null,
    },
    navigation: input.navigation,
    templates: {
      home: input.layouts.home ?? base.templates.home,
      product: input.layouts.product ?? base.templates.product,
      collection: input.layouts.collection ?? base.templates.collection,
      blogPost: input.layouts.blogPost ?? base.templates.blogPost,
    },
    pages: input.pages.map((p) => ({
      id: p.id.startsWith("draft-page-") ? undefined : p.id,
      slug: p.slug,
      title: p.title,
      layout: p.layout,
      status: p.status === "published" ? "published" : "draft",
    })),
  };
}

export function collectLayoutsFromPageCache(
  cache: Record<string, { draft: HomeLayout; saved: HomeLayout } | undefined>,
): {
  home?: HomeLayout;
  product?: HomeLayout;
  collection?: HomeLayout;
  blogPost?: HomeLayout;
  pageLayouts: Record<string, HomeLayout>;
} {
  const pageLayouts: Record<string, HomeLayout> = {};
  for (const [key, snapshot] of Object.entries(cache)) {
    if (!snapshot) continue;
    if (key.startsWith("page:")) {
      pageLayouts[key.slice("page:".length)] = snapshot.draft;
    }
  }
  return {
    home: cache.home?.draft,
    product: cache.product?.draft,
    collection: cache.collection?.draft,
    blogPost: cache["blog-post"]?.draft,
    pageLayouts,
  };
}
