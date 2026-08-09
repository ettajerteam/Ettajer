import { describe, expect, it } from "vitest";
import { parseScopes, hasScope, THEME_AI_DEFAULT_SCOPES } from "@/lib/developer/scopes";
import { verifyPkce, pkceChallengeS256 } from "@/lib/developer/pkce";
import { sanitizeThemeText } from "@/lib/developer/theme-validate";
import { emptyThemeDocument, asThemeDocument } from "@/lib/developer/theme-document";
import { checkDeveloperRateLimit } from "@/lib/developer/rate-limit";

describe("developer scopes", () => {
  it("parses and dedupes scopes", () => {
    const scopes = parseScopes("store:read themes:write store:read bogus");
    expect(scopes).toEqual(["store:read", "themes:write"]);
  });

  it("default theme scopes exclude publish", () => {
    expect(THEME_AI_DEFAULT_SCOPES.includes("themes:publish")).toBe(false);
    expect(hasScope(THEME_AI_DEFAULT_SCOPES, "themes:write")).toBe(true);
  });
});

describe("pkce", () => {
  it("verifies S256", () => {
    const verifier = "test-verifier-value-1234567890";
    const challenge = pkceChallengeS256(verifier);
    expect(verifyPkce(verifier, challenge, "S256")).toBe(true);
    expect(verifyPkce("wrong", challenge, "S256")).toBe(false);
  });

  it("rejects plain PKCE", () => {
    expect(verifyPkce("abc", "abc", "plain")).toBe(false);
    expect(verifyPkce("abc", "abc", "S256")).toBe(false);
  });
});

describe("theme sanitize", () => {
  it("strips script tags and javascript urls", () => {
    const cleaned = sanitizeThemeText({
      headline: 'Hi<script>alert(1)</script>',
      link: "javascript:alert(1)",
      ok: "Safe text",
    }) as Record<string, string>;
    expect(cleaned.headline).not.toContain("<script");
    expect(cleaned.link.toLowerCase()).not.toContain("javascript:");
    expect(cleaned.ok).toBe("Safe text");
  });
});

describe("theme document", () => {
  it("normalizes empty document", () => {
    const doc = asThemeDocument({});
    expect(doc.version).toBe(1);
    expect(doc.templates.home.sections).toEqual([]);
  });

  it("emptyThemeDocument is valid shape", () => {
    const doc = emptyThemeDocument({ theme: "modern" });
    expect(doc.theme.theme).toBe("modern");
  });
});

describe("rate limit", () => {
  it("blocks after limit", () => {
    const key = `test-${Date.now()}`;
    expect(checkDeveloperRateLimit({ key, limit: 2 }).ok).toBe(true);
    expect(checkDeveloperRateLimit({ key, limit: 2 }).ok).toBe(true);
    expect(checkDeveloperRateLimit({ key, limit: 2 }).ok).toBe(false);
  });
});

describe("navigation validation", () => {
  it("rejects javascript hrefs", async () => {
    const { validateNavigation } = await import("@/lib/developer/theme-validate");
    const { DeveloperApiError } = await import("@/lib/developer/errors");
    expect(() =>
      validateNavigation([{ id: "1", label: "Bad", href: "javascript:alert(1)" }]),
    ).toThrow(DeveloperApiError);
  });

  it("accepts relative storefront links", async () => {
    const { validateNavigation } = await import("@/lib/developer/theme-validate");
    const nav = validateNavigation([
      { id: "home", label: "Home", href: "/" },
      { id: "shop", label: "Shop", href: "/products" },
    ]);
    expect(nav).toHaveLength(2);
    expect(nav[0].href).toBe("/");
  });
});

describe("media url hardening", () => {
  it("rejects private hosts", async () => {
    const { assertSafeMediaUrl } = await import("@/lib/developer/theme-validate");
    const { DeveloperApiError } = await import("@/lib/developer/errors");
    expect(() => assertSafeMediaUrl("http://127.0.0.1/x.png")).toThrow(DeveloperApiError);
    expect(() => assertSafeMediaUrl("http://169.254.169.254/latest")).toThrow(
      DeveloperApiError,
    );
  });
});

describe("scope matrix (mutations)", () => {
  it("read-only scopes cannot publish or write themes", async () => {
    const { hasScope } = await import("@/lib/developer/scopes");
    const readOnly = ["store:read", "products:read", "themes:read"] as const;
    expect(hasScope([...readOnly], "themes:write")).toBe(false);
    expect(hasScope([...readOnly], "themes:publish")).toBe(false);
    expect(hasScope([...readOnly], "pages:write")).toBe(false);
    expect(hasScope([...readOnly], "navigation:write")).toBe(false);
    expect(hasScope([...readOnly], "media:write")).toBe(false);
  });

  it("each write scope is distinct", async () => {
    const { hasScope } = await import("@/lib/developer/scopes");
    const base = ["themes:read", "themes:create", "themes:write"] as const;
    expect(hasScope([...base], "themes:publish")).toBe(false);
    expect(hasScope([...base, "themes:publish"], "themes:publish")).toBe(true);
    expect(hasScope(["pages:read"], "pages:write")).toBe(false);
    expect(hasScope(["media:read"], "media:write")).toBe(false);
    expect(hasScope(["navigation:read"], "navigation:write")).toBe(false);
  });
});
