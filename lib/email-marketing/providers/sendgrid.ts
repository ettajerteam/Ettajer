import { buildProviderDnsExpectations } from "@/lib/email-marketing/providers/dns-expectations";
import type {
  EmailSendAdapter,
  EmailSendMessage,
  EmailSendResult,
} from "@/lib/email-marketing/providers/types";

function getSendgridKey(): string | undefined {
  return process.env.SENDGRID_API_KEY?.trim();
}

function getFrom(): string {
  return process.env.EMAIL_FROM ?? "Ettajer <noreply@ettajer.com>";
}

function parseFrom(from: string): { email: string; name?: string } {
  const match = from.match(/^(.*)<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() };
  }
  return { email: from.trim() };
}

export const sendgridSendAdapter: EmailSendAdapter = {
  id: "sendgrid",
  label: "SendGrid",
  docsUrl: "https://docs.sendgrid.com/",
  isConfigured: () => Boolean(getSendgridKey()),
  getStatus(input) {
    const configured = Boolean(getSendgridKey());
    return {
      id: "sendgrid",
      label: "SendGrid",
      configured,
      active: false,
      health: configured ? "configured" : "missing_credentials",
      webhookPath: "/api/webhooks/email/sendgrid",
      webhookRegistered: Boolean(input?.webhookRegistered),
      envHints: ["SENDGRID_API_KEY", "SENDGRID_WEBHOOK_SECRET", "EMAIL_FROM"],
      docsUrl: "https://docs.sendgrid.com/",
    };
  },
  async send(message: EmailSendMessage): Promise<EmailSendResult> {
    const key = getSendgridKey();
    if (!key) {
      return {
        success: false,
        error: "SENDGRID_API_KEY not configured",
        retryable: true,
        provider: "sendgrid",
      };
    }

    try {
      const from = parseFrom(message.from ?? getFrom());
      const toList = (Array.isArray(message.to) ? message.to : [message.to]).map(
        (email) => ({ email })
      );
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: toList }],
          from,
          reply_to: message.replyTo
            ? {
                email: Array.isArray(message.replyTo)
                  ? message.replyTo[0]
                  : message.replyTo,
              }
            : undefined,
          subject: message.subject,
          content: [{ type: "text/html", value: message.html }],
          headers: message.headers,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
          success: false,
          error: text.slice(0, 500) || `SendGrid HTTP ${res.status}`,
          retryable: res.status >= 500 || res.status === 429,
          provider: "sendgrid",
        };
      }

      const messageId =
        res.headers.get("x-message-id") ||
        res.headers.get("X-Message-Id") ||
        undefined;

      return {
        success: true,
        id: messageId,
        provider: "sendgrid",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "SendGrid send failed",
        retryable: true,
        provider: "sendgrid",
      };
    }
  },
  getDnsExpectations(domain) {
    return buildProviderDnsExpectations("sendgrid", domain);
  },
};
