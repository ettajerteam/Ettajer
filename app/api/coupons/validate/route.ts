import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateCouponForCheckout } from "@/lib/marketing";
import { z } from "zod";

const validateCouponSchema = z.object({
  storeSlug: z.string().min(1),
  code: z.string().min(1).max(50),
  subtotal: z.number().min(0),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateCouponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { slug: parsed.data.storeSlug },
      select: { id: true, currency: true },
    });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const { coupon, discount } = await validateCouponForCheckout(
      store.id,
      parsed.data.code,
      parsed.data.subtotal
    );

    return NextResponse.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      currency: store.currency,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid coupon";
    return NextResponse.json({ message }, { status: 400 });
  }
}
