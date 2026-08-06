import { prisma } from "@/lib/db";
import { parseNewsletterAutomations } from "@/lib/newsletter-automation-settings";
import { createEmailTemplateFromGallery } from "@/lib/email-marketing/templates";
import {
  EMAIL_AUTOMATION_TRIGGER_DEFS,
  getEmailAutomationTriggerDef,
  isEmailAutomationTrigger,
  type EmailAutomationTrigger,
} from "@/lib/email-marketing/triggers";
import { isNewsletterTemplateId } from "@/lib/email/newsletter-templates";
import type { EmailAutomationRow } from "@/lib/email-marketing/types";

export type { EmailAutomationRow } from "@/lib/email-marketing/types";

export function serializeEmailAutomation(row: {
  id: string;
  name: string;
  trigger: string;
  enabled: boolean;
  templateId: string;
  delayMinutes: number;
  updatedAt: Date;
  template: { name: string };
}): EmailAutomationRow {
  return {
    id: row.id,
    name: row.name,
    trigger: (isEmailAutomationTrigger(row.trigger)
      ? row.trigger
      : "newsletter_subscribe") as EmailAutomationTrigger,
    enabled: row.enabled,
    templateId: row.templateId,
    templateName: row.template.name,
    delayMinutes: row.delayMinutes,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listEmailAutomations(storeId: string) {
  return prisma.emailAutomation.findMany({
    where: { storeId },
    include: { template: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Ensure one automation row per trigger. Seeds templates from gallery
 * and migrates legacy welcome JSON once.
 */
export async function ensureEmailAutomationsSeeded(store: {
  id: string;
  name: string;
  settings?: { newsletterAutomations?: unknown } | null;
}) {
  const existing = await prisma.emailAutomation.findMany({
    where: { storeId: store.id },
    select: { trigger: true },
  });
  const have = new Set(existing.map((e) => e.trigger));
  const legacy = parseNewsletterAutomations(
    store.settings?.newsletterAutomations,
    store.name
  );

  for (const def of EMAIL_AUTOMATION_TRIGGER_DEFS) {
    if (have.has(def.id)) continue;

    const galleryId = isNewsletterTemplateId(def.defaultGalleryId)
      ? def.defaultGalleryId
      : "welcome";

    let templateId: string | null = null;

    if (
      def.id === "newsletter_subscribe" &&
      legacy.welcome.enabled &&
      isNewsletterTemplateId(legacy.welcome.templateId)
    ) {
      const tpl = await prisma.emailTemplate.create({
        data: {
          storeId: store.id,
          name: "Welcome (migrated)",
          galleryId: legacy.welcome.templateId,
          themeId: legacy.welcome.themeId,
          subject: legacy.welcome.subject,
          title: legacy.welcome.title,
          body: legacy.welcome.body,
          ctaLabel: legacy.welcome.ctaLabel,
          ctaUrl: legacy.welcome.ctaUrl,
        },
      });
      templateId = tpl.id;
    } else {
      const tpl = await createEmailTemplateFromGallery({
        storeId: store.id,
        galleryId,
        storeName: store.name,
        name: `${def.name} template`,
      });
      templateId = tpl.id;
    }

    await prisma.emailAutomation.create({
      data: {
        storeId: store.id,
        name: def.name,
        trigger: def.id,
        enabled:
          def.id === "newsletter_subscribe" ? legacy.welcome.enabled : false,
        templateId,
        delayMinutes: 0,
      },
    });
  }
}

export async function setEmailAutomation(input: {
  storeId: string;
  trigger: EmailAutomationTrigger;
  enabled: boolean;
  templateId: string;
  name?: string;
}) {
  const template = await prisma.emailTemplate.findFirst({
    where: { id: input.templateId, storeId: input.storeId },
  });
  if (!template) throw new Error("Template not found");

  const def = getEmailAutomationTriggerDef(input.trigger);
  return prisma.emailAutomation.upsert({
    where: {
      storeId_trigger: {
        storeId: input.storeId,
        trigger: input.trigger,
      },
    },
    create: {
      storeId: input.storeId,
      trigger: input.trigger,
      name: input.name?.trim() || def?.name || input.trigger,
      enabled: input.enabled,
      templateId: input.templateId,
      delayMinutes: 0,
    },
    update: {
      enabled: input.enabled,
      templateId: input.templateId,
      ...(input.name?.trim() ? { name: input.name.trim() } : {}),
    },
    include: { template: { select: { name: true } } },
  });
}

/**
 * Enqueue a marketing automation email (worker delivers).
 * Uses AutomationExecution for at-most-once idempotency.
 * Never throws to callers.
 */
export async function runEmailMarketingAutomation(input: {
  storeId: string;
  trigger: EmailAutomationTrigger;
  to: string;
  /** Entity refs for idempotent execution (orderId, cartId, …) */
  context?: {
    subscriberId?: string | null;
    orderId?: string | null;
    cartId?: string | null;
    customerId?: string | null;
    occurrenceId?: string | null;
  };
}): Promise<{
  sent: boolean;
  queued?: boolean;
  skipped?: boolean;
  reason?: string;
}> {
  if (!input.to.trim()) return { sent: false };

  // Atlas journeys: enroll in parallel with legacy automations (non-blocking)
  try {
    const { enrollByTrigger } = await import(
      "@/lib/email-marketing/atlas/journey-runner"
    );
    const journeyTrigger = mapAutomationTriggerToJourney(input.trigger);
    if (journeyTrigger) {
      void enrollByTrigger({
        storeId: input.storeId,
        trigger: journeyTrigger,
        email: input.to,
        context: input.context as Record<string, unknown> | undefined,
      }).catch((err) =>
        console.error("[atlas/enrollByTrigger]", err)
      );
    }
  } catch (err) {
    console.error("[atlas/enroll hook]", err);
  }

  if (!(await import("@/lib/email-marketing/providers")).isAnyEmailProviderConfigured()) {
    return { sent: false };
  }

  try {
    const automation = await prisma.emailAutomation.findUnique({
      where: {
        storeId_trigger: {
          storeId: input.storeId,
          trigger: input.trigger,
        },
      },
      include: {
        template: true,
        store: {
          select: {
            name: true,
            slug: true,
            primaryColor: true,
            contactEmail: true,
            address: true,
            currency: true,
          },
        },
      },
    });

    if (!automation?.enabled || !automation.template) {
      return { sent: false, reason: "disabled" };
    }

    const {
      claimAutomationExecution,
      enrichAutomationContext,
      markAutomationExecutionQueued,
      markAutomationExecutionSkipped,
    } = await import("@/lib/email-marketing/automation-execution");

    const context = await enrichAutomationContext({
      storeId: input.storeId,
      to: input.to,
      context: input.context,
    });

    const claim = await claimAutomationExecution({
      storeId: input.storeId,
      automationId: automation.id,
      trigger: input.trigger,
      context,
    });

    if (!claim.claimed) {
      return {
        sent: false,
        skipped: true,
        reason: claim.reason,
      };
    }

    const executionId = claim.execution.id;

    const { resolveMarketingCompliance } = await import(
      "@/lib/email-marketing/compliance"
    );
    const compliance = await resolveMarketingCompliance({
      storeId: input.storeId,
      email: input.to,
    });
    if (!compliance.allowed) {
      await markAutomationExecutionSkipped(
        executionId,
        `Skipped: ${compliance.reason}`
      );
      return { sent: false, skipped: true, reason: compliance.reason };
    }

    const { enqueueEmailJobs } = await import(
      "@/lib/email-marketing/email-queue"
    );
    const { parseEmailBlocks } = await import(
      "@/lib/email-marketing/email-blocks"
    );
    const email = input.to.trim().toLowerCase();
    const delayMs = Math.max(0, automation.delayMinutes) * 60_000;
    const scheduledAt =
      delayMs > 0 ? new Date(Date.now() + delayMs) : null;

    const { created } = await enqueueEmailJobs({
      storeId: input.storeId,
      kind: "automation",
      subject: automation.template.subject,
      payload: {
        storeName: automation.store.name,
        storeSlug: automation.store.slug,
        storePrimaryColor: automation.store.primaryColor,
        storeAddress: automation.store.address,
        storeSupportEmail: automation.store.contactEmail,
        replyTo: automation.store.contactEmail,
        storeId: input.storeId,
        currency: automation.store.currency ?? "MAD",
        template: {
          themeId: automation.template.themeId,
          subject: automation.template.subject,
          title: automation.template.title,
          body: automation.template.body,
          ctaLabel: automation.template.ctaLabel,
          ctaUrl: automation.template.ctaUrl,
          galleryId: automation.template.galleryId,
          blocks: parseEmailBlocks(automation.template.blocks),
        },
      },
      items: [
        {
          toEmail: email,
          idempotencyKey: `automation-exec:${executionId}`,
          scheduledAt,
          automationTrigger: input.trigger,
          automationExecutionId: executionId,
          emailTemplateId: automation.templateId,
        },
      ],
    });

    if (created === 0) {
      // Job already exists for this execution (rare race) — treat as processed
      await markAutomationExecutionQueued(executionId);
      return { sent: false, skipped: true, reason: "already_queued" };
    }

    await markAutomationExecutionQueued(executionId);
    return { sent: false, queued: true };
  } catch (error) {
    console.error(`[email-marketing/${input.trigger}]`, error);
    return { sent: false, reason: "error" };
  }
}

/** Map v2 automation triggers onto Atlas journey trigger ids. */
function mapAutomationTriggerToJourney(
  trigger: EmailAutomationTrigger
): string | null {
  switch (trigger) {
    case "newsletter_subscribe":
      return "newsletter_signup";
    case "order_placed":
      return "any_purchase";
    case "abandoned_cart":
      return "cart_abandoned";
    case "customer_created":
      return "customer_created";
    default:
      return null;
  }
}
