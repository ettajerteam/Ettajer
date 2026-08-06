import {
  buildNewsletterComposeDefaults,
  isNewsletterTemplateId,
  type NewsletterComposeFields,
  type NewsletterTemplateId,
} from "@/lib/email/newsletter-templates";
import {
  isNewsletterThemeId,
  type NewsletterThemeId,
} from "@/lib/email/newsletter-themes";

export interface NewsletterWelcomeAutomation {
  enabled: boolean;
  templateId: NewsletterTemplateId;
  themeId: NewsletterThemeId;
  subject: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface NewsletterAutomationsSettings {
  welcome: NewsletterWelcomeAutomation;
}

export function defaultNewsletterWelcome(
  storeName = "our store"
): NewsletterWelcomeAutomation {
  const fields = buildNewsletterComposeDefaults("welcome", storeName);
  return {
    enabled: false,
    templateId: "welcome",
    themeId: "store",
    subject: fields.subject,
    title: fields.title,
    body: fields.body,
    ctaLabel: fields.ctaLabel,
    ctaUrl: "",
  };
}

export function defaultNewsletterAutomations(
  storeName?: string
): NewsletterAutomationsSettings {
  return { welcome: defaultNewsletterWelcome(storeName) };
}

function asObject(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export function parseNewsletterAutomations(
  raw: unknown,
  storeName?: string
): NewsletterAutomationsSettings {
  const defaults = defaultNewsletterAutomations(storeName);
  const root = asObject(raw);
  const welcomeRaw = asObject(root.welcome);

  const templateId = isNewsletterTemplateId(String(welcomeRaw.templateId ?? ""))
    ? (welcomeRaw.templateId as NewsletterTemplateId)
    : defaults.welcome.templateId;
  const themeId = isNewsletterThemeId(String(welcomeRaw.themeId ?? ""))
    ? (welcomeRaw.themeId as NewsletterThemeId)
    : defaults.welcome.themeId;

  const str = (
    key: keyof NewsletterComposeFields,
    fallback: string
  ) => {
    const v = welcomeRaw[key];
    return typeof v === "string" && v.trim() ? v.trim() : fallback;
  };

  return {
    welcome: {
      enabled: welcomeRaw.enabled === true,
      templateId,
      themeId,
      subject: str("subject", defaults.welcome.subject).slice(0, 200),
      title: str("title", defaults.welcome.title).slice(0, 200),
      body: str("body", defaults.welcome.body).slice(0, 5000),
      ctaLabel: str("ctaLabel", defaults.welcome.ctaLabel).slice(0, 80),
      ctaUrl: str("ctaUrl", "").slice(0, 500),
    },
  };
}
