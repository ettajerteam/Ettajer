import type { PlatformState } from "@/lib/intelligence/engine-types";
import { getMerchantSegmentSummary } from "@/lib/intelligence/segments/merchants";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

export type RichSegment = {
  id: string;
  label: string;
  description: string;
  count: number;
  href: string;
  ruleId: string;
  definition: string;
  priority: number;
  analyticalOnly?: boolean;
};

/** Extended segments — not mutually exclusive. */
export function buildRichSegments(state: PlatformState): RichSegment[] {
  const base = getMerchantSegmentSummary(state);
  const rich: RichSegment[] = base.map((s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
    count: s.count,
    href: s.href,
    ruleId: `SEGMENT_${s.id}`,
    definition: s.description,
    priority:
      s.id === "HOT"
        ? 80
        : s.id === "FIRST_SALE"
          ? 75
          : s.id === "AT_RISK"
            ? 70
            : s.id === "POWER"
              ? 60
              : 40,
  }));

  rich.push({
    id: "HIGH_INTENT",
    label: "HIGH_INTENT",
    description: "High-intent first-sale or hot empty",
    count: state.firstSaleHighIntent + state.loggedInEmpty7d,
    href: "/admin/activation",
    ruleId: "SEGMENT_HIGH_INTENT",
    definition: "Recent activity among empty or zero-order catalogs",
    priority: 85,
    analyticalOnly: true,
  });

  if (state.domainFailing > 0) {
    rich.push({
      id: "TECHNICAL_BLOCK",
      label: "TECHNICAL_BLOCK",
      description: "Stores with failing custom domains",
      count: state.domainFailing,
      href: "/admin/domains",
      ruleId: "SEGMENT_TECHNICAL_BLOCK",
      definition: "customDomain present && dns != healthy",
      priority: 90,
      analyticalOnly: true,
    });
  }

  if (state.pendingRealOrders > 0) {
    rich.push({
      id: "OPERATIONAL_BLOCK",
      label: "OPERATIONAL_BLOCK",
      description: "Pending COD operational block",
      count: state.pendingRealOrders,
      href: "/admin/payments?focus=pending",
      ruleId: "SEGMENT_OPERATIONAL_BLOCK",
      definition: "pendingRealOrders > 0",
      priority: 95,
      analyticalOnly: true,
    });
  }

  rich.push({
    id: "LOW_INTENT",
    label: "LOW_INTENT",
    description: "Empty stores without recent login",
    count: Math.max(0, state.funnel.noProducts - state.loggedInEmpty7d),
    href: "/admin/activation?temp=cold",
    ruleId: "SEGMENT_LOW_INTENT",
    definition: `no products && no login within ${T.activationWindowDays}d`,
    priority: 20,
    analyticalOnly: true,
  });

  return rich;
}
