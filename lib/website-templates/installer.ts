import type { HomeLayout, StoreSection } from "@/lib/sections/types";
import type { NavItem } from "@/lib/navigation";
import { serializePageContentWithLayout } from "@/lib/page-layout";
import type {
  WebsiteTemplateBranding,
  WebsiteTemplateDefinition,
  WebsiteTemplateId,
} from "./types";
import { getTemplate } from "./registry";
import { getTemplateHomeLayout, getTemplateSecondaryPages, isHomePageSlug } from "./utils";

function newSectionId(type: string): string {
  return `${type}-${Math.random().toString(36).slice(2, 10)}`;
}

function newNavId(): string {
  return `nav-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneSection(section: StoreSection): StoreSection {
  return {
    ...JSON.parse(JSON.stringify(section)),
    id: newSectionId(section.type),
  };
}

function cloneLayout(layout: HomeLayout): HomeLayout {
  return {
    version: 1,
    sections: layout.sections
      .filter((section) => Boolean(section?.type) && typeof section.visible === "boolean")
      .map(cloneSection),
  };
}

function cloneNavItem(item: NavItem): NavItem {
  return {
    id: newNavId(),
    label: item.label,
    href: item.href,
    children: item.children?.map(cloneNavItem),
  };
}

export interface TemplatePageApplyPayload {
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
}

export interface TemplateApplyResult {
  homeLayout: HomeLayout;
  theme: WebsiteTemplateDefinition["theme"];
  branding?: WebsiteTemplateBranding;
  navigation: NavItem[];
  pages: TemplatePageApplyPayload[];
  productLayout?: HomeLayout;
  collectionLayout?: HomeLayout;
  blogPostLayout?: HomeLayout;
}

function serializePageForApply(
  page: WebsiteTemplateDefinition["pages"][number]
): TemplatePageApplyPayload {
  return {
    title: page.title,
    slug: page.slug,
    content: serializePageContentWithLayout({ body: "", layout: cloneLayout(page.layout) }),
    status: page.status ?? "published",
  };
}

/**
 * Apply a registered template — returns patches for draft store state.
 * Does not mutate the store; caller applies theme, layout, nav, and creates pages via API.
 */
export function applyTemplate(templateId: WebsiteTemplateId): TemplateApplyResult | null {
  const template = getTemplate(templateId);
  if (!template) return null;
  return buildTemplateApplyResult(template);
}

export function buildTemplateApplyResult(template: WebsiteTemplateDefinition): TemplateApplyResult {
  const homeLayout = cloneLayout(getTemplateHomeLayout(template));
  const secondaryPages = getTemplateSecondaryPages(template);

  return {
    homeLayout,
    theme: { ...template.theme },
    branding: template.branding ? { ...template.branding } : undefined,
    navigation: template.navigation.map(cloneNavItem),
    pages: secondaryPages.map((page) => serializePageForApply(page)),
    productLayout: template.productLayout
      ? cloneLayout(template.productLayout)
      : undefined,
    collectionLayout: template.collectionLayout
      ? cloneLayout(template.collectionLayout)
      : undefined,
    blogPostLayout: template.blogPostLayout
      ? cloneLayout(template.blogPostLayout)
      : undefined,
  };
}

/** @deprecated Use applyTemplate(templateId) or buildTemplateApplyResult */
export function prepareTemplateApply(template: WebsiteTemplateDefinition): TemplateApplyResult {
  return buildTemplateApplyResult(template);
}

export function cloneTemplateLayout(template: WebsiteTemplateDefinition): HomeLayout {
  return cloneLayout(getTemplateHomeLayout(template));
}

export function cloneTemplateNavigation(template: WebsiteTemplateDefinition): NavItem[] {
  return template.navigation.map(cloneNavItem);
}

export function getTemplatePreviewSettings(template: WebsiteTemplateDefinition) {
  return {
    theme: template.theme.theme,
    primaryColor: template.theme.primaryColor,
    secondaryColor: template.theme.secondaryColor,
    font: template.theme.font,
    logo: template.branding?.logo ?? null,
  };
}

/** Resolve template by id for installer entry point. */
export function resolveTemplateForInstall(templateId: WebsiteTemplateId): WebsiteTemplateDefinition | null {
  return getTemplate(templateId) ?? null;
}

export function countTemplatePages(template: WebsiteTemplateDefinition): number {
  return template.pages.filter((p) => !isHomePageSlug(p.slug)).length;
}
