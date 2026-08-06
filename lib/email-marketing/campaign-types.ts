import type { EmailJobRenderPayload } from "@/lib/email-marketing/email-queue-types";

export const CAMPAIGN_STATUSES = [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "archived",
  "cancelled",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Completed",
  archived: "Archived",
  cancelled: "Cancelled",
};

/** UI filter keys including derived "failed" and "completed" aliases. */
export const CAMPAIGN_HISTORY_FILTERS = [
  "all",
  "draft",
  "scheduled",
  "sending",
  "completed",
  "failed",
  "archived",
  "cancelled",
] as const;

export type CampaignHistoryFilter = (typeof CAMPAIGN_HISTORY_FILTERS)[number];

/** Normalize legacy DB values to the current campaign status set. */
export function normalizeCampaignStatus(status: string): CampaignStatus {
  switch (status) {
    case "draft":
    case "scheduled":
    case "sending":
    case "sent":
    case "archived":
    case "cancelled":
      return status;
    case "queued":
      return "sending";
    case "completed":
      return "sent";
    default:
      return "draft";
  }
}

export function formatCampaignStatusLabel(status: string): string {
  const normalized = normalizeCampaignStatus(status);
  return CAMPAIGN_STATUS_LABELS[normalized];
}

/**
 * Presentation status for history UI.
 * "failed" is derived when a finished run delivered nothing and all attempts failed.
 */
export function getCampaignPresentationStatus(row: {
  status: string;
  sentCount: number;
  failedCount: number;
  recipientCount: number;
}): CampaignStatus | "failed" {
  const status = normalizeCampaignStatus(row.status);
  if (
    (status === "sent" || status === "sending") &&
    row.failedCount > 0 &&
    row.sentCount === 0 &&
    row.recipientCount > 0 &&
    row.failedCount >= row.recipientCount
  ) {
    return "failed";
  }
  return status;
}

export function formatCampaignPresentationLabel(
  status: CampaignStatus | "failed" | string
): string {
  if (status === "failed") return "Failed";
  if (status === "completed" || status === "sent") return "Completed";
  return formatCampaignStatusLabel(status);
}

export interface CampaignPayloadSnapshot {
  storeName: string;
  storeSlug: string;
  storePrimaryColor: string | null;
  storeAddress: string | null;
  storeSupportEmail: string | null;
  replyTo: string | null;
  storeId?: string;
  currency?: string;
  template: EmailJobRenderPayload["template"];
}

export interface CampaignRow {
  id: string;
  name: string | null;
  templateId: string;
  subject: string;
  status: CampaignStatus;
  /** Derived for UI badges (may be "failed") */
  presentationStatus: CampaignStatus | "failed";
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  deliveryRate: number;
  scheduledAt: string | null;
  timezone: string | null;
  queuedAt: string | null;
  segmentIds: string[];
  createdAt: string;
  updatedAt: string;
  /** Atlas revenue attribution */
  attributedRevenue: number;
  attributedOrders: number;
  attributedAt: string | null;
  conversionRate: number;
  averageOrderValue: number;
  revenuePerRecipient: number;
  revenuePerEmail: number;
  roi: number;
}

export interface CampaignStatusCounts {
  draft: number;
  scheduled: number;
  sending: number;
  sent: number;
  archived: number;
  cancelled: number;
  failed: number;
  total: number;
}

export interface CampaignListResult {
  campaigns: CampaignRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: CampaignStatusCounts;
}

export interface CampaignTimelineItem {
  id: string;
  type:
    | "draft"
    | "scheduled"
    | "sending"
    | "completed"
    | "failed"
    | "cancelled"
    | "archived"
    | "event";
  label: string;
  detail?: string | null;
  at: string;
  meta?: Record<string, unknown> | null;
}

export interface CampaignRecipientRow {
  id: string;
  email: string;
  status: string;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipientListResult {
  recipients: CampaignRecipientRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}
