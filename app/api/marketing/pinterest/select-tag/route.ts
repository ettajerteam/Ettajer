import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  PINTEREST_OAUTH_SESSION_COOKIE,
  decodePinterestOAuthSession,
} from "@/lib/pinterest-oauth";
import {
  normalizeMarketingIntegrations,
  parseMarketingIntegrations,
} from "@/lib/marketing-integrations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  tagId: z.string().regex(/^\d{10,16}$/),
  tagName: z.string().max(200).optional().nullable(),
  adAccountId: z.string().min(5).max(64),
});

/**
 * Persist Tag + ad account chosen after Pinterest OAuth.
 * Does NOT overwrite Conversions API token (Ads Manager token is separate).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const raw = cookies().get(PINTEREST_OAUTH_SESSION_COOKIE)?.value;
  const oauthSession = raw ? decodePinterestOAuthSession(raw) : null;
  if (!oauthSession || oauthSession.userId !== session.user.id) {
    return NextResponse.json(
      { message: "Pinterest login expired. Connect with Pinterest again." },
      { status: 401 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid tag selection", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const store = await prisma.store.findFirst({
    where: { id: oauthSession.storeId, userId: session.user.id },
    include: { settings: true },
  });
  if (!store) {
    return NextResponse.json({ message: "Store not found" }, { status: 404 });
  }

  const current = parseMarketingIntegrations(
    store.settings?.marketingIntegrations
  );
  const next = normalizeMarketingIntegrations({
    ...current,
    pinterest: {
      ...current.pinterest,
      enabled: true,
      pixelId: parsed.data.tagId,
      accountId: parsed.data.adAccountId.trim(),
      // Keep existing Ads Manager conversion token — OAuth cannot send CAPI events.
      accessToken: current.pinterest.accessToken,
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

  const response = NextResponse.json({
    ok: true,
    tagId: parsed.data.tagId,
    tagName: parsed.data.tagName ?? null,
    adAccountId: parsed.data.adAccountId,
    needsConversionToken: !Boolean(current.pinterest.accessToken?.trim()),
    integrations: next,
  });
  response.cookies.set(PINTEREST_OAUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
