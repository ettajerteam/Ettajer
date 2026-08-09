import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo/site-config";

export const dynamic = "force-dynamic";

/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414).
 * Required so Claude/Cursor MCP clients discover authorize + token endpoints
 * instead of guessing /authorize and /token on the origin.
 */
export async function GET() {
  const issuer = absoluteUrl("/").replace(/\/$/, "");
  return NextResponse.json(
    {
      issuer,
      authorization_endpoint: absoluteUrl("/oauth/authorize"),
      token_endpoint: absoluteUrl("/api/oauth/token"),
      revocation_endpoint: absoluteUrl("/api/oauth/revoke"),
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: [
        "client_secret_post",
        "client_secret_basic",
        "none",
      ],
      scopes_supported: [
        "store:read",
        "products:read",
        "collections:read",
        "settings:read",
        "themes:read",
        "themes:create",
        "themes:write",
        "themes:preview",
        "themes:publish",
        "pages:read",
        "pages:write",
        "media:read",
        "media:write",
        "navigation:read",
        "navigation:write",
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
