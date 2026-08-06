import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthenticatedStore } from "@/lib/products";
import { ordersToCsv } from "@/lib/orders";
import { isValidOrderStatus } from "@/lib/validations/order";

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const search = searchParams.get("search")?.trim();

    const where: Record<string, unknown> = {
      storeId: store.id,
      status: { not: "draft" },
    };

    if (status && status !== "all" && isValidOrderStatus(status)) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as Record<string, Date>).lte = end;
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        orderNumber: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        total: true,
        subtotal: true,
        shipping: true,
        tax: true,
        discount: true,
        couponCode: true,
        refundedAmount: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const csv = ordersToCsv(
      orders.map((o) => ({
        ...o,
        itemCount: o._count.items,
      })),
      store.currency
    );

    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders-${store.slug}-${stamp}.csv"`,
      },
    });
  } catch (error) {
    console.error("Orders export error:", error);
    return NextResponse.json({ message: "Failed to export orders" }, { status: 500 });
  }
}
