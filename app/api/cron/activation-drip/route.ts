import { NextResponse } from "next/server";
import { runMerchantActivationDrip } from "@/lib/admin/activation-drip";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  if (url.searchParams.get("secret") === secret) return true;
  return false;
}

async function handle(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { message: "CRON_SECRET is not set." },
      { status: 503 },
    );
  }
  if (!authorizeCron(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runMerchantActivationDrip();
    return NextResponse.json({
      ok: true,
      cron: "activation-drip",
      ...summary,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/activation-drip]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Activation drip cron failed",
      },
      { status: 500 },
    );
  }
}

/** Daily merchant activation nudges (first product + share store). */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
