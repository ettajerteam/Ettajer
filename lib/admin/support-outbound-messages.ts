import { getAppUrl } from "@/lib/email/base-template";
import { getEmailCopy } from "@/lib/email/email-i18n";
import type { LandingLocale } from "@/lib/landing/landing-i18n";

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function supportConfirmationInboxMessage(
  topic: string,
  locale: LandingLocale
): string {
  const copy = getEmailCopy(locale).supportConfirmation;
  const helpUrl = `${getAppUrl()}/help`;

  return [
    stripHtml(copy.body(topic)),
    stripHtml(copy.highlightBody(helpUrl)),
    copy.footerNote,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function nameChangeInviteInboxMessage(
  currentName: string,
  locale: LandingLocale
): string {
  const copy = getEmailCopy(locale).nameChangeInvite;

  return [
    stripHtml(copy.body(currentName)),
    ...copy.steps.map((step, index) => `${index + 1}. ${step}`),
    copy.expiryNote,
    copy.footerNote,
  ].join("\n\n");
}

export function nameChangeConfirmedInboxMessage(
  previousName: string,
  newName: string,
  locale: LandingLocale
): string {
  const copy = getEmailCopy(locale).nameChangeConfirmed;

  return [
    stripHtml(copy.body(previousName, newName)),
    copy.footerNote,
  ].join("\n\n");
}
