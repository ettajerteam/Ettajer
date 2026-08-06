import { createHmac, timingSafeEqual } from "crypto";
import type { NormalizedEmailEventInput } from "@/lib/email-marketing/email-analytics-types";
import type { EmailEventType } from "@/lib/email-marketing/email-analytics-types";
import { registerEmailWebhookAdapter } from "@/lib/email-marketing/webhooks/registry";

/**
 * Amazon SES notifications via SNS HTTP(S) subscription.
 * Accepts SNS SubscriptionConfirmation + Notification envelopes containing
 * Bounce / Complaint / Delivery messages.
 * https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns-contents.html
 */
const TYPE_MAP: Record<string, EmailEventType | undefined> = {
  Bounce: "bounced",
  Complaint: "complained",
  Delivery: "delivered",
  Reject: "failed",
  Open: "opened",
  Click: "clicked",
};

function verifySes(input: {
  rawBody: string;
  headers: Headers;
  secret: string | undefined;
}): boolean {
  if (!input.secret?.trim()) {
    return process.env.NODE_ENV !== "production";
  }
  const headerSecret =
    input.headers.get("x-ses-webhook-secret") ||
    input.headers.get("x-amz-sns-webhook-secret") ||
    input.headers.get("x-ettajer-webhook-secret");
  if (!headerSecret) {
    // Optional HMAC of body when secret configured as signing key
    const sig = input.headers.get("x-ettajer-signature");
    if (!sig) return process.env.NODE_ENV !== "production";
    try {
      const expected = createHmac("sha256", input.secret)
        .update(input.rawBody)
        .digest("hex");
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
  try {
    const a = Buffer.from(headerSecret);
    const b = Buffer.from(input.secret);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function normalizeSesMessage(message: Record<string, unknown>): NormalizedEmailEventInput[] {
  const notificationType = String(
    message.notificationType || message.eventType || ""
  );
  const type = TYPE_MAP[notificationType];
  if (!type) return [];

  const mail = (message.mail || {}) as Record<string, unknown>;
  const messageId =
    typeof mail.messageId === "string" ? mail.messageId : null;
  const destinations = Array.isArray(mail.destination)
    ? (mail.destination as string[])
    : [];

  let toEmail: string | null = destinations[0] ?? null;
  let bounceType: string | null = null;
  let soft = false;

  if (notificationType === "Bounce") {
    const bounce = (message.bounce || {}) as Record<string, unknown>;
    bounceType = typeof bounce.bounceType === "string" ? bounce.bounceType : null;
    soft = String(bounceType || "").toLowerCase() === "transient";
    const recipients = Array.isArray(bounce.bouncedRecipients)
      ? (bounce.bouncedRecipients as Array<{ emailAddress?: string }>)
      : [];
    toEmail = recipients[0]?.emailAddress || toEmail;
  }
  if (notificationType === "Complaint") {
    const complaint = (message.complaint || {}) as Record<string, unknown>;
    const recipients = Array.isArray(complaint.complainedRecipients)
      ? (complaint.complainedRecipients as Array<{ emailAddress?: string }>)
      : [];
    toEmail = recipients[0]?.emailAddress || toEmail;
  }

  const occurredAt =
    (typeof mail.timestamp === "string" && mail.timestamp) ||
    new Date().toISOString();

  return [
    {
      type,
      provider: "ses",
      providerMessageId: messageId,
      providerEventId: `${notificationType}:${messageId || toEmail}:${occurredAt}`,
      toEmail,
      occurredAt,
      metadata: {
        notificationType,
        bounceType,
        soft,
      },
    },
  ];
}

function normalizeSes(payload: unknown): NormalizedEmailEventInput[] {
  if (!payload || typeof payload !== "object") return [];
  const body = payload as Record<string, unknown>;

  // SNS envelope
  if (body.Type === "SubscriptionConfirmation") {
    // Auto-confirm is left to ops; acknowledge without events
    return [];
  }

  if (body.Type === "Notification" && typeof body.Message === "string") {
    try {
      const inner = JSON.parse(body.Message) as Record<string, unknown>;
      return normalizeSesMessage(inner);
    } catch {
      return [];
    }
  }

  // Direct SES event (EventBridge / raw)
  if (body.notificationType || body.eventType) {
    return normalizeSesMessage(body);
  }

  return [];
}

registerEmailWebhookAdapter({
  provider: "ses",
  verify: verifySes,
  normalize: ({ payload }) => normalizeSes(payload),
});

export { normalizeSes, verifySes };
