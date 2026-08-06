import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scoreStoreIntelligence } from "@/lib/email-marketing/atlas/intelligence";
import { attributeStoreCampaigns } from "@/lib/email-marketing/atlas/attribution";
import { runJourneyWorker } from "@/lib/email-marketing/atlas/journey-runner";
import { evaluateAndPromoteWinners } from "@/lib/email-marketing/atlas/experiments";
import { ensurePredictiveSegments } from "@/lib/email-marketing/atlas/predictive-segments";

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
      { status: 503 }
    );
  }
  if (!authorizeCron(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const stores = await prisma.store.findMany({
      select: { id: true },
      take: 50,
      orderBy: { updatedAt: "desc" },
    });

    let scored = 0;
    let attributed = 0;
    let segmentsCreated = 0;
    let experimentsPromoted = 0;

    for (const store of stores) {
      const intel = await scoreStoreIntelligence(store.id, 80);
      scored += intel.scored;
      const attr = await attributeStoreCampaigns(store.id, 15);
      attributed += attr.updated;
      const segs = await ensurePredictiveSegments(store.id);
      segmentsCreated += segs.created;
      const exp = await evaluateAndPromoteWinners(store.id);
      experimentsPromoted += exp.promoted;
    }

    const journeys = await runJourneyWorker({ batchSize: 50 });

    return NextResponse.json({
      ok: true,
      stores: stores.length,
      scored,
      attributed,
      segmentsCreated,
      experimentsPromoted,
      journeys,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/email-atlas]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Atlas cron failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
