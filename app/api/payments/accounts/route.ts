import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import {
  createStripeConnectOnboardingLink,
  disconnectStripeAccount,
  getPaymentAccount,
  listPaymentAccounts,
  syncStripeAccountFromStripe,
} from "@/lib/payments/accounts";
import { isStripeConnectConfigured } from "@/lib/payments/stripe";
import {
  isStripePaymentsAvailable,
  STRIPE_COMING_SOON_DETAIL,
} from "@/lib/payments/stripe-availability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** List merchant payment accounts + Stripe Connect availability. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const accounts = await listPaymentAccounts(session.user.id);
  return NextResponse.json({
    configured: {
      stripe: isStripeConnectConfigured() && isStripePaymentsAvailable(),
      /** Merchants can enable PayPal at checkout; Connect onboarding comes later. */
      paypal: true,
      payoneer: false,
    },
    stripeComingSoon: !isStripePaymentsAvailable(),
    accounts,
  });
}

/**
 * Body: { action: "connect" | "refresh" | "disconnect", provider?: "stripe" }
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const provider = String(body.provider ?? "stripe");

  if (provider !== "stripe") {
    return NextResponse.json(
      { message: `${provider} connect is not available yet` },
      { status: 400 }
    );
  }

  if (!isStripePaymentsAvailable()) {
    return NextResponse.json(
      { message: STRIPE_COMING_SOON_DETAIL },
      { status: 503 }
    );
  }

  try {
    if (action === "connect") {
      if (!isStripeConnectConfigured()) {
        return NextResponse.json(
          {
            message:
              "Stripe is not configured yet. Add STRIPE_SECRET_KEY, then retry Connect.",
          },
          { status: 503 }
        );
      }
      const link = await createStripeConnectOnboardingLink({
        userId: session.user.id,
        email: session.user.email,
        country: typeof body.country === "string" ? body.country : "MA",
      });
      return NextResponse.json({ url: link.url, accountId: link.accountId });
    }

    if (action === "refresh") {
      const account = await getPaymentAccount(session.user.id, "stripe");
      if (!account) {
        return NextResponse.json(
          { message: "No Stripe account connected" },
          { status: 404 }
        );
      }
      const synced = await syncStripeAccountFromStripe(
        session.user.id,
        account.accountId
      );
      return NextResponse.json({ account: synced });
    }

    if (action === "disconnect") {
      await disconnectStripeAccount(session.user.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Payment account action failed:", error);
    const message =
      error instanceof Error ? error.message : "Payment account action failed";
    // Stripe often rejects MA Express accounts — surface clearly
    return NextResponse.json({ message }, { status: 502 });
  }
}
