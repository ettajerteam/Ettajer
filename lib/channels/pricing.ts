/**
 * Deterministic smart pricing for channel listings.
 * Solves for the sale price that covers cost + shipping, absorbs the
 * channel's take-rate (feePercent), and still leaves the target margin.
 *
 *   price * (1 - feePercent/100) - cost - shipping = price * targetMarginPercent/100
 *   price = (cost + shipping) / (1 - (feePercent + targetMarginPercent) / 100)
 */

export interface RecommendedPriceInput {
  /** Cost of goods sold (COGS), in store currency. */
  cost: number;
  /** Estimated shipping cost absorbed by the seller. */
  shipping?: number;
  /** Channel take-rate, e.g. Etsy transaction + payment fees (~9-10%). */
  feePercent: number;
  /** Desired net margin as a percent of the sale price. */
  targetMarginPercent: number;
}

export interface RecommendedPriceResult {
  price: number;
  breakdown: {
    cost: number;
    shipping: number;
    feePercent: number;
    targetMarginPercent: number;
    estimatedFeeAmount: number;
    estimatedMarginAmount: number;
  };
}

export class PricingInputError extends Error {}

/**
 * Compute a recommended sale price. Throws PricingInputError for invalid
 * inputs (negative costs, or fee+margin percentages that make pricing
 * mathematically impossible, i.e. >= 100%).
 */
export function recommendedPrice(input: RecommendedPriceInput): RecommendedPriceResult {
  const cost = input.cost;
  const shipping = input.shipping ?? 0;
  const feePercent = input.feePercent;
  const targetMarginPercent = input.targetMarginPercent;

  if (cost < 0 || shipping < 0) {
    throw new PricingInputError("cost and shipping must be non-negative");
  }
  if (feePercent < 0 || targetMarginPercent < 0) {
    throw new PricingInputError("feePercent and targetMarginPercent must be non-negative");
  }

  const denominator = 1 - (feePercent + targetMarginPercent) / 100;
  if (denominator <= 0) {
    throw new PricingInputError(
      "feePercent + targetMarginPercent must be less than 100% for pricing to be solvable"
    );
  }

  const base = cost + shipping;
  const price = Math.round((base / denominator) * 100) / 100;
  const estimatedFeeAmount = Math.round(price * (feePercent / 100) * 100) / 100;
  const estimatedMarginAmount = Math.round(price * (targetMarginPercent / 100) * 100) / 100;

  return {
    price,
    breakdown: {
      cost,
      shipping,
      feePercent,
      targetMarginPercent,
      estimatedFeeAmount,
      estimatedMarginAmount,
    },
  };
}

/** Round a price to a ".99" charm-pricing ending, never below the input price minus 1 unit. */
export function toCharmPrice(price: number): number {
  const whole = Math.floor(price);
  return Math.round((whole + 0.99) * 100) / 100;
}
