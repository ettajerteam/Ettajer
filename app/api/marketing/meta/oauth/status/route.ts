import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-session";
import {
  getMetaIntegrationPublicUrls,
  getMetaOAuthConfigStatus,
} from "@/lib/meta-oauth";

export const dynamic = "force-dynamic";

/** Whether Meta Business OAuth is ready + App Dashboard URLs to configure. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const status = getMetaOAuthConfigStatus();
  const urls = getMetaIntegrationPublicUrls();
  return NextResponse.json({
    configured: status.configured,
    hasAppId: status.hasAppId,
    hasAppSecret: status.hasAppSecret,
    hasConfigId: status.hasConfigId,
    urls,
  });
}
