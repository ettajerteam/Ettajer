import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import {
  getPinterestIntegrationPublicUrls,
  getPinterestOAuthConfigStatus,
} from "@/lib/pinterest-oauth";

export const dynamic = "force-dynamic";

/** Whether Pinterest OAuth is ready + redirect URIs to configure. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const status = getPinterestOAuthConfigStatus();
  const urls = getPinterestIntegrationPublicUrls();
  return NextResponse.json({
    configured: status.configured,
    hasAppId: status.hasAppId,
    hasAppSecret: status.hasAppSecret,
    urls,
  });
}
