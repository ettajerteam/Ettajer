import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { serializeContactSubmission } from "@/lib/contact-submissions";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawLimit = Number(searchParams.get("limit") ?? "50");
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(100, Math.floor(rawLimit)))
      : 50;

    const [submissions, unread] = await Promise.all([
      prisma.contactSubmission.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.contactSubmission.count({
        where: { storeId: store.id, status: "new" },
      }),
    ]);

    const total = await prisma.contactSubmission.count({
      where: { storeId: store.id },
    });

    return NextResponse.json({
      submissions: submissions.map(serializeContactSubmission),
      count: total,
      unread,
    });
  } catch (error) {
    console.error("Contact list error:", error);
    return NextResponse.json(
      { message: "Failed to load messages" },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  action: z.enum(["mark_read", "mark_all_read", "archive"]),
  ids: z.array(z.string().min(1)).optional(),
});

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

    const { action, ids } = parsed.data;

    if (action === "mark_all_read") {
      await prisma.contactSubmission.updateMany({
        where: { storeId: store.id, status: "new" },
        data: { status: "read" },
      });
      return NextResponse.json({ ok: true });
    }

    if (!ids?.length) {
      return NextResponse.json({ message: "ids required" }, { status: 400 });
    }

    const status = action === "archive" ? "archived" : "read";
    await prisma.contactSubmission.updateMany({
      where: { storeId: store.id, id: { in: ids } },
      data: { status },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact patch error:", error);
    return NextResponse.json(
      { message: "Failed to update messages" },
      { status: 500 }
    );
  }
}
