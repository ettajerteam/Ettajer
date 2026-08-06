import { createHmac, timingSafeEqual } from "crypto";
import {
  getAppUrl,
  isLocalOrPrivateHost,
} from "@/lib/app-url";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION?.trim() || "v21.0";

/**
 * Permissions must be selected inside a Facebook Login for Business *configuration*
 * in the Meta App Dashboard — not passed as classic Facebook Login `scope` params.
 * @see https://developers.facebook.com/docs/facebook-login/facebook-login-for-business
 */
export const META_LOGIN_FOR_BUSINESS_PERMISSIONS = [
  "ads_management",
  "ads_read",
  "business_management",
] as const;

function getMetaLoginConfigId(): string | null {
  return (
    process.env.META_LOGIN_CONFIG_ID?.trim() ||
    process.env.META_OAUTH_CONFIG_ID?.trim() ||
    process.env.FACEBOOK_LOGIN_CONFIG_ID?.trim() ||
    null
  );
}

export interface MetaOAuthPixel {
  id: string;
  name: string;
  adAccountId?: string | null;
  businessId?: string | null;
}

export interface MetaOAuthSessionPayload {
  userId: string;
  storeId: string;
  accessToken: string;
  tokenExpiresAt: number | null;
  createdAt: number;
}

function getMetaAppId(): string | null {
  return process.env.META_APP_ID?.trim() || process.env.FACEBOOK_APP_ID?.trim() || null;
}

function getMetaAppSecret(): string | null {
  return (
    process.env.META_APP_SECRET?.trim() ||
    process.env.FACEBOOK_APP_SECRET?.trim() ||
    null
  );
}

function signingSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.META_APP_SECRET?.trim() ||
    "ettajer-meta-oauth-dev"
  );
}

export function isMetaOAuthConfigured(): boolean {
  return Boolean(getMetaAppId() && getMetaAppSecret() && getMetaLoginConfigId());
}

export function getMetaOAuthConfigStatus(): {
  configured: boolean;
  hasAppId: boolean;
  hasAppSecret: boolean;
  hasConfigId: boolean;
} {
  const hasAppId = Boolean(getMetaAppId());
  const hasAppSecret = Boolean(getMetaAppSecret());
  const hasConfigId = Boolean(getMetaLoginConfigId());
  return {
    configured: hasAppId && hasAppSecret && hasConfigId,
    hasAppId,
    hasAppSecret,
    hasConfigId,
  };
}

export function getMetaOAuthRedirectUri(): string {
  const override = process.env.META_OAUTH_REDIRECT_URI?.trim();
  if (override) return override.replace(/\/$/, "");

  // Local dev: always use localhost so Meta callback matches the running server
  // (getAppUrl() prefers NEXT_PUBLIC_SITE_URL = production).
  const isLocalDev = !process.env.VERCEL && process.env.NODE_ENV !== "production";
  if (isLocalDev) {
    const nextAuth = process.env.NEXTAUTH_URL?.trim();
    if (nextAuth) {
      try {
        const url = new URL(nextAuth);
        if (isLocalOrPrivateHost(url.hostname)) {
          return `${stripTrailingSlash(nextAuth)}/api/marketing/meta/oauth/callback`;
        }
      } catch {
        // fall through
      }
    }
    return "http://localhost:3000/api/marketing/meta/oauth/callback";
  }

  return `${getAppUrl()}/api/marketing/meta/oauth/callback`;
}

/** URLs to paste into Meta App Dashboard (OAuth + data deletion). */
export function getMetaIntegrationPublicUrls() {
  const productionBase = "https://www.ettajer.com";
  const oauthRedirectUri = getMetaOAuthRedirectUri();
  const productionOauthRedirectUri = `${productionBase}/api/marketing/meta/oauth/callback`;
  const localOauthRedirectUri =
    "http://localhost:3000/api/marketing/meta/oauth/callback";

  return {
    oauthRedirectUri,
    productionOauthRedirectUri,
    localOauthRedirectUri,
    dataDeletionCallbackUrl: `${productionBase}/api/meta/data-deletion`,
    dataDeletionInstructionsUrl: `${productionBase}/data-deletion`,
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

export function createMetaOAuthState(input: {
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

export function parseMetaOAuthState(state: string): {
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

export function encodeMetaOAuthSession(session: MetaOAuthSessionPayload): string {
  const payload = b64urlEncode(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function decodeMetaOAuthSession(raw: string): MetaOAuthSessionPayload | null {
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || !verifySignature(payload, signature)) return null;
  try {
    const data = JSON.parse(b64urlDecode(payload)) as MetaOAuthSessionPayload;
    if (!data.userId || !data.storeId || !data.accessToken) return null;
    if (data.createdAt && Date.now() - data.createdAt > 30 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Build Facebook Login for Business authorize URL.
 * Uses `config_id` (not classic `scope`) per Meta docs:
 * https://developers.facebook.com/docs/facebook-login/facebook-login-for-business
 */
export function buildMetaOAuthAuthorizeUrl(state: string): string {
  const appId = getMetaAppId();
  const configId = getMetaLoginConfigId();
  if (!appId) throw new Error("META_APP_ID is not configured");
  if (!configId) {
    throw new Error(
      "META_LOGIN_CONFIG_ID is not configured. Create a Facebook Login for Business configuration in the Meta App Dashboard and set META_LOGIN_CONFIG_ID."
    );
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getMetaOAuthRedirectUri(),
    state,
    response_type: "code",
    // Login for Business: permissions come from the dashboard configuration.
    // Do not pass ads_* scopes via `scope` — Meta returns "Invalid Scopes".
    config_id: configId,
  });

  return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

async function graphGet<T>(
  path: string,
  accessToken: string,
  query?: Record<string, string>
): Promise<T> {
  const params = new URLSearchParams({
    access_token: accessToken,
    ...(query ?? {}),
  });
  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}${path}?${params.toString()}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const json = (await res.json()) as T & {
    error?: { message?: string; type?: string; code?: number };
  };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || `Meta Graph error (${res.status})`);
  }
  return json;
}

export async function exchangeMetaOAuthCode(code: string): Promise<{
  accessToken: string;
  expiresIn: number | null;
}> {
  const appId = getMetaAppId();
  const appSecret = getMetaAppSecret();
  if (!appId || !appSecret) {
    throw new Error("Meta OAuth is not configured");
  }

  const shortParams = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: getMetaOAuthRedirectUri(),
    code,
  });
  const shortRes = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token?${shortParams}`,
    { cache: "no-store" }
  );
  const shortJson = (await shortRes.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };
  if (!shortRes.ok || !shortJson.access_token) {
    throw new Error(shortJson.error?.message || "Failed to exchange Meta auth code");
  }

  const longParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortJson.access_token,
  });
  const longRes = await fetch(
    `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token?${longParams}`,
    { cache: "no-store" }
  );
  const longJson = (await longRes.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (longRes.ok && longJson.access_token) {
    return {
      accessToken: longJson.access_token,
      expiresIn: typeof longJson.expires_in === "number" ? longJson.expires_in : null,
    };
  }

  return {
    accessToken: shortJson.access_token,
    expiresIn: typeof shortJson.expires_in === "number" ? shortJson.expires_in : null,
  };
}

function pushPixel(
  map: Map<string, MetaOAuthPixel>,
  pixel: { id?: string; name?: string },
  extra?: { adAccountId?: string | null; businessId?: string | null }
) {
  if (!pixel.id) return;
  const existing = map.get(pixel.id);
  map.set(pixel.id, {
    id: pixel.id,
    name: pixel.name?.trim() || existing?.name || `Pixel ${pixel.id}`,
    adAccountId: extra?.adAccountId ?? existing?.adAccountId ?? null,
    businessId: extra?.businessId ?? existing?.businessId ?? null,
  });
}

/** List ad pixels the connected Meta user can access. */
export async function listMetaPixelsForToken(
  accessToken: string
): Promise<MetaOAuthPixel[]> {
  const map = new Map<string, MetaOAuthPixel>();

  try {
    const accounts = await graphGet<{
      data?: Array<{
        id?: string;
        account_id?: string;
        name?: string;
        adspixels?: { data?: Array<{ id?: string; name?: string }> };
      }>;
    }>("/me/adaccounts", accessToken, {
      fields: "name,account_id,adspixels{id,name}",
      limit: "100",
    });

    for (const account of accounts.data ?? []) {
      const adAccountId = account.account_id
        ? `act_${account.account_id}`
        : account.id ?? null;
      for (const pixel of account.adspixels?.data ?? []) {
        pushPixel(map, pixel, { adAccountId });
      }
    }
  } catch (error) {
    console.warn("[meta-oauth] adaccounts pixels failed:", error);
  }

  try {
    const businesses = await graphGet<{
      data?: Array<{
        id?: string;
        name?: string;
        owned_pixels?: { data?: Array<{ id?: string; name?: string }> };
        client_pixels?: { data?: Array<{ id?: string; name?: string }> };
      }>;
    }>("/me/businesses", accessToken, {
      fields: "id,name,owned_pixels{id,name},client_pixels{id,name}",
      limit: "50",
    });

    for (const business of businesses.data ?? []) {
      for (const pixel of business.owned_pixels?.data ?? []) {
        pushPixel(map, pixel, { businessId: business.id ?? null });
      }
      for (const pixel of business.client_pixels?.data ?? []) {
        pushPixel(map, pixel, { businessId: business.id ?? null });
      }
    }
  } catch (error) {
    console.warn("[meta-oauth] business pixels failed:", error);
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const META_OAUTH_STATE_COOKIE = "ettajer_meta_oauth_state";
export const META_OAUTH_SESSION_COOKIE = "ettajer_meta_oauth_session";
export const META_OAUTH_NONCE_COOKIE = "ettajer_meta_oauth_nonce";
