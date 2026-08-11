/**
 * Channel sync queue unit tests (lib/channels/sync-queue.ts).
 *
 * enqueueChannelJob / markJobRetryOrFail hit prisma, so we mock @/lib/db
 * (same pattern as lib/academy/market/__tests__/market-saves.test.ts) rather
 * than requiring a real database. computeChannelBackoffMs is pure and is
 * tested directly.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock, findUniqueMock, updateMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  findUniqueMock: vi.fn(),
  updateMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    channelSyncJob: {
      create: createMock,
      findUnique: findUniqueMock,
      update: updateMock,
    },
  },
}));

import {
  computeChannelBackoffMs,
  enqueueChannelJob,
  markJobRetryOrFail,
  markJobFail,
} from "@/lib/channels/sync-queue";

describe("computeChannelBackoffMs — exponential backoff math", () => {
  it("doubles the delay for each attempt, starting at 30s", () => {
    expect(computeChannelBackoffMs(1)).toBe(30_000);
    expect(computeChannelBackoffMs(2)).toBe(60_000);
    expect(computeChannelBackoffMs(3)).toBe(120_000);
    expect(computeChannelBackoffMs(4)).toBe(240_000);
    expect(computeChannelBackoffMs(5)).toBe(480_000);
  });

  it("caps the backoff at 30 minutes", () => {
    expect(computeChannelBackoffMs(10)).toBe(30 * 60 * 1000);
    expect(computeChannelBackoffMs(100)).toBe(30 * 60 * 1000);
  });

  it("treats non-positive attempt numbers as the first attempt (30s)", () => {
    expect(computeChannelBackoffMs(0)).toBe(30_000);
    expect(computeChannelBackoffMs(-5)).toBe(30_000);
  });

  it("is deterministic for a given attempt number", () => {
    expect(computeChannelBackoffMs(3)).toBe(computeChannelBackoffMs(3));
  });
});

describe("enqueueChannelJob — idempotency via unique key", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new job when the idempotency key is unused", async () => {
    createMock.mockResolvedValue({ id: "job_1", idempotencyKey: "key-1" });

    const result = await enqueueChannelJob({
      storeId: "store_1",
      operation: "import_listings",
      idempotencyKey: "key-1",
    });

    expect(result.created).toBe(true);
    expect(result.job).toEqual({ id: "job_1", idempotencyKey: "key-1" });
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("treats a duplicate idempotency key (P2002) as a no-op and returns the existing job", async () => {
    const conflict = Object.assign(new Error("Unique constraint failed"), {
      code: "P2002",
    });
    createMock.mockRejectedValue(conflict);
    findUniqueMock.mockResolvedValue({ id: "job_existing", idempotencyKey: "key-1" });

    const result = await enqueueChannelJob({
      storeId: "store_1",
      operation: "import_listings",
      idempotencyKey: "key-1",
    });

    expect(result.created).toBe(false);
    expect(result.job).toEqual({ id: "job_existing", idempotencyKey: "key-1" });
    expect(findUniqueMock).toHaveBeenCalledWith({ where: { idempotencyKey: "key-1" } });
  });

  it("re-throws non-conflict database errors instead of swallowing them", async () => {
    createMock.mockRejectedValue(new Error("connection lost"));

    await expect(
      enqueueChannelJob({
        storeId: "store_1",
        operation: "import_listings",
        idempotencyKey: "key-2",
      })
    ).rejects.toThrow("connection lost");
    expect(findUniqueMock).not.toHaveBeenCalled();
  });
});

describe("markJobRetryOrFail — retry backoff scheduling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("schedules a retry with exponential backoff when attempts remain", async () => {
    updateMock.mockResolvedValue({});
    const before = Date.now();

    const status = await markJobRetryOrFail("job_1", 2, 5, "temporary failure");

    expect(status).toBe("retrying");
    expect(updateMock).toHaveBeenCalledTimes(1);
    const call = updateMock.mock.calls[0][0];
    expect(call.where).toEqual({ id: "job_1" });
    expect(call.data.status).toBe("retrying");
    expect(call.data.lastError).toBe("temporary failure");

    const expectedDelay = computeChannelBackoffMs(2); // 60_000ms
    const actualDelay = (call.data.availableAt as Date).getTime() - before;
    expect(actualDelay).toBeGreaterThanOrEqual(expectedDelay - 50);
    expect(actualDelay).toBeLessThan(expectedDelay + 5_000);
  });

  it("marks the job terminally failed once attempts reach maxAttempts", async () => {
    updateMock.mockResolvedValue({});

    const status = await markJobRetryOrFail("job_1", 5, 5, "permanent failure");

    expect(status).toBe("failed");
    const call = updateMock.mock.calls[0][0];
    expect(call.data.status).toBe("failed");
    expect(call.data.lastError).toBe("permanent failure");
  });

  it("marks the job failed when attempts already exceed maxAttempts", async () => {
    updateMock.mockResolvedValue({});
    const status = await markJobRetryOrFail("job_1", 6, 5, "still failing");
    expect(status).toBe("failed");
  });

  it("truncates error messages to 2000 characters before persisting", async () => {
    updateMock.mockResolvedValue({});
    const longError = "x".repeat(3000);

    await markJobRetryOrFail("job_1", 1, 5, longError);

    const call = updateMock.mock.calls[0][0];
    expect((call.data.lastError as string).length).toBe(2000);
  });
});

describe("markJobFail — forced terminal failure", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always sets status to failed regardless of remaining attempts", async () => {
    updateMock.mockResolvedValue({});
    await markJobFail("job_9", "fatal error");

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "job_9" },
      data: {
        status: "failed",
        lockedAt: null,
        lockedBy: null,
        lastError: "fatal error",
      },
    });
  });
});
