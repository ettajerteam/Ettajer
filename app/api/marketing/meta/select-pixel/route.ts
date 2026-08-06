import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  META_OAUTH_SESSION_COOKIE,
  decodeMetaOAuthSession,
} from "@/lib/meta-oauth";
import {
  normalizeMarketingIntegrations,
  parseMarketingIntegrations,
} from "@/lib/marketing-integrations";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  pixelId: z.string().regex(/^\d{10,20}$/),
  pixelName: z.string().max(200).optional().nullable(),
  businessId: z.string().max(64).optional().nullable(),
  adAccountId: z.string().max(64).optional().nullable(),
});

/** Persist the pixel chosen after Meta OAuth into store marketing settings. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const raw = cookies().get(META_OAUTH_SESSION_COOKIE)?.value;
  const oauthSession = raw ? decodeMetaOAuthSession(raw) : null;
  if (!oauthSession || oauthSession.userId !== session.user.id) {
    return NextResponse.json(
      { message: "Meta login expired. Connect with Meta again." },
      { status: 401 }
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid pixel selection", errors: parsed.error.flatten() },
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

  const current = parseMarketingIntegrations(store.settings?.marketingIntegrations);
  const next = normalizeMarketingIntegrations({
    ...current,
    meta: {
      ...current.meta,
      enabled: true,
      pixelId: parsed.data.pixelId,
      accessToken: oauthSession.accessToken,
      accountId:
        parsed.data.businessId?.trim() || current.meta.accountId,
      adAccountId:
        parsed.data.adAccountId?.trim() || current.meta.adAccountId,
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
    pixelId: parsed.data.pixelId,
    pixelName: parsed.data.pixelName ?? null,
    integrations: next,
  });
  response.cookies.set(META_OAUTH_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
