import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  normalizeMetaAdAccountId,
  syncMetaCustomAudience,
} from "@/lib/meta-custom-audiences";
import {
  normalizeMarketingIntegrations,
  parseMarketingIntegrations,
} from "@/lib/marketing-integrations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  list: z.enum(["purchasers", "abandoners"]),
  adAccountId: z.string().min(1).max(64).optional().nullable(),
});

/** Create/update a Meta Custom Audience from store purchasers or abandoners. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid request", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: { select: { marketingIntegrations: true } } },
  });

  if (!store) {
    return NextResponse.json({ message: "Store not found" }, { status: 404 });
  }

  const current = parseMarketingIntegrations(store.settings?.marketingIntegrations);
  const meta = current.meta;

  if (!meta.accessToken) {
    return NextResponse.json(
      { message: "Connect with Meta first so we can use your access token." },
      { status: 400 }
    );
  }

  const adAccountId = normalizeMetaAdAccountId(
    parsed.data.adAccountId || meta.adAccountId
  );
  if (!adAccountId) {
    return NextResponse.json(
      {
        message:
          "Select a Meta ad account. Custom Audiences are created under an ad account.",
      },
      { status: 400 }
    );
  }

  try {
    const existingAudienceId =
      parsed.data.list === "purchasers"
        ? meta.purchasersAudienceId
        : meta.abandonersAudienceId;

    const result = await syncMetaCustomAudience({
      storeId: store.id,
      storeName: store.name,
      accessToken: meta.accessToken,
      adAccountId,
      list: parsed.data.list,
      existingAudienceId,
    });

    const syncedAt = new Date().toISOString();
    const next = normalizeMarketingIntegrations({
      ...current,
      meta: {
        ...meta,
        adAccountId: result.adAccountId,
        ...(parsed.data.list === "purchasers"
          ? {
              purchasersAudienceId: result.audienceId,
              purchasersAudienceSyncedAt: syncedAt,
            }
          : {
              abandonersAudienceId: result.audienceId,
              abandonersAudienceSyncedAt: syncedAt,
            }),
      },
    });

    const json = next as unknown as Prisma.InputJsonValue;
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        marketingIntegrations: json,
      },
      update: {
        marketingIntegrations: json,
      },
    });

    return NextResponse.json({
      ok: true,
      ...result,
      syncedAt,
      integrations: next,
    });
  } catch (error) {
    console.error("[meta-audiences] sync failed:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to sync Custom Audience with Meta",
      },
      { status: 502 }
    );
  }
}
