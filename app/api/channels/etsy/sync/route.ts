import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { getEtsyConnectionForStore } from "@/lib/channels/connection-service";
import { enqueueChannelJob } from "@/lib/channels/sync-queue";
import type { ChannelSyncOperation } from "@/lib/channels/types";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  operation: z.enum(["sync_orders", "sync_inventory", "import_listings", "full"]),
});

type RequestedOperation = z.infer<typeof bodySchema>["operation"];

const OPERATION_TO_JOBS: Record<RequestedOperation, ChannelSyncOperation[]> = {
  sync_orders: ["sync_orders"],
  sync_inventory: ["sync_inventory"],
  import_listings: ["import_listings"],
  full: ["import_listings", "sync_inventory", "sync_orders"],
};

/** Enqueues background sync job(s) for the merchant's Etsy connection (processed by the cron worker). */
export async function POST(request: Request) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid operation" },
      { status: 400 }
    );
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection || connection.status === "DISCONNECTED") {
    return NextResponse.json({ message: "Connect your Etsy shop first" }, { status: 400 });
  }

  const operations = OPERATION_TO_JOBS[parsed.data.operation];
  const enqueued = [];
  for (const operation of operations) {
    const { job, created } = await enqueueChannelJob({
      storeId: store.id,
      connectionId: connection.id,
      operation,
      idempotencyKey: `manual:${connection.id}:${operation}:${randomUUID()}`,
    });
    enqueued.push({ operation, jobId: job?.id ?? null, created });
  }

  return NextResponse.json({ ok: true, enqueued });
}
