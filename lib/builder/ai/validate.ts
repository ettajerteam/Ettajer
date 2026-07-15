import { getBlock } from "../block-registry";
import type { SettingFieldSchema } from "../block-schema";
import type {
  AiGeneratedPage,
  AiGeneratedSection,
  AiGeneratedSite,
} from "./types";

function collectSchemaKeys(fields: SettingFieldSchema[] | undefined): string[] {
  const keys: string[] = [];
  for (const field of fields ?? []) {
    keys.push(field.key);
  }
  return keys;
}

function validateSectionContent(
  blockId: string,
  content: Record<string, unknown>
): string[] {
  const warnings: string[] = [];
  const block = getBlock(blockId);

  if (!block) {
    warnings.push(`Unknown block "${blockId}" — not found in block registry`);
    return warnings;
  }

  if (!block.implemented) {
    warnings.push(`Block "${blockId}" is not yet implemented in the storefront`);
  }

  const schema = block.settingsSchema;
  const knownKeys = new Set<string>(["styles"]);
  for (const key of collectSchemaKeys(schema.content)) knownKeys.add(key);
  for (const key of collectSchemaKeys(schema.styles)) knownKeys.add(key);
  for (const key of collectSchemaKeys(schema.layout)) knownKeys.add(key);
  for (const key of collectSchemaKeys(schema.advanced)) knownKeys.add(key);

  for (const key of Object.keys(content)) {
    if (key === "styles") continue;
    if (!knownKeys.has(key)) {
      warnings.push(
        `Section "${blockId}": content key "${key}" is not defined in block settingsSchema`
      );
    }
  }

  return warnings;
}

export function validateGeneratedSection(section: AiGeneratedSection): string[] {
  const warnings: string[] = [];

  if (!section.blockId) {
    warnings.push("Section is missing blockId");
    return warnings;
  }

  warnings.push(...validateSectionContent(section.blockId, section.content));

  if (!section.styles || typeof section.styles !== "object") {
    warnings.push(`Section "${section.blockId}": styles should be a SectionVisualStyles object`);
  }

  return warnings;
}

export function validateGeneratedPage(page: AiGeneratedPage): string[] {
  const warnings: string[] = [];

  if (!page.id) warnings.push("Page is missing id");
  if (!page.title) warnings.push("Page is missing title");
  if (page.type === "home" && page.slug !== "") {
    warnings.push('Home page slug should be empty string');
  }
  if (page.type === "custom" && !page.slug) {
    warnings.push("Custom page is missing slug");
  }

  if (page.type === "home" && page.sections.length === 0) {
    warnings.push("Home page has no sections");
  }

  for (const section of page.sections) {
    warnings.push(...validateGeneratedSection(section));
  }

  return warnings;
}

export function validateGeneratedSite(site: AiGeneratedSite): string[] {
  const warnings: string[] = [];

  if (site.pages.length === 0) {
    warnings.push("Site has no pages");
  }

  const homePages = site.pages.filter((p) => p.type === "home");
  if (homePages.length === 0) {
    warnings.push("Site is missing a home page");
  } else if (homePages.length > 1) {
    warnings.push("Site has multiple home pages");
  }

  for (const page of site.pages) {
    warnings.push(...validateGeneratedPage(page));
  }

  if (!site.theme?.theme) {
    warnings.push("Site theme is missing theme id");
  }
  if (!site.theme?.primaryColor) {
    warnings.push("Site theme is missing primaryColor");
  }

  if (site.navigation.length === 0) {
    warnings.push("Site navigation is empty");
  }

  return warnings;
}
