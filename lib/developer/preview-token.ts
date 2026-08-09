import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const THEME_PREVIEW_TOKEN_TTL_SECONDS = 10 * 60; // 10 minutes

export type ThemePreviewTokenClaims = {
  purpose: "theme_preview";
  storeId: string;
  themeId: string;
  iat: number;
  exp: number;
  nonce: string;
};

function previewSigningKey(): Buffer {
  const dedicated = process.env.PREVIEW_TOKEN_SECRET?.trim();
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  // Production must use a dedicated preview secret (not NEXTAUTH_SECRET).
  if (isProd && !dedicated) {
    throw new Error(
      "PREVIEW_TOKEN_SECRET is required in production to sign preview tokens",
    );
  }

  const raw =
    dedicated ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.EMAIL_SECRETS_KEY?.trim() ||
    "";
  if (!raw) {
    throw new Error(
      "PREVIEW_TOKEN_SECRET (preferred) or NEXTAUTH_SECRET is required to sign preview tokens",
    );
  }
  return createHmac("sha256", "ettajer-theme-preview-v1").update(raw).digest();
}

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b.toString("base64url");
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", previewSigningKey()).update(payloadB64).digest("base64url");
}

/** Issue a short-lived, purpose-bound theme preview token (not an API credential). */
export function issueThemePreviewToken(input: {
  storeId: string;
  themeId: string;
  ttlSeconds?: number;
}): { token: string; expiresAt: Date; claims: ThemePreviewTokenClaims } {
  const ttl = input.ttlSeconds ?? THEME_PREVIEW_TOKEN_TTL_SECONDS;
  const now = Math.floor(Date.now() / 1000);
  const claims: ThemePreviewTokenClaims = {
    purpose: "theme_preview",
    storeId: input.storeId,
    themeId: input.themeId,
    iat: now,
    exp: now + ttl,
    nonce: randomBytes(8).toString("hex"),
  };
  const payloadB64 = b64url(JSON.stringify(claims));
  const sig = signPayload(payloadB64);
  return {
    token: `${payloadB64}.${sig}`,
    expiresAt: new Date(claims.exp * 1000),
    claims,
  };
}

/** Verify preview token. Returns claims only when purpose/store/theme/exp match. */
export function verifyThemePreviewToken(
  token: string,
  expected: { storeId: string; themeId: string },
): ThemePreviewTokenClaims | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const expectedSig = signPayload(payloadB64);
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const claims = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as ThemePreviewTokenClaims;

    if (claims.purpose !== "theme_preview") return null;
    if (claims.storeId !== expected.storeId) return null;
    if (claims.themeId !== expected.themeId) return null;
    if (typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}
