import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  normalizePath,
  parseUserAgent,
  readRequestGeo,
} from "@/lib/store-analytics";

export const runtime = "nodejs";

interface TrackBody {
  storeSlug?: string;
  path?: string;
  sessionId?: string;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export async function POST(request: Request) {
  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const storeSlug = body.storeSlug?.trim();
  const sessionId = body.sessionId?.trim();
  if (!storeSlug || !sessionId || sessionId.length < 8 || sessionId.length > 80) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const geo = await readRequestGeo();
  const { device, browser } = parseUserAgent(geo.userAgent);
  const path = normalizePath(body.path || "/");

  await prisma.storePageView.create({
    data: {
      storeId: store.id,
      sessionId,
      path,
      referrer: body.referrer?.slice(0, 500) || null,
      utmSource: body.utmSource?.slice(0, 120) || null,
      utmMedium: body.utmMedium?.slice(0, 120) || null,
      utmCampaign: body.utmCampaign?.slice(0, 120) || null,
      country: geo.country?.slice(0, 8) || null,
      city: geo.city ? decodeURIComponent(geo.city).slice(0, 80) : null,
      device,
      browser,
    },
  });

  return NextResponse.json({ ok: true });
}
