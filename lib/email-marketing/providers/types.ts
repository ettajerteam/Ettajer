/**
 * Multi-ESP deliverability types.
 * Supported send providers: Resend, Postmark, SendGrid, Amazon SES.
 */

export const EMAIL_SEND_PROVIDERS = [
  "resend",
  "postmark",
  "sendgrid",
  "ses",
] as const;

export type EmailSendProviderId = (typeof EMAIL_SEND_PROVIDERS)[number];

export const EMAIL_DNS_STATUSES = [
  "unknown",
  "pending",
  "verified",
  "failed",
] as const;
export type EmailDnsStatus = (typeof EMAIL_DNS_STATUSES)[number];

export const EMAIL_SUPPRESSION_REASONS = [
  "bounce",
  "complaint",
  "unsubscribe",
  "manual",
] as const;
export type EmailSuppressionReason = (typeof EMAIL_SUPPRESSION_REASONS)[number];

export interface EmailDnsRecordExpectation {
  type: "TXT" | "CNAME";
  host: string;
  /** Substring or full value that must appear for verification */
  valueIncludes: string[];
  /** Human-readable value merchants should publish */
  recommendedValue: string;
  purpose: "spf" | "dkim" | "dmarc";
}

export interface EmailProviderDnsExpectations {
  provider: EmailSendProviderId;
  records: EmailDnsRecordExpectation[];
  docsUrl?: string;
}

export interface EmailSendMessage {
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

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  /** When true, queue should retry with backoff */
  retryable?: boolean;
  provider: EmailSendProviderId;
}

export type EmailProviderHealth =
  | "configured"
  | "missing_credentials"
  | "degraded"
  | "inactive";

export interface EmailProviderStatus {
  id: EmailSendProviderId;
  label: string;
  configured: boolean;
  active: boolean;
  health: EmailProviderHealth;
  webhookPath: string;
  webhookRegistered: boolean;
  envHints: string[];
  docsUrl?: string;
}

export interface EmailSendAdapter {
  id: EmailSendProviderId;
  label: string;
  docsUrl?: string;
  isConfigured(): boolean;
  getStatus(input?: { webhookRegistered?: boolean }): EmailProviderStatus;
  send(message: EmailSendMessage): Promise<EmailSendResult>;
  getDnsExpectations(domain: string): EmailProviderDnsExpectations;
}

export function isEmailSendProviderId(value: string): value is EmailSendProviderId {
  return (EMAIL_SEND_PROVIDERS as readonly string[]).includes(value);
}

export function parseEmailFromHeader(from: string): {
  email: string;
  domain: string | null;
} {
  const angle = from.match(/<([^>]+)>/);
  const email = (angle?.[1] || from).trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 0) return { email, domain: null };
  return { email, domain: email.slice(at + 1) };
}
