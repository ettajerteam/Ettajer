import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import {
  getEtsyConnectionForStore,
  serializeConnectionPublic,
  updateAutopilot,
} from "@/lib/channels/connection-service";

export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    inventorySync: z.boolean().optional(),
    orderSync: z.boolean().optional(),
    trackingSync: z.boolean().optional(),
    priceSync: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No changes provided" });

export async function PATCH(request: Request) {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const connection = await getEtsyConnectionForStore(store.id);
  if (!connection) {
    return NextResponse.json({ message: "No Etsy connection found" }, { status: 404 });
  }

  const updated = await updateAutopilot(store.id, connection.id, parsed.data);
  if (!updated) {
    return NextResponse.json({ message: "Failed to update autopilot settings" }, { status: 500 });
  }

  return NextResponse.json({ connection: serializeConnectionPublic(updated) });
}
