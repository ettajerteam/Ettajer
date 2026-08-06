import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  findUserIdByStripeAccountId,
  syncStripeAccountFromStripe,
} from "@/lib/payments/accounts";
import { fulfillStripePaidOrder } from "@/lib/payments/stripe-fulfill";
import { getStripe, getStripeWebhookSecret } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Stripe Connect + Checkout webhooks.
 * Configure endpoint in Stripe Dashboard → Webhooks:
 *   https://www.ettajer.com/api/webhooks/stripe
 *
 * Events:
 * - account.updated
 * - account.application.deauthorized
 * - checkout.session.completed
 */
export async function POST(request: Request) {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    return NextResponse.json(
      { message: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (error) {
    console.error("Stripe webhook signature failed:", error);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const userId = await findUserIdByStripeAccountId(account.id);
      if (userId) {
        await syncStripeAccountFromStripe(userId, account.id);
      }
    }

    if (event.type === "account.application.deauthorized") {
      const accountId =
        typeof event.account === "string" ? event.account : null;
      if (accountId) {
        const userId = await findUserIdByStripeAccountId(accountId);
        if (userId) {
          await syncStripeAccountFromStripe(userId, accountId);
        }
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId =
        session.metadata?.orderId ||
        (typeof session.client_reference_id === "string"
          ? session.client_reference_id
          : null);
      if (orderId && session.id) {
        await fulfillStripePaidOrder({
          orderId,
          sessionId: session.id,
        }).catch((err) =>
          console.error("[stripe webhook] fulfill failed:", err)
        );
      }
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ message: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
