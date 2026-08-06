import { createHmac, timingSafeEqual } from "crypto";
import {
  getAppUrl,
  isLocalOrPrivateHost,
} from "@/lib/app-url";

/**
 * Pinterest OAuth (authorization code) for Tag + ad account selection.
 * Note: Conversions API events still require an Ads Manager conversion token —
 * the OAuth user token cannot call POST /v5/ad_accounts/{id}/events.
 * @see https://developers.pinterest.com/docs/getting-started/set-up-authentication-and-authorization/
 */

export const PINTEREST_OAUTH_SCOPES = ["ads:read", "catalogs:read"] as const;

export interface PinterestOAuthTag {
  id: string;
  name: string;
  adAccountId: string;
  adAccountName?: string | null;
  status?: string | null;
}

export interface PinterestOAuthSessionPayload {
  userId: string;
  storeId: string;
  accessToken: string;
  tokenExpiresAt: number | null;
  createdAt: number;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function getPinterestAppId(): string | null {
  return (
    process.env.PINTEREST_APP_ID?.trim() ||
    process.env.PINTEREST_CLIENT_ID?.trim() ||
    null
  );
}

function getPinterestAppSecret(): string | null {
  return (
    process.env.PINTEREST_APP_SECRET?.trim() ||
    process.env.PINTEREST_CLIENT_SECRET?.trim() ||
    null
  );
}

function signingSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.PINTEREST_APP_SECRET?.trim() ||
    "ettajer-pinterest-oauth-dev"
  );
}

export function isPinterestOAuthConfigured(): boolean {
  return Boolean(getPinterestAppId() && getPinterestAppSecret());
}

export function getPinterestOAuthConfigStatus(): {
  configured: boolean;
  hasAppId: boolean;
  hasAppSecret: boolean;
} {
  const hasAppId = Boolean(getPinterestAppId());
  const hasAppSecret = Boolean(getPinterestAppSecret());
  return {
    configured: hasAppId && hasAppSecret,
    hasAppId,
    hasAppSecret,
  };
}

export function getPinterestOAuthRedirectUri(): string {
  const override = process.env.PINTEREST_OAUTH_REDIRECT_URI?.trim();
  if (override) return override.replace(/\/$/, "");

  const isLocalDev = !process.env.VERCEL && process.env.NODE_ENV !== "production";
  if (isLocalDev) {
    const nextAuth = process.env.NEXTAUTH_URL?.trim();
    if (nextAuth) {
      try {
        const url = new URL(nextAuth);
        if (isLocalOrPrivateHost(url.hostname)) {
          return `${stripTrailingSlash(nextAuth)}/api/marketing/pinterest/oauth/callback`;
        }
      } catch {
        // fall through
      }
    }
    return "http://localhost:3000/api/marketing/pinterest/oauth/callback";
  }

  return `${getAppUrl()}/api/marketing/pinterest/oauth/callback`;
}

export function getPinterestIntegrationPublicUrls() {
  const productionBase = "https://www.ettajer.com";
  const oauthRedirectUri = getPinterestOAuthRedirectUri();
  const productionOauthRedirectUri = `${productionBase}/api/marketing/pinterest/oauth/callback`;
  const localOauthRedirectUri =
    "http://localhost:3000/api/marketing/pinterest/oauth/callback";

  return {
    oauthRedirectUri,
    productionOauthRedirectUri,
    localOauthRedirectUri,
    usesProductionCallback:
      oauthRedirectUri === productionOauthRedirectUri ||
      oauthRedirectUri.includes("ettajer.com"),
  };
}

function b64urlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function b64urlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", signingSecret()).update(payload).digest("base64url");
}

function verifySignature(payload: string, signature: string): boolean {
  const expected = sign(payload);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createPinterestOAuthState(input: {
  userId: string;
  storeId: string;
  nonce: string;
}): string {
  const payload = b64urlEncode(
    JSON.stringify({
      userId: input.userId,
      storeId: input.storeId,
      nonce: input.nonce,
      exp: Date.now() + 10 * 60 * 1000,
    })
  );
  return `${payload}.${sign(payload)}`;
}

export function parsePinterestOAuthState(state: string): {
  userId: string;
  storeId: string;
  nonce: string;
} | null {
  const [payload, signature] = state.split(".");
  if (!payload || !signature || !verifySignature(payload, signature)) return null;
  try {
    const data = JSON.parse(b64urlDecode(payload)) as {
      userId?: string;
      storeId?: string;
      nonce?: string;
      exp?: number;
    };
    if (!data.userId || !data.storeId || !data.nonce) return null;
    if (typeof data.exp === "number" && data.exp < Date.now()) return null;
    return { userId: data.userId, storeId: data.storeId, nonce: data.nonce };
  } catch {
    return null;
  }
}

export function encodePinterestOAuthSession(
  session: PinterestOAuthSessionPayload
): string {
  const payload = b64urlEncode(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function decodePinterestOAuthSession(
  raw: string
): PinterestOAuthSessionPayload | null {
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !verifySignature(payload, signature)) return null;
  try {
    const data = JSON.parse(b64urlDecode(payload)) as PinterestOAuthSessionPayload;
    if (!data.userId || !data.storeId || !data.accessToken) return null;
    if (data.createdAt && Date.now() - data.createdAt > 30 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export function buildPinterestOAuthAuthorizeUrl(state: string): string {
  const appId = getPinterestAppId();
  if (!appId) throw new Error("PINTEREST_APP_ID is not configured");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getPinterestOAuthRedirectUri(),
    response_type: "code",
    scope: PINTEREST_OAUTH_SCOPES.join(","),
    state,
  });

  return `https://www.pinterest.com/oauth/?${params.toString()}`;
}

export async function exchangePinterestOAuthCode(code: string): Promise<{
  accessToken: string;
  expiresIn: number | null;
  refreshToken: string | null;
}> {
  const appId = getPinterestAppId();
  const appSecret = getPinterestAppSecret();
  if (!appId || !appSecret) {
    throw new Error("Pinterest OAuth is not configured");
  }

  const basic = Buffer.from(`${appId}:${appSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getPinterestOAuthRedirectUri(),
  });

  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    message?: string;
    error?: string;
  };

  if (!res.ok || !json.access_token) {
    throw new Error(
      json.message || json.error || "Failed to exchange Pinterest auth code"
    );
  }

  return {
    accessToken: json.access_token,
    expiresIn: typeof json.expires_in === "number" ? json.expires_in : null,
    refreshToken: json.refresh_token?.trim() || null,
  };
}

async function pinterestGet<T>(
  path: string,
  accessToken: string,
  query?: Record<string, string>
): Promise<T> {
  const params = new URLSearchParams(query);
  const qs = params.toString();
  const url = `https://api.pinterest.com/v5${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const json = (await res.json()) as T & {
    message?: string;
    code?: number;
  };
  if (!res.ok) {
    throw new Error(
      (json as { message?: string }).message ||
        `Pinterest API error (${res.status})`
    );
  }
  return json;
}

/** List conversion tags across ad accounts the connected user can access. */
export async function listPinterestTagsForToken(
  accessToken: string
): Promise<PinterestOAuthTag[]> {
  const map = new Map<string, PinterestOAuthTag>();

  const accounts = await pinterestGet<{
    items?: Array<{ id?: string; name?: string }>;
  }>("/ad_accounts", accessToken, {
    page_size: "100",
    include_shared_accounts: "true",
  });

  for (const account of accounts.items ?? []) {
    const adAccountId = account.id?.trim();
    if (!adAccountId) continue;

    try {
      const tags = await pinterestGet<{
        items?: Array<{
          id?: string;
          name?: string;
          status?: string;
          ad_account_id?: string;
        }>;
      }>(`/ad_accounts/${encodeURIComponent(adAccountId)}/conversion_tags`, accessToken, {
        filter_deleted: "false",
      });

      for (const tag of tags.items ?? []) {
        if (!tag.id?.trim()) continue;
        map.set(tag.id, {
          id: tag.id.trim(),
          name: tag.name?.trim() || `Tag ${tag.id}`,
          adAccountId: tag.ad_account_id?.trim() || adAccountId,
          adAccountName: account.name?.trim() || null,
          status: tag.status ?? null,
        });
      }
    } catch (error) {
      console.warn(
        `[pinterest-oauth] conversion_tags failed for ${adAccountId}:`,
        error
      );
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const PINTEREST_OAUTH_STATE_COOKIE = "ettajer_pinterest_oauth_state";
export const PINTEREST_OAUTH_SESSION_COOKIE = "ettajer_pinterest_oauth_session";
export const PINTEREST_OAUTH_NONCE_COOKIE = "ettajer_pinterest_oauth_nonce";
