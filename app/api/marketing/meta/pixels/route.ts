import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth-session";
import {
  META_OAUTH_SESSION_COOKIE,
  decodeMetaOAuthSession,
  isMetaOAuthConfigured,
  listMetaPixelsForToken,
} from "@/lib/meta-oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Status + available pixels for the pending Meta OAuth session. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const configured = isMetaOAuthConfigured();
  const raw = cookies().get(META_OAUTH_SESSION_COOKIE)?.value;
  const oauthSession = raw ? decodeMetaOAuthSession(raw) : null;

  if (!oauthSession || oauthSession.userId !== session.user.id) {
    return NextResponse.json({
      configured,
      sessionActive: false,
      pixels: [],
    });
  }

  try {
    const pixels = await listMetaPixelsForToken(oauthSession.accessToken);
    return NextResponse.json({
      configured,
      sessionActive: true,
      pixels,
    });
  } catch (error) {
    console.error("[meta-oauth/pixels]", error);
    return NextResponse.json(
      {
        configured,
        sessionActive: true,
        pixels: [],
        message:
          error instanceof Error ? error.message : "Failed to list Meta pixels",
      },
      { status: 502 }
    );
  }
}
