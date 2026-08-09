import { describe, expect, it } from "vitest";
import {
  contrastOnColor,
  parseHexColor,
  relativeLuminance,
  resolveCtaFill,
  resolveStoreCtaColors,
} from "@/lib/storefront/cta-contrast";

describe("cta-contrast", () => {
  it("parses hex colors", () => {
    expect(parseHexColor("#fff")).toBe("#ffffff");
    expect(parseHexColor("007AFF")).toBe("#007aff");
    expect(parseHexColor("nope")).toBeNull();
  });

  it("uses dark text on light fills", () => {
    expect(contrastOnColor("#ffffff")).toBe("#0a0a0a");
    expect(contrastOnColor("#f5f5f5")).toBe("#0a0a0a");
    expect(contrastOnColor("#007AFF")).toBe("#ffffff");
    expect(contrastOnColor("#0a0a0a")).toBe("#ffffff");
  });

  it("darkens near-white primary for light-surface CTAs", () => {
    const fill = resolveCtaFill("#ffffff", "light");
    expect(fill).not.toBe("#ffffff");
    expect(relativeLuminance(fill)!).toBeLessThan(0.5);
    const cta = resolveStoreCtaColors("#ffffff", "light");
    expect(cta.onFill).toBe("#ffffff");
    expect(cta.style.color).toBe("#ffffff");
  });

  it("keeps saturated brand colors", () => {
    expect(resolveCtaFill("#007AFF", "light").toLowerCase()).toBe("#007aff");
  });
});
