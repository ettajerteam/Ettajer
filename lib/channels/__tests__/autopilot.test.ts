/**
 * AutoPilot enqueue unit tests (lib/channels/autopilot.ts).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findManyMock, enqueueMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  enqueueMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    channelConnection: {
      findMany: findManyMock,
    },
  },
}));

vi.mock("@/lib/channels/sync-queue", () => ({
  enqueueChannelJob: enqueueMock,
}));

import { enqueueAutopilotJobs } from "@/lib/channels/autopilot";

describe("enqueueAutopilotJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueMock.mockResolvedValue({ created: true, job: { id: "job" } });
  });

  it("enqueues order, inventory, and tracking when flags are on", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "conn_1",
        storeId: "store_1",
        autopilot: {
          orderSync: true,
          inventorySync: true,
          trackingSync: true,
          priceSync: true,
        },
      },
    ]);

    const result = await enqueueAutopilotJobs(new Date("2026-08-12T10:15:00.000Z"));

    expect(result.connections).toBe(1);
    expect(result.enqueued).toBe(3);
    expect(enqueueMock).toHaveBeenCalledTimes(3);

    const operations = enqueueMock.mock.calls.map(
      (call: [{ operation: string }]) => call[0].operation
    );
    expect(operations).toEqual(["sync_orders", "sync_inventory", "sync_tracking"]);
    expect(operations).not.toContain("sync_price");

    const keys = enqueueMock.mock.calls.map(
      (call: [{ idempotencyKey: string }]) => call[0].idempotencyKey
    );
    expect(keys).toEqual([
      "etsy:conn_1:sync_orders:2026081210",
      "etsy:conn_1:sync_inventory:2026081210",
      "etsy:conn_1:sync_tracking:2026081210",
    ]);
  });

  it("skips disabled flags and counts duplicate keys as skipped", async () => {
    findManyMock.mockResolvedValue([
      {
        id: "conn_2",
        storeId: "store_2",
        autopilot: { orderSync: true, inventorySync: false, trackingSync: false },
      },
    ]);
    enqueueMock.mockResolvedValueOnce({ created: false, job: { id: "existing" } });

    const result = await enqueueAutopilotJobs(new Date("2026-08-12T11:00:00.000Z"));

    expect(result.enqueued).toBe(0);
    expect(result.skipped).toBe(1);
    expect(enqueueMock).toHaveBeenCalledTimes(1);
    expect(enqueueMock.mock.calls[0][0].operation).toBe("sync_orders");
  });
});
