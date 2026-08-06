import { createHmac, timingSafeEqual } from "crypto";
import type { NormalizedEmailEventInput } from "@/lib/email-marketing/email-analytics-types";
import type { EmailEventType } from "@/lib/email-marketing/email-analytics-types";
import { registerEmailWebhookAdapter } from "@/lib/email-marketing/webhooks/registry";

/**
 * Postmark webhook — Bounce, SpamComplaint, Delivery, Open, Click, SubscriptionChange.
 * https://postmarkapp.com/developer/webhooks/webhooks-overview
 */
const TYPE_MAP: Record<string, EmailEventType | undefined> = {
  Delivery: "delivered",
  Bounce: "bounced",
  SpamComplaint: "complained",
  Open: "opened",
  Click: "clicked",
  SubscriptionChange: "unsubscribed",
};

function verifyPostmark(input: {
  rawBody: string;
  headers: Headers;
  secret: string | undefined;
}): boolean {
  if (!input.secret?.trim()) {
    return process.env.NODE_ENV !== "production";
  }
  // Optional shared secret via custom header or Basic auth username
  const headerSecret =
    input.headers.get("x-postmark-webhook-secret") ||
    input.headers.get("x-ettajer-webhook-secret");
  if (headerSecret) {
    try {
      const a = Buffer.from(headerSecret);
      const b = Buffer.from(input.secret);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
  // Allow HTTP Basic: secret as password
  const auth = input.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
      const pass = decoded.split(":")[1] ?? decoded;
      const a = Buffer.from(pass);
      const b = Buffer.from(input.secret);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }
  return process.env.NODE_ENV !== "production";
}

function normalizePostmark(payload: unknown): NormalizedEmailEventInput[] {
  if (!payload || typeof payload !== "object") return [];
  const body = payload as Record<string, unknown>;
  const recordType = String(body.RecordType || body.Type || "");
  const type = TYPE_MAP[recordType];
  if (!type) return [];

  const messageId =
    (typeof body.MessageID === "string" && body.MessageID) ||
    (typeof body.MessageId === "string" && body.MessageId) ||
    null;
  const toEmail =
    (typeof body.Email === "string" && body.Email) ||
    (typeof body.Recipient === "string" && body.Recipient) ||
    null;
  const occurredAt =
    (typeof body.DeliveredAt === "string" && body.DeliveredAt) ||
    (typeof body.BouncedAt === "string" && body.BouncedAt) ||
    (typeof body.ReceivedAt === "string" && body.ReceivedAt) ||
    new Date().toISOString();

  const bounceType =
    typeof body.Type === "string"
      ? body.Type
      : typeof body.TypeCode === "number"
        ? body.TypeCode === 1
          ? "HardBounce"
          : "SoftBounce"
        : null;

  return [
    {
      type,
      provider: "postmark",
      providerMessageId: messageId,
      providerEventId: `${recordType}:${messageId || toEmail}:${occurredAt}`,
      toEmail,
      occurredAt,
      metadata: {
        recordType,
        bounceType,
        description: body.Description ?? null,
        soft:
          String(bounceType || "")
            .toLowerCase()
            .includes("soft") || false,
      },
    },
  ];
}

registerEmailWebhookAdapter({
  provider: "postmark",
  verify: verifyPostmark,
  normalize: ({ payload }) => normalizePostmark(payload),
});

export { normalizePostmark, verifyPostmark };
