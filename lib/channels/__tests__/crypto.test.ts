/**
 * Channel token at-rest encryption unit tests (lib/channels/crypto.ts).
 * Reuses the mailhub AES-256-GCM envelope; see
 * lib/developer/__tests__/d4-security.test.ts for the sibling key-rotation test.
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  encryptChannelTokens,
  decryptChannelAccessToken,
  decryptChannelRefreshToken,
  decryptChannelTokens,
} from "@/lib/channels/crypto";

beforeEach(() => {
  process.env.EMAIL_SECRETS_KEY = "test-email-secrets-key-for-channels";
  process.env.NEXTAUTH_SECRET = "test-nextauth-secret-fallback";
});

describe("encryptChannelTokens / decryptChannelAccessToken / decryptChannelRefreshToken", () => {
  it("round-trips access and refresh tokens without leaking plaintext in ciphertext", () => {
    const { accessTokenEncrypted, refreshTokenEncrypted } = encryptChannelTokens({
      accessToken: "access-abc-123",
      refreshToken: "refresh-xyz-789",
    });

    expect(accessTokenEncrypted).not.toContain("access-abc-123");
    expect(refreshTokenEncrypted).not.toBeNull();
    expect(refreshTokenEncrypted as string).not.toContain("refresh-xyz-789");

    expect(decryptChannelAccessToken(accessTokenEncrypted)).toBe("access-abc-123");
    expect(decryptChannelRefreshToken(refreshTokenEncrypted)).toBe("refresh-xyz-789");
  });

  it("returns a null refreshTokenEncrypted when no refresh token is provided", () => {
    const { refreshTokenEncrypted } = encryptChannelTokens({ accessToken: "access-only" });
    expect(refreshTokenEncrypted).toBeNull();
  });

  it("decryptChannelRefreshToken tolerates null/undefined input", () => {
    expect(decryptChannelRefreshToken(null)).toBeNull();
    expect(decryptChannelRefreshToken(undefined)).toBeNull();
  });

  it("throws when the decrypted payload has a falsy accessToken", () => {
    const { accessTokenEncrypted } = encryptChannelTokens({ accessToken: "" });
    expect(() => decryptChannelAccessToken(accessTokenEncrypted)).toThrow(
      /missing accessToken/
    );
  });

  it("throws on tampered ciphertext (auth tag mismatch)", () => {
    const { accessTokenEncrypted } = encryptChannelTokens({ accessToken: "a-token" });
    const parts = accessTokenEncrypted.split(":");
    parts[3] = Buffer.from("this-is-not-the-original-ciphertext").toString("base64url");
    const tampered = parts.join(":");
    expect(() => decryptChannelAccessToken(tampered)).toThrow();
  });
});

describe("decryptChannelTokens", () => {
  it("reconstructs the token payload from a ChannelConnection-shaped row", () => {
    const { accessTokenEncrypted, refreshTokenEncrypted } = encryptChannelTokens({
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });

    expect(
      decryptChannelTokens({ accessTokenEncrypted, refreshTokenEncrypted })
    ).toEqual({ accessToken: "access-1", refreshToken: "refresh-1" });
  });

  it("returns refreshToken: null when the row has no refresh token", () => {
    const { accessTokenEncrypted } = encryptChannelTokens({ accessToken: "access-1" });
    expect(
      decryptChannelTokens({ accessTokenEncrypted, refreshTokenEncrypted: null })
    ).toEqual({ accessToken: "access-1", refreshToken: null });
  });

  it("returns null when the row has no stored access token", () => {
    expect(
      decryptChannelTokens({ accessTokenEncrypted: null, refreshTokenEncrypted: null })
    ).toBeNull();
  });
});

describe("key rotation", () => {
  it("decrypts ciphertext encrypted under NEXTAUTH_SECRET after EMAIL_SECRETS_KEY is later set", () => {
    delete process.env.EMAIL_SECRETS_KEY;
    process.env.NEXTAUTH_SECRET = "legacy-nextauth-secret-value";
    const { accessTokenEncrypted } = encryptChannelTokens({ accessToken: "legacy-token" });

    process.env.EMAIL_SECRETS_KEY = "newly-rotated-dedicated-key";
    expect(decryptChannelAccessToken(accessTokenEncrypted)).toBe("legacy-token");
  });
});
