import { buildProviderDnsExpectations } from "@/lib/email-marketing/providers/dns-expectations";
import type {
  EmailSendAdapter,
  EmailSendMessage,
  EmailSendResult,
} from "@/lib/email-marketing/providers/types";

function getPostmarkToken(): string | undefined {
  return (
    process.env.POSTMARK_SERVER_TOKEN?.trim() ||
    process.env.POSTMARK_API_KEY?.trim()
  );
}

function getFrom(): string {
  return process.env.EMAIL_FROM ?? "Ettajer <noreply@ettajer.com>";
}

export const postmarkSendAdapter: EmailSendAdapter = {
  id: "postmark",
  label: "Postmark",
  docsUrl: "https://postmarkapp.com/developer",
  isConfigured: () => Boolean(getPostmarkToken()),
  getStatus(input) {
    const configured = Boolean(getPostmarkToken());
    return {
      id: "postmark",
      label: "Postmark",
      configured,
      active: false,
      health: configured ? "configured" : "missing_credentials",
      webhookPath: "/api/webhooks/email/postmark",
      webhookRegistered: Boolean(input?.webhookRegistered),
      envHints: [
        "POSTMARK_SERVER_TOKEN",
        "POSTMARK_WEBHOOK_SECRET",
        "EMAIL_FROM",
      ],
      docsUrl: "https://postmarkapp.com/developer",
    };
  },
  async send(message: EmailSendMessage): Promise<EmailSendResult> {
    const token = getPostmarkToken();
    if (!token) {
      return {
        success: false,
        error: "POSTMARK_SERVER_TOKEN not configured",
        retryable: true,
        provider: "postmark",
      };
    }

    try {
      const to = Array.isArray(message.to) ? message.to.join(",") : message.to;
      const res = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Postmark-Server-Token": token,
        },
        body: JSON.stringify({
          From: message.from ?? getFrom(),
          To: to,
          Subject: message.subject,
          HtmlBody: message.html,
          ReplyTo: Array.isArray(message.replyTo)
            ? message.replyTo[0]
            : message.replyTo,
          Headers: message.headers
            ? Object.entries(message.headers).map(([Name, Value]) => ({
                Name,
                Value,
              }))
            : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        MessageID?: string;
        Message?: string;
      };
      if (!res.ok) {
        return {
          success: false,
          error: data.Message || `Postmark HTTP ${res.status}`,
          retryable: res.status >= 500 || res.status === 429,
          provider: "postmark",
        };
      }
      return {
        success: true,
        id: data.MessageID,
        provider: "postmark",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Postmark send failed",
        retryable: true,
        provider: "postmark",
      };
    }
  },
  getDnsExpectations(domain) {
    return buildProviderDnsExpectations("postmark", domain);
  },
};
