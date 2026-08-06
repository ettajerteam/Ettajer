import { NextResponse } from "next/server";
import { z } from "zod";
import { fulfillStripePaidOrder } from "@/lib/payments/stripe-fulfill";
import { retrieveStripeCheckoutSession } from "@/lib/payments/stripe-checkout";
import {
  isStripePaymentsAvailable,
  STRIPE_COMING_SOON_DETAIL,
} from "@/lib/payments/stripe-availability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  sessionId: z.string().min(1),
});

/** Confirm Stripe Checkout after redirect — marks order paid (idempotent). */
export async function POST(request: Request) {
  try {
    if (!isStripePaymentsAvailable()) {
      return NextResponse.json(
        { message: STRIPE_COMING_SOON_DETAIL },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "sessionId required" }, { status: 400 });
    }

    const session = await retrieveStripeCheckoutSession(parsed.data.sessionId);
    const orderId =
      session.metadata?.orderId ||
      (typeof session.client_reference_id === "string"
        ? session.client_reference_id
        : null);

    if (!orderId) {
      return NextResponse.json(
        { message: "No order linked to this Stripe session" },
        { status: 400 }
      );
    }

    const result = await fulfillStripePaidOrder({
      orderId,
      sessionId: parsed.data.sessionId,
      request,
    });

    if (!result) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderNumber: result.orderNumber,
      alreadyPaid: result.alreadyPaid,
    });
  } catch (error) {
    console.error("Stripe confirm failed:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not confirm payment",
      },
      { status: 502 }
    );
  }
}
