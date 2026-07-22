import type { BusinessModel } from "@/lib/onboarding/business-models";
import type { WebsiteTemplateDefinition, WebsiteTemplateId } from "./types";
import { auraTemplate } from "./templates/aura";
import { techTemplate } from "./templates/tech";
import { paperTemplate } from "./templates/paper";

const templateRegistry = new Map<WebsiteTemplateId, WebsiteTemplateDefinition>();

function seedRegistry(): void {
  for (const template of [auraTemplate, techTemplate, paperTemplate]) {
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

export function getTemplatesForBusinessModel(
  businessModel: BusinessModel,
): WebsiteTemplateDefinition[] {
  return getAllTemplates().filter((t) => t.businessModels.includes(businessModel));
}

export function isWebsiteTemplateId(value: string): value is WebsiteTemplateId {
  return templateRegistry.has(value as WebsiteTemplateId);
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
