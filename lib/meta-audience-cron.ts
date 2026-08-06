import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  normalizeMetaAdAccountId,
  syncMetaCustomAudience,
  type MetaAudienceListType,
} from "@/lib/meta-custom-audiences";
import {
  normalizeMarketingIntegrations,
  parseMarketingIntegrations,
  type MarketingIntegrations,
} from "@/lib/marketing-integrations";

const DEFAULT_MIN_HOURS = 20;

function hoursSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return null;
  return ms / (1000 * 60 * 60);
}

export type StoreAudienceSyncOutcome = {
  storeId: string;
  storeName: string;
  lists: Array<{
    list: MetaAudienceListType;
    status: "synced" | "skipped" | "failed";
    reason?: string;
    uploaded?: number;
    audienceId?: string;
  }>;
};

/** Sync one or both Meta custom audience lists for a store and persist timestamps. */
export async function syncStoreMetaAudienceLists(input: {
  storeId: string;
  storeName: string;
  integrations: MarketingIntegrations;
  lists?: MetaAudienceListType[];
  /** Skip a list if last sync was within this many hours (unless force). */
  minHoursBetween?: number;
  force?: boolean;
}): Promise<{
  integrations: MarketingIntegrations;
  outcome: StoreAudienceSyncOutcome;
}> {
  const meta = input.integrations.meta;
  const lists: MetaAudienceListType[] = input.lists ?? [
    "purchasers",
    "abandoners",
  ];
  const minHours = input.minHoursBetween ?? DEFAULT_MIN_HOURS;
  const outcome: StoreAudienceSyncOutcome = {
    storeId: input.storeId,
    storeName: input.storeName,
    lists: [],
  };

  if (!meta.accessToken) {
    for (const list of lists) {
      outcome.lists.push({
        list,
        status: "skipped",
        reason: "missing_access_token",
      });
    }
    return { integrations: input.integrations, outcome };
  }

  const adAccountId = normalizeMetaAdAccountId(meta.adAccountId);
  if (!adAccountId) {
    for (const list of lists) {
      outcome.lists.push({
        list,
        status: "skipped",
        reason: "missing_ad_account",
      });
    }
    return { integrations: input.integrations, outcome };
  }

  let next = input.integrations;

  for (const list of lists) {
    const lastSyncedAt =
      list === "purchasers"
        ? meta.purchasersAudienceSyncedAt
        : meta.abandonersAudienceSyncedAt;
    const existingAudienceId =
      list === "purchasers"
        ? meta.purchasersAudienceId
        : meta.abandonersAudienceId;

    // Cron / auto: only refresh lists that already exist (or force both).
    if (!input.force && !existingAudienceId) {
      outcome.lists.push({
        list,
        status: "skipped",
        reason: "no_audience_yet",
      });
      continue;
    }

    const age = hoursSince(lastSyncedAt);
    if (!input.force && age != null && age < minHours) {
      outcome.lists.push({
        list,
        status: "skipped",
        reason: `synced_${Math.round(age)}h_ago`,
        audienceId: existingAudienceId ?? undefined,
      });
      continue;
    }

    try {
      const result = await syncMetaCustomAudience({
        storeId: input.storeId,
        storeName: input.storeName,
        accessToken: meta.accessToken,
        adAccountId,
        list,
        existingAudienceId,
      });
      const syncedAt = new Date().toISOString();
      next = normalizeMarketingIntegrations({
        ...next,
        meta: {
          ...next.meta,
          adAccountId: result.adAccountId,
          ...(list === "purchasers"
            ? {
                purchasersAudienceId: result.audienceId,
                purchasersAudienceSyncedAt: syncedAt,
              }
            : {
                abandonersAudienceId: result.audienceId,
                abandonersAudienceSyncedAt: syncedAt,
              }),
        },
      });
      outcome.lists.push({
        list,
        status: "synced",
        uploaded: result.uploaded,
        audienceId: result.audienceId,
      });
    } catch (error) {
      outcome.lists.push({
        list,
        status: "failed",
        reason: error instanceof Error ? error.message : "sync_failed",
        audienceId: existingAudienceId ?? undefined,
      });
    }
  }

  if (JSON.stringify(next) !== JSON.stringify(input.integrations)) {
    const json = next as unknown as Prisma.InputJsonValue;
    await prisma.storeSettings.upsert({
      where: { storeId: input.storeId },
      create: {
        storeId: input.storeId,
        marketingIntegrations: json,
      },
      update: {
        marketingIntegrations: json,
      },
    });
  }

  return { integrations: next, outcome };
}

/** Daily cron: re-sync Meta audiences for stores with auto-sync enabled. */
export async function runMetaAudienceAutoSyncCron(options?: {
  minHoursBetween?: number;
  limit?: number;
}): Promise<{
  scanned: number;
  syncedLists: number;
  skippedLists: number;
  failedLists: number;
  stores: StoreAudienceSyncOutcome[];
}> {
  const limit = options?.limit ?? 100;
  const stores = await prisma.store.findMany({
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      settings: { select: { marketingIntegrations: true } },
    },
  });

  const results: StoreAudienceSyncOutcome[] = [];
  let syncedLists = 0;
  let skippedLists = 0;
  let failedLists = 0;
  let scanned = 0;

  for (const store of stores) {
    const integrations = parseMarketingIntegrations(
      store.settings?.marketingIntegrations
    );
    const meta = integrations.meta;
    if (!meta.audiencesAutoSync) continue;
    if (!meta.accessToken || !meta.adAccountId) continue;
    if (!meta.purchasersAudienceId && !meta.abandonersAudienceId) continue;

    scanned += 1;
    const { outcome } = await syncStoreMetaAudienceLists({
      storeId: store.id,
      storeName: store.name,
      integrations,
      minHoursBetween: options?.minHoursBetween,
      force: false,
    });
    results.push(outcome);
    for (const item of outcome.lists) {
      if (item.status === "synced") syncedLists += 1;
      else if (item.status === "failed") failedLists += 1;
      else skippedLists += 1;
    }
  }

  return {
    scanned,
    syncedLists,
    skippedLists,
    failedLists,
    stores: results,
  };
}
