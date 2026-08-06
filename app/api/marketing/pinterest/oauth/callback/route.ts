import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth-session";
import {
  PINTEREST_OAUTH_NONCE_COOKIE,
  PINTEREST_OAUTH_SESSION_COOKIE,
  PINTEREST_OAUTH_STATE_COOKIE,
  encodePinterestOAuthSession,
  exchangePinterestOAuthCode,
  parsePinterestOAuthState,
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

function redirectToPinterest(origin: string, query: Record<string, string>) {
  const url = new URL("/dashboard/marketing/pinterest", origin);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/** Pinterest OAuth callback — exchange code, stash session, open tag picker. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const session = await auth();
  if (!session?.user?.id) {
    return redirectToPinterest(origin, { oauth_error: "unauthorized" });
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  if (error) {
    return redirectToPinterest(origin, {
      oauth_error: errorDescription || error || "denied",
    });
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!code || !state) {
    return redirectToPinterest(origin, { oauth_error: "missing_code" });
  }

  const cookieStore = cookies();
  const storedState = cookieStore.get(PINTEREST_OAUTH_STATE_COOKIE)?.value;
  const storedNonce = cookieStore.get(PINTEREST_OAUTH_NONCE_COOKIE)?.value;
  if (!storedState || storedState !== state) {
    return redirectToPinterest(origin, { oauth_error: "invalid_state" });
  }

  const parsed = parsePinterestOAuthState(state);
  if (!parsed || parsed.userId !== session.user.id) {
    return redirectToPinterest(origin, { oauth_error: "invalid_state" });
  }
  if (!storedNonce || storedNonce !== parsed.nonce) {
    return redirectToPinterest(origin, { oauth_error: "invalid_state" });
  }

  try {
    const tokens = await exchangePinterestOAuthCode(code);
    const oauthSession = encodePinterestOAuthSession({
      userId: session.user.id,
      storeId: parsed.storeId,
      accessToken: tokens.accessToken,
      tokenExpiresAt: tokens.expiresIn
        ? Date.now() + tokens.expiresIn * 1000
        : null,
      createdAt: Date.now(),
    });

    const response = redirectToPinterest(origin, { oauth: "picker" });
    response.cookies.set(
      PINTEREST_OAUTH_SESSION_COOKIE,
      oauthSession,
      cookieOptions(1800)
    );
    response.cookies.set(PINTEREST_OAUTH_STATE_COOKIE, "", {
      ...cookieOptions(0),
      maxAge: 0,
    });
    response.cookies.set(PINTEREST_OAUTH_NONCE_COOKIE, "", {
      ...cookieOptions(0),
      maxAge: 0,
    });
    return response;
  } catch (err) {
    console.error("[pinterest-oauth/callback]", err);
    return redirectToPinterest(origin, {
      oauth_error:
        err instanceof Error ? err.message.slice(0, 80) : "token_exchange_failed",
    });
  }
}
