import { NEWSLETTER_TEMPLATES } from "@/lib/email/newsletter-templates";
import type { NewsletterThemeId } from "@/lib/email/newsletter-themes";

export interface EmailGalleryItem {
  id: string;
  name: string;
  description: string;
  badge: string;
  suggestedThemeId: NewsletterThemeId;
  defaults: {
    subject: string;
    title: string;
    body: string;
    ctaLabel: string;
  };
}

export function listEmailGallery(): EmailGalleryItem[] {
  return NEWSLETTER_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    badge: t.badge,
    suggestedThemeId: t.suggestedThemeId,
    defaults: t.defaults,
  }));
}
