import { describe, expect, it } from "vitest";
import {
  activationTemperature,
  scoreMerchantHealth,
} from "@/lib/admin/merchant-health";
import {
  buildAttentionQueue,
  buildAttentionSentence,
} from "@/lib/admin/attention-queue";

describe("scoreMerchantHealth", () => {
  it("scores an empty recent store as needs attention / risk", () => {
    const now = new Date("2026-08-26T12:00:00Z");
    const result = scoreMerchantHealth({
      hasStore: true,
      storeCreatedAt: new Date("2026-08-20T12:00:00Z"),
      lastLoginAt: new Date("2026-08-25T12:00:00Z"),
      productCount: 0,
      activeProductCount: 0,
      hasThemeCustomized: true,
      realOrders: 0,
      now,
    });
    expect(result.score).toBeLessThan(60);
    expect(result.bottleneck).toBe("products");
    expect(result.why.some((w) => w.includes("No products"))).toBe(true);
    expect(result.recommendedAction.length).toBeGreaterThan(10);
  });

  it("scores an activated store higher", () => {
    const result = scoreMerchantHealth({
      hasStore: true,
      lastLoginAt: new Date(),
      productCount: 5,
      activeProductCount: 4,
      hasThemeCustomized: true,
      realOrders: 3,
      realGmv: 1200,
    });
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.band).toBe("healthy");
    expect(result.bottleneck).toBe("none");
  });
});

describe("activationTemperature", () => {
  it("marks recent logins as hot", () => {
    const now = new Date("2026-08-26T12:00:00Z");
    expect(
      activationTemperature(new Date("2026-08-24T12:00:00Z"), null, now)
    ).toBe("hot");
    expect(
      activationTemperature(new Date("2026-07-01T12:00:00Z"), null, now)
    ).toBe("cold");
  });
});

describe("attention queue", () => {
  it("builds a live attention sentence from counts", () => {
    const items = buildAttentionQueue({
      pendingRealOrders: 12,
      waitingUsers: 0,
      hotEmptyCount: 19,
      loggedInEmpty7d: 19,
      activeNoOrders: 128,
      domainsConnected: 10,
      domainsConnectedSuccess: 6,
      openSupport: 1,
      failedLogins24h: 0,
    });
    expect(items[0]?.id).toBe("pending-cod");
    const sentence = buildAttentionSentence(items);
    expect(sentence).toContain("12 orders need attention");
    expect(sentence).toContain("merchants need activation");
    expect(items.some((i) => i.id === "domains")).toBe(true);
  });
});
