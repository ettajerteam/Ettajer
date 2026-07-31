import nodemailer from "nodemailer";
import { Resend } from "resend";
import { buildProviderDnsExpectations } from "@/lib/email-marketing/providers/dns-expectations";
import { isEmailSendProviderId } from "@/lib/email-marketing/providers/types";
import {
  formatFromHeader,
  type MailHubAdapter,
  type MailHubDnsRecord,
  type MailHubProviderConfig,
  type MailHubProviderKind,
  type MailHubSendMessage,
  type MailHubSendResult,
  type MailHubConnectionTestResult,
} from "@/lib/mailhub/types";
import {
  getEmailFrom,
  isResendConfigured,
} from "@/lib/resend";

function mapDns(
  kind: MailHubProviderKind,
  domain: string
): MailHubDnsRecord[] {
  if (kind === "smtp" || kind === "ettajer_managed") {
    const platformKind = kind === "ettajer_managed" ? "resend" : "resend";
    if (isEmailSendProviderId(platformKind)) {
      return buildProviderDnsExpectations(platformKind, domain).records.map(
        (r) => ({
          type: r.type,
          host: r.host,
          recommendedValue: r.recommendedValue,
          valueIncludes: r.valueIncludes,
          purpose: r.purpose,
        })
      );
    }
  }
  if (isEmailSendProviderId(kind)) {
    return buildProviderDnsExpectations(kind, domain).records.map((r) => ({
      type: r.type,
      host: r.host,
      recommendedValue: r.recommendedValue,
      valueIncludes: r.valueIncludes,
      purpose: r.purpose,
    }));
  }
  // Generic SPF/DKIM/DMARC guidance for Mailgun/Brevo/SMTP
  return [
    {
      type: "TXT",
      host: domain,
      recommendedValue: `v=spf1 include:${
        kind === "mailgun"
          ? "mailgun.org"
          : kind === "brevo"
            ? "spf.brevo.com"
            : "spf.example.com"
      } ~all`,
      valueIncludes: ["v=spf1"],
      purpose: "spf",
    },
    {
      type: "TXT",
      host: `_dmarc.${domain}`,
      recommendedValue: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`,
      valueIncludes: ["v=DMARC1"],
      purpose: "dmarc",
    },
    {
      type: "TXT",
      host: `mailhub._domainkey.${domain}`,
      recommendedValue: "Publish the DKIM TXT value from your ESP dashboard",
      valueIncludes: ["v=DKIM1", "k=rsa"],
      purpose: "dkim",
    },
  ];
}

function defaultFrom(config: MailHubProviderConfig): string {
  if (config.fromEmail) {
    return formatFromHeader(config.fromName, config.fromEmail);
  }
  return getEmailFrom();
}

async function timedSend(
  kind: MailHubProviderKind,
  fn: () => Promise<{ success: boolean; id?: string; error?: string; retryable?: boolean }>
): Promise<MailHubSendResult> {
  const started = Date.now();
  try {
    const result = await fn();
    return {
      ...result,
      provider: kind,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Send failed",
      retryable: true,
      provider: kind,
      latencyMs: Date.now() - started,
    };
  }
}

export function createMailHubAdapter(
  kind: MailHubProviderKind,
  config: MailHubProviderConfig
): MailHubAdapter {
  if (kind === "ettajer_managed" || kind === "resend") {
    return createResendLikeAdapter(kind, config);
  }
  if (kind === "smtp") {
    return createSmtpAdapter(config);
  }
  if (kind === "mailgun") {
    return createMailgunAdapter(config);
  }
  if (kind === "brevo") {
    return createBrevoAdapter(config);
  }
  if (kind === "postmark") {
    return createPostmarkAdapter(config);
  }
  if (kind === "sendgrid") {
    return createSendgridAdapter(config);
  }
  if (kind === "ses") {
    return createSesAdapter(config);
  }
  return createResendLikeAdapter("resend", config);
}

function createResendLikeAdapter(
  kind: "ettajer_managed" | "resend",
  config: MailHubProviderConfig
): MailHubAdapter {
  const apiKey =
    kind === "ettajer_managed"
      ? process.env.RESEND_API_KEY?.trim() || config.apiKey
      : config.apiKey || process.env.RESEND_API_KEY?.trim();

  return {
    kind,
    label: kind === "ettajer_managed" ? "Ettajer Managed" : "Resend",
    docsUrl: "https://resend.com/docs",
    getDnsRecords: (domain) => mapDns(kind, domain),
    async testConnection(): Promise<MailHubConnectionTestResult> {
      const started = Date.now();
      if (!apiKey) {
        return {
          ok: false,
          latencyMs: 0,
          message: "Missing Resend API key",
        };
      }
      try {
        const resend = new Resend(apiKey);
        // Lightweight authenticated call
        await resend.domains.list();
        return {
          ok: true,
          latencyMs: Date.now() - started,
          message: "Connected to Resend",
          providerResponse: "domains.list ok",
        };
      } catch (error) {
        return {
          ok: false,
          latencyMs: Date.now() - started,
          message: error instanceof Error ? error.message : "Connection failed",
        };
      }
    },
    async send(message: MailHubSendMessage) {
      return timedSend(kind, async () => {
        if (!apiKey) {
          return {
            success: false,
            error:
              kind === "ettajer_managed"
                ? "Ettajer Managed email is not configured"
                : "Resend API key missing",
            retryable: true,
          };
        }
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
          from: message.from ?? defaultFrom(config),
          to: Array.isArray(message.to) ? message.to : [message.to],
          subject: message.subject,
          html: message.html,
          replyTo: message.replyTo
            ? Array.isArray(message.replyTo)
              ? message.replyTo
              : [message.replyTo]
            : undefined,
          headers: message.headers,
          attachments: message.attachments?.map((file) => ({
            filename: file.filename,
            content: file.content,
            contentType: file.contentType,
            inlineContentId: file.inlineContentId,
          })),
        });
        if (error) {
          return { success: false, error: error.message, retryable: true };
        }
        return {
          success: true,
          id: typeof data?.id === "string" ? data.id : undefined,
        };
      });
    },
  };
}

function createSmtpAdapter(config: MailHubProviderConfig): MailHubAdapter {
  function buildTransport() {
    const port = config.port || 587;
    const encryption = config.encryption || "starttls";
    return nodemailer.createTransport({
      host: config.host,
      port,
      secure: encryption === "ssl" || port === 465,
      requireTLS: encryption === "starttls" || encryption === "tls",
      auth:
        config.username && config.password
          ? { user: config.username, pass: config.password }
          : undefined,
    });
  }

  return {
    kind: "smtp",
    label: "Custom SMTP",
    docsUrl: undefined,
    getDnsRecords: (domain) => mapDns("smtp", domain),
    async testConnection() {
      const started = Date.now();
      if (!config.host) {
        return { ok: false, latencyMs: 0, message: "SMTP host required" };
      }
      try {
        const transport = buildTransport();
        await transport.verify();
        return {
          ok: true,
          latencyMs: Date.now() - started,
          message: `SMTP OK · ${config.host}:${config.port || 587}`,
          providerResponse: "verify() succeeded",
        };
      } catch (error) {
        return {
          ok: false,
          latencyMs: Date.now() - started,
          message: error instanceof Error ? error.message : "SMTP failed",
        };
      }
    },
    async send(message) {
      return timedSend("smtp", async () => {
        if (!config.host) {
          return { success: false, error: "SMTP host missing", retryable: false };
        }
        const transport = buildTransport();
        const info = await transport.sendMail({
          from: message.from ?? defaultFrom(config),
          to: message.to,
          subject: message.subject,
          html: message.html,
          replyTo: message.replyTo,
          headers: message.headers,
          attachments: message.attachments?.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
            cid: a.inlineContentId,
          })),
        });
        return {
          success: true,
          id: typeof info.messageId === "string" ? info.messageId : undefined,
        };
      });
    },
  };
}

function createMailgunAdapter(config: MailHubProviderConfig): MailHubAdapter {
  const domain = config.domain;
  const apiKey = config.apiKey;
  return {
    kind: "mailgun",
    label: "Mailgun",
    docsUrl: "https://documentation.mailgun.com/",
    getDnsRecords: (d) => mapDns("mailgun", d),
    async testConnection() {
      const started = Date.now();
      if (!apiKey || !domain) {
        return {
          ok: false,
          latencyMs: 0,
          message: "Mailgun domain and API key required",
        };
      }
      try {
        const auth = Buffer.from(`api:${apiKey}`).toString("base64");
        const res = await fetch(
          `https://api.mailgun.net/v3/domains/${encodeURIComponent(domain)}`,
          { headers: { Authorization: `Basic ${auth}` } }
        );
        if (!res.ok) {
          const text = await res.text();
          return {
            ok: false,
            latencyMs: Date.now() - started,
            message: `Mailgun ${res.status}`,
            providerResponse: text.slice(0, 200),
          };
        }
        return {
          ok: true,
          latencyMs: Date.now() - started,
          message: "Connected to Mailgun",
        };
      } catch (error) {
        return {
          ok: false,
          latencyMs: Date.now() - started,
          message: error instanceof Error ? error.message : "Mailgun failed",
        };
      }
    },
    async send(message) {
      return timedSend("mailgun", async () => {
        if (!apiKey || !domain) {
          return {
            success: false,
            error: "Mailgun credentials missing",
            retryable: false,
          };
        }
        const auth = Buffer.from(`api:${apiKey}`).toString("base64");
        const form = new FormData();
        form.set("from", message.from ?? defaultFrom(config));
        form.set(
          "to",
          Array.isArray(message.to) ? message.to.join(",") : message.to
        );
        form.set("subject", message.subject);
        form.set("html", message.html);
        if (message.replyTo) {
          form.set(
            "h:Reply-To",
            Array.isArray(message.replyTo)
              ? message.replyTo.join(",")
              : message.replyTo
          );
        }
        const res = await fetch(
          `https://api.mailgun.net/v3/${encodeURIComponent(domain)}/messages`,
          {
            method: "POST",
            headers: { Authorization: `Basic ${auth}` },
            body: form,
          }
        );
        const json = (await res.json().catch(() => ({}))) as {
          id?: string;
          message?: string;
        };
        if (!res.ok) {
          return {
            success: false,
            error: json.message || `Mailgun ${res.status}`,
            retryable: res.status >= 500,
          };
        }
        return { success: true, id: json.id };
      });
    },
  };
}

function createBrevoAdapter(config: MailHubProviderConfig): MailHubAdapter {
  const apiKey = config.apiKey;
  return {
    kind: "brevo",
    label: "Brevo",
    docsUrl: "https://developers.brevo.com/",
    getDnsRecords: (d) => mapDns("brevo", d),
    async testConnection() {
      const started = Date.now();
      if (!apiKey) {
        return { ok: false, latencyMs: 0, message: "Brevo API key required" };
      }
      try {
        const res = await fetch("https://api.brevo.com/v3/account", {
          headers: { "api-key": apiKey },
        });
        if (!res.ok) {
          return {
            ok: false,
            latencyMs: Date.now() - started,
            message: `Brevo ${res.status}`,
          };
        }
        return {
          ok: true,
          latencyMs: Date.now() - started,
          message: "Connected to Brevo",
        };
      } catch (error) {
        return {
          ok: false,
          latencyMs: Date.now() - started,
          message: error instanceof Error ? error.message : "Brevo failed",
        };
      }
    },
    async send(message) {
      return timedSend("brevo", async () => {
        if (!apiKey) {
          return {
            success: false,
            error: "Brevo API key missing",
            retryable: false,
          };
        }
        const fromHeader = message.from ?? defaultFrom(config);
        const angle = fromHeader.match(/<([^>]+)>/);
        const email = (angle?.[1] || fromHeader).trim();
        const name = angle
          ? fromHeader.replace(angle[0], "").trim().replace(/^"|"$/g, "")
          : config.fromName || undefined;
        const toList = (Array.isArray(message.to) ? message.to : [message.to]).map(
          (t) => ({ email: t })
        );
        const res = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: { email, name },
            to: toList,
            subject: message.subject,
            htmlContent: message.html,
            replyTo: message.replyTo
              ? {
                  email: Array.isArray(message.replyTo)
                    ? message.replyTo[0]
                    : message.replyTo,
                }
              : undefined,
            headers: message.headers,
          }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          messageId?: string;
          message?: string;
        };
        if (!res.ok) {
          return {
            success: false,
            error: json.message || `Brevo ${res.status}`,
            retryable: res.status >= 500,
          };
        }
        return { success: true, id: json.messageId };
      });
    },
  };
}

function createPostmarkAdapter(config: MailHubProviderConfig): MailHubAdapter {
  const token = config.serverToken || config.apiKey;
  return {
    kind: "postmark",
    label: "Postmark",
    docsUrl: "https://postmarkapp.com/developer",
    getDnsRecords: (d) => mapDns("postmark", d),
    async testConnection() {
      const started = Date.now();
      if (!token) {
        return {
          ok: false,
          latencyMs: 0,
          message: "Postmark server token required",
        };
      }
      try {
        const res = await fetch("https://api.postmarkapp.com/server", {
          headers: {
            Accept: "application/json",
            "X-Postmark-Server-Token": token,
          },
        });
        if (!res.ok) {
          return {
            ok: false,
            latencyMs: Date.now() - started,
            message: `Postmark ${res.status}`,
          };
        }
        return {
          ok: true,
          latencyMs: Date.now() - started,
          message: "Connected to Postmark",
        };
      } catch (error) {
        return {
          ok: false,
          latencyMs: Date.now() - started,
          message: error instanceof Error ? error.message : "Postmark failed",
        };
      }
    },
    async send(message) {
      return timedSend("postmark", async () => {
        if (!token) {
          return {
            success: false,
            error: "Postmark token missing",
            retryable: false,
          };
        }
        const res = await fetch("https://api.postmarkapp.com/email", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Postmark-Server-Token": token,
          },
          body: JSON.stringify({
            From: message.from ?? defaultFrom(config),
            To: Array.isArray(message.to) ? message.to.join(",") : message.to,
            Subject: message.subject,
            HtmlBody: message.html,
            ReplyTo: message.replyTo
              ? Array.isArray(message.replyTo)
                ? message.replyTo.join(",")
                : message.replyTo
              : undefined,
            Headers: message.headers
              ? Object.entries(message.headers).map(([Name, Value]) => ({
                  Name,
                  Value,
                }))
              : undefined,
          }),
        });
        const json = (await res.json().catch(() => ({}))) as {
          MessageID?: string;
          Message?: string;
        };
        if (!res.ok) {
          return {
            success: false,
            error: json.Message || `Postmark ${res.status}`,
            retryable: res.status >= 500,
          };
        }
        return { success: true, id: json.MessageID };
      });
    },
  };
}

function createSendgridAdapter(config: MailHubProviderConfig): MailHubAdapter {
  const apiKey = config.apiKey;
  return {
    kind: "sendgrid",
    label: "SendGrid",
    docsUrl: "https://docs.sendgrid.com/",
    getDnsRecords: (d) => mapDns("sendgrid", d),
    async testConnection() {
      const started = Date.now();
      if (!apiKey) {
        return { ok: false, latencyMs: 0, message: "SendGrid API key required" };
      }
      try {
        const res = await fetch("https://api.sendgrid.com/v3/user/profile", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!res.ok) {
          return {
            ok: false,
            latencyMs: Date.now() - started,
            message: `SendGrid ${res.status}`,
          };
        }
        return {
          ok: true,
          latencyMs: Date.now() - started,
          message: "Connected to SendGrid",
        };
      } catch (error) {
        return {
          ok: false,
          latencyMs: Date.now() - started,
          message: error instanceof Error ? error.message : "SendGrid failed",
        };
      }
    },
    async send(message) {
      return timedSend("sendgrid", async () => {
        if (!apiKey) {
          return {
            success: false,
            error: "SendGrid API key missing",
            retryable: false,
          };
        }
        const fromHeader = message.from ?? defaultFrom(config);
        const angle = fromHeader.match(/<([^>]+)>/);
        const email = (angle?.[1] || fromHeader).trim();
        const name = angle
          ? fromHeader.replace(angle[0], "").trim().replace(/^"|"$/g, "")
          : undefined;
        const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: (Array.isArray(message.to) ? message.to : [message.to]).map(
                  (t) => ({ email: t })
                ),
              },
            ],
            from: { email, name },
            subject: message.subject,
            content: [{ type: "text/html", value: message.html }],
            reply_to: message.replyTo
              ? {
                  email: Array.isArray(message.replyTo)
                    ? message.replyTo[0]
                    : message.replyTo,
                }
              : undefined,
            headers: message.headers,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          return {
            success: false,
            error: text.slice(0, 300) || `SendGrid ${res.status}`,
            retryable: res.status >= 500,
          };
        }
        const id = res.headers.get("x-message-id") || undefined;
        return { success: true, id: id ?? undefined };
      });
    },
  };
}

function createSesAdapter(config: MailHubProviderConfig): MailHubAdapter {
  // Delegate to platform SES when merchant doesn't supply keys
  return {
    kind: "ses",
    label: "Amazon SES",
    docsUrl: "https://docs.aws.amazon.com/ses/",
    getDnsRecords: (d) => mapDns("ses", d),
    async testConnection() {
      const started = Date.now();
      if (!config.accessKeyId || !config.secretAccessKey) {
        // Fall back: check platform SES adapter
        const { sesSendAdapter } = await import(
          "@/lib/email-marketing/providers/ses"
        );
        if (sesSendAdapter.isConfigured()) {
          return {
            ok: true,
            latencyMs: Date.now() - started,
            message: "Using platform SES credentials",
          };
        }
        return {
          ok: false,
          latencyMs: 0,
          message: "SES access key & secret required",
        };
      }
      return {
        ok: true,
        latencyMs: Date.now() - started,
        message: "SES credentials present (send to fully verify)",
      };
    },
    async send(message) {
      // Prefer platform SES adapter (SigV4) — store keys can be set via env for now
      const { sesSendAdapter } = await import(
        "@/lib/email-marketing/providers/ses"
      );
      return timedSend("ses", async () => {
        if (!sesSendAdapter.isConfigured() && !config.accessKeyId) {
          return {
            success: false,
            error: "SES is not configured",
            retryable: true,
          };
        }
        const result = await sesSendAdapter.send({
          ...message,
          from: message.from ?? defaultFrom(config),
        });
        return {
          success: result.success,
          id: result.id,
          error: result.error,
          retryable: result.retryable,
        };
      });
    },
  };
}

export function platformManagedAvailable(): boolean {
  return isResendConfigured();
}
