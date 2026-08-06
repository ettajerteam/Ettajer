import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listMarketingEventDiagnostics } from "@/lib/marketing-event-diagnostics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Recent Meta CAPI deliveries + 24h counters for the merchant dashboard. */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: { userId: session.user.id },
      select: { id: true, slug: true },
    });
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status") ?? "all";
    const status =
      statusParam === "ok" || statusParam === "error" || statusParam === "skipped"
        ? statusParam
        : "all";

    const { events, last24h } = await listMarketingEventDiagnostics({
      storeId: store.id,
      status,
      limit: 50,
    });

    return NextResponse.json({
      storeSlug: store.slug,
      last24h,
      events: events.map((event) => ({
        id: event.id,
        eventName: event.eventName,
        eventId: event.eventId,
        status: event.status,
        source: event.source,
        channel: event.channel,
        httpStatus: event.httpStatus,
        error: event.error,
        testMode: event.testMode,
        metadata: event.metadata,
        createdAt: event.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[meta/diagnostics]", error);
    const message =
      error instanceof Error ? error.message : "Failed to load diagnostics";
    const needsGenerate =
      /marketingEventLog|MarketingEventLog|does not exist|Unknown arg/i.test(
        message
      );
    return NextResponse.json(
      {
        message: needsGenerate
          ? "Diagnostics table is ready, but Prisma client needs regenerate. Stop the dev server, run npx prisma generate, then restart."
          : message,
      },
      { status: 500 }
    );
  }
}
