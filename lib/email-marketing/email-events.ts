import { prisma } from "@/lib/db";
import { normalizeSubscriberEmail } from "@/lib/newsletter";
import {
  EMAIL_EVENT_TYPES,
  ratePercent,
  type EmailEventType,
  type NormalizedEmailEventInput,
} from "@/lib/email-marketing/email-analytics-types";

export type { NormalizedEmailEventInput } from "@/lib/email-marketing/email-analytics-types";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function isEmailEventType(value: string): value is EmailEventType {
  return (EMAIL_EVENT_TYPES as readonly string[]).includes(value);
}

/**
 * Resolve store + campaign links from a provider message id when webhooks
 * omit Ettajer ids.
 */
async function resolveFromProviderMessageId(providerMessageId: string | null | undefined) {
  if (!providerMessageId?.trim()) return null;
  return prisma.emailJob.findFirst({
    where: { providerMessageId: providerMessageId.trim() },
    select: {
      id: true,
      storeId: true,
      toEmail: true,
      newsletterSendId: true,
      automationExecutionId: true,
    },
  });
}

async function bumpCampaignCounters(input: {
  newsletterSendId: string | null | undefined;
  emailJobId: string | null | undefined;
  type: EmailEventType;
}) {
  const { newsletterSendId, emailJobId, type } = input;
  if (!newsletterSendId) return;

  const counterTypes: EmailEventType[] = [
    "delivered",
    "opened",
    "clicked",
    "bounced",
  ];
  if (!counterTypes.includes(type)) return;

  // Unique engagement per job — first event of this type bumps the campaign
  if (emailJobId) {
    const prior = await prisma.emailEvent.count({
      where: { emailJobId, type },
    });
    if (prior !== 1) return;
  }

  const data =
    type === "delivered"
      ? { deliveredCount: { increment: 1 } }
      : type === "opened"
        ? { openedCount: { increment: 1 } }
        : type === "clicked"
          ? { clickedCount: { increment: 1 } }
          : type === "bounced"
            ? { bouncedCount: { increment: 1 } }
            : null;
  if (!data) return;
  await prisma.newsletterSend
    .update({
      where: { id: newsletterSendId },
      data,
    })
    .catch(() => undefined);
}

/**
 * Idempotent ingest for system emits and provider webhooks.
 * Duplicate (provider, providerEventId) → no-op success.
 */
export async function ingestEmailEvent(
  input: NormalizedEmailEventInput
): Promise<{ ok: boolean; created: boolean; id?: string; reason?: string }> {
  if (!isEmailEventType(input.type)) {
    return { ok: false, created: false, reason: "invalid_type" };
  }
  if (!input.providerEventId?.trim()) {
    return { ok: false, created: false, reason: "missing_provider_event_id" };
  }

  let storeId = input.storeId ?? null;
  let emailJobId = input.emailJobId ?? null;
  let newsletterSendId = input.newsletterSendId ?? null;
  let automationExecutionId = input.automationExecutionId ?? null;
  let toEmail = input.toEmail
    ? normalizeSubscriberEmail(input.toEmail)
    : null;

  if (!storeId || !emailJobId) {
    const linked = await resolveFromProviderMessageId(input.providerMessageId);
    if (linked) {
      storeId = storeId || linked.storeId;
      emailJobId = emailJobId || linked.id;
      newsletterSendId = newsletterSendId || linked.newsletterSendId;
      automationExecutionId =
        automationExecutionId || linked.automationExecutionId;
      toEmail = toEmail || normalizeSubscriberEmail(linked.toEmail);
    }
  }

  if (!storeId) {
    return { ok: false, created: false, reason: "missing_store" };
  }

  const occurredAt = input.occurredAt
    ? new Date(input.occurredAt)
    : new Date();

  try {
    const row = await prisma.emailEvent.create({
      data: {
        storeId,
        type: input.type,
        toEmail,
        emailJobId,
        newsletterSendId,
        automationExecutionId,
        provider: String(input.provider || "system"),
        providerMessageId: input.providerMessageId?.trim() || null,
        providerEventId: input.providerEventId.trim(),
        metadata: (input.metadata ?? undefined) as object | undefined,
        occurredAt: Number.isNaN(occurredAt.getTime()) ? new Date() : occurredAt,
      },
      select: { id: true },
    });

    await bumpCampaignCounters({
      newsletterSendId,
      emailJobId,
      type: input.type,
    });

    // MailHub: mirror engagement onto EmailLog when provider message id is known
    if (input.providerMessageId?.trim()) {
      const statusMap: Record<string, string> = {
        delivered: "delivered",
        opened: "opened",
        clicked: "clicked",
        bounced: "bounced",
        complained: "complained",
        rejected: "rejected",
        failed: "failed",
      };
      const logStatus = statusMap[input.type];
      if (logStatus) {
        const { updateEmailLogStatusByProviderMessage } = await import(
          "@/lib/mailhub/logs"
        );
        await updateEmailLogStatusByProviderMessage({
          providerMessageId: input.providerMessageId.trim(),
          status: logStatus,
          storeId,
        });
      }
    }

    // Mirror bounce/complaint onto suppression list + subscriber status
    if (
      toEmail &&
      (input.type === "bounced" || input.type === "complained")
    ) {
      const { upsertEmailSuppression, inferBounceType } = await import(
        "@/lib/email-marketing/suppression"
      );
      const meta = (input.metadata ?? {}) as Record<string, unknown>;
      const softFlag = meta.soft === true;
      const bounceType =
        input.type === "bounced"
          ? softFlag
            ? "soft"
            : inferBounceType(meta)
          : null;

      await upsertEmailSuppression({
        storeId,
        email: toEmail,
        reason: input.type === "bounced" ? "bounce" : "complaint",
        bounceType,
        source: String(input.provider || "system"),
        metadata: meta,
      });
    }

    if (toEmail && input.type === "unsubscribed") {
      const { upsertEmailSuppression } = await import(
        "@/lib/email-marketing/suppression"
      );
      await upsertEmailSuppression({
        storeId,
        email: toEmail,
        reason: "unsubscribe",
        source: String(input.provider || "system"),
        metadata: (input.metadata ?? {}) as Record<string, unknown>,
      });
    }

    return { ok: true, created: true, id: row.id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: true, created: false, reason: "duplicate" };
    }
    console.error("[email-event/ingest]", error);
    return { ok: false, created: false, reason: "error" };
  }
}

export async function ingestEmailEvents(
  events: NormalizedEmailEventInput[]
): Promise<{ accepted: number; created: number; skipped: number }> {
  let created = 0;
  let skipped = 0;
  for (const event of events) {
    const result = await ingestEmailEvent(event);
    if (result.created) created += 1;
    else skipped += 1;
  }
  return { accepted: events.length, created, skipped };
}

/** Record a successful handoff to the ESP from the queue worker. */
export async function recordEmailJobSent(input: {
  storeId: string;
  emailJobId: string;
  toEmail: string;
  newsletterSendId?: string | null;
  automationExecutionId?: string | null;
  providerMessageId?: string | null;
  provider?: string;
}) {
  const messageId = input.providerMessageId?.trim() || null;

  await ingestEmailEvent({
    type: "sent",
    storeId: input.storeId,
    emailJobId: input.emailJobId,
    newsletterSendId: input.newsletterSendId,
    automationExecutionId: input.automationExecutionId,
    toEmail: input.toEmail,
    provider: "system",
    providerMessageId: messageId,
    providerEventId: `system:sent:${input.emailJobId}`,
    metadata: input.provider
      ? { transport: input.provider }
      : undefined,
  });

  // Provisional delivery = ESP accepted the message. Real ESP webhooks may
  // also emit `delivered` (idempotent per job via unique bump).
  await ingestEmailEvent({
    type: "delivered",
    storeId: input.storeId,
    emailJobId: input.emailJobId,
    newsletterSendId: input.newsletterSendId,
    automationExecutionId: input.automationExecutionId,
    toEmail: input.toEmail,
    provider: "system",
    providerMessageId: messageId,
    providerEventId: `system:delivered:${input.emailJobId}`,
    metadata: {
      provisional: true,
      transport: input.provider || "resend",
    },
  });
}

export async function recordEmailJobFailed(input: {
  storeId: string;
  emailJobId: string;
  toEmail: string;
  newsletterSendId?: string | null;
  automationExecutionId?: string | null;
  error: string;
}) {
  await ingestEmailEvent({
    type: "failed",
    storeId: input.storeId,
    emailJobId: input.emailJobId,
    newsletterSendId: input.newsletterSendId,
    automationExecutionId: input.automationExecutionId,
    toEmail: input.toEmail,
    provider: "system",
    providerEventId: `system:failed:${input.emailJobId}:${Date.now()}`,
    metadata: { error: input.error.slice(0, 500) },
  });
}

export async function recordUnsubscribeEvent(input: {
  storeId: string;
  email: string;
  subscriberId?: string | null;
}) {
  await ingestEmailEvent({
    type: "unsubscribed",
    storeId: input.storeId,
    toEmail: input.email,
    provider: "system",
    providerEventId: `system:unsubscribed:${input.storeId}:${normalizeSubscriberEmail(input.email)}:${Date.now()}`,
    metadata: input.subscriberId
      ? { subscriberId: input.subscriberId }
      : undefined,
  });
}

export { ratePercent };
