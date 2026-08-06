import { NextResponse } from "next/server";
import { runEmailQueueWorker } from "@/lib/email-marketing/email-queue";

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
      {
        message:
          "CRON_SECRET is not set. Add it before enabling the email queue worker.",
      },
      { status: 503 }
    );
  }

  if (!authorizeCron(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runEmailQueueWorker();
    return NextResponse.json({
      ok: true,
      ...summary,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/email-queue]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Email queue cron failed",
      },
      { status: 500 }
    );
  }
}

/** Vercel Cron — process marketing email queue every minute */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
