import {
  buildNewsletterEmailHtml,
  isNewsletterTemplateId,
  type NewsletterTemplateId,
} from "@/lib/email/newsletter-templates";
import {
  isNewsletterThemeId,
  type NewsletterThemeId,
} from "@/lib/email/newsletter-themes";
import { getAbsoluteStoreUrl } from "@/lib/storefront-urls";
import { parseEmailBlocks, type EmailBlock } from "@/lib/email-marketing/email-blocks";
import {
  buildEmailProductBlocksHtml,
  type ResolvedEmailProductCard,
} from "@/lib/email-marketing/product-blocks-render";

export function buildEmailTemplateHtml(input: {
  template: {
    themeId: string;
    subject: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
    galleryId?: string | null;
    blocks?: EmailBlock[] | unknown;
  };
  storeName: string;
  storeSlug: string;
  storePrimaryColor?: string | null;
  storeAddress?: string | null;
  storeSupportEmail?: string | null;
  currency?: string;
  /** Pre-resolved product cards (editor preview / send-time sync) */
  resolvedProducts?: ResolvedEmailProductCard[];
  marketingCompliance?: {
    preferencesUrl: string;
    unsubscribeUrl: string;
  };
}): string {
  const galleryId = isNewsletterTemplateId(input.template.galleryId ?? "")
    ? (input.template.galleryId as NewsletterTemplateId)
    : "announcement";
  const themeId = isNewsletterThemeId(input.template.themeId)
    ? (input.template.themeId as NewsletterThemeId)
    : "store";

  const currency = input.currency || "MAD";
  const productHtml = buildEmailProductBlocksHtml(
    input.resolvedProducts ?? [],
    currency
  );

  return buildNewsletterEmailHtml({
    templateId: galleryId,
    themeId,
    storeName: input.storeName,
    storeSlug: input.storeSlug,
    storePrimaryColor: input.storePrimaryColor,
    storeAddress: input.storeAddress,
    storeSupportEmail: input.storeSupportEmail,
    marketingCompliance: input.marketingCompliance,
    customBlock: productHtml || undefined,
    fields: {
      subject: input.template.subject,
      title: input.template.title,
      body: input.template.body,
      ctaLabel: input.template.ctaLabel || "Visit the store",
      ctaUrl:
        input.template.ctaUrl.trim() || getAbsoluteStoreUrl(input.storeSlug),
    },
  });
}

/**
 * Build HTML with live product data from the catalog (auto-sync on product updates).
 */
export async function buildEmailTemplateHtmlLive(input: {
  storeId: string;
  currency: string;
  template: {
    themeId: string;
    subject: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
    galleryId?: string | null;
    blocks?: EmailBlock[] | unknown;
  };
  storeName: string;
  storeSlug: string;
  storePrimaryColor?: string | null;
  storeAddress?: string | null;
  storeSupportEmail?: string | null;
  marketingCompliance?: {
    preferencesUrl: string;
    unsubscribeUrl: string;
  };
  /** Personalized product recommendations at send time */
  recipientEmail?: string | null;
}): Promise<string> {
  const { resolveEmailProductBlocks } = await import(
    "@/lib/email-marketing/product-blocks"
  );
  const blocks = parseEmailBlocks(input.template.blocks);
  const resolvedProducts = await resolveEmailProductBlocks({
    storeId: input.storeId,
    storeSlug: input.storeSlug,
    currency: input.currency,
    blocks,
    recipientEmail: input.recipientEmail,
  });

  return buildEmailTemplateHtml({
    ...input,
    resolvedProducts,
  });
}
