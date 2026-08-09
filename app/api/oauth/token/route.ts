import { NextResponse } from "next/server";
import {
  exchangeAuthorizationCode,
  refreshAccessToken,
} from "@/lib/developer/oauth";
import {
  DeveloperApiError,
  fromDeveloperError,
} from "@/lib/developer/errors";

export const dynamic = "force-dynamic";

async function parseBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(json)) {
      if (v != null) out[k] = String(v);
    }
    return out;
  }
  const form = await request.formData();
  const out: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") out[key] = value;
  });
  return out;
}

export async function POST(request: Request) {
  try {
    const body = await parseBody(request);
    const grantType = body.grant_type;

    if (grantType === "authorization_code") {
      if (!body.client_id || !body.code || !body.redirect_uri) {
        throw new DeveloperApiError(
          "INVALID_REQUEST",
          "client_id, code, and redirect_uri are required.",
        );
      }
      const tokens = await exchangeAuthorizationCode({
        clientId: body.client_id,
        clientSecret: body.client_secret,
        code: body.code,
        redirectUri: body.redirect_uri,
        codeVerifier: body.code_verifier,
      });
      return NextResponse.json(tokens, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    if (grantType === "refresh_token") {
      if (!body.client_id || !body.refresh_token) {
        throw new DeveloperApiError(
          "INVALID_REQUEST",
          "client_id and refresh_token are required.",
        );
      }
      const tokens = await refreshAccessToken({
        clientId: body.client_id,
        clientSecret: body.client_secret,
        refreshToken: body.refresh_token,
      });
      return NextResponse.json(tokens, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    throw new DeveloperApiError(
      "UNSUPPORTED_GRANT_TYPE",
      "Supported grant_type: authorization_code, refresh_token.",
    );
  } catch (err) {
    return fromDeveloperError(err);
  }
}
