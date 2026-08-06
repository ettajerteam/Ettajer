import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth-session";
import {
  META_OAUTH_NONCE_COOKIE,
  META_OAUTH_SESSION_COOKIE,
  META_OAUTH_STATE_COOKIE,
  encodeMetaOAuthSession,
  exchangeMetaOAuthCode,
  parseMetaOAuthState,
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

function redirectToMeta(origin: string, query: Record<string, string>) {
  const url = new URL("/dashboard/marketing/meta", origin);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/** Meta OAuth callback — exchange code, stash session, open pixel picker. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const session = await auth();
  if (!session?.user?.id) {
    return redirectToMeta(origin, { oauth_error: "unauthorized" });
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");
  if (error) {
    const description = (errorDescription || "").toLowerCase();
    const oauthError =
      description.includes("invalid scope") || description.includes("invalid_scope")
        ? "invalid_scope"
        : errorReason || error || "denied";
    return redirectToMeta(origin, { oauth_error: oauthError });
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    return redirectToMeta(origin, { oauth_error: "missing_code" });
  }

  const cookieStore = cookies();
  const storedState = cookieStore.get(META_OAUTH_STATE_COOKIE)?.value;
  const storedNonce = cookieStore.get(META_OAUTH_NONCE_COOKIE)?.value;
  if (!storedState || storedState !== state) {
    return redirectToMeta(origin, { oauth_error: "invalid_state" });
  }

  const parsed = parseMetaOAuthState(state);
  if (!parsed || parsed.userId !== session.user.id) {
    return redirectToMeta(origin, { oauth_error: "invalid_state" });
  }
  if (!storedNonce || storedNonce !== parsed.nonce) {
    return redirectToMeta(origin, { oauth_error: "invalid_state" });
  }

  try {
    const tokens = await exchangeMetaOAuthCode(code);
    const oauthSession = encodeMetaOAuthSession({
      userId: session.user.id,
      storeId: parsed.storeId,
      accessToken: tokens.accessToken,
      tokenExpiresAt: tokens.expiresIn
        ? Date.now() + tokens.expiresIn * 1000
        : null,
      createdAt: Date.now(),
    });

    const response = redirectToMeta(origin, { oauth: "picker" });
    response.cookies.set(META_OAUTH_SESSION_COOKIE, oauthSession, cookieOptions(1800));
    response.cookies.set(META_OAUTH_STATE_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
    response.cookies.set(META_OAUTH_NONCE_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
    return response;
  } catch (err) {
    console.error("[meta-oauth/callback]", err);
    return redirectToMeta(origin, {
      oauth_error:
        err instanceof Error ? err.message.slice(0, 80) : "token_exchange_failed",
    });
  }
}
