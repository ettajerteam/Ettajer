import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type MarketingDiagnosticStatus = "ok" | "error" | "skipped";
export type MarketingDiagnosticSource = "storefront" | "cart" | "checkout";

const KEEP_PER_STORE = 150;

export interface RecordMarketingDiagnosticInput {
  storeId: string;
  platform?: string;
  channel?: string;
  eventName: string;
  eventId?: string | null;
  status: MarketingDiagnosticStatus;
  source?: MarketingDiagnosticSource | string | null;
  httpStatus?: number | null;
  error?: string | null;
  testMode?: boolean;
  metadata?: Record<string, unknown> | null;
}

/** Persist a CAPI (or similar) delivery attempt. Fire-and-forget safe. */
export async function recordMarketingEventDiagnostic(
  input: RecordMarketingDiagnosticInput
): Promise<void> {
  try {
    await prisma.marketingEventLog.create({
      data: {
        storeId: input.storeId,
        platform: input.platform ?? "meta",
        channel: input.channel ?? "capi",
        eventName: input.eventName,
        eventId: input.eventId?.trim() || null,
        status: input.status,
        source: input.source ?? null,
        httpStatus: input.httpStatus ?? null,
        error: input.error?.slice(0, 500) || null,
        testMode: Boolean(input.testMode),
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    // Keep a rolling window per store (best-effort prune)
    const overflow = await prisma.marketingEventLog.findMany({
      where: { storeId: input.storeId },
      orderBy: { createdAt: "desc" },
      skip: KEEP_PER_STORE,
      select: { id: true },
      take: 50,
    });
    if (overflow.length > 0) {
      await prisma.marketingEventLog.deleteMany({
        where: { id: { in: overflow.map((row) => row.id) } },
      });
    }
  } catch (error) {
    console.error("[marketing-diagnostics] record failed:", error);
  }
}

export function diagnosticMetadataFromCapi(input: {
  value?: number;
  currency?: string;
  orderId?: string;
  contentIds?: string[];
  numItems?: number;
  reason?: string;
}): Record<string, unknown> {
  const meta: Record<string, unknown> = {};
  if (typeof input.value === "number") meta.value = input.value;
  if (input.currency) meta.currency = input.currency;
  if (input.orderId) meta.orderId = input.orderId;
  if (input.contentIds?.length) meta.contentIds = input.contentIds.slice(0, 20);
  if (typeof input.numItems === "number") meta.numItems = input.numItems;
  if (input.reason) meta.reason = input.reason;
  return meta;
}

export async function listMarketingEventDiagnostics(input: {
  storeId: string;
  status?: MarketingDiagnosticStatus | "all";
  limit?: number;
}) {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const status = input.status && input.status !== "all" ? input.status : undefined;

  const [events, totals] = await Promise.all([
    prisma.marketingEventLog.findMany({
      where: {
        storeId: input.storeId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.marketingEventLog.groupBy({
      by: ["status"],
      where: {
        storeId: input.storeId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      _count: { _all: true },
    }),
  ]);

  const last24h = { ok: 0, error: 0, skipped: 0, total: 0 };
  for (const row of totals) {
    const count = row._count._all;
    last24h.total += count;
    if (row.status === "ok") last24h.ok = count;
    else if (row.status === "error") last24h.error = count;
    else if (row.status === "skipped") last24h.skipped = count;
  }

  return { events, last24h };
}
