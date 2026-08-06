import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  PINTEREST_OAUTH_NONCE_COOKIE,
  PINTEREST_OAUTH_STATE_COOKIE,
  buildPinterestOAuthAuthorizeUrl,
  createPinterestOAuthState,
  getPinterestOAuthConfigStatus,
  isPinterestOAuthConfigured,
} from "@/lib/pinterest-oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Start Pinterest OAuth — redirects to Pinterest authorize. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  if (!isPinterestOAuthConfigured()) {
    const status = getPinterestOAuthConfigStatus();
    const reason = !status.hasAppId ? "missing_app_id" : "not_configured";
    return NextResponse.redirect(
      new URL(`/dashboard/marketing/pinterest?oauth_error=${reason}`, origin)
    );
  }

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!store) {
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  const nonce = randomBytes(16).toString("hex");
  const state = createPinterestOAuthState({
    userId: session.user.id,
    storeId: store.id,
    nonce,
  });

  const authorizeUrl = buildPinterestOAuthAuthorizeUrl(state);
  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(PINTEREST_OAUTH_STATE_COOKIE, state, cookieOptions(600));
  response.cookies.set(PINTEREST_OAUTH_NONCE_COOKIE, nonce, cookieOptions(600));
  return response;
}
