import type {
  MerchantSegmentAssignment,
  MerchantSegmentId,
  PlatformState,
  SegmentSummary,
} from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

export function getMerchantSegmentSummary(
  state: PlatformState
): SegmentSummary[] {
  const growing = state.concentration.filter(
    (c) => c.orders >= T.growingMinOrders
  ).length;
  const power = state.concentration.filter(
    (c) => c.sharePct >= T.powerSharePct || c.gmv > 0
  ).length;
  const dormant = Math.max(0, state.funnel.noProducts - state.loggedInEmpty7d);

  return [
    {
      id: "HOT",
      label: "HOT",
      description: "Recently active + no products",
      count: state.hotEmptyCount,
      href: "/admin/activation?stage=empty&temp=hot",
    },
    {
      id: "FIRST_SALE",
      label: "FIRST SALE",
      description: "Products live + zero real orders",
      count: state.firstSaleCount,
      href: "/admin/activation?stage=listed",
    },
    {
      id: "GROWING",
      label: "GROWING",
      description: "Recent real orders + positive momentum",
      count: growing,
      href: "/admin/analytics?range=7",
    },
    {
      id: "POWER",
      label: "POWER",
      description: "High GMV / high order volume",
      count: power,
      href: "/admin/analytics?range=30",
    },
    {
      id: "AT_RISK",
      label: "AT RISK",
      description: "Waiting activation or blocked from commerce",
      count: state.waitingUsers,
      href: "/admin/users?status=waiting",
    },
    {
      id: "DORMANT",
      label: "DORMANT",
      description: "Empty stores with no recent login",
      count: dormant,
      href: "/admin/activation?stage=empty&temp=cold",
    },
  ];
}

/**
 * Primary segment assignments for known merchants in the overview sample.
 * A merchant may qualify for multiple categories; primary is chosen by precedence.
 */
export function getMerchantSegments(
  state: PlatformState
): MerchantSegmentAssignment[] {
  const assignments: MerchantSegmentAssignment[] = [];
  const seen = new Set<string>();

  const precedence: MerchantSegmentId[] = [
    "POWER",
    "GROWING",
    "HOT",
    "FIRST_SALE",
    "AT_RISK",
    "DORMANT",
  ];

  function push(
    merchantId: string,
    candidates: MerchantSegmentId[],
    score: number,
    reasons: string[],
    evidence: MerchantSegmentAssignment["evidence"],
    store?: { storeId: string; storeName: string }
  ) {
    if (seen.has(merchantId)) return;
    const segment =
      precedence.find((p) => candidates.includes(p)) ?? candidates[0]!;
    seen.add(merchantId);
    assignments.push({
      merchantId,
      storeId: store?.storeId,
      storeName: store?.storeName,
      segment,
      score,
      reasons,
      evidence,
    });
  }

  for (const c of state.concentration) {
    const candidates: MerchantSegmentId[] = [];
    if (c.sharePct >= T.powerSharePct || c.gmv > 5000) candidates.push("POWER");
    if (c.orders >= T.growingMinOrders) candidates.push("GROWING");
    if (candidates.length === 0) continue;
    push(
      c.id,
      candidates,
      Math.min(100, c.sharePct + c.orders * 5),
      [
        c.sharePct >= T.powerSharePct
          ? `Share ${c.sharePct}% of tracked GMV`
          : null,
        c.orders > 0 ? `${c.orders} real orders` : null,
      ].filter(Boolean) as string[],
      [
        { label: "gmv", value: c.gmv, source: "platform.gmv" },
        { label: "sharePct", value: c.sharePct, source: "platform.gmv" },
        { label: "orders", value: c.orders, source: "platform.gmv" },
      ],
      { storeId: c.id, storeName: c.name }
    );
  }

  for (const h of state.helpToday) {
    push(
      h.ownerId || h.storeId,
      ["HOT"],
      h.healthScore,
      ["Recently active", "No products", `Intent ${h.intent}`],
      [
        { label: "intent", value: h.intent, source: "merchant.health" },
        {
          label: "healthScore",
          value: h.healthScore,
          source: "merchant.health",
        },
      ],
      { storeId: h.storeId, storeName: h.storeName }
    );
  }

  return assignments;
}

/** Pure helper for tests: zero products + recent login → HOT */
export function segmentForMerchantFacts(facts: {
  productCount: number;
  realOrders: number;
  loggedInWithinWindow: boolean;
  gmv: number;
  sharePct: number;
  previouslyActiveDeclining?: boolean;
  noRecentActivity?: boolean;
}): MerchantSegmentId {
  if (facts.sharePct >= T.powerSharePct || facts.gmv > 5000) return "POWER";
  if (facts.realOrders >= T.growingMinOrders && facts.gmv > 0) return "GROWING";
  if (facts.productCount === 0 && facts.loggedInWithinWindow) return "HOT";
  if (facts.productCount > 0 && facts.realOrders === 0) return "FIRST_SALE";
  if (facts.previouslyActiveDeclining) return "AT_RISK";
  if (facts.noRecentActivity) return "DORMANT";
  return "DORMANT";
}
