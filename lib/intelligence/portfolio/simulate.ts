/**
 * Portfolio simulation under capacity constraints.
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { PlatformDigitalTwin } from "@/lib/intelligence/twin/types";

export type InterventionPortfolio = {
  id: string;
  label: string;
  candidatePool: number;
  selectedSize: number;
  capacityLimit: number;
  coveragePct: number;
  expectedImpactPerAction: number;
  operationalLoad: number;
  risk: number;
  note: string;
};

export function buildActivationPortfolios(
  twin: PlatformDigitalTwin
): InterventionPortfolio[] {
  const pool = Math.max(
    twin.metrics.firstSaleHighIntent,
    Math.min(twin.metrics.firstSaleCount, twin.metrics.firstSaleHighIntent + twin.activationState.emptyStores)
  );
  const capacity = twin.constraints.dailyActivationCapacity;
  const sizes = C.twin.maxPortfolioSizes.filter((n) => n > 0);

  return sizes.map((size) => {
    const selected = Math.min(size, pool, capacity);
    const coveragePct =
      pool === 0 ? 0 : Math.round((selected / pool) * 1000) / 10;
    return {
      id: `portfolio-first-sale-${size}`,
      label: `Top ${size} first-sale / high-intent targets`,
      candidatePool: pool,
      selectedSize: selected,
      capacityLimit: capacity,
      coveragePct,
      expectedImpactPerAction: selected > 0 ? 0.45 : 0,
      operationalLoad: selected / Math.max(1, capacity),
      risk: size > capacity ? 0.4 : 0.15,
      note:
        pool > capacity
          ? `We have ${pool} candidates but capacity supports ${capacity} — prioritize top ${selected}.`
          : `Pool ${pool} fits within capacity ${capacity}.`,
    };
  });
}
