import { describe, expect, it } from "vitest";
import {
  expandVariantOptionValues,
  normalizeProductVariants,
  parseProductVariants,
} from "@/lib/product-variants";

describe("expandVariantOptionValues", () => {
  it("splits comma-separated size lists into individual options", () => {
    expect(expandVariantOptionValues(["S, M, L, XL"])).toEqual(["S", "M", "L", "XL"]);
  });

  it("splits color lists", () => {
    expect(expandVariantOptionValues(["red, bleu, black, gris"])).toEqual([
      "red",
      "bleu",
      "black",
      "gris",
    ]);
  });

  it("leaves already-split options alone", () => {
    expect(expandVariantOptionValues(["S", "M", "L", "XL"])).toEqual(["S", "M", "L", "XL"]);
  });

  it("splits slash-separated lists", () => {
    expect(expandVariantOptionValues(["S / M / L"])).toEqual(["S", "M", "L"]);
  });

  it("keeps a single value that happens to contain one comma-less token", () => {
    expect(expandVariantOptionValues(["Blue"])).toEqual(["Blue"]);
  });
});

describe("parseProductVariants", () => {
  it("expands legacy comma-list options for storefront chips", () => {
    const parsed = parseProductVariants([
      { id: "1", name: "Size", options: ["S, M, L, XL"] },
      { id: "2", name: "Color", options: ["red, bleu, black, gris"] },
    ]);
    expect(parsed[0]?.options).toEqual(["S", "M", "L", "XL"]);
    expect(parsed[1]?.options).toEqual(["red", "bleu", "black", "gris"]);
  });
});

describe("normalizeProductVariants", () => {
  it("drops empty variants and expands lists on save", () => {
    expect(
      normalizeProductVariants([
        { id: "1", name: "Size", options: ["S, M, L, XL"] },
        { id: "2", name: "  ", options: ["A"] },
      ])
    ).toEqual([{ id: "1", name: "Size", options: ["S", "M", "L", "XL"], optionImages: undefined }]);
  });
});
