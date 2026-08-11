/**
 * Etsy OAuth PKCE + signed-state unit tests.
 * Mirrors the pattern used by lib/developer/__tests__/d4-security.test.ts for
 * PKCE/HMAC-signed state (see also lib/meta-oauth.ts, which this module mirrors).
 */
import { createHash, createHmac } from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildEtsyAuthorizeUrl,
  parseEtsyOAuthState,
  ETSY_OAUTH_SCOPES,
} from "@/lib/channels/adapters/etsy/oauth";

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-nextauth-secret-for-etsy-oauth";
  process.env.ETSY_CLIENT_ID = "test-etsy-client-id";
  delete process.env.ETSY_CLIENT_SECRET;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("buildEtsyAuthorizeUrl / PKCE challenge generation", () => {
  it("builds an authorize URL whose code_challenge matches SHA-256(code_verifier) from the signed state", () => {
    const { url, state, nonce } = buildEtsyAuthorizeUrl({
      userId: "user_1",
      storeId: "store_1",
    });

    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://www.etsy.com/oauth/connect");
    expect(parsed.searchParams.get("client_id")).toBe("test-etsy-client-id");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("code_challenge_method")).toBe("S256");
    expect(parsed.searchParams.get("scope")).toBe(ETSY_OAUTH_SCOPES.join(" "));
    expect(parsed.searchParams.get("state")).toBe(state);

    const payload = parseEtsyOAuthState(state);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("user_1");
    expect(payload?.storeId).toBe("store_1");
    expect(payload?.nonce).toBe(nonce);

    // RFC 7636: code_verifier must be 43-128 chars from the unreserved charset.
    expect(payload!.codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(payload!.codeVerifier.length).toBeLessThanOrEqual(128);
    expect(payload!.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);

    const expectedChallenge = createHash("sha256")
      .update(payload!.codeVerifier)
      .digest("base64url");
    expect(parsed.searchParams.get("code_challenge")).toBe(expectedChallenge);
  });

  it("generates a fresh code_verifier/challenge and nonce on every call", () => {
    const first = buildEtsyAuthorizeUrl({ userId: "u", storeId: "s" });
    const second = buildEtsyAuthorizeUrl({ userId: "u", storeId: "s" });

    expect(first.state).not.toBe(second.state);
    expect(first.nonce).not.toBe(second.nonce);
    expect(new URL(first.url).searchParams.get("code_challenge")).not.toBe(
      new URL(second.url).searchParams.get("code_challenge")
    );
  });

  it("honors a custom scopes list", () => {
    const { url } = buildEtsyAuthorizeUrl({
      userId: "u",
      storeId: "s",
      scopes: ["listings_r", "shops_r"],
    });
    expect(new URL(url).searchParams.get("scope")).toBe("listings_r shops_r");
  });

  it("throws when ETSY_CLIENT_ID is not configured", () => {
    delete process.env.ETSY_CLIENT_ID;
    expect(() => buildEtsyAuthorizeUrl({ userId: "u", storeId: "s" })).toThrow(
      /ETSY_CLIENT_ID/
    );
  });
});

describe("parseEtsyOAuthState — signature verification", () => {
  it("accepts a state it just signed", () => {
    const { state } = buildEtsyAuthorizeUrl({ userId: "u1", storeId: "s1" });
    expect(parseEtsyOAuthState(state)).not.toBeNull();
  });

  it("rejects a state with a tampered signature", () => {
    const { state } = buildEtsyAuthorizeUrl({ userId: "u", storeId: "s" });
    const [payload] = state.split(".");
    expect(parseEtsyOAuthState(`${payload}.not-a-valid-signature`)).toBeNull();
  });

  it("rejects a state with a tampered payload (signature no longer matches)", () => {
    const { state } = buildEtsyAuthorizeUrl({ userId: "u", storeId: "s" });
    const [, signature] = state.split(".");
    const forgedPayload = Buffer.from(
      JSON.stringify({
        userId: "attacker",
        storeId: "s",
        codeVerifier: "x".repeat(43),
        nonce: "n",
        exp: Date.now() + 10_000,
      })
    ).toString("base64url");
    expect(parseEtsyOAuthState(`${forgedPayload}.${signature}`)).toBeNull();
  });

  it("rejects a state signed under a different secret", () => {
    const { state } = buildEtsyAuthorizeUrl({ userId: "u", storeId: "s" });
    process.env.NEXTAUTH_SECRET = "a-completely-different-secret";
    expect(parseEtsyOAuthState(state)).toBeNull();
  });

  it("rejects malformed / empty state strings", () => {
    expect(parseEtsyOAuthState("")).toBeNull();
    expect(parseEtsyOAuthState("not-a-valid-state")).toBeNull();
    expect(parseEtsyOAuthState("payload-only.")).toBeNull();
    expect(parseEtsyOAuthState(".signature-only")).toBeNull();
  });

  it("rejects a validly-signed state whose decoded payload is missing required fields", () => {
    const incompletePayload = Buffer.from(
      JSON.stringify({ userId: "u", storeId: "s" })
    ).toString("base64url");
    const signature = createHmac(
      "sha256",
      process.env.NEXTAUTH_SECRET as string
    )
      .update(incompletePayload)
      .digest("base64url");
    expect(parseEtsyOAuthState(`${incompletePayload}.${signature}`)).toBeNull();
  });
});

describe("parseEtsyOAuthState — expiry", () => {
  it("accepts a freshly-issued state and rejects it once the 10-minute TTL has elapsed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const { state } = buildEtsyAuthorizeUrl({ userId: "u", storeId: "s" });
    expect(parseEtsyOAuthState(state)).not.toBeNull();

    // TTL is 10 minutes; step just past it.
    vi.setSystemTime(new Date("2026-01-01T00:10:00.001Z"));
    expect(parseEtsyOAuthState(state)).toBeNull();
  });
});
