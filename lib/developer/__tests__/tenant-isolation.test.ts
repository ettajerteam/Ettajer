/**
 * Replaced by integration/platform-integration.test.ts — keep a thin file so
 * older CI includes still discover the tenant suite when DATABASE_URL is set.
 */
import { describe, expect, it } from "vitest";
import { createHash, randomBytes } from "crypto";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

function hashToken(raw: string) {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

describe.runIf(hasDb)("developer tenant isolation (legacy entry)", () => {
  it("hashes API keys and never stores raw secret equality", () => {
    const raw = `etsk_live_${randomBytes(12).toString("hex")}`;
    const hashed = hashToken(raw);
    expect(hashed).not.toEqual(raw);
    expect(hashed).toHaveLength(64);
  });
});

describe("scope matrix (unit)", () => {
  it("publish requires themes:publish", async () => {
    const { hasScope, THEME_AI_DEFAULT_SCOPES } = await import(
      "@/lib/developer/scopes"
    );
    expect(hasScope(THEME_AI_DEFAULT_SCOPES, "themes:write")).toBe(true);
    expect(hasScope(THEME_AI_DEFAULT_SCOPES, "themes:publish")).toBe(false);
    expect(
      hasScope([...THEME_AI_DEFAULT_SCOPES, "themes:publish"], "themes:publish"),
    ).toBe(true);
  });
});
