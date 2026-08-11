import { prisma } from "@/lib/db";
import {
  decryptChannelTokens,
  encryptChannelTokens,
} from "@/lib/channels/crypto";
import {
  DEFAULT_CHANNEL_AUTOPILOT,
  type ChannelAutopilotFlags,
  type ChannelConnectionPublic,
  type ChannelConnectionStatus,
  type ChannelShopMetadata,
  type ChannelTokenPayload,
} from "@/lib/channels/types";
import type { ChannelConnection } from "@prisma/client";

const ETSY_CHANNEL = "etsy";

function toAutopilotFlags(raw: unknown): ChannelAutopilotFlags {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    inventorySync: obj.inventorySync === true,
    orderSync: obj.orderSync === true,
    trackingSync: obj.trackingSync === true,
    priceSync: obj.priceSync === true,
  };
}

function toShopMetadata(raw: unknown): ChannelShopMetadata {
  if (raw && typeof raw === "object") return raw as ChannelShopMetadata;
  return {};
}

/** Public projection of a ChannelConnection row. Never includes tokens. */
export function serializeConnectionPublic(
  connection: ChannelConnection
): ChannelConnectionPublic {
  return {
    id: connection.id,
    storeId: connection.storeId,
    channel: connection.channel,
    status: connection.status as ChannelConnectionStatus,
    externalAccountId: connection.externalAccountId,
    externalShopId: connection.externalShopId,
    tokenExpiresAt: connection.tokenExpiresAt
      ? connection.tokenExpiresAt.toISOString()
      : null,
    scopes: connection.scopes,
    metadata: toShopMetadata(connection.metadata),
    autopilot: toAutopilotFlags(connection.autopilot),
    lastSyncAt: connection.lastSyncAt ? connection.lastSyncAt.toISOString() : null,
    lastError: connection.lastError,
    createdAt: connection.createdAt.toISOString(),
    updatedAt: connection.updatedAt.toISOString(),
  };
}

/**
 * Fetch the (single) Etsy connection for a store, if any.
 * `@@unique([storeId, channel, externalShopId])` allows multiple Etsy shops per
 * store in theory, but today the product only supports one — return the most
 * recently updated non-disconnected connection, falling back to the latest overall.
 */
export async function getEtsyConnectionForStore(
  storeId: string
): Promise<ChannelConnection | null> {
  const connections = await prisma.channelConnection.findMany({
    where: { storeId, channel: ETSY_CHANNEL },
    orderBy: { updatedAt: "desc" },
  });
  if (connections.length === 0) return null;
  const active = connections.find((c) => c.status !== "DISCONNECTED");
  return active ?? connections[0];
}

/** Fetch a connection by id, scoped to the owning store (tenant check). */
export async function getConnectionForStore(
  storeId: string,
  connectionId: string
): Promise<ChannelConnection | null> {
  const connection = await prisma.channelConnection.findUnique({
    where: { id: connectionId },
  });
  if (!connection || connection.storeId !== storeId) return null;
  return connection;
}

/** Decrypt the stored OAuth tokens for a connection. Returns null if disconnected. */
export function getConnectionTokens(
  connection: Pick<ChannelConnection, "accessTokenEncrypted" | "refreshTokenEncrypted">
): ChannelTokenPayload | null {
  return decryptChannelTokens(connection);
}

export interface UpsertConnectedEtsyConnectionInput {
  storeId: string;
  externalAccountId: string;
  externalShopId: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt: Date;
  scopes: string[];
  shopMetadata: ChannelShopMetadata;
}

/**
 * Create or reconnect the Etsy ChannelConnection for a store+shop pair.
 * Always encrypts tokens before persisting; preserves existing autopilot
 * preferences on reconnect instead of resetting them.
 */
export async function upsertConnectedEtsyConnection(
  input: UpsertConnectedEtsyConnectionInput
): Promise<ChannelConnection> {
  const { accessTokenEncrypted, refreshTokenEncrypted } = encryptChannelTokens({
    accessToken: input.accessToken,
    refreshToken: input.refreshToken ?? null,
  });

  const existing = await prisma.channelConnection.findUnique({
    where: {
      storeId_channel_externalShopId: {
        storeId: input.storeId,
        channel: ETSY_CHANNEL,
        externalShopId: input.externalShopId,
      },
    },
  });

  const data = {
    storeId: input.storeId,
    channel: ETSY_CHANNEL,
    status: "CONNECTED" as ChannelConnectionStatus,
    externalAccountId: input.externalAccountId,
    externalShopId: input.externalShopId,
    accessTokenEncrypted,
    refreshTokenEncrypted,
    tokenExpiresAt: input.expiresAt,
    scopes: input.scopes,
    metadata: input.shopMetadata as object,
    lastError: null,
  };

  if (existing) {
    return prisma.channelConnection.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.channelConnection.create({
    data: {
      ...data,
      autopilot: DEFAULT_CHANNEL_AUTOPILOT as object,
    },
  });
}

/**
 * Disconnect a channel connection: clear tokens, keep history/metadata for
 * re-auth and auditing. Tenant-scoped via storeId.
 */
export async function disconnectConnection(
  storeId: string,
  connectionId: string
): Promise<ChannelConnection | null> {
  const connection = await getConnectionForStore(storeId, connectionId);
  if (!connection) return null;

  return prisma.channelConnection.update({
    where: { id: connectionId },
    data: {
      status: "DISCONNECTED",
      accessTokenEncrypted: null,
      refreshTokenEncrypted: null,
      tokenExpiresAt: null,
    },
  });
}

/** Merge autopilot flag updates for a connection. Tenant-scoped via storeId. */
export async function updateAutopilot(
  storeId: string,
  connectionId: string,
  flags: Partial<ChannelAutopilotFlags>
): Promise<ChannelConnection | null> {
  const connection = await getConnectionForStore(storeId, connectionId);
  if (!connection) return null;

  const merged: ChannelAutopilotFlags = {
    ...toAutopilotFlags(connection.autopilot),
    ...flags,
  };

  return prisma.channelConnection.update({
    where: { id: connectionId },
    data: { autopilot: merged as object },
  });
}

/** Mark a connection as needing re-auth (e.g. refresh token revoked/expired). */
export async function markConnectionReauthRequired(
  connectionId: string,
  lastError?: string | null
): Promise<void> {
  await prisma.channelConnection.update({
    where: { id: connectionId },
    data: {
      status: "REAUTH_REQUIRED",
      lastError: lastError ? lastError.slice(0, 2000) : null,
    },
  });
}

/** Persist a rotated access/refresh token pair after a successful refresh. */
export async function updateConnectionTokens(
  connectionId: string,
  tokens: { accessToken: string; refreshToken?: string | null; expiresAt: Date }
): Promise<void> {
  const { accessTokenEncrypted, refreshTokenEncrypted } = encryptChannelTokens({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? null,
  });
  await prisma.channelConnection.update({
    where: { id: connectionId },
    data: {
      accessTokenEncrypted,
      ...(tokens.refreshToken ? { refreshTokenEncrypted } : {}),
      tokenExpiresAt: tokens.expiresAt,
      status: "CONNECTED",
      lastError: null,
    },
  });
}

export async function touchConnectionSync(
  connectionId: string,
  outcome: { success: boolean; error?: string | null }
): Promise<void> {
  await prisma.channelConnection.update({
    where: { id: connectionId },
    data: {
      lastSyncAt: new Date(),
      lastError: outcome.success ? null : (outcome.error ?? "Sync failed").slice(0, 2000),
      ...(outcome.success ? {} : { status: "ERROR" }),
    },
  });
}
