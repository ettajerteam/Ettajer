import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import type { ChannelSyncJob } from "@prisma/client";
import type { ChannelSyncOperation } from "@/lib/channels/types";

/** Mirrors lib/email-marketing/email-queue-types.ts backoff shape for consistency. */
export const CHANNEL_SYNC_BATCH_SIZE = 25;
export const CHANNEL_SYNC_MAX_ATTEMPTS = 5;
export const CHANNEL_SYNC_LOCK_STALE_MS = 5 * 60 * 1000;

/** Exponential backoff: 30s, 60s, 120s, 240s, 480s (capped 30m). */
export function computeChannelBackoffMs(attemptAfterFailure: number): number {
  const base = 30_000;
  const ms = base * Math.pow(2, Math.max(0, attemptAfterFailure - 1));
  return Math.min(ms, 30 * 60 * 1000);
}

export interface EnqueueChannelJobInput {
  storeId: string;
  connectionId?: string | null;
  operation: ChannelSyncOperation;
  payload?: Record<string, unknown>;
  idempotencyKey: string;
  maxAttempts?: number;
  availableAt?: Date;
}

/**
 * Enqueue a channel sync job. Relies on ChannelSyncJob.idempotencyKey being
 * @unique — a duplicate enqueue (same key) is treated as a no-op, not an error.
 */
export async function enqueueChannelJob(
  input: EnqueueChannelJobInput
): Promise<{ job: ChannelSyncJob | null; created: boolean }> {
  try {
    const job = await prisma.channelSyncJob.create({
      data: {
        storeId: input.storeId,
        connectionId: input.connectionId ?? null,
        operation: input.operation,
        payload: (input.payload ?? {}) as object,
        idempotencyKey: input.idempotencyKey,
        maxAttempts: input.maxAttempts ?? CHANNEL_SYNC_MAX_ATTEMPTS,
        availableAt: input.availableAt ?? new Date(),
      },
    });
    return { job, created: true };
  } catch (error) {
    const isUniqueConflict =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002";
    if (!isUniqueConflict) throw error;

    const existing = await prisma.channelSyncJob.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    return { job: existing, created: false };
  }
}

/**
 * Atomically claim up to `limit` due jobs for this worker, mirroring the
 * email queue's claim pattern (per-row conditional updateMany + stale-lock
 * takeover) so concurrent workers never double-process a job.
 */
export async function claimChannelJobs(
  limit: number = CHANNEL_SYNC_BATCH_SIZE,
  workerId: string = `w-${randomUUID().slice(0, 8)}`
): Promise<ChannelSyncJob[]> {
  const now = new Date();
  const staleBefore = new Date(now.getTime() - CHANNEL_SYNC_LOCK_STALE_MS);

  const candidates = await prisma.channelSyncJob.findMany({
    where: {
      OR: [
        { status: "queued", availableAt: { lte: now } },
        {
          status: "retrying",
          availableAt: { lte: now },
          attempts: { lt: CHANNEL_SYNC_MAX_ATTEMPTS },
        },
        { status: "processing", lockedAt: { lt: staleBefore } },
      ],
    },
    orderBy: [{ availableAt: "asc" }, { createdAt: "asc" }],
    take: limit,
    select: { id: true, attempts: true },
  });

  const claimed: ChannelSyncJob[] = [];
  for (const candidate of candidates) {
    const fresh = await prisma.channelSyncJob.updateMany({
      where: {
        id: candidate.id,
        attempts: candidate.attempts,
        status: { in: ["queued", "retrying"] },
        availableAt: { lte: now },
      },
      data: {
        status: "processing",
        lockedAt: now,
        lockedBy: workerId,
        attempts: { increment: 1 },
      },
    });

    let ok = fresh.count === 1;
    if (!ok) {
      const stale = await prisma.channelSyncJob.updateMany({
        where: { id: candidate.id, status: "processing", lockedAt: { lt: staleBefore } },
        data: {
          status: "processing",
          lockedAt: now,
          lockedBy: workerId,
          attempts: { increment: 1 },
        },
      });
      ok = stale.count === 1;
    }

    if (ok) {
      const job = await prisma.channelSyncJob.findUnique({ where: { id: candidate.id } });
      if (job) claimed.push(job);
    }
  }

  return claimed;
}

export async function markJobSuccess(jobId: string): Promise<void> {
  await prisma.channelSyncJob.update({
    where: { id: jobId },
    data: {
      status: "success",
      lockedAt: null,
      lockedBy: null,
      lastError: null,
    },
  });
}

/**
 * Record a failure. If the job still has attempts left, schedule a retry with
 * exponential backoff (status "retrying"); otherwise mark it terminally "failed".
 */
export async function markJobRetryOrFail(
  jobId: string,
  attempts: number,
  maxAttempts: number,
  error: string
): Promise<"retrying" | "failed"> {
  const terminal = attempts >= maxAttempts;
  const status = terminal ? "failed" : "retrying";
  const availableAt = terminal
    ? new Date()
    : new Date(Date.now() + computeChannelBackoffMs(attempts));

  await prisma.channelSyncJob.update({
    where: { id: jobId },
    data: {
      status,
      availableAt,
      lockedAt: null,
      lockedBy: null,
      lastError: error.slice(0, 2000),
    },
  });

  return status;
}

/** Force a job to terminal failure regardless of remaining attempts. */
export async function markJobFail(jobId: string, error: string): Promise<void> {
  await prisma.channelSyncJob.update({
    where: { id: jobId },
    data: {
      status: "failed",
      lockedAt: null,
      lockedBy: null,
      lastError: error.slice(0, 2000),
    },
  });
}
