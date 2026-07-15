import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import type { NavItem } from "@/lib/navigation";
import type { WebsiteTemplateDefinition } from "@/lib/website-templates/types";
import { createSectionFromBlock, homeLayoutToBuilderDocument, sectionToBlockId } from "../legacy-adapter";
import type { BuilderDocument } from "../types";
import type {
  AiGeneratedPage,
  AiGeneratedSection,
  AiGeneratedSite,
} from "./types";

function mergeSectionSettings(section: AiGeneratedSection): Record<string, unknown> {
  return {
    ...section.content,
    styles: section.styles,
  };
}

export function toStoreSections(sections: AiGeneratedSection[]): StoreSection[] {
  const result: StoreSection[] = [];

  for (const section of sections) {
    const storeSection = createSectionFromBlock(section.blockId, {
      settings: mergeSectionSettings(section),
    });
    if (storeSection) {
      result.push({
        ...storeSection,
        visible: section.visible ?? storeSection.visible,
      });
    }
  }

  return result;
}

export function toHomeLayout(page: AiGeneratedPage): HomeLayout {
  return {
    version: 1,
    sections: toStoreSections(page.sections),
  };
}

export function toBuilderDocument(site: AiGeneratedSite): BuilderDocument {
  const homePage = site.pages.find((p) => p.type === "home") ?? site.pages[0];
  if (!homePage) {
    return { version: 2, pages: [], elements: {} };
  }

  const layout = toHomeLayout(homePage);
  const doc = homeLayoutToBuilderDocument(layout);

  for (const page of site.pages) {
    if (page.type === "custom" && page.id !== homePage.id) {
      doc.pages.push({
        id: page.id,
        slug: page.slug,
        title: page.title,
        type: "custom",
        rootElementIds: [],
      });
    }
  }

  return doc;
}

export function toWebsiteTemplate(site: AiGeneratedSite): Partial<WebsiteTemplateDefinition> {
  const homePage = site.pages.find((p) => p.type === "home") ?? site.pages[0];
  const customPages = site.pages.filter((p) => p.type === "custom");
  const homeLayout: HomeLayout = homePage ? toHomeLayout(homePage) : { version: 1, sections: [] };

  return {
    theme: {
      theme: site.theme.theme,
      primaryColor: site.theme.primaryColor,
      secondaryColor: site.theme.secondaryColor,
      font: site.theme.font,
    },
    pages: [
      {
        slug: "home",
        title: homePage?.title ?? "Home",
        layout: homeLayout,
      },
      ...customPages.map((page) => ({
        title: page.title,
        slug: page.slug,
        layout: (page.sections.length > 0 ? toHomeLayout(page) : { version: 1, sections: [] }) as HomeLayout,
        status: "draft" as const,
      })),
    ],
    navigation: site.navigation.map(cloneNavItem),
  };
}

function cloneNavItem(item: NavItem): NavItem {
  return {
    id: item.id,
    label: item.label,
    href: item.href,
    children: item.children?.map(cloneNavItem),
  };
}

/** Converts a legacy StoreSection to AI output shape (for template-based generation). */
export function storeSectionToAiGenerated(section: StoreSection): AiGeneratedSection {
  const { styles, ...content } = section.settings as Record<string, unknown> & {
    styles?: AiGeneratedSection["styles"];
  };
  const blockId = sectionToBlockId(section);

  return {
    blockId,
    content,
    styles: (styles as AiGeneratedSection["styles"]) ?? {},
    visible: section.visible,
  };
}

export function homeLayoutToAiGeneratedPage(
  layout: HomeLayout,
  pageMeta?: Partial<Pick<AiGeneratedPage, "id" | "slug" | "title" | "type">>
): AiGeneratedPage {
  return {
    id: pageMeta?.id ?? "home",
    slug: pageMeta?.slug ?? "",
    title: pageMeta?.title ?? "Home",
    type: pageMeta?.type ?? "home",
    sections: layout.sections.map(storeSectionToAiGenerated),
  };
}
