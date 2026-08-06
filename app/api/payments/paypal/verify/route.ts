import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getPaypalAccessToken } from "@/lib/payments/paypal";
import {
  isPaypalCurrencySupported,
  paypalCurrencyHint,
} from "@/lib/payments/paypal-currency";
import { parsePaymentGateways } from "@/lib/store-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  clientId: z.string().min(1).max(200),
  clientSecret: z.string().max(200).optional().nullable(),
  mode: z.enum(["sandbox", "live"]).optional().default("sandbox"),
});

/** Verify PayPal REST Client ID + Secret with a live OAuth token request. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: true },
  });
  if (!store) {
    return NextResponse.json({ message: "Store not found" }, { status: 404 });
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Client ID is required", ok: false },
      { status: 400 }
    );
  }

  const gateways = parsePaymentGateways(store.settings?.paymentGateways);
  const clientId = parsed.data.clientId.trim();
  const clientSecret =
    parsed.data.clientSecret?.trim() ||
    gateways.paypalClientSecret?.trim() ||
    "";
  const mode = parsed.data.mode === "live" ? "live" : "sandbox";

  if (!clientSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "Secret is required — paste Secret Key 1 from your PayPal app",
      },
      { status: 400 }
    );
  }

  const storeCurrency = store.currency?.toUpperCase() || "MAD";
  if (!isPaypalCurrencySupported(storeCurrency)) {
    return NextResponse.json(
      {
        ok: false,
        message: paypalCurrencyHint(storeCurrency),
      },
      { status: 400 }
    );
  }

  try {
    await getPaypalAccessToken(clientId, clientSecret, mode);
    return NextResponse.json({
      ok: true,
      mode,
      message:
        mode === "live"
          ? "Connected to PayPal Live — credentials work"
          : "Connected to PayPal Sandbox — credentials work",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not connect to PayPal — check Client ID, Secret, and Mode",
      },
      { status: 400 }
    );
  }
}
