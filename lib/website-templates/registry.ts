import type { WebsiteTemplateDefinition, WebsiteTemplateId } from "./types";
import { fashionTemplate } from "./templates/fashion";
import { beautyTemplate } from "./templates/beauty";
import { electronicsTemplate } from "./templates/electronics";
import { restaurantTemplate } from "./templates/restaurant";
import { furnitureTemplate } from "./templates/furniture";
import { agencyTemplate } from "./templates/agency";
import { portfolioTemplate } from "./templates/portfolio";

const templateRegistry = new Map<WebsiteTemplateId, WebsiteTemplateDefinition>();

function seedRegistry(): void {
  for (const template of [
    fashionTemplate,
    beautyTemplate,
    electronicsTemplate,
    restaurantTemplate,
    furnitureTemplate,
    agencyTemplate,
    portfolioTemplate,
  ]) {
    templateRegistry.set(template.id, template);
  }
}

seedRegistry();

/** Register a template — call from new template files; no builder core changes needed. */
export function registerTemplate(template: WebsiteTemplateDefinition): void {
  templateRegistry.set(template.id, template);
}

export function getTemplate(id: WebsiteTemplateId): WebsiteTemplateDefinition | undefined {
  return templateRegistry.get(id);
}

export function getAllTemplates(): WebsiteTemplateDefinition[] {
  return Array.from(templateRegistry.values());
}

/** @deprecated Use getAllTemplates() */
export function listWebsiteTemplates(): WebsiteTemplateDefinition[] {
  return getAllTemplates();
}

/** @deprecated Use getTemplate() */
export function getWebsiteTemplate(id: WebsiteTemplateId): WebsiteTemplateDefinition | undefined {
  return getTemplate(id);
}

/** @deprecated Use getAllTemplates() */
export const WEBSITE_TEMPLATES = getAllTemplates();
