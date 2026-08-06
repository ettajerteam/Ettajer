import { createHmac, timingSafeEqual } from "crypto";
import type { NormalizedEmailEventInput } from "@/lib/email-marketing/email-analytics-types";
import type { EmailEventType } from "@/lib/email-marketing/email-analytics-types";
import { registerEmailWebhookAdapter } from "@/lib/email-marketing/webhooks/registry";

/**
 * Resend webhook event types → our EmailEvent types.
 * Docs: https://resend.com/docs/dashboard/webhooks/event-types
 */
const RESEND_TYPE_MAP: Record<string, EmailEventType | undefined> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.delivery_delayed": undefined,
  "email.failed": "failed",
};

function mapResendType(type: string): EmailEventType | null {
  return RESEND_TYPE_MAP[type] ?? null;
}

function verifyResendSvix(input: {
  rawBody: string;
  headers: Headers;
  secret: string | undefined;
}): boolean {
  if (!input.secret?.trim()) {
    // Allow ingest in development when secret not set (still need CRON-like care in prod)
    return process.env.NODE_ENV !== "production";
  }

  // Svix-style: whsec_… base64 secret
  const msgId = input.headers.get("svix-id");
  const timestamp = input.headers.get("svix-timestamp");
  const signatureHeader = input.headers.get("svix-signature");
  if (!msgId || !timestamp || !signatureHeader) return false;

  const secret = input.secret.startsWith("whsec_")
    ? input.secret.slice(6)
    : input.secret;
  let key: Buffer;
  try {
    key = Buffer.from(secret, "base64");
  } catch {
    key = Buffer.from(secret, "utf8");
  }

  const signedContent = `${msgId}.${timestamp}.${input.rawBody}`;
  const expected = createHmac("sha256", key)
    .update(signedContent)
    .digest("base64");

  const signatures = signatureHeader.split(" ").map((part) => {
    const [, sig] = part.split(",");
    return sig || part.replace(/^v1,/, "");
  });

  return signatures.some((sig) => {
    try {
      const a = Buffer.from(sig);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

function normalizeResendPayload(payload: unknown): NormalizedEmailEventInput[] {
  if (!payload || typeof payload !== "object") return [];
  const body = payload as {
    type?: string;
    created_at?: string;
    data?: {
      email_id?: string;
      to?: string[] | string;
      bounce?: unknown;
      click?: { link?: string };
      created_at?: string;
    };
  };

  const type = body.type ? mapResendType(body.type) : null;
  if (!type || !body.data?.email_id) return [];

  const toRaw = body.data.to;
  const toEmail = Array.isArray(toRaw)
    ? toRaw[0]
    : typeof toRaw === "string"
      ? toRaw
      : null;

  const occurredAt = body.created_at || body.data.created_at || new Date().toISOString();
  const svixStyleId = `${body.type}:${body.data.email_id}:${occurredAt}`;

  return [
    {
      type,
      provider: "resend",
      providerMessageId: body.data.email_id,
      providerEventId: svixStyleId,
      toEmail,
      occurredAt,
      metadata: {
        resendType: body.type,
        bounce: body.data.bounce ?? null,
        link: body.data.click?.link ?? null,
        soft:
          JSON.stringify(body.data.bounce ?? {})
            .toLowerCase()
            .includes("transient") ||
          JSON.stringify(body.data.bounce ?? {})
            .toLowerCase()
            .includes("soft"),
      },
    },
  ];
}

registerEmailWebhookAdapter({
  provider: "resend",
  verify: verifyResendSvix,
  normalize: ({ payload }) => normalizeResendPayload(payload),
});

export { normalizeResendPayload, verifyResendSvix };
