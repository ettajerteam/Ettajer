export type PricingCurrency = "MAD" | "USD";

/** Display rate for localized Moroccan pricing */
export const USD_TO_MAD = 10;

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  monthlyPriceUsd: number;
  annualPriceUsd: number;
  features: string[];
  cta: string;
  popular: boolean;
  firstMonthFree: boolean;
};

export const LANDING_PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Launch your first store and validate your catalog with COD.",
    monthlyPriceUsd: 15,
    annualPriceUsd: 12,
    features: [
      "COD checkout included",
      "Up to 100 products",
      "1 custom domain",
      "Visual store builder",
    ],
    cta: "Choose Starter",
    popular: false,
    firstMonthFree: true,
  },
  {
    id: "growth",
    name: "Growth",
    description: "Scale with 0% platform fees and full COD automation.",
    monthlyPriceUsd: 49,
    annualPriceUsd: 39,
    features: [
      "0% Ettajer transaction fees",
      "WhatsApp & SMS verification",
      "Unlimited products",
      "3 custom domains",
      "Order automation",
    ],
    cta: "Choose Growth",
    popular: true,
    firstMonthFree: true,
  },
  {
    id: "business",
    name: "Business",
    description: "High-volume COD operations with dedicated support.",
    monthlyPriceUsd: 99,
    annualPriceUsd: 79,
    features: [
      "0% Ettajer transaction fees",
      "Courier integrations",
      "Unlimited stores & domains",
      "Migration concierge",
      "Dedicated account manager",
    ],
    cta: "Choose Business",
    popular: false,
    firstMonthFree: true,
  },
];

export const PRICING_INCLUDES = [
  "0% fees on Growth & Business",
  "SSL security",
  "Edge hosting",
  "COD-ready checkout",
] as const;

export function formatPrice(
  amountUsd: number,
  currency: PricingCurrency,
  options?: { perMonth?: boolean },
): string {
  if (currency === "MAD") {
    const mad = amountUsd * USD_TO_MAD;
    return options?.perMonth ? `${mad} MAD/mo` : `${mad} MAD`;
  }
  return options?.perMonth ? `$${amountUsd}/mo` : `$${amountUsd}`;
}

export function getAnnualSavings(
  plan: PricingPlan,
  currency: PricingCurrency,
): string {
  const savedUsd = (plan.monthlyPriceUsd - plan.annualPriceUsd) * 12;
  if (currency === "MAD") {
    return `Save ${savedUsd * USD_TO_MAD} MAD/year`;
  }
  return `Save $${savedUsd}/year`;
}

export function getBilledAnnuallyTotal(
  plan: PricingPlan,
  currency: PricingCurrency,
): string {
  const totalUsd = plan.annualPriceUsd * 12;
  if (currency === "MAD") {
    return `${totalUsd * USD_TO_MAD} MAD/year`;
  }
  return `$${totalUsd}/year`;
}
