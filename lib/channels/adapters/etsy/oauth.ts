import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getAppUrl, isLocalOrPrivateHost } from "@/lib/app-url";

/**
 * Etsy Open API v3 OAuth 2.0 + PKCE.
 * Docs: https://developers.etsy.com/documentation/essentials/authentication
 *
 * Signing pattern mirrors lib/meta-oauth.ts (HMAC-SHA256 state, timing-safe verify)
 * but embeds the PKCE code_verifier inside the signed state instead of a cookie,
 * so the OAuth flow works even when the browser drops third-party cookies.
 */

const ETSY_AUTHORIZE_URL = "https://www.etsy.com/oauth/connect";
const ETSY_TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";

/**
 * Etsy Open API v3 scopes needed for the Seller OS: listing CRUD, shop read/write,
 * transactions (receipts/orders) read/write, and shipping address read (for fulfillment).
 */
export const ETSY_OAUTH_SCOPES = [
  "listings_r",
  "listings_w",
  "listings_d",
  "shops_r",
  "shops_w",
  "transactions_r",
  "transactions_w",
  "address_r",
] as const;

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function getEtsyClientId(): string | null {
  return process.env.ETSY_CLIENT_ID?.trim() || null;
}

function getEtsyClientSecret(): string | null {
  return process.env.ETSY_CLIENT_SECRET?.trim() || null;
}

export function isEtsyOAuthConfigured(): boolean {
  return Boolean(getEtsyClientId() && getEtsyClientSecret());
}

export function getEtsyRedirectUri(): string {
  const override = process.env.ETSY_REDIRECT_URI?.trim();
  if (override) return stripTrailingSlash(override);

  const isLocalDev = !process.env.VERCEL && process.env.NODE_ENV !== "production";
  if (isLocalDev) {
    const nextAuth = process.env.NEXTAUTH_URL?.trim();
    if (nextAuth) {
      try {
        const url = new URL(nextAuth);
        if (isLocalOrPrivateHost(url.hostname)) {
          return `${stripTrailingSlash(nextAuth)}/api/channels/etsy/oauth/callback`;
        }
      } catch {
        // fall through
      }
    }
    return "http://localhost:3000/api/channels/etsy/oauth/callback";
  }

  return `${getAppUrl()}/api/channels/etsy/oauth/callback`;
}

function signingSecret(): string {
  return (
    process.env.NEXTAUTH_SECRET?.trim() ||
    getEtsyClientSecret() ||
    "ettajer-etsy-oauth-dev"
  );
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

/** RFC 7636 PKCE code_verifier: 43-128 char unreserved-charset string. */
function generateCodeVerifier(): string {
  return randomBytes(48).toString("base64url");
}

function generateCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export interface EtsyOAuthStatePayload {
  userId: string;
  storeId: string;
  codeVerifier: string;
  nonce: string;
  exp: number;
}

const STATE_TTL_MS = 10 * 60 * 1000;

function createEtsyOAuthState(input: {
  userId: string;
  storeId: string;
  codeVerifier: string;
  nonce: string;
}): string {
  const payload = b64urlEncode(
    JSON.stringify({
      userId: input.userId,
      storeId: input.storeId,
      codeVerifier: input.codeVerifier,
      nonce: input.nonce,
      exp: Date.now() + STATE_TTL_MS,
    } satisfies EtsyOAuthStatePayload)
  );
  return `${payload}.${sign(payload)}`;
}

/** Verify + decode a signed OAuth state string. Returns null if invalid/expired/tampered. */
export function parseEtsyOAuthState(state: string): EtsyOAuthStatePayload | null {
  const [payload, signature] = state.split(".");
  if (!payload || !signature || !verifySignature(payload, signature)) return null;
  try {
    const data = JSON.parse(b64urlDecode(payload)) as Partial<EtsyOAuthStatePayload>;
    if (!data.userId || !data.storeId || !data.codeVerifier || !data.nonce) return null;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return {
      userId: data.userId,
      storeId: data.storeId,
      codeVerifier: data.codeVerifier,
      nonce: data.nonce,
      exp: data.exp,
    };
  } catch {
    return null;
  }
}

export interface BuildEtsyAuthorizeUrlResult {
  url: string;
  state: string;
  nonce: string;
}

/** Build the Etsy "connect" authorize URL, generating and signing PKCE state. */
export function buildEtsyAuthorizeUrl(input: {
  userId: string;
  storeId: string;
  scopes?: readonly string[];
}): BuildEtsyAuthorizeUrlResult {
  const clientId = getEtsyClientId();
  if (!clientId) throw new Error("ETSY_CLIENT_ID is not configured");

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const nonce = randomBytes(16).toString("base64url");
  const state = createEtsyOAuthState({
    userId: input.userId,
    storeId: input.storeId,
    codeVerifier,
    nonce,
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getEtsyRedirectUri(),
    scope: (input.scopes ?? ETSY_OAUTH_SCOPES).join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return { url: `${ETSY_AUTHORIZE_URL}?${params.toString()}`, state, nonce };
}

export interface EtsyTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  /** Etsy embeds the numeric user id in the access token as "<user_id>.<token>". */
  etsyUserId: string;
}

function parseEtsyUserIdFromAccessToken(accessToken: string): string {
  const [userId] = accessToken.split(".");
  if (!userId || !/^\d+$/.test(userId)) {
    throw new Error("Unexpected Etsy access token format");
  }
  return userId;
}

interface EtsyTokenApiResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
}

/** Exchange an authorization code (+ PKCE verifier) for access/refresh tokens. */
export async function exchangeEtsyCode(input: {
  code: string;
  codeVerifier: string;
}): Promise<EtsyTokenResponse> {
  const clientId = getEtsyClientId();
  if (!clientId) throw new Error("ETSY_CLIENT_ID is not configured");

  const res = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: getEtsyRedirectUri(),
      code: input.code,
      code_verifier: input.codeVerifier,
    }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as EtsyTokenApiResponse;
  if (!res.ok || !json.access_token || !json.refresh_token) {
    throw new Error(
      json.error_description || json.error || `Etsy token exchange failed (${res.status})`
    );
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in ?? 3600,
    tokenType: json.token_type ?? "Bearer",
    etsyUserId: parseEtsyUserIdFromAccessToken(json.access_token),
  };
}

/** Exchange a refresh token for a new access/refresh token pair (Etsy rotates refresh tokens). */
export async function refreshEtsyAccessToken(
  refreshToken: string
): Promise<EtsyTokenResponse> {
  const clientId = getEtsyClientId();
  if (!clientId) throw new Error("ETSY_CLIENT_ID is not configured");

  const res = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as EtsyTokenApiResponse;
  if (!res.ok || !json.access_token || !json.refresh_token) {
    throw new Error(
      json.error_description || json.error || `Etsy token refresh failed (${res.status})`
    );
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in ?? 3600,
    tokenType: json.token_type ?? "Bearer",
    etsyUserId: parseEtsyUserIdFromAccessToken(json.access_token),
  };
}

export const ETSY_OAUTH_NONCE_COOKIE = "ettajer_etsy_oauth_nonce";
