import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth-session";
import {
  PINTEREST_OAUTH_SESSION_COOKIE,
  decodePinterestOAuthSession,
  listPinterestTagsForToken,
} from "@/lib/pinterest-oauth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Available conversion tags for the pending Pinterest OAuth session. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const raw = cookies().get(PINTEREST_OAUTH_SESSION_COOKIE)?.value;
  const oauthSession = raw ? decodePinterestOAuthSession(raw) : null;
  if (!oauthSession || oauthSession.userId !== session.user.id) {
    return NextResponse.json({
      sessionActive: false,
      tags: [],
      message: "Pinterest login expired. Connect with Pinterest again.",
    });
  }

  try {
    const tags = await listPinterestTagsForToken(oauthSession.accessToken);
    return NextResponse.json({
      sessionActive: true,
      tags,
    });
  } catch (error) {
    console.error("[pinterest-oauth/tags]", error);
    return NextResponse.json(
      {
        sessionActive: true,
        tags: [],
        message:
          error instanceof Error
            ? error.message
            : "Failed to list Pinterest tags",
      },
      { status: 502 }
    );
  }
}
