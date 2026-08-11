/**
 * Etsy listing -> Ettajer import mapping unit tests
 * (lib/channels/adapters/etsy/map-listing.ts).
 */
import { describe, expect, it } from "vitest";
import {
  mapEtsyListingToImportResult,
  type EtsyListing,
} from "@/lib/channels/adapters/etsy/map-listing";

function baseListing(overrides: Partial<EtsyListing> = {}): EtsyListing {
  return {
    listing_id: 111222333,
    title: "Handmade Ceramic Mug",
    description: "A lovely handmade ceramic mug, glazed and kiln-fired.",
    price: { amount: 2999, divisor: 100, currency_code: "USD" },
    quantity: 12,
    tags: ["ceramic", "mug", "handmade"],
    state: "active",
    url: "https://www.etsy.com/listing/111222333",
    images: [
      {
        listing_image_id: 1,
        url_fullxfull: "https://example.com/full1.jpg",
        alt_text: "Front view",
        rank: 1,
      },
      {
        listing_image_id: 2,
        url_fullxfull: "https://example.com/full2.jpg",
        alt_text: null,
        rank: 2,
      },
    ],
    inventory: {
      products: [
        {
          product_id: 1,
          sku: "MUG-001",
          is_deleted: false,
          offerings: [
            {
              offering_id: 1,
              quantity: 12,
              is_enabled: true,
              price: { amount: 2999, divisor: 100, currency_code: "USD" },
            },
          ],
          property_values: [],
        },
      ],
    },
    ...overrides,
  };
}

describe("mapEtsyListingToImportResult — happy path", () => {
  it("maps a complete listing to a ready-to-import result", () => {
    const result = mapEtsyListingToImportResult(baseListing());

    expect(result.readiness).toBe("ready");
    expect(result.issues).toEqual([]);

    expect(result.productInput.title).toBe("Handmade Ceramic Mug");
    expect(result.productInput.price).toBe(29.99);
    expect(result.productInput.sku).toBe("MUG-001");
    expect(result.productInput.inventory).toBe(12);
    expect(result.productInput.tags).toEqual(["ceramic", "mug", "handmade"]);
    expect(result.productInput.images).toEqual([
      "https://example.com/full1.jpg",
      "https://example.com/full2.jpg",
    ]);

    expect(result.channelListing.externalProductId).toBe("111222333");
    expect(result.channelListing.price).toBe(29.99);
    expect(result.channelListing.currencyCode).toBe("USD");
    expect(result.channelListing.sku).toBe("MUG-001");
    expect(result.channelListing.quantity).toBe(12);
  });

  it("accepts draft listings as a valid, importable state", () => {
    const result = mapEtsyListingToImportResult(baseListing({ state: "draft" }));
    expect(result.readiness).toBe("ready");
  });

  it("ignores soft-deleted inventory products when mapping variants", () => {
    const result = mapEtsyListingToImportResult(
      baseListing({
        inventory: {
          products: [
            {
              product_id: 1,
              sku: "LIVE-SKU",
              is_deleted: false,
              offerings: [
                {
                  offering_id: 1,
                  quantity: 5,
                  is_enabled: true,
                  price: { amount: 1999, divisor: 100, currency_code: "USD" },
                },
              ],
              property_values: [],
            },
            {
              product_id: 2,
              sku: "DELETED-SKU",
              is_deleted: true,
              offerings: [
                {
                  offering_id: 2,
                  quantity: 3,
                  is_enabled: true,
                  price: { amount: 1999, divisor: 100, currency_code: "USD" },
                },
              ],
              property_values: [],
            },
          ],
        },
      })
    );

    expect(result.channelListing.variants).toHaveLength(1);
    expect(result.channelListing.variants[0].sku).toBe("LIVE-SKU");
  });
});

describe("mapEtsyListingToImportResult — never invents missing data", () => {
  it("leaves title, price, and inventory unset (not defaulted) when Etsy omits them", () => {
    const result = mapEtsyListingToImportResult(
      baseListing({ title: null, price: null, quantity: null })
    );

    expect(result.productInput.title).toBe("");
    expect(result.productInput.price).toBeNull();
    expect(result.productInput.inventory).toBeNull();
    expect(result.readiness).toBe("needs_review");
    expect(result.issues).toContain("Missing title");
    expect(result.issues).toContain("Missing or unparseable price");
  });

  it("does not invent a SKU when no inventory products are present", () => {
    const result = mapEtsyListingToImportResult(baseListing({ inventory: null }));
    expect(result.productInput.sku).toBeNull();
    expect(result.channelListing.variants).toEqual([]);
  });

  it("does not invent images and reports needs_review when there are none", () => {
    const result = mapEtsyListingToImportResult(baseListing({ images: [] }));
    expect(result.productInput.images).toEqual([]);
    expect(result.readiness).toBe("needs_review");
    expect(result.issues).toContain("No usable images");
  });

  it("defaults tags to an empty array (never fabricated) when Etsy omits them", () => {
    const result = mapEtsyListingToImportResult(baseListing({ tags: null }));
    expect(result.productInput.tags).toEqual([]);
    expect(result.channelListing.tags).toEqual([]);
  });
});

describe("mapEtsyListingToImportResult — SKU classification", () => {
  it("classifies a listing whose variants all lack a SKU as missing_sku", () => {
    const result = mapEtsyListingToImportResult(
      baseListing({
        inventory: {
          products: [
            {
              product_id: 1,
              sku: null,
              is_deleted: false,
              offerings: [
                {
                  offering_id: 1,
                  quantity: 5,
                  is_enabled: true,
                  price: { amount: 1999, divisor: 100, currency_code: "USD" },
                },
              ],
              property_values: [{ property_id: 1, property_name: "Color", values: ["Blue"] }],
            },
            {
              product_id: 2,
              sku: null,
              is_deleted: false,
              offerings: [
                {
                  offering_id: 2,
                  quantity: 3,
                  is_enabled: true,
                  price: { amount: 1999, divisor: 100, currency_code: "USD" },
                },
              ],
              property_values: [{ property_id: 1, property_name: "Color", values: ["Red"] }],
            },
          ],
        },
      })
    );

    expect(result.readiness).toBe("missing_sku");
    expect(result.productInput.sku).toBeNull();
    expect(result.channelListing.variants).toHaveLength(2);
    expect(result.channelListing.variants.every((v) => v.sku === null)).toBe(true);
  });

  it("surfaces a partial-SKU issue when only some variants have a SKU", () => {
    const result = mapEtsyListingToImportResult(
      baseListing({
        inventory: {
          products: [
            {
              product_id: 1,
              sku: "HAS-SKU",
              is_deleted: false,
              offerings: [
                {
                  offering_id: 1,
                  quantity: 5,
                  is_enabled: true,
                  price: { amount: 1999, divisor: 100, currency_code: "USD" },
                },
              ],
              property_values: [],
            },
            {
              product_id: 2,
              sku: null,
              is_deleted: false,
              offerings: [
                {
                  offering_id: 2,
                  quantity: 3,
                  is_enabled: true,
                  price: { amount: 1999, divisor: 100, currency_code: "USD" },
                },
              ],
              property_values: [],
            },
          ],
        },
      })
    );

    expect(result.issues).toContain("One or more variants are missing a SKU");
  });

  it("uses the single variant's SKU as the top-level SKU when there is exactly one variant", () => {
    const result = mapEtsyListingToImportResult(
      baseListing({
        inventory: {
          products: [
            {
              product_id: 1,
              sku: "ONLY-ONE",
              is_deleted: false,
              offerings: [
                {
                  offering_id: 1,
                  quantity: 5,
                  is_enabled: true,
                  price: { amount: 1999, divisor: 100, currency_code: "USD" },
                },
              ],
              property_values: [],
            },
          ],
        },
      })
    );

    expect(result.productInput.sku).toBe("ONLY-ONE");
    expect(result.readiness).toBe("ready");
  });
});

describe("mapEtsyListingToImportResult — listing state", () => {
  it("classifies unsupported listing states (e.g. sold_out) regardless of otherwise-complete data", () => {
    const result = mapEtsyListingToImportResult(baseListing({ state: "sold_out" }));
    expect(result.readiness).toBe("unsupported");
    expect(result.issues.some((i) => i.includes("Unsupported listing state"))).toBe(true);
  });
});
