export const EMAIL_EVENT_TYPES = [
  "sent",
  "delivered",
  "opened",
  "clicked",
  "bounced",
  "complained",
  "unsubscribed",
  "failed",
] as const;

export type EmailEventType = (typeof EMAIL_EVENT_TYPES)[number];

export const EMAIL_EVENT_PROVIDERS = [
  "system",
  "resend",
  "sendgrid",
  "ses",
  "postmark",
  "mailgun",
] as const;

export type EmailEventProvider = (typeof EMAIL_EVENT_PROVIDERS)[number] | string;

/** Normalized webhook / system event — all providers map into this shape. */
export interface NormalizedEmailEventInput {
  type: EmailEventType;
  toEmail?: string | null;
  storeId?: string | null;
  emailJobId?: string | null;
  newsletterSendId?: string | null;
  automationExecutionId?: string | null;
  provider: EmailEventProvider;
  providerMessageId?: string | null;
  /** Required for idempotent ingest */
  providerEventId: string;
  metadata?: Record<string, unknown> | null;
  occurredAt?: Date | string | null;
}

export interface EmailAnalyticsSummary {
  sent: number;
  delivered: number;
  failed: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  ctr: number;
}

export interface EmailAnalyticsDailyPoint {
  date: string;
  sends: number;
  opens: number;
  clicks: number;
}

export interface EmailCampaignAnalyticsRow {
  id: string;
  subject: string;
  status: string;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  openRate: number;
  ctr: number;
  createdAt: string;
}

export function ratePercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function emptyEmailAnalyticsSummary(): EmailAnalyticsSummary {
  return {
    sent: 0,
    delivered: 0,
    failed: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    ctr: 0,
  };
}
