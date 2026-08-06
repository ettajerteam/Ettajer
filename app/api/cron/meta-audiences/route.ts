import { NextResponse } from "next/server";
import { runMetaAudienceAutoSyncCron } from "@/lib/meta-audience-cron";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("secret") === secret) return true;

  // Vercel Cron sends this header; still require CRON_SECRET match via Authorization when set by Vercel.
  const vercelCron = request.headers.get("x-vercel-cron");
  if (vercelCron && authHeader === `Bearer ${secret}`) return true;

  return false;
}

async function handle(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      {
        message:
          "CRON_SECRET is not set. Add it to the environment before enabling audience auto-sync.",
      },
      { status: 503 }
    );
  }

  if (!authorizeCron(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runMetaAudienceAutoSyncCron();
    return NextResponse.json({
      ok: true,
      ...summary,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/meta-audiences]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Audience cron failed",
      },
      { status: 500 }
    );
  }
}

/** Vercel Cron / manual scheduler entry for Meta Custom Audience re-sync. */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
