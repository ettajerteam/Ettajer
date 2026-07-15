export type {
  WebsiteTemplateId,
  WebsiteTemplateDefinition,
  WebsiteTemplatePageDefinition,
  WebsiteTemplateBranding,
  WebsiteTemplate,
  TemplatePageDefinition,
} from "./types";

export {
  isHomePageSlug,
  getTemplateHomeLayout,
  getTemplateSecondaryPages,
  getTemplateThumbnailStyle,
} from "./utils";

export {
  applyTemplate,
  buildTemplateApplyResult,
  prepareTemplateApply,
  cloneTemplateLayout,
  cloneTemplateNavigation,
  getTemplatePreviewSettings,
  resolveTemplateForInstall,
  countTemplatePages,
  type TemplateApplyResult,
  type TemplatePageApplyPayload,
} from "./installer";

export {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  listWebsiteTemplates,
  getWebsiteTemplate,
  WEBSITE_TEMPLATES,
} from "./registry";

export { tplSection, tplNav, tplLayout, tplFooter } from "./helpers";
