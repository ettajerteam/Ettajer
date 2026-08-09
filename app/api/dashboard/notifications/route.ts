import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { parseShopPreferences } from "@/lib/shop-preferences";
import type {
  DashboardNotificationItem,
  DashboardNotificationKind,
  DashboardNotificationSummary,
} from "@/lib/dashboard-notifications";

const KIND_ALERT: Record<
  DashboardNotificationKind,
  "orders" | "orderStatus" | "messages" | "stock" | "abandoned"
> = {
  order: "orders",
  order_status: "orderStatus",
  message: "messages",
  stock: "stock",
  abandoned: "abandoned",
};

const KNOWN_KINDS = new Set<string>(Object.keys(KIND_ALERT));

function isKnownKind(kind: string): kind is DashboardNotificationKind {
  return KNOWN_KINDS.has(kind);
}

const patchSchema = z.object({
  action: z.enum(["open", "mark_all_read", "dismiss", "mark_kind_read"]),
  ids: z.array(z.string().min(1)).optional(),
  kinds: z
    .array(z.enum(["order", "order_status", "message", "stock", "abandoned"]))
    .optional(),
});

function emptySummary(): DashboardNotificationSummary {
  return {
    orders: 0,
    orderStatus: 0,
    messages: 0,
    stock: 0,
    abandoned: 0,
  };
}

function applyKindCount(
  summary: DashboardNotificationSummary,
  kind: DashboardNotificationKind,
  n: number
) {
  if (kind === "order") summary.orders = n;
  else if (kind === "order_status") summary.orderStatus = n;
  else if (kind === "message") summary.messages = n;
  else if (kind === "stock") summary.stock = n;
  else if (kind === "abandoned") summary.abandoned = n;
}

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = Number(searchParams.get("limit") ?? "16");
    const limit = Number.isFinite(rawLimit)
      ? Math.max(5, Math.min(60, Math.floor(rawLimit)))
      : 16;

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const alerts = parseShopPreferences(settings?.seo).alerts;

    const enabledKinds = (
      Object.keys(KIND_ALERT) as DashboardNotificationKind[]
    ).filter((kind) => alerts[KIND_ALERT[kind]]);

    if (enabledKinds.length === 0) {
      return NextResponse.json({
        count: 0,
        unread: 0,
        items: [],
        summary: emptySummary(),
        unreadSummary: emptySummary(),
        alerts: {
          orders: alerts.orders,
          orderStatus: alerts.orderStatus,
          messages: alerts.messages,
          stock: alerts.stock,
          abandoned: alerts.abandoned,
        },
      });
    }

    const rows = await prisma.notification.findMany({
      where: {
        storeId: store.id,
        dismissedAt: null,
        kind: { in: enabledKinds },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        kind: true,
        title: true,
        body: true,
        href: true,
        createdAt: true,
        readAt: true,
      },
    });

    const items: DashboardNotificationItem[] = rows
      .filter((row) => isKnownKind(row.kind))
      .map((row) => ({
        id: row.id,
        kind: row.kind as DashboardNotificationKind,
        title: row.title,
        body: row.body,
        href: row.href || "/dashboard/notifications",
        createdAt: row.createdAt.toISOString(),
        readAt: row.readAt ? row.readAt.toISOString() : null,
      }));

    const kindCounts = await prisma.notification.groupBy({
      by: ["kind"],
      where: {
        storeId: store.id,
        dismissedAt: null,
        kind: { in: enabledKinds },
      },
      _count: { _all: true },
    });

    const unreadRows = await prisma.notification.groupBy({
      by: ["kind"],
      where: {
        storeId: store.id,
        dismissedAt: null,
        readAt: null,
        kind: { in: enabledKinds },
      },
      _count: { _all: true },
    });

    const summary = emptySummary();
    const unreadSummary = emptySummary();

    let totalCount = 0;
    for (const row of kindCounts) {
      const n = row._count._all;
      totalCount += n;
      if (!isKnownKind(row.kind)) continue;
      applyKindCount(summary, row.kind, n);
    }

    let unread = 0;
    for (const row of unreadRows) {
      unread += row._count._all;
      if (!isKnownKind(row.kind)) continue;
      applyKindCount(unreadSummary, row.kind, row._count._all);
    }

    return NextResponse.json({
      count: totalCount,
      unread,
      items,
      summary,
      unreadSummary,
      alerts: {
        orders: alerts.orders,
        orderStatus: alerts.orderStatus,
        messages: alerts.messages,
        stock: alerts.stock,
        abandoned: alerts.abandoned,
      },
    });
  } catch (error) {
    console.error("Dashboard notifications error:", error);
    return NextResponse.json(
      { message: "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const { action, ids, kinds } = parsed.data;
    const now = new Date();

    if (action === "dismiss") {
      if (!ids?.length) {
        return NextResponse.json({ message: "ids required" }, { status: 400 });
      }
      await prisma.notification.updateMany({
        where: {
          storeId: store.id,
          id: { in: ids },
          dismissedAt: null,
        },
        data: { dismissedAt: now, readAt: now },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "mark_kind_read") {
      if (!kinds?.length) {
        return NextResponse.json({ message: "kinds required" }, { status: 400 });
      }
      await prisma.notification.updateMany({
        where: {
          storeId: store.id,
          kind: { in: kinds },
          dismissedAt: null,
          readAt: null,
        },
        data: { readAt: now },
      });
      return NextResponse.json({ ok: true });
    }

    // open with ids → mark those read; mark_all_read (or open without ids) → all
    if (action === "open" && !ids?.length) {
      // Popup opened: client clears badge locally; leave item unread until mark_all / click
      return NextResponse.json({ ok: true });
    }

    if (ids?.length) {
      await prisma.notification.updateMany({
        where: {
          storeId: store.id,
          id: { in: ids },
          dismissedAt: null,
          readAt: null,
        },
        data: { readAt: now },
      });
    } else {
      await prisma.notification.updateMany({
        where: {
          storeId: store.id,
          dismissedAt: null,
          readAt: null,
        },
        data: { readAt: now },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Dashboard notifications patch error:", error);
    return NextResponse.json(
      { message: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
