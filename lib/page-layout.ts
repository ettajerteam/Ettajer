import type { EditorPageTarget } from "@/lib/builder/editor-types";
import { createSectionFromBlock } from "@/lib/builder/legacy-adapter";
import { getBlock, getBlockBySectionType } from "@/lib/builder/block-registry";
import type { ThemeId } from "@/lib/themes";
import type { HomeLayout, PageTemplateType, StoreSection } from "@/lib/sections/types";
import { parseHomeLayout, serializeHomeLayout } from "@/lib/sections/parse";
import {
  parsePageContent,
  serializePageContent,
  type PageContentData,
} from "@/lib/page-content";

export type PageLayoutKey = "home" | "product" | "collection" | `page:${string}`;

export type TemplateLayoutKey = Extract<PageLayoutKey, "home" | "product" | "collection">;

export interface StoreTemplateLayouts {
  home: HomeLayout;
  product: HomeLayout;
  collection: HomeLayout;
}

export function getPageLayoutKey(target: EditorPageTarget): PageLayoutKey {
  if (target.type === "home") return "home";
  if (target.type === "product") return "product";
  if (target.type === "collection") return "collection";
  return `page:${target.page.id}`;
}

export function getTemplateLayoutKey(target: EditorPageTarget): TemplateLayoutKey | null {
  if (target.type === "home" || target.type === "product" || target.type === "collection") {
    return target.type;
  }
  return null;
}

export function getPageTemplateType(target: EditorPageTarget): PageTemplateType | null {
  return getTemplateLayoutKey(target);
}

export function getEmptyPageLayout(): HomeLayout {
  return { version: 1, sections: [] };
}

function newSectionId(type: string): string {
  return `${type}-${Math.random().toString(36).slice(2, 10)}`;
}

function section(type: StoreSection["type"], settings?: Record<string, unknown>): StoreSection {
  const block = getBlockBySectionType(type) ?? getBlock(type);
  if (block) {
    const created = createSectionFromBlock(block.id, { settings });
    if (created) return created;
  }
  return {
    id: newSectionId(type),
    type,
    settings: settings ?? {},
    visible: true,
  };
}

/** Default section templates when a page slug matches a known page type. */
export function getDefaultPageLayoutTemplate(slug: string, _theme: ThemeId = "minimal"): HomeLayout {
  const normalized = slug.toLowerCase().replace(/^\/+/, "");

  if (normalized === "about") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "About us",
          subheadline: "Learn more about our story and what drives us.",
          alignment: "center",
          showStoreDescription: false,
        }),
        section("rich-text", {
          title: "Our story",
          content:
            "<p>Share your brand story, mission, and values here. Tell visitors what makes your business unique.</p>",
          alignment: "left",
        }),
        section("footer"),
      ],
    };
  }

  if (normalized === "contact") {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Get in touch",
          subheadline: "We would love to hear from you.",
          alignment: "center",
          showStoreDescription: false,
        }),
        section("rich-text", {
          title: "Contact us",
          content:
            "<p>Reach out with questions, feedback, or partnership inquiries.</p><p><strong>hello@example.com</strong></p>",
          alignment: "left",
        }),
        section("footer"),
      ],
    };
  }

  if (normalized === "landing" || normalized.startsWith("landing-")) {
    return {
      version: 1,
      sections: [
        section("hero", {
          headline: "Welcome",
          subheadline: "Discover what we have to offer.",
          ctaText: "Shop now",
          alignment: "center",
        }),
        section("product-grid", { title: "Featured products" }),
        section("rich-text", {
          title: "Why choose us",
          content: "<p>Highlight your key benefits and value proposition here.</p>",
        }),
        section("footer"),
      ],
    };
  }

  return getEmptyPageLayout();
}

export function extractLayoutFromPageContent(
  content: string,
  theme?: ThemeId
): HomeLayout | null {
  const parsed = parsePageContent(content);
  if (!parsed.layout) return null;
  const layout = parseHomeLayout(parsed.layout, theme);
  return layout.sections.length > 0 ? layout : null;
}

export function getSavedLayoutFromPageContent(content: string, theme?: ThemeId): HomeLayout {
  return extractLayoutFromPageContent(content, theme) ?? getEmptyPageLayout();
}

export function pageHasSectionLayout(content: string): boolean {
  return extractLayoutFromPageContent(content) !== null;
}

export function serializePageContentWithLayout(data: PageContentData): string {
  const hasLayout = Boolean(data.layout?.sections?.length);
  const hasSeo = Boolean(data.metaTitle?.trim() || data.metaDescription?.trim());
  const hasBody = Boolean(data.body?.trim());

  if (!hasLayout && !hasSeo && !hasBody) return "";

  if (!hasLayout && !hasSeo) return data.body;

  return JSON.stringify({
    __ettajerPage: true,
    body: data.body,
    metaTitle: data.metaTitle?.trim() || undefined,
    metaDescription: data.metaDescription?.trim() || undefined,
    layout: hasLayout ? serializeHomeLayout(data.layout!) : undefined,
  });
}

export function updatePageContentLayout(content: string, layout: HomeLayout): string {
  const parsed = parsePageContent(content);
  return serializePageContentWithLayout({
    ...parsed,
    layout: layout.sections.length > 0 ? layout : undefined,
  });
}

export function createInitialPageContent(slug: string, theme?: ThemeId): string {
  const template = getDefaultPageLayoutTemplate(slug, theme);
  if (template.sections.length === 0) return "";
  return serializePageContentWithLayout({ body: "", layout: template });
}

/** @deprecated Use serializePageContentWithLayout */
export { serializePageContent };
