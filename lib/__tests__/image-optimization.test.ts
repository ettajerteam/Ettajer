import { describe, expect, it } from "vitest";
import { shouldBypassImageOptimizer } from "@/lib/image-optimization";

describe("shouldBypassImageOptimizer", () => {
  it("bypasses Vercel Blob product images", () => {
    expect(
      shouldBypassImageOptimizer(
        "https://v2oyb83dujmkbwfn.public.blob.vercel-storage.com/uploads/store/photo.webp"
      )
    ).toBe(true);
  });

  it("still optimizes local theme placeholders", () => {
    expect(
      shouldBypassImageOptimizer("/assets/placeholders/products/modern-1.webp")
    ).toBe(false);
  });
});
