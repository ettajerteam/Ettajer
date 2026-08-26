/**
 * Map PlatformDigitalTwin → DigitalTwinState contract.
 */
import type {
  DigitalTwinState,
  PlatformDigitalTwin,
} from "@/lib/intelligence/twin/types";

export function toDigitalTwinState(twin: PlatformDigitalTwin): DigitalTwinState {
  return {
    version: "5.0.0",
    generatedAt: twin.timestamp,
    platform: {
      totalStores: twin.metrics.totalStores,
      liveStores: twin.metrics.liveStores,
      activeMerchants: twin.metrics.activeMerchants,
    },
    merchants: {
      emptyStores: twin.metrics.emptyStores,
      firstSaleCount: twin.metrics.firstSaleCount,
    },
    commerce: {
      pendingCOD: twin.provenanced.pendingCOD,
      pendingGMV: twin.provenanced.pendingGMV,
      realOrders7d: twin.metrics.realOrders7d,
    },
    activation: {
      highIntent: twin.metrics.firstSaleHighIntent,
      emptyStores: twin.metrics.emptyStores,
    },
    operations: { pendingCOD: twin.metrics.pendingCOD },
    technical: { domainFailing: twin.provenanced.domainFailures },
    support: { openSupport: twin.provenanced.supportBacklog },
    revenue: {
      realRevenue7d: twin.provenanced.realRevenue7d,
      concentrationPct: twin.metrics.top2SharePct,
    },
    risks: twin.riskState,
    opportunities: twin.opportunityState,
    temporal: twin.dimensions,
    dependencies: twin.dependencies,
    dataQuality: twin.dataQuality,
    twinHash: twin.twinHash,
    confidence: twin.confidence,
  };
}
