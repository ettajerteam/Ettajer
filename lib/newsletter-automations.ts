import { prisma } from "@/lib/db";
import { isResendConfigured, sendEmail } from "@/lib/resend";
import { runEmailMarketingAutomation } from "@/lib/email-marketing/automations";
import { parseNewsletterAutomations } from "@/lib/newsletter-automation-settings";
import { buildNewsletterEmailHtml } from "@/lib/email/newsletter-templates";
import { resolveMarketingCompliance } from "@/lib/email-marketing/compliance";

/**
 * Prefer Email Marketing automation table; fall back to legacy JSON welcome
 * until merchants open Automations (which seeds the table).
 */
export async function maybeSendWelcomeNewsletterEmail(input: {
  storeId: string;
  email: string;
  shouldSend: boolean;
  subscriberId?: string | null;
  /** signup | reactivate — disambiguates AutomationExecution idempotency */
  occurrence?: "signup" | "reactivate";
}): Promise<void> {
  if (!input.shouldSend) return;

  const occurrenceId =
    input.occurrence === "reactivate"
      ? `reactivate:${new Date().toISOString().slice(0, 10)}`
      : "signup";

  const fromTable = await runEmailMarketingAutomation({
    storeId: input.storeId,
    trigger: "newsletter_subscribe",
    to: input.email,
    context: {
      subscriberId: input.subscriberId ?? null,
      occurrenceId,
    },
  });
  if (fromTable.sent || fromTable.queued || fromTable.skipped) return;

  if (!isResendConfigured()) return;

  try {
    const store = await prisma.store.findUnique({
      where: { id: input.storeId },
      select: {
        name: true,
        slug: true,
        primaryColor: true,
        contactEmail: true,
        address: true,
        settings: { select: { newsletterAutomations: true } },
      },
    });
    if (!store) return;

    const settings = parseNewsletterAutomations(
      store.settings?.newsletterAutomations,
      store.name
    );
    if (!settings.welcome.enabled) return;

    const hasRows = await prisma.emailAutomation.count({
      where: { storeId: input.storeId },
    });
    if (hasRows > 0) return;

    const compliance = await resolveMarketingCompliance({
      storeId: input.storeId,
      email: input.email,
    });
    if (!compliance.allowed) return;

    const html = buildNewsletterEmailHtml({
      templateId: settings.welcome.templateId,
      themeId: settings.welcome.themeId,
      storeName: store.name,
      storeSlug: store.slug,
      storePrimaryColor: store.primaryColor,
      storeAddress: store.address,
      storeSupportEmail: store.contactEmail,
      fields: {
        subject: settings.welcome.subject,
        title: settings.welcome.title,
        body: settings.welcome.body,
        ctaLabel: settings.welcome.ctaLabel,
        ctaUrl: settings.welcome.ctaUrl.trim() || "",
      },
      marketingCompliance: {
        preferencesUrl: compliance.preferencesUrl,
        unsubscribeUrl: compliance.unsubscribeUrl,
      },
    });

    await sendEmail({
      to: input.email,
      subject: settings.welcome.subject,
      html,
      replyTo: store.contactEmail?.trim() || undefined,
      headers: {
        "List-Unsubscribe": `<${compliance.unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
  } catch (error) {
    console.error("[newsletter/welcome-automation]", error);
  }
}
