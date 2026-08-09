import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo/site-config";

export const dynamic = "force-dynamic";

/**
 * OAuth 2.0 Protected Resource Metadata (RFC 9728).
 * Points MCP clients at the Ettajer authorization server for /api/v1/mcp.
 */
export async function GET() {
  const resource = absoluteUrl("/api/v1/mcp");
  const authorizationServers = [absoluteUrl("/").replace(/\/$/, "")];
  return NextResponse.json(
    {
      resource,
      authorization_servers: authorizationServers,
      scopes_supported: [
        "store:read",
        "products:read",
        "collections:read",
        "settings:read",
        "orders:read",
        "customers:read",
        "checkout:read",
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
      bearer_methods_supported: ["header"],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
