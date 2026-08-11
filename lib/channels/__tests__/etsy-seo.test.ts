/**
 * Heuristic Etsy SEO scoring unit tests (lib/channels/etsy-seo.ts).
 */
import { describe, expect, it } from "vitest";
import { computeEtsySeoScore } from "@/lib/channels/etsy-seo";

describe("computeEtsySeoScore — empty listing baseline", () => {
  it("scores 0 with actionable suggestions for a completely empty listing", () => {
    const result = computeEtsySeoScore({ title: "", tags: [], description: "", imageCount: 0 });
    expect(result.score).toBe(0);
    expect(result.breakdown).toEqual({
      titleScore: 0,
      tagScore: 0,
      descriptionScore: 0,
      imageScore: 0,
    });
    expect(result.suggestions).toContain("Add a title.");
    expect(result.suggestions).toContain("Add a product description.");
  });
});

describe("computeEtsySeoScore — title", () => {
  it("increases the title score as the title grows toward the 100-140 char sweet spot", () => {
    const short = computeEtsySeoScore({ title: "Mug", tags: [], description: "", imageCount: 0 });
    const medium = computeEtsySeoScore({
      title: "Handmade Ceramic Mug Handmade Ceramic Mug Handmade Ceramic Mug", // 62 chars
      tags: [],
      description: "",
      imageCount: 0,
    });
    const long = computeEtsySeoScore({
      title:
        "Handmade Ceramic Mug Handmade Ceramic Mug Handmade Ceramic Mug Handmade Ceramic Mug Handmade Ceramic Mug", // 104 chars
      tags: [],
      description: "",
      imageCount: 0,
    });

    expect(medium.breakdown.titleScore).toBeGreaterThan(short.breakdown.titleScore);
    expect(long.breakdown.titleScore).toBeGreaterThan(medium.breakdown.titleScore);
    expect(long.breakdown.titleScore).toBe(30);
    expect(long.suggestions.some((s) => s.toLowerCase().includes("title"))).toBe(false);
  });

  it("penalizes titles over Etsy's 140-character limit", () => {
    const tooLong = computeEtsySeoScore({
      title: "x".repeat(150),
      tags: [],
      description: "",
      imageCount: 0,
    });
    expect(tooLong.breakdown.titleScore).toBe(25);
    expect(tooLong.suggestions.some((s) => s.includes("exceeds"))).toBe(true);
  });
});

describe("computeEtsySeoScore — tags", () => {
  it("increases the tag score with more tags, capping at the 13-tag maximum", () => {
    const noTags = computeEtsySeoScore({ title: "", tags: [], description: "", imageCount: 0 });
    const someTags = computeEtsySeoScore({
      title: "",
      tags: ["a", "b", "c"],
      description: "",
      imageCount: 0,
    });
    const maxTags = computeEtsySeoScore({
      title: "",
      tags: Array.from({ length: 13 }, (_, i) => `tag${i}`),
      description: "",
      imageCount: 0,
    });
    const overMax = computeEtsySeoScore({
      title: "",
      tags: Array.from({ length: 20 }, (_, i) => `tag${i}`),
      description: "",
      imageCount: 0,
    });

    expect(someTags.breakdown.tagScore).toBeGreaterThan(noTags.breakdown.tagScore);
    expect(maxTags.breakdown.tagScore).toBeGreaterThan(someTags.breakdown.tagScore);
    expect(maxTags.breakdown.tagScore).toBe(30);
    expect(overMax.breakdown.tagScore).toBe(30);
    expect(maxTags.suggestions.some((s) => s.toLowerCase().includes("tag"))).toBe(false);
  });
});

describe("computeEtsySeoScore — description", () => {
  it("increases the description score with length, capping around 200+ characters", () => {
    const none = computeEtsySeoScore({ title: "", tags: [], description: "", imageCount: 0 });
    const thin = computeEtsySeoScore({
      title: "",
      tags: [],
      description: "A short description.",
      imageCount: 0,
    });
    const full = computeEtsySeoScore({
      title: "",
      tags: [],
      description: "A".repeat(250),
      imageCount: 0,
    });

    expect(thin.breakdown.descriptionScore).toBeGreaterThan(none.breakdown.descriptionScore);
    expect(full.breakdown.descriptionScore).toBeGreaterThan(thin.breakdown.descriptionScore);
    expect(full.breakdown.descriptionScore).toBe(20);
  });
});

describe("computeEtsySeoScore — images", () => {
  it("increases the image score with more images, capping at the 10-image maximum", () => {
    const none = computeEtsySeoScore({ title: "", tags: [], description: "", imageCount: 0 });
    const some = computeEtsySeoScore({ title: "", tags: [], description: "", imageCount: 4 });
    const max = computeEtsySeoScore({ title: "", tags: [], description: "", imageCount: 10 });
    const over = computeEtsySeoScore({ title: "", tags: [], description: "", imageCount: 25 });

    expect(some.breakdown.imageScore).toBeGreaterThan(none.breakdown.imageScore);
    expect(max.breakdown.imageScore).toBeGreaterThan(some.breakdown.imageScore);
    expect(max.breakdown.imageScore).toBe(20);
    expect(over.breakdown.imageScore).toBe(20);
    expect(max.suggestions.some((s) => s.toLowerCase().includes("image"))).toBe(false);
  });
});

describe("computeEtsySeoScore — overall", () => {
  it("scores a well-optimized listing much higher than a poor one, with no leftover suggestions", () => {
    const poor = computeEtsySeoScore({
      title: "Mug",
      tags: [],
      description: "",
      imageCount: 1,
    });
    const great = computeEtsySeoScore({
      title:
        "Handmade Ceramic Mug Handmade Ceramic Mug Handmade Ceramic Mug Handmade Ceramic Mug Handmade Ceramic Mug", // 104 chars
      tags: Array.from({ length: 13 }, (_, i) => `keyword-${i}`),
      description: "A".repeat(220),
      imageCount: 10,
    });

    expect(great.score).toBeGreaterThan(poor.score);
    expect(great.score).toBe(100);
    expect(great.suggestions).toEqual([]);
  });

  it("clamps the overall score between 0 and 100", () => {
    const result = computeEtsySeoScore({
      title: "y".repeat(500),
      tags: Array.from({ length: 50 }, (_, i) => `t${i}`),
      description: "z".repeat(1000),
      imageCount: 50,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
