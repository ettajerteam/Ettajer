import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  serializeCoupon,
  updateCoupon,
  getCouponStats,
} from "@/lib/marketing";

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const [coupons, stats] = await Promise.all([
      listCoupons(store.id),
      getCouponStats(store.id),
    ]);
    return NextResponse.json({
      coupons: coupons.map(serializeCoupon),
      stats,
      currency: store.currency,
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const coupon = await createCoupon(store.id, {
      code: body.code,
      type: body.type === "fixed" ? "fixed" : "percentage",
      value: Number(body.value),
      minPurchase: body.minPurchase ? Number(body.minPurchase) : undefined,
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });

    return NextResponse.json({ coupon: serializeCoupon(coupon) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });

    const body = await request.json();
    const coupon = await updateCoupon(id, store.id, {
      code: body.code,
      type: body.type === "fixed" ? "fixed" : body.type === "percentage" ? "percentage" : undefined,
      value: body.value != null ? Number(body.value) : undefined,
      minPurchase: body.minPurchase != null ? Number(body.minPurchase) : body.minPurchase === null ? null : undefined,
      maxDiscount: body.maxDiscount != null ? Number(body.maxDiscount) : body.maxDiscount === null ? null : undefined,
      usageLimit: body.usageLimit != null ? Number(body.usageLimit) : body.usageLimit === null ? null : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : body.expiresAt === null ? null : undefined,
    });

    return NextResponse.json({ coupon: serializeCoupon(coupon) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });

    await deleteCoupon(id, store.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
