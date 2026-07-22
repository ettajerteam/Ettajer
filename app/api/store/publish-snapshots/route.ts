import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import {
  mergeSeoWithPublishSnapshot,
  parsePublishSnapshots,
  type PublishSnapshot,
} from "@/lib/builder/editor-draft-seo";
import { parseLayoutRevision } from "@/lib/builder/layout-revision";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const snapshots = parsePublishSnapshots(settings?.seo);
    return NextResponse.json({
      snapshots: snapshots.map(({ layouts, theme, navigation, ...meta }) => ({
        ...meta,
        hasLayouts: Boolean(layouts && Object.keys(layouts).length > 0),
        hasTheme: Boolean(theme),
        hasNavigation: Boolean(navigation),
      })),
      revision: parseLayoutRevision(settings?.seo),
    });
  } catch (error) {
    console.error("Publish snapshots list error:", error);
    return NextResponse.json({ message: "Failed to list snapshots" }, { status: 500 });
  }
}

/** Return a full snapshot for restore-into-editor. */
export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action as string;

    if (action === "get") {
      const id = body.id as string;
      const settings = await prisma.storeSettings.findUnique({
        where: { storeId: store.id },
        select: { seo: true },
      });
      const snapshot = parsePublishSnapshots(settings?.seo).find((s) => s.id === id);
      if (!snapshot) {
        return NextResponse.json({ message: "Snapshot not found" }, { status: 404 });
      }
      return NextResponse.json({ snapshot });
    }

    if (action === "record") {
      const snapshot = body.snapshot as PublishSnapshot;
      if (!snapshot?.id || typeof snapshot.revision !== "number") {
        return NextResponse.json({ message: "Invalid snapshot" }, { status: 400 });
      }
      const existing = await prisma.storeSettings.findUnique({
        where: { storeId: store.id },
        select: { seo: true },
      });
      const seo = mergeSeoWithPublishSnapshot(existing?.seo, snapshot);
      await prisma.storeSettings.upsert({
        where: { storeId: store.id },
        create: { storeId: store.id, seo: seo as Prisma.InputJsonValue },
        update: { seo: seo as Prisma.InputJsonValue },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Publish snapshots error:", error);
    return NextResponse.json({ message: "Failed to handle snapshot" }, { status: 500 });
  }
}
