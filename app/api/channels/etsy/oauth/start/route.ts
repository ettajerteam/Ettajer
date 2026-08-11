import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/get-authenticated-store";
import { buildEtsyAuthorizeUrl, isEtsyOAuthConfigured } from "@/lib/channels/adapters/etsy/oauth";

export const dynamic = "force-dynamic";

/** Kicks off the Etsy PKCE OAuth flow — redirects the merchant to Etsy's consent screen. */
export async function GET() {
  const store = await getAuthenticatedStore();
  if (!store) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isEtsyOAuthConfigured()) {
    return NextResponse.json(
      {
        message:
          "Etsy integration is not configured. Set ETSY_CLIENT_ID and ETSY_CLIENT_SECRET to enable it.",
      },
      { status: 503 }
    );
  }

  try {
    const { url } = buildEtsyAuthorizeUrl({ userId: store.userId, storeId: store.id });
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[etsy/oauth/start]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to start Etsy connection" },
      { status: 500 }
    );
  }
}
