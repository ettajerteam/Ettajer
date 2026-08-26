/**
 * Explainable merchant/store health score (0–100).
 * Uses only signals that exist in platform data — never fabricates activity.
 */

export type MerchantHealthInput = {
  hasStore: boolean;
  storeCreatedAt?: Date | string | null;
  lastLoginAt?: Date | string | null;
  productCount: number;
  activeProductCount: number;
  hasThemeCustomized?: boolean;
  hasCustomDomain?: boolean;
  domainDnsOk?: boolean | null;
  realOrders: number;
  realGmv?: number;
  openSupportCount?: number;
  recentErrorCount?: number;
  now?: Date;
};

export type MerchantHealthFactor = {
  id: string;
  label: string;
  met: boolean;
  weight: number;
};

export type MerchantHealthBand =
  | "healthy"
  | "growing"
  | "attention"
  | "risk";

export type MerchantHealthResult = {
  score: number;
  band: MerchantHealthBand;
  bandLabel: string;
  factors: MerchantHealthFactor[];
  why: string[];
  recommendedAction: string;
  bottleneck:
    | "account"
    | "store"
    | "products"
    | "publish"
    | "traffic"
    | "orders"
    | "support"
    | "none";
};

export type ActivationTemperature = "hot" | "warm" | "cold";

function daysSince(value: Date | string | null | undefined, now: Date): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return null;
  return (now.getTime() - t) / 86400000;
}

export function healthBand(score: number): MerchantHealthBand {
  if (score >= 80) return "healthy";
  if (score >= 60) return "growing";
  if (score >= 40) return "attention";
  return "risk";
}

export function healthBandLabel(band: MerchantHealthBand): string {
  switch (band) {
    case "healthy":
      return "Healthy / Activated";
    case "growing":
      return "Growing";
    case "attention":
      return "Needs Attention";
    case "risk":
      return "At Risk / Inactive";
  }
}

export function activationTemperature(
  lastLoginAt: Date | string | null | undefined,
  createdAt: Date | string | null | undefined,
  now = new Date()
): ActivationTemperature {
  const loginDays = daysSince(lastLoginAt, now);
  const createDays = daysSince(createdAt, now);
  if ((loginDays != null && loginDays <= 7) || (createDays != null && createDays <= 7)) {
    return "hot";
  }
  if ((loginDays != null && loginDays <= 30) || (createDays != null && createDays <= 30)) {
    return "warm";
  }
  return "cold";
}

export function temperatureLabel(temp: ActivationTemperature): string {
  switch (temp) {
    case "hot":
      return "Hot";
    case "warm":
      return "Warm";
    case "cold":
      return "Cold";
  }
}

export function scoreMerchantHealth(input: MerchantHealthInput): MerchantHealthResult {
  const now = input.now ?? new Date();
  const loginDays = daysSince(input.lastLoginAt, now);
  const recentLogin = loginDays != null && loginDays <= 7;
  const somewhatRecent = loginDays != null && loginDays <= 30;
  const hasProducts = input.productCount > 0;
  const hasPublished = input.activeProductCount > 0;
  const hasOrders = input.realOrders > 0;
  const themeOk = Boolean(input.hasThemeCustomized);
  const domainOk = Boolean(input.hasCustomDomain);
  const dnsOk = input.domainDnsOk === true;
  const supportDrag = (input.openSupportCount ?? 0) > 0;
  const errorDrag = (input.recentErrorCount ?? 0) > 0;

  const factors: MerchantHealthFactor[] = [
    {
      id: "store",
      label: "Store created",
      met: input.hasStore,
      weight: 10,
    },
    {
      id: "theme",
      label: "Theme customized",
      met: themeOk,
      weight: 8,
    },
    {
      id: "activity",
      label:
        loginDays == null
          ? "No recorded login"
          : loginDays < 1
            ? "Active today"
            : `Active ${Math.round(loginDays)}d ago`,
      met: recentLogin || somewhatRecent,
      weight: recentLogin ? 18 : somewhatRecent ? 10 : 0,
    },
    {
      id: "products",
      label: hasProducts
        ? `${input.productCount} product${input.productCount === 1 ? "" : "s"}`
        : "No products",
      met: hasProducts,
      weight: 16,
    },
    {
      id: "published",
      label: hasPublished
        ? `${input.activeProductCount} published`
        : "No published products",
      met: hasPublished,
      weight: 18,
    },
    {
      id: "orders",
      label: hasOrders
        ? `${input.realOrders} real order${input.realOrders === 1 ? "" : "s"}`
        : "No real orders",
      met: hasOrders,
      weight: 22,
    },
    {
      id: "domain",
      label: !domainOk
        ? "No custom domain"
        : dnsOk
          ? "Custom domain DNS OK"
          : input.domainDnsOk === false
            ? "Custom domain DNS failing"
            : "Custom domain linked",
      met: domainOk && input.domainDnsOk !== false,
      weight: domainOk ? 8 : 0,
    },
  ];

  let score = 0;
  for (const f of factors) {
    if (f.met && f.weight > 0) score += f.weight;
  }
  // Soft penalties — only when signal exists
  if (supportDrag) score = Math.max(0, score - 6);
  if (errorDrag) score = Math.max(0, score - 4);
  if (domainOk && input.domainDnsOk === false) score = Math.max(0, score - 8);
  if (!recentLogin && !somewhatRecent && input.hasStore) {
    score = Math.max(0, score - 8);
  }

  score = Math.min(100, Math.round(score));
  const band = healthBand(score);

  const why = factors.map((f) => `${f.met ? "✓" : "✕"} ${f.label}`);
  if (supportDrag) why.push("✕ Open support thread");
  if (errorDrag) why.push("✕ Recent platform errors");

  let bottleneck: MerchantHealthResult["bottleneck"] = "none";
  let recommendedAction: string;

  if (!input.hasStore) {
    bottleneck = "store";
    recommendedAction = "Help the merchant finish store creation.";
  } else if (!hasProducts) {
    bottleneck = "products";
    recommendedAction = recentLogin
      ? "High-intent merchant — they returned recently but have not added products. Send product setup help."
      : "Merchant has a store with zero products. Offer onboarding help or a first-product nudge.";
  } else if (!hasPublished) {
    bottleneck = "publish";
    recommendedAction =
      "Products exist as drafts. Help them publish at least one live product.";
  } else if (!hasOrders) {
    bottleneck = "traffic";
    recommendedAction =
      "Catalog is live with zero real sales — prioritize share, domain, and first-sale coaching.";
  } else if (supportDrag) {
    bottleneck = "support";
    recommendedAction = "Resolve open support before asking for more growth work.";
  } else {
    bottleneck = "none";
    recommendedAction =
      "Merchant is activated. Watch for concentration risk and keep support latency low.";
  }

  return {
    score,
    band,
    bandLabel: healthBandLabel(band),
    factors,
    why,
    recommendedAction,
    bottleneck,
  };
}

/** Map activation row fields into health input. */
export function healthFromActivationRow(row: {
  createdAt: Date;
  lastLoginAt: Date | null;
  activeProducts: number;
  draftProducts: number;
  realOrders: number;
  category?: string | null;
}): MerchantHealthResult {
  const productCount = row.activeProducts + row.draftProducts;
  return scoreMerchantHealth({
    hasStore: true,
    storeCreatedAt: row.createdAt,
    lastLoginAt: row.lastLoginAt,
    productCount,
    activeProductCount: row.activeProducts,
    hasThemeCustomized: Boolean(row.category),
    realOrders: row.realOrders,
  });
}
