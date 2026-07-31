/**
 * Project MailHub — provider kinds & shared types.
 */

export const MAILHUB_PROVIDER_KINDS = [
  "ettajer_managed",
  "resend",
  "postmark",
  "sendgrid",
  "ses",
  "mailgun",
  "brevo",
  "smtp",
] as const;

export type MailHubProviderKind = (typeof MAILHUB_PROVIDER_KINDS)[number];

export const MAILHUB_PROVIDER_LABELS: Record<MailHubProviderKind, string> = {
  ettajer_managed: "Ettajer Managed",
  resend: "Resend",
  postmark: "Postmark",
  sendgrid: "SendGrid",
  ses: "Amazon SES",
  mailgun: "Mailgun",
  brevo: "Brevo",
  smtp: "Custom SMTP",
};

/** Future inbox providers — architecture reserved (SMTP-compatible). */
export const MAILHUB_FUTURE_KINDS = [
  "google_workspace",
  "microsoft_365",
  "zoho",
  "proton",
  "namecheap_private",
  "icloud",
] as const;

export const MAILHUB_PURPOSES = ["marketing", "transactional", "test"] as const;
export type MailHubPurpose = (typeof MAILHUB_PURPOSES)[number];

export const MAILHUB_LOG_STATUSES = [
  "queued",
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "complained",
  "rejected",
  "failed",
] as const;
export type MailHubLogStatus = (typeof MAILHUB_LOG_STATUSES)[number];

export interface MailHubSendMessage {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string | string[];
  headers?: Record<string, string>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    inlineContentId?: string;
  }[];
}

export interface MailHubSendResult {
  success: boolean;
  id?: string;
  error?: string;
  retryable?: boolean;
  provider: MailHubProviderKind;
  latencyMs?: number;
}

export interface MailHubDnsRecord {
  type: "TXT" | "CNAME" | "MX";
  host: string;
  recommendedValue: string;
  valueIncludes: string[];
  purpose: "spf" | "dkim" | "dmarc" | "return_path" | "mx";
}

export interface MailHubConnectionTestResult {
  ok: boolean;
  latencyMs: number;
  message: string;
  providerResponse?: string;
}

export interface MailHubProviderConfig {
  /** API key providers */
  apiKey?: string;
  serverToken?: string;
  /** SES */
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  /** Mailgun */
  domain?: string;
  /** SMTP */
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  encryption?: "ssl" | "tls" | "starttls" | "none";
  /** Shared */
  fromEmail?: string;
  fromName?: string;
  webhookSecret?: string;
}

export interface MailHubAdapter {
  kind: MailHubProviderKind;
  label: string;
  docsUrl?: string;
  send(message: MailHubSendMessage): Promise<MailHubSendResult>;
  testConnection(): Promise<MailHubConnectionTestResult>;
  getDnsRecords(domain: string): MailHubDnsRecord[];
}

export function isMailHubProviderKind(
  value: string
): value is MailHubProviderKind {
  return (MAILHUB_PROVIDER_KINDS as readonly string[]).includes(value);
}

export function formatFromHeader(name: string | null | undefined, email: string) {
  const n = name?.trim();
  if (!n) return email;
  return `${n} <${email}>`;
}
