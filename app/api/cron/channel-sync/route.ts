import { NextResponse } from "next/server";
import { enqueueAutopilotJobs } from "@/lib/channels/autopilot";
import { CHANNEL_SYNC_BATCH_SIZE, claimChannelJobs } from "@/lib/channels/sync-queue";
import { processChannelJob } from "@/lib/channels/sync-runner";

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
        message: "CRON_SECRET is not set. Add it before enabling the channel sync worker.",
      },
      { status: 503 }
    );
  }

  if (!authorizeCron(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const autopilot = await enqueueAutopilotJobs();
    const jobs = await claimChannelJobs(CHANNEL_SYNC_BATCH_SIZE);
    let success = 0;
    let failed = 0;
    let retrying = 0;

    for (const job of jobs) {
      const result = await processChannelJob(job);
      if (result.status === "success") success += 1;
      else if (result.status === "retrying") retrying += 1;
      else failed += 1;
    }

    return NextResponse.json({
      ok: true,
      autopilot,
      claimed: jobs.length,
      success,
      failed,
      retrying,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/channel-sync]", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Channel sync cron failed",
      },
      { status: 500 }
    );
  }
}

/** Vercel Cron (daily on Hobby) + optional external/GitHub Actions 5-minute pings — enqueue AutoPilot work, then process the channel sync queue */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
