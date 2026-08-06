export const EMAIL_JOB_STATUSES = [
  "pending",
  "scheduled",
  "sending",
  "sent",
  "failed",
  "cancelled",
] as const;

export type EmailJobStatus = (typeof EMAIL_JOB_STATUSES)[number];

export const EMAIL_JOB_KINDS = ["campaign", "automation", "journey"] as const;
export type EmailJobKind = (typeof EMAIL_JOB_KINDS)[number];

export interface EmailJobRenderPayload {
  storeName: string;
  storeSlug: string;
  storePrimaryColor: string | null;
  storeAddress: string | null;
  storeSupportEmail: string | null;
  replyTo: string | null;
  template: {
    themeId: string;
    subject: string;
    title: string;
    body: string;
    ctaLabel: string;
    ctaUrl: string;
    galleryId: string | null;
    /** Product block refs — resolved live at send for price/image sync */
    blocks?: import("@/lib/email-marketing/email-blocks").EmailBlock[];
  };
  storeId?: string;
  currency?: string;
}

export interface EmailJobRow {
  id: string;
  kind: EmailJobKind;
  status: EmailJobStatus;
  toEmail: string;
  subject: string;
  attempts: number;
  maxAttempts: number;
  scheduledAt: string | null;
  availableAt: string;
  lastError: string | null;
  newsletterSendId: string | null;
  automationTrigger: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailQueueStats {
  pending: number;
  scheduled: number;
  sending: number;
  sent: number;
  failed: number;
  cancelled: number;
  total: number;
}

export const EMAIL_QUEUE_BATCH_SIZE = 40;
export const EMAIL_QUEUE_MAX_ATTEMPTS = 5;
export const EMAIL_QUEUE_LOCK_STALE_MS = 5 * 60 * 1000;

/** Exponential backoff: 30s, 60s, 120s, 240s, 480s (capped 30m) */
export function computeBackoffMs(attemptAfterFailure: number): number {
  const base = 30_000;
  const ms = base * Math.pow(2, Math.max(0, attemptAfterFailure - 1));
  return Math.min(ms, 30 * 60 * 1000);
}

export function formatEmailJobStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "scheduled":
      return "Scheduled";
    case "sending":
      return "Sending";
    case "sent":
      return "Sent";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}
