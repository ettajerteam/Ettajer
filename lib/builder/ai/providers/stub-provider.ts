import { getWebsiteTemplate } from "@/lib/website-templates/registry";
import { getTemplateHomeLayout } from "@/lib/website-templates";
import type { AiGenerationProvider } from "../provider";
import { parsePromptIntent, type ParsedIntent } from "../intent";
import {
  composeNavigationForIntent,
  composeSectionForBlock,
  composeSectionsForIntent,
  composeThemeForIntent,
} from "../compose";
import { homeLayoutToAiGeneratedPage } from "../serialize";
import type {
  AiGeneratedPage,
  AiGeneratedSection,
  AiGeneratedSite,
  AiGeneratedTheme,
  AiGenerationContext,
  AiGenerationPrompt,
} from "../types";

export const stubProvider: AiGenerationProvider = {
  id: "stub",
  name: "Stub (rule-based)",

  async generateSite(
    prompt: AiGenerationPrompt,
    ctx: AiGenerationContext
  ): Promise<AiGeneratedSite> {
    const intent = parsePromptIntent(prompt.text);

    if (intent.suggestedTemplateId) {
      const template = getWebsiteTemplate(intent.suggestedTemplateId);
      if (template) {
        const isLuxuryPerfume =
          intent.tone === "luxury" &&
          intent.keywords.some((k: string) => ["perfume", "fragrance"].includes(k));

        if (isLuxuryPerfume) {
          return buildLuxuryPerfumeSite(prompt, ctx, intent);
        }

        return {
          pages: [homeLayoutToAiGeneratedPage(getTemplateHomeLayout(template))],
          navigation: template.navigation.map((item) => ({ ...item })),
          theme: {
            theme: template.theme.theme,
            primaryColor: template.theme.primaryColor,
            secondaryColor: template.theme.secondaryColor,
            font: template.theme.font,
            logo: null,
          },
          metadata: {
            prompt: prompt.text,
            provider: "stub",
            generatedAt: new Date().toISOString(),
            confidence: 0.85,
          },
        };
      }
    }

    return buildComposedSite(prompt, ctx, intent);
  },

  async generatePage(
    prompt: AiGenerationPrompt,
    ctx: AiGenerationContext
  ): Promise<AiGeneratedPage> {
    const text = prompt.text.toLowerCase();
    const isCustomPage =
      /\b(about|contact|services|menu|work|page)\b/i.test(text) &&
      !/\b(home|homepage|landing)\b/i.test(text);

    if (isCustomPage) {
      return buildCustomPage(prompt, ctx);
    }

    const site = await stubProvider.generateSite!(prompt, ctx);
    const home = site.pages.find((p: AiGeneratedPage) => p.type === "home") ?? site.pages[0];
    if (!home) {
      throw new Error("Stub provider failed to generate a home page");
    }
    return home;
  },

  async generateSection(
    prompt: AiGenerationPrompt,
    ctx: AiGenerationContext & { blockId?: string }
  ): Promise<AiGeneratedSection> {
    const intent = parsePromptIntent(prompt.text);
    const blockId =
      ctx.blockId ??
      intent.suggestedBlocks[0] ??
      ctx.availableBlocks[0] ??
      "rich-text";

    return composeSectionForBlock(blockId, intent, prompt.text);
  },

  async generateTheme(
    prompt: AiGenerationPrompt,
    _ctx: AiGenerationContext
  ): Promise<AiGeneratedTheme> {
    const intent = parsePromptIntent(prompt.text);
    return composeThemeForIntent(intent);
  },
};

function buildLuxuryPerfumeSite(
  prompt: AiGenerationPrompt,
  _ctx: AiGenerationContext,
  intent: ParsedIntent
): AiGeneratedSite {
  const sections = composeSectionsForIntent(intent, { storeName: prompt.storeName });
  const theme = composeThemeForIntent(intent);
  const navigation = composeNavigationForIntent(intent);

  return {
    pages: [
      {
        id: "home",
        slug: "",
        title: "Home",
        type: "home",
        sections,
      },
    ],
    navigation,
    theme,
    metadata: {
      prompt: prompt.text,
      provider: "stub",
      generatedAt: new Date().toISOString(),
      confidence: 0.92,
    },
  };
}

function buildComposedSite(
  prompt: AiGenerationPrompt,
  _ctx: AiGenerationContext,
  intent: ParsedIntent
): AiGeneratedSite {
  const sections = composeSectionsForIntent(intent, { storeName: prompt.storeName });
  const theme = composeThemeForIntent(intent);
  const navigation = composeNavigationForIntent(intent);

  return {
    pages: [
      {
        id: "home",
        slug: "",
        title: "Home",
        type: "home",
        sections,
      },
    ],
    navigation,
    theme,
    metadata: {
      prompt: prompt.text,
      provider: "stub",
      generatedAt: new Date().toISOString(),
      confidence: 0.75,
    },
  };
}

function buildCustomPage(
  prompt: AiGenerationPrompt,
  _ctx: AiGenerationContext
): AiGeneratedPage {
  const intent = parsePromptIntent(prompt.text);
  const text = prompt.text.toLowerCase();

  let slug = "about";
  let title = "About";

  if (text.includes("contact")) {
    slug = "contact";
    title = "Contact";
  } else if (text.includes("services")) {
    slug = "services";
    title = "Services";
  } else if (text.includes("menu")) {
    slug = "menu";
    title = "Menu";
  } else if (text.includes("work")) {
    slug = "work";
    title = "Work";
  }

  const sections: AiGeneratedSection[] =
    slug === "contact"
      ? [
          composeSectionForBlock(
            "rich-text",
            intent,
            prompt.storeName
              ? `Get in touch with ${prompt.storeName}. We usually reply within one business day.`
              : "Get in touch — we usually reply within one business day."
          ),
          composeSectionForBlock("contact-form", intent, prompt.text),
        ]
      : [
          composeSectionForBlock(
            "hero",
            intent,
            title === "About"
              ? `Our story${prompt.storeName ? ` — ${prompt.storeName}` : ""}`
              : title
          ),
          composeSectionForBlock("rich-text", intent, prompt.text),
        ];

  return {
    id: `page-${slug}`,
    slug,
    title,
    type: "custom",
    sections,
  };
}
