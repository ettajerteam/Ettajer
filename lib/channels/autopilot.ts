import { prisma } from "@/lib/db";
import { enqueueChannelJob } from "@/lib/channels/sync-queue";
import {
  DEFAULT_CHANNEL_AUTOPILOT,
  type ChannelAutopilotFlags,
} from "@/lib/channels/types";

function toAutopilotFlags(raw: unknown): ChannelAutopilotFlags {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    inventorySync: obj.inventorySync === true,
    orderSync: obj.orderSync === true,
    trackingSync: obj.trackingSync === true,
    priceSync: obj.priceSync === true,
  };
}

/** Hour bucket for idempotent autopilot enqueues (matches 5m cron without flooding). */
function hourBucket(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  return `${y}${m}${d}${h}`;
}

export type AutopilotEnqueueResult = {
  connections: number;
  enqueued: number;
  skipped: number;
};

/**
 * For every CONNECTED Etsy shop with AutoPilot flags on, enqueue sync jobs.
 * Idempotency keys are per connection + operation + UTC hour so the 5-minute
 * cron can safely call this repeatedly without duplicating work.
 */
export async function enqueueAutopilotJobs(
  now = new Date()
): Promise<AutopilotEnqueueResult> {
  const bucket = hourBucket(now);
  const connections = await prisma.channelConnection.findMany({
    where: { channel: "etsy", status: "CONNECTED" },
    select: {
      id: true,
      storeId: true,
      autopilot: true,
    },
  });

  let enqueued = 0;
  let skipped = 0;

  for (const connection of connections) {
    const flags = {
      ...DEFAULT_CHANNEL_AUTOPILOT,
      ...toAutopilotFlags(connection.autopilot),
    };

    const jobs: Array<{
      operation: "sync_orders" | "sync_inventory" | "sync_tracking";
      enabled: boolean;
    }> = [
      { operation: "sync_orders", enabled: flags.orderSync },
      { operation: "sync_inventory", enabled: flags.inventorySync },
      { operation: "sync_tracking", enabled: flags.trackingSync },
    ];

    for (const job of jobs) {
      if (!job.enabled) continue;
      const result = await enqueueChannelJob({
        storeId: connection.storeId,
        connectionId: connection.id,
        operation: job.operation,
        payload: {},
        idempotencyKey: `etsy:${connection.id}:${job.operation}:${bucket}`,
      });
      if (result.created) enqueued += 1;
      else skipped += 1;
    }
  }

  return { connections: connections.length, enqueued, skipped };
}
