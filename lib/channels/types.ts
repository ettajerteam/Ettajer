/**
 * Shared types for the Ettajer channel integration layer (Etsy Seller OS + future channels).
 * Keep this file framework/DB-agnostic — it mirrors, but does not import, the Prisma schema.
 */

/** Channels with a schema slot today. Only "etsy" has a live adapter for now. */
export const CHANNEL_IDS = [
  "etsy",
  "meta",
  "google",
  "pinterest",
  "tiktok",
  "amazon",
] as const;
export type ChannelId = (typeof CHANNEL_IDS)[number];

export const IMPLEMENTED_CHANNEL_IDS = ["etsy"] as const;
export type ImplementedChannelId = (typeof IMPLEMENTED_CHANNEL_IDS)[number];

export function isChannelId(value: string): value is ChannelId {
  return (CHANNEL_IDS as readonly string[]).includes(value);
}

/** Mirrors ChannelConnection.status in prisma/schema.prisma */
export const CHANNEL_CONNECTION_STATUSES = [
  "CONNECTED",
  "EXPIRED",
  "REAUTH_REQUIRED",
  "DISCONNECTED",
  "ERROR",
] as const;
export type ChannelConnectionStatus = (typeof CHANNEL_CONNECTION_STATUSES)[number];

/** Mirrors ProductChannelListing.status in prisma/schema.prisma */
export const CHANNEL_LISTING_STATUSES = [
  "draft",
  "active",
  "inactive",
  "error",
] as const;
export type ChannelListingStatus = (typeof CHANNEL_LISTING_STATUSES)[number];

/** Mirrors ChannelSyncJob.status in prisma/schema.prisma */
export const CHANNEL_SYNC_JOB_STATUSES = [
  "queued",
  "processing",
  "success",
  "failed",
  "retrying",
] as const;
export type ChannelSyncJobStatus = (typeof CHANNEL_SYNC_JOB_STATUSES)[number];

/** Mirrors ChannelSyncLog.status in prisma/schema.prisma */
export const CHANNEL_SYNC_LOG_STATUSES = [
  "success",
  "failed",
  "skipped",
  "info",
] as const;
export type ChannelSyncLogStatus = (typeof CHANNEL_SYNC_LOG_STATUSES)[number];

/** ChannelSyncJob.operation values used across the channel layer. */
export const CHANNEL_SYNC_OPERATIONS = [
  "import_listings",
  "import_listing",
  "publish_listing",
  "update_listing",
  "sync_inventory",
  "sync_orders",
  "sync_tracking",
  "sync_order_status",
  "refresh_token",
] as const;
export type ChannelSyncOperation = (typeof CHANNEL_SYNC_OPERATIONS)[number];

/** ChannelConnection.autopilot flags (stored as JSON). */
export interface ChannelAutopilotFlags {
  /** Push Ettajer inventory changes to the channel automatically. */
  inventorySync: boolean;
  /** Pull channel orders into Ettajer automatically. */
  orderSync: boolean;
  /** Push fulfillment/tracking updates back to the channel automatically. */
  trackingSync: boolean;
  /** Push Ettajer price changes to the channel automatically. */
  priceSync: boolean;
}

export const DEFAULT_CHANNEL_AUTOPILOT: ChannelAutopilotFlags = {
  inventorySync: false,
  orderSync: false,
  trackingSync: false,
  priceSync: false,
};

/** ChannelConnection.metadata (Etsy) — shop-level facts, never secrets. */
export interface EtsyShopMetadata {
  shopId: string;
  shopName: string;
  shopUrl?: string | null;
  currencyCode?: string | null;
  countryCode?: string | null;
  listingActiveCount?: number | null;
  isVacation?: boolean | null;
  /** Default Etsy shipping profile used when publishing new listings. */
  shippingProfileId?: string | null;
  /** Default return policy when Etsy requires one for activation. */
  returnPolicyId?: string | null;
  raw?: Record<string, unknown>;
}

export type ChannelShopMetadata = EtsyShopMetadata | Record<string, unknown>;

/** Decrypted connection tokens — never persisted or logged as-is. */
export interface ChannelTokenPayload {
  accessToken: string;
  refreshToken?: string | null;
}

/** Public (safe-to-serialize) view of a ChannelConnection row. Never includes tokens. */
export interface ChannelConnectionPublic {
  id: string;
  storeId: string;
  channel: string;
  status: ChannelConnectionStatus;
  externalAccountId: string | null;
  externalShopId: string | null;
  tokenExpiresAt: string | null;
  scopes: string[];
  metadata: ChannelShopMetadata;
  autopilot: ChannelAutopilotFlags;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Etsy Open API v3 listing import readiness classification (see map-listing.ts). */
export const LISTING_IMPORT_READINESS = [
  "ready",
  "needs_review",
  "missing_sku",
  "unsupported",
] as const;
export type ListingImportReadiness = (typeof LISTING_IMPORT_READINESS)[number];
