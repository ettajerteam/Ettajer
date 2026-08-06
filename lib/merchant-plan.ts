import { formatFounderNumber } from "@/lib/founder/constants";
import {
  LANDING_PRICING_PLANS,
  type PricingCurrency,
  type PricingPlan,
} from "@/lib/landing/pricing";

export type MerchantPlanKind = "founder" | "free" | "starter" | "growth" | "business";

export type MerchantPlanInfo = {
  kind: MerchantPlanKind;
  label: string;
  hint: string | null;
  needsUpgrade: boolean;
  href: string;
};

export type MerchantPlanStatus = {
  kind: MerchantPlanKind;
  label: string;
  summary: string;
  badge: string;
  needsUpgrade: boolean;
  href: string;
  founderNumber: number | null;
  perks: string[];
};

export const PAID_PLAN_KINDS = ["starter", "growth", "business"] as const;
export type PaidPlanKind = (typeof PAID_PLAN_KINDS)[number];

export type StoredMerchantPlan = "free" | PaidPlanKind;

export type PlanLimitId = "products" | "domains" | "stores" | "fees";

export type PlanLimits = {
  products: number | null;
  domains: number | null;
  stores: number | null;
  /** Ettajer platform fee percent; 0 = none */
  platformFeePercent: number | null;
};

export type PlanUsage = {
  products: number;
  domains: number;
  stores: number;
};

export type PlanCompareRow = {
  id: string;
  label: string;
  free: string;
  starter: string;
  growth: string;
  business: string;
};

const PLAN_LABELS: Record<MerchantPlanKind, string> = {
  founder: "Founder",
  free: "Free",
  starter: "Starter",
  growth: "Growth",
  business: "Business",
};

const PLAN_LIMITS: Record<MerchantPlanKind, PlanLimits> = {
  free: {
    products: 50,
    domains: 0,
    stores: 1,
    platformFeePercent: 2,
  },
  founder: {
    products: null,
    domains: 1,
    stores: 1,
    platformFeePercent: 0,
  },
  starter: {
    products: 100,
    domains: 1,
    stores: 1,
    platformFeePercent: 1,
  },
  growth: {
    products: null,
    domains: 3,
    stores: 1,
    platformFeePercent: 0,
  },
  business: {
    products: null,
    domains: null,
    stores: null,
    platformFeePercent: 0,
  },
};

export const PLAN_COMPARE_ROWS: PlanCompareRow[] = [
  {
    id: "products",
    label: "Products",
    free: "50",
    starter: "100",
    growth: "Unlimited",
    business: "Unlimited",
  },
  {
    id: "domains",
    label: "Custom domains",
    free: "—",
    starter: "1",
    growth: "3",
    business: "Unlimited",
  },
  {
    id: "fees",
    label: "Ettajer fees",
    free: "2%",
    starter: "1%",
    growth: "0%",
    business: "0%",
  },
  {
    id: "verification",
    label: "WhatsApp / SMS verify",
    free: "—",
    starter: "—",
    growth: "Included",
    business: "Included",
  },
  {
    id: "automation",
    label: "Order automation",
    free: "Basic",
    starter: "Basic",
    growth: "Full",
    business: "Full + courier",
  },
  {
    id: "support",
    label: "Support",
    free: "Help center",
    starter: "Email",
    growth: "Priority",
    business: "Dedicated AM",
  },
];

export function isPaidPlanKind(id: string): id is PaidPlanKind {
  return (PAID_PLAN_KINDS as readonly string[]).includes(id);
}

export function normalizeStoredPlan(
  plan?: string | null
): StoredMerchantPlan {
  const value = (plan ?? "free").trim().toLowerCase();
  if (isPaidPlanKind(value)) return value;
  return "free";
}

function paidPlanPerks(kind: PaidPlanKind): string[] {
  return (
    LANDING_PRICING_PLANS.find((p) => p.id === kind)?.features ?? [
      "COD checkout included",
      "Visual store builder",
    ]
  );
}

export function getPlanLimits(kind: MerchantPlanKind): PlanLimits {
  return PLAN_LIMITS[kind];
}

export function formatPlanLimit(value: number | null, unlimitedLabel = "Unlimited"): string {
  if (value === null) return unlimitedLabel;
  return String(value);
}

export function getUsagePercent(used: number, limit: number | null): number | null {
  if (limit === null || limit <= 0) return null;
  return Math.min(100, Math.round((used / limit) * 100));
}

/**
 * Resolve the merchant's current plan badge for dashboard chrome.
 * Paid plans win; founders without a paid plan keep the Founder badge.
 */
export function getMerchantPlanInfo(input: {
  founderNumber?: number | null;
  plan?: string | null;
}): MerchantPlanInfo {
  const stored = normalizeStoredPlan(input.plan);

  if (isPaidPlanKind(stored)) {
    return {
      kind: stored,
      label: PLAN_LABELS[stored],
      hint: stored === "starter" ? "Active plan" : "Upgrade anytime",
      needsUpgrade: stored === "starter",
      href: "/dashboard/settings?tab=plan",
    };
  }

  if (input.founderNumber && input.founderNumber > 0) {
    return {
      kind: "founder",
      label: "Founder",
      hint: formatFounderNumber(input.founderNumber),
      needsUpgrade: false,
      href: "/founder-card",
    };
  }

  return {
    kind: "free",
    label: "Free",
    hint: "Upgrade for Growth tools",
    needsUpgrade: true,
    href: "/dashboard/settings?tab=plan",
  };
}

/** Richer plan status for Settings → Plan. */
export function getMerchantPlanStatus(input: {
  founderNumber?: number | null;
  plan?: string | null;
}): MerchantPlanStatus {
  const info = getMerchantPlanInfo(input);

  if (isPaidPlanKind(info.kind)) {
    const pricing = LANDING_PRICING_PLANS.find((p) => p.id === info.kind);
    return {
      kind: info.kind,
      label: info.label,
      summary: pricing?.description ?? `You're on the ${info.label} plan.`,
      badge: "Active",
      needsUpgrade: info.kind === "starter",
      href: "/dashboard/settings?tab=plan",
      founderNumber: input.founderNumber ?? null,
      perks: paidPlanPerks(info.kind),
    };
  }

  if (info.kind === "founder" && input.founderNumber) {
    return {
      kind: "founder",
      label: "Founder",
      summary:
        "You hold an early Ettajer seat with lifetime recognition and priority access while we ship billing.",
      badge: "Lifetime seat",
      needsUpgrade: false,
      href: "/founder-card",
      founderNumber: input.founderNumber,
      perks: [
        "Founder card & early access",
        "Full COD storefront tools",
        "Priority product feedback channel",
        "No subscription charge while billing rolls out",
      ],
    };
  }

  return {
    kind: "free",
    label: "Free",
    summary:
      "You're on the Free plan. Compare Starter, Growth, and Business below — self-serve checkout is coming soon.",
    badge: "Early access",
    needsUpgrade: true,
    href: "/dashboard/settings?tab=plan",
    founderNumber: null,
    perks: [
      "COD checkout & store builder",
      "Orders, products, and customers",
      "Marketing pixels & email tools",
      "Upgrade unlocks 0% fees & higher limits",
    ],
  };
}

export function getPaidPricingPlans(): PricingPlan[] {
  return LANDING_PRICING_PLANS;
}

export function resolvePricingCurrency(
  storeCurrency?: string | null
): PricingCurrency {
  const c = (storeCurrency ?? "").trim().toUpperCase();
  return c === "MAD" || c === "DH" ? "MAD" : "USD";
}

export function getNextPlanKind(kind: MerchantPlanKind): PaidPlanKind | null {
  if (kind === "free" || kind === "founder" || kind === "starter") return "growth";
  if (kind === "growth") return "business";
  return null;
}