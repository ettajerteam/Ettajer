/**
 * Deterministic smart-pricing math unit tests (lib/channels/pricing.ts).
 */
import { describe, expect, it } from "vitest";
import { recommendedPrice, toCharmPrice, PricingInputError } from "@/lib/channels/pricing";

describe("recommendedPrice", () => {
  it("solves price = (cost + shipping) / (1 - (fee + margin) / 100)", () => {
    const result = recommendedPrice({
      cost: 10,
      shipping: 2,
      feePercent: 10,
      targetMarginPercent: 20,
    });

    // (10 + 2) / (1 - 0.30) = 12 / 0.7 = 17.142857... -> 17.14
    expect(result.price).toBe(17.14);
    expect(result.breakdown).toEqual({
      cost: 10,
      shipping: 2,
      feePercent: 10,
      targetMarginPercent: 20,
      estimatedFeeAmount: 1.71,
      estimatedMarginAmount: 3.43,
    });
  });

  it("defaults shipping to 0 when omitted", () => {
    const result = recommendedPrice({ cost: 20, feePercent: 0, targetMarginPercent: 0 });
    expect(result.price).toBe(20);
    expect(result.breakdown.shipping).toBe(0);
  });

  it("is deterministic — identical inputs always produce identical output", () => {
    const input = {
      cost: 15.5,
      shipping: 3.25,
      feePercent: 6.5,
      targetMarginPercent: 35,
    };
    expect(recommendedPrice(input)).toEqual(recommendedPrice(input));
  });

  it("rounds price and fee/margin breakdown amounts to 2 decimal places", () => {
    const result = recommendedPrice({ cost: 7, shipping: 1.33, feePercent: 8.25, targetMarginPercent: 15 });
    expect(Number.isInteger(result.price * 100)).toBe(true);
    expect(Number.isInteger(result.breakdown.estimatedFeeAmount * 100)).toBe(true);
    expect(Number.isInteger(result.breakdown.estimatedMarginAmount * 100)).toBe(true);
  });

  it("throws PricingInputError for negative cost or shipping", () => {
    expect(() =>
      recommendedPrice({ cost: -1, feePercent: 10, targetMarginPercent: 10 })
    ).toThrow(PricingInputError);
    expect(() =>
      recommendedPrice({ cost: 1, shipping: -1, feePercent: 10, targetMarginPercent: 10 })
    ).toThrow(PricingInputError);
  });

  it("throws PricingInputError for negative fee or margin percentages", () => {
    expect(() =>
      recommendedPrice({ cost: 1, feePercent: -5, targetMarginPercent: 10 })
    ).toThrow(PricingInputError);
    expect(() =>
      recommendedPrice({ cost: 1, feePercent: 5, targetMarginPercent: -10 })
    ).toThrow(PricingInputError);
  });

  it("throws PricingInputError when fee + margin is mathematically impossible (>= 100%)", () => {
    expect(() =>
      recommendedPrice({ cost: 10, feePercent: 60, targetMarginPercent: 40 })
    ).toThrow(PricingInputError);
    expect(() =>
      recommendedPrice({ cost: 10, feePercent: 70, targetMarginPercent: 40 })
    ).toThrow(/solvable/);
  });

  it("solves at zero cost/shipping, still respecting fee + margin", () => {
    const result = recommendedPrice({ cost: 0, shipping: 0, feePercent: 10, targetMarginPercent: 10 });
    expect(result.price).toBe(0);
  });
});

describe("toCharmPrice", () => {
  it("rounds down to the nearest whole number and appends a .99 ending", () => {
    expect(toCharmPrice(17.14)).toBe(17.99);
    expect(toCharmPrice(20)).toBe(20.99);
    expect(toCharmPrice(9.01)).toBe(9.99);
  });

  it("is deterministic for the same input", () => {
    expect(toCharmPrice(42.5)).toBe(toCharmPrice(42.5));
  });
});
