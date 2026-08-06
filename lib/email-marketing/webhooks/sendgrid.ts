import { createHmac, timingSafeEqual } from "crypto";
import type { NormalizedEmailEventInput } from "@/lib/email-marketing/email-analytics-types";
import type { EmailEventType } from "@/lib/email-marketing/email-analytics-types";
import { registerEmailWebhookAdapter } from "@/lib/email-marketing/webhooks/registry";

/**
 * SendGrid Event Webhook (JSON batch).
 * https://docs.sendgrid.com/for-developers/tracking-events/event
 */
const TYPE_MAP: Record<string, EmailEventType | undefined> = {
  delivered: "delivered",
  open: "opened",
  click: "clicked",
  bounce: "bounced",
  dropped: "failed",
  spamreport: "complained",
  unsubscribe: "unsubscribed",
  group_unsubscribe: "unsubscribed",
  deferred: undefined,
  processed: "sent",
};

function verifySendgrid(input: {
  rawBody: string;
  headers: Headers;
  secret: string | undefined;
}): boolean {
  if (!input.secret?.trim()) {
    return process.env.NODE_ENV !== "production";
  }
  // Signed Event Webhook: X-Twilio-Email-Event-Webhook-Signature + Timestamp
  const signature = input.headers.get("x-twilio-email-event-webhook-signature");
  const timestamp = input.headers.get("x-twilio-email-event-webhook-timestamp");
  if (!signature || !timestamp) {
    // Fallback shared secret header for simpler setups
    const fallback =
      input.headers.get("x-sendgrid-webhook-secret") ||
      input.headers.get("x-ettajer-webhook-secret");
    if (!fallback) return process.env.NODE_ENV !== "production";
    try {
      const a = Buffer.from(fallback);
      const b = Buffer.from(input.secret);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  try {
    const expected = createHmac("sha256", input.secret)
      .update(timestamp + input.rawBody)
      .digest("base64");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function normalizeSendgrid(payload: unknown): NormalizedEmailEventInput[] {
  const events = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { events?: unknown }).events)
      ? (payload as { events: unknown[] }).events
      : [];

  const out: NormalizedEmailEventInput[] = [];
  for (const item of events) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const sgEvent = String(row.event || "").toLowerCase();
    const type = TYPE_MAP[sgEvent];
    if (!type) continue;

    const messageId =
      (typeof row.sg_message_id === "string" && row.sg_message_id.split(".")[0]) ||
      (typeof row["smtp-id"] === "string" && row["smtp-id"]) ||
      null;
    const toEmail = typeof row.email === "string" ? row.email : null;
    const ts =
      typeof row.timestamp === "number"
        ? new Date(row.timestamp * 1000).toISOString()
        : new Date().toISOString();
    const eventId =
      (typeof row.sg_event_id === "string" && row.sg_event_id) ||
      `${sgEvent}:${messageId || toEmail}:${ts}`;

    const bounceClassification = String(row.type || row.reason || "").toLowerCase();
    out.push({
      type,
      provider: "sendgrid",
      providerMessageId: messageId,
      providerEventId: eventId,
      toEmail,
      occurredAt: ts,
      metadata: {
        event: sgEvent,
        reason: row.reason ?? null,
        bounceType: bounceClassification,
        soft:
          bounceClassification.includes("blocked") ||
          bounceClassification.includes("soft"),
      },
    });
  }
  return out;
}

registerEmailWebhookAdapter({
  provider: "sendgrid",
  verify: verifySendgrid,
  normalize: ({ payload }) => normalizeSendgrid(payload),
});

export { normalizeSendgrid, verifySendgrid };
