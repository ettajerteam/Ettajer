import type { ThemeId } from "@/lib/themes";
import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import type { NavItem } from "@/lib/navigation";

export type StoreThemeDocumentV1 = {
  version: 1;
  theme: {
    theme: ThemeId;
    primaryColor: string;
    secondaryColor: string;
    font: string;
    logo?: string | null;
  };
  navigation: NavItem[];
  templates: {
    home: HomeLayout;
    product?: HomeLayout;
    collection?: HomeLayout;
    blogPost?: HomeLayout;
  };
  pages: {
    id?: string;
    slug: string;
    title: string;
    layout: HomeLayout;
    status?: "draft" | "published";
  }[];
};

export function emptyThemeDocument(
  partial?: Partial<StoreThemeDocumentV1["theme"]>,
): StoreThemeDocumentV1 {
  return {
    version: 1,
    theme: {
      theme: partial?.theme ?? "minimal",
      primaryColor: partial?.primaryColor ?? "#007AFF",
      secondaryColor: partial?.secondaryColor ?? "#FFFFFF",
      font: partial?.font ?? "Inter",
      logo: partial?.logo ?? null,
    },
    navigation: [
      { id: "home", label: "Home", href: "/" },
      { id: "products", label: "Shop", href: "/products" },
    ],
    templates: {
      home: { version: 1, sections: [] },
      product: { version: 1, sections: [] },
      collection: { version: 1, sections: [] },
    },
    pages: [],
  };
}

export function asThemeDocument(raw: unknown): StoreThemeDocumentV1 {
  if (!raw || typeof raw !== "object") return emptyThemeDocument();
  const doc = raw as StoreThemeDocumentV1;
  if (doc.version !== 1) return emptyThemeDocument();
  return {
    version: 1,
    theme: {
      theme: (doc.theme?.theme as ThemeId) || "minimal",
      primaryColor: doc.theme?.primaryColor || "#007AFF",
      secondaryColor: doc.theme?.secondaryColor || "#FFFFFF",
      font: doc.theme?.font || "Inter",
      logo: doc.theme?.logo ?? null,
    },
    navigation: Array.isArray(doc.navigation) ? doc.navigation : [],
    templates: {
      home: normalizeLayout(doc.templates?.home),
      product: doc.templates?.product
        ? normalizeLayout(doc.templates.product)
        : { version: 1, sections: [] },
      collection: doc.templates?.collection
        ? normalizeLayout(doc.templates.collection)
        : { version: 1, sections: [] },
      blogPost: doc.templates?.blogPost
        ? normalizeLayout(doc.templates.blogPost)
        : undefined,
    },
    pages: Array.isArray(doc.pages)
      ? doc.pages.map((p) => ({
          id: p.id,
          slug: String(p.slug || "page"),
          title: String(p.title || "Page"),
          layout: normalizeLayout(p.layout),
          status: p.status === "published" ? "published" : "draft",
        }))
      : [],
  };
}

function normalizeLayout(layout: unknown): HomeLayout {
  if (
    layout &&
    typeof layout === "object" &&
    Array.isArray((layout as HomeLayout).sections)
  ) {
    return {
      version: 1,
      sections: (layout as HomeLayout).sections as StoreSection[],
    };
  }
  if (Array.isArray(layout)) {
    return { version: 1, sections: layout as StoreSection[] };
  }
  return { version: 1, sections: [] };
}

export type TemplateKey = "home" | "product" | "collection" | "blogPost";
