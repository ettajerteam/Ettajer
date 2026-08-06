import {
  buildModernEmailHtml,
  escapeHtml,
} from "@/lib/email/base-template";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";
import {
  resolveNewsletterTheme,
  type NewsletterThemeId,
} from "@/lib/email/newsletter-themes";

export type NewsletterTemplateId =
  | "promo"
  | "new_arrivals"
  | "announcement"
  | "welcome"
  | "flash_sale"
  | "free_shipping"
  | "thank_you"
  | "restock"
  | "exclusive";

export interface NewsletterTemplateDef {
  id: NewsletterTemplateId;
  name: string;
  description: string;
  badge: string;
  /** Suggested theme when picking this template (merchant can override) */
  suggestedThemeId: NewsletterThemeId;
  defaults: {
    subject: string;
    title: string;
    body: string;
    ctaLabel: string;
  };
}

export interface NewsletterComposeFields {
  subject: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}

export const NEWSLETTER_TEMPLATES: NewsletterTemplateDef[] = [
  {
    id: "promo",
    name: "Promo",
    description: "Sale or discount offer with a clear shop CTA.",
    badge: "Offer",
    suggestedThemeId: "warm",
    defaults: {
      subject: "A special offer just for you",
      title: "Limited-time offer",
      body: "Thanks for being part of our community. Enjoy an exclusive deal on your next order — available for a short time only.",
      ctaLabel: "Shop the offer",
    },
  },
  {
    id: "new_arrivals",
    name: "New arrivals",
    description: "Highlight fresh products and collections.",
    badge: "New",
    suggestedThemeId: "classic",
    defaults: {
      subject: "New arrivals are here",
      title: "Just landed",
      body: "We just added new pieces to the shop. Be the first to see what's new and pick your favorites before they sell out.",
      ctaLabel: "See what's new",
    },
  },
  {
    id: "announcement",
    name: "Announcement",
    description: "Store news, shipping updates, or a thank-you note.",
    badge: "Update",
    suggestedThemeId: "forest",
    defaults: {
      subject: "A quick update from us",
      title: "News from the shop",
      body: "We wanted to share a short update with our subscribers. Thanks for following along — we're glad you're here.",
      ctaLabel: "Visit the store",
    },
  },
  {
    id: "welcome",
    name: "Welcome",
    description: "Greet new subscribers and invite them to browse.",
    badge: "Welcome",
    suggestedThemeId: "store",
    defaults: {
      subject: "Welcome — you're on the list",
      title: "Glad you're here",
      body: "Thanks for subscribing. You'll be the first to hear about new drops, offers, and store news. Start exploring whenever you're ready.",
      ctaLabel: "Browse the shop",
    },
  },
  {
    id: "flash_sale",
    name: "Flash sale",
    description: "Urgent short window deal.",
    badge: "Flash",
    suggestedThemeId: "coral",
    defaults: {
      subject: "Flash sale — ends soon",
      title: "Don't miss this",
      body: "For a limited time only, grab your favorites at a special price. When the clock runs out, the deal is gone.",
      ctaLabel: "Shop the flash sale",
    },
  },
  {
    id: "free_shipping",
    name: "Free shipping",
    description: "Promote free or reduced delivery.",
    badge: "Shipping",
    suggestedThemeId: "classic",
    defaults: {
      subject: "Free shipping on your next order",
      title: "We cover delivery",
      body: "Order from the shop and enjoy free shipping for a limited time. Stock up on what you love — delivery is on us.",
      ctaLabel: "Shop with free shipping",
    },
  },
  {
    id: "thank_you",
    name: "Thank you",
    description: "Appreciate your community.",
    badge: "Thanks",
    suggestedThemeId: "rose",
    defaults: {
      subject: "Thank you for being with us",
      title: "We appreciate you",
      body: "A quick note to say thanks for supporting the shop. Your orders and messages mean a lot — here's to more great finds ahead.",
      ctaLabel: "Visit the store",
    },
  },
  {
    id: "restock",
    name: "Restock",
    description: "Announce popular items back in stock.",
    badge: "Back",
    suggestedThemeId: "forest",
    defaults: {
      subject: "They're back in stock",
      title: "Restocked favorites",
      body: "Some of our most-loved pieces are available again. Tap in before they sell out a second time.",
      ctaLabel: "Shop restocks",
    },
  },
  {
    id: "exclusive",
    name: "Exclusive",
    description: "Subscriber-only early access or perk.",
    badge: "VIP",
    suggestedThemeId: "midnight",
    defaults: {
      subject: "Exclusive for subscribers",
      title: "For you first",
      body: "As a subscriber you get first access. Browse the exclusive picks before they go public — available for a short window.",
      ctaLabel: "Unlock the drop",
    },
  },
];

export function getNewsletterTemplate(
  id: string
): NewsletterTemplateDef | undefined {
  return NEWSLETTER_TEMPLATES.find((t) => t.id === id);
}

export function isNewsletterTemplateId(id: string): id is NewsletterTemplateId {
  return NEWSLETTER_TEMPLATES.some((t) => t.id === id);
}

function paragraphsToHtml(text: string): string {
  const parts = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  return parts
    .map((p) => escapeHtml(p).split("\n").join("<br />"))
    .map(
      (p) => `<span style="display:block;margin:0 0 12px;">${p}</span>`
    )
    .join("");
}

export function buildNewsletterComposeDefaults(
  templateId: NewsletterTemplateId,
  _storeName: string
): NewsletterComposeFields {
  const template = getNewsletterTemplate(templateId)!;
  return {
    subject: template.defaults.subject,
    title: template.defaults.title,
    body: template.defaults.body,
    ctaLabel: template.defaults.ctaLabel,
    ctaUrl: "",
  };
}

export function buildNewsletterEmailHtml(input: {
  templateId: NewsletterTemplateId;
  themeId?: NewsletterThemeId | string | null;
  storeName: string;
  storeSlug: string;
  storePrimaryColor?: string | null;
  storeAddress?: string | null;
  storeSupportEmail?: string | null;
  fields: NewsletterComposeFields;
  /** Pre-built HTML (e.g. live product blocks) inserted under the body */
  customBlock?: string;
  marketingCompliance?: {
    preferencesUrl: string;
    unsubscribeUrl: string;
  };
}): string {
  const template = getNewsletterTemplate(input.templateId)!;
  const theme = resolveNewsletterTheme(
    input.themeId ?? template.suggestedThemeId,
    input.storePrimaryColor
  );
  const storeUrl =
    input.fields.ctaUrl.trim() || getAbsoluteStoreUrl(input.storeSlug);
  const bodyHtml = paragraphsToHtml(input.fields.body.trim());

  return buildModernEmailHtml({
    brandName: input.storeName,
    previewText: input.fields.subject.trim() || template.defaults.subject,
    title: input.fields.title.trim() || template.defaults.title,
    badge: template.badge,
    badgeColor: theme.badgeColor,
    accentFrom: theme.accentFrom,
    accentTo: theme.accentTo,
    greeting: `Hi from ${input.storeName}`,
    body: bodyHtml || escapeHtml(template.defaults.body),
    customBlock: input.customBlock,
    cta: {
      label: input.fields.ctaLabel.trim() || template.defaults.ctaLabel,
      url: storeUrl,
    },
    footerNote: `You're receiving this because you subscribed to ${input.storeName}.`,
    showHelpLink: false,
    marketingCompliance: input.marketingCompliance
      ? {
          businessName: input.storeName,
          address: input.storeAddress,
          supportEmail: input.storeSupportEmail,
          preferencesUrl: input.marketingCompliance.preferencesUrl,
          unsubscribeUrl: input.marketingCompliance.unsubscribeUrl,
        }
      : undefined,
  });
}
