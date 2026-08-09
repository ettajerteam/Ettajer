/**
 * D4 security regression: OAuth reuse/PKCE, preview tokens, publish scope, rate-limit backend.
 */
import { createHash, randomBytes } from "crypto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  issueThemePreviewToken,
  verifyThemePreviewToken,
} from "@/lib/developer/preview-token";
import {
  InMemoryDeveloperRateLimiter,
  RedisDeveloperRateLimiter,
  setDeveloperRateLimiter,
} from "@/lib/developer/rate-limit";
import { hasScope, THEME_AI_DEFAULT_SCOPES } from "@/lib/developer/scopes";
import { requireScopes } from "@/lib/developer/auth-context";
import { DeveloperApiError } from "@/lib/developer/errors";
import { verifyPkce } from "@/lib/developer/pkce";
import {
  encryptSecretPayload,
  decryptSecretPayload,
} from "@/lib/mailhub/crypto";

function s256Challenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

describe("D4 OAuth / PKCE unit", () => {
  it("accepts matching S256 verifier", () => {
    const verifier = randomBytes(32).toString("base64url");
    expect(verifyPkce(verifier, s256Challenge(verifier), "S256")).toBe(true);
  });

  it("rejects mismatched S256 verifier", () => {
    const verifier = randomBytes(32).toString("base64url");
    const other = randomBytes(32).toString("base64url");
    expect(verifyPkce(other, s256Challenge(verifier), "S256")).toBe(false);
  });

  it("rejects plain PKCE method", () => {
    const verifier = "plain-verifier-value-xxxxxxxx";
    expect(verifyPkce(verifier, verifier, "plain")).toBe(false);
  });
});

describe("D4 preview tokens", () => {
  beforeEach(() => {
    process.env.PREVIEW_TOKEN_SECRET = "d4-test-preview-secret";
    delete process.env.VERCEL_ENV;
  });

  it("issues and verifies a bound token", () => {
    const { token, claims } = issueThemePreviewToken({
      storeId: "store_a",
      themeId: "theme_a",
    });
    expect(claims.purpose).toBe("theme_preview");
    expect(
      verifyThemePreviewToken(token, {
        storeId: "store_a",
        themeId: "theme_a",
      }),
    ).toMatchObject({ storeId: "store_a", themeId: "theme_a" });
  });

  it("rejects cross-store and tampered tokens", () => {
    const { token } = issueThemePreviewToken({
      storeId: "store_a",
      themeId: "theme_a",
    });
    expect(
      verifyThemePreviewToken(token, {
        storeId: "store_b",
        themeId: "theme_a",
      }),
    ).toBeNull();
    expect(
      verifyThemePreviewToken(token.slice(0, -2) + "aa", {
        storeId: "store_a",
        themeId: "theme_a",
      }),
    ).toBeNull();
  });

  it("requires PREVIEW_TOKEN_SECRET in production", () => {
    delete process.env.PREVIEW_TOKEN_SECRET;
    process.env.VERCEL_ENV = "production";
    process.env.NEXTAUTH_SECRET = "should-not-be-used-in-prod";
    expect(() =>
      issueThemePreviewToken({ storeId: "s", themeId: "t" }),
    ).toThrow(/PREVIEW_TOKEN_SECRET/);
  });
});

describe("D4 publish protection", () => {
  it("THEME_AI_DEFAULT_SCOPES excludes themes:publish", () => {
    expect(hasScope(THEME_AI_DEFAULT_SCOPES, "themes:publish")).toBe(false);
  });

  it("requireScopes denies publish without themes:publish", () => {
    const ctx = {
      actor: "api_key" as const,
      applicationId: "app",
      applicationName: "test",
      userId: "user",
      storeId: "store",
      scopes: [...THEME_AI_DEFAULT_SCOPES],
      tokenKey: "tok",
    };
    expect(() => requireScopes(ctx, "themes:publish")).toThrow(DeveloperApiError);
    try {
      requireScopes(ctx, "themes:publish");
    } catch (err) {
      expect(err).toBeInstanceOf(DeveloperApiError);
      expect((err as DeveloperApiError).code).toBe("INSUFFICIENT_SCOPE");
    }
  });
});

describe("D4 rate limit backends", () => {
  it("memory backend enforces limits", () => {
    const lim = new InMemoryDeveloperRateLimiter();
    setDeveloperRateLimiter(lim);
    expect(lim.check({ key: "t1", limit: 2 }).ok).toBe(true);
    expect(lim.check({ key: "t1", limit: 2 }).ok).toBe(true);
    expect(lim.check({ key: "t1", limit: 2 }).ok).toBe(false);
  });

  it("redis backend fails closed in production without Upstash", async () => {
    const prev = {
      backend: process.env.RATE_LIMIT_BACKEND,
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      vercel: process.env.VERCEL_ENV,
    };
    process.env.RATE_LIMIT_BACKEND = "redis";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.VERCEL_ENV = "production";
    const lim = new RedisDeveloperRateLimiter();
    await expect(lim.check({ key: "x", limit: 10 })).rejects.toThrow(/UPSTASH/);
    process.env.RATE_LIMIT_BACKEND = prev.backend;
    process.env.UPSTASH_REDIS_REST_URL = prev.url;
    process.env.UPSTASH_REDIS_REST_TOKEN = prev.token;
    process.env.VERCEL_ENV = prev.vercel;
  });
});

describe("D4 EMAIL_SECRETS_KEY rotation decrypt", () => {
  it("decrypts ciphertext encrypted under NEXTAUTH_SECRET after EMAIL_SECRETS_KEY is set", () => {
    process.env.NEXTAUTH_SECRET = "legacy-nextauth-secret";
    delete process.env.EMAIL_SECRETS_KEY;
    const cipher = encryptSecretPayload({ clientSecret: "abc" });

    process.env.EMAIL_SECRETS_KEY = "new-dedicated-email-secrets-key";
    // New encrypts use EMAIL_SECRETS_KEY; legacy still decrypts via fallback.
    const roundtrip = decryptSecretPayload<{ clientSecret: string }>(cipher);
    expect(roundtrip.clientSecret).toBe("abc");

    const newer = encryptSecretPayload({ clientSecret: "xyz" });
    expect(decryptSecretPayload<{ clientSecret: string }>(newer).clientSecret).toBe(
      "xyz",
    );
  });
});
