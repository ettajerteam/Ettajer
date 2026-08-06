import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  META_OAUTH_NONCE_COOKIE,
  META_OAUTH_STATE_COOKIE,
  buildMetaOAuthAuthorizeUrl,
  createMetaOAuthState,
  getMetaOAuthConfigStatus,
  isMetaOAuthConfigured,
} from "@/lib/meta-oauth";

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

/** Start Meta Business OAuth — redirects to Facebook Login. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  if (!isMetaOAuthConfigured()) {
    const status = getMetaOAuthConfigStatus();
    const reason = !status.hasConfigId ? "missing_config_id" : "not_configured";
    return NextResponse.redirect(
      new URL(`/dashboard/marketing/meta?oauth_error=${reason}`, origin)
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
  const state = createMetaOAuthState({
    userId: session.user.id,
    storeId: store.id,
    nonce,
  });

  const authorizeUrl = buildMetaOAuthAuthorizeUrl(state);
  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(META_OAUTH_STATE_COOKIE, state, cookieOptions(600));
  response.cookies.set(META_OAUTH_NONCE_COOKIE, nonce, cookieOptions(600));
  return response;
}
