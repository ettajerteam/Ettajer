/**
 * Build PlatformDigitalTwin from live PlatformState (no DB duplication).
 */
import { INTELLIGENCE_SCORING_CONFIG as C } from "@/lib/intelligence/config/scoring";
import type { PlatformState } from "@/lib/intelligence/engine-types";
import { captureDimensionSnapshot } from "@/lib/intelligence/platform/transitions";
import { calculatePlatformHealth } from "@/lib/intelligence/scoring/health";
import { buildStateGraph } from "@/lib/intelligence/twin/state-graph";
import type {
  PlatformDigitalTwin,
  TwinHealthVector,
  TwinMetrics,
} from "@/lib/intelligence/twin/types";

export function buildTwinMetrics(state: PlatformState): TwinMetrics {
  return {
    pendingCOD: state.pendingRealOrders,
    pendingGMV: state.pendingRealGmv,
    realOrders7d: state.realOrders7d,
    realRevenue7d: state.realRevenue7d,
    firstSaleCount: state.firstSaleCount,
    firstSaleHighIntent: state.firstSaleHighIntent,
    domainFailures: state.domainFailing,
    supportBacklog: state.openSupport,
    emptyStores: state.funnel.noProducts,
    activeMerchants: state.funnel.hasOrders,
    liveStores: state.liveStores,
    totalStores: state.totalStores,
    top2SharePct: state.top2SharePct,
    revenueChange7d: state.revenueChange7d,
    ordersChange7d: state.ordersChange7d,
  };
}

export function buildHealthVector(state: PlatformState): TwinHealthVector {
  const h = calculatePlatformHealth(state);
  const trust =
    state.pendingRealOrders > 0 || state.openSupport > 0
      ? Math.max(0, 100 - state.pendingRealOrders * 5 - state.openSupport * 8)
      : 90;
  const merchantHealth = Math.round(
    (h.dimensions.activation + h.dimensions.revenue) / 2
  );
  return {
    operationsHealth: h.dimensions.operations,
    activationHealth: h.dimensions.activation,
    revenueHealth: h.dimensions.revenue,
    supportHealth: h.dimensions.support,
    technicalHealth: h.dimensions.technical,
    merchantHealth,
    trustHealth: trust,
  };
}

function hashTwinInputs(state: PlatformState, snapshotId: string): string {
  const payload = JSON.stringify({
    snapshotId,
    pending: state.pendingRealOrders,
    gmv: state.pendingRealGmv,
    dns: state.domainFailing,
    support: state.openSupport,
    firstSale: state.firstSaleCount,
    rev7: state.realRevenue7d,
    ord7: state.realOrders7d,
    change: state.revenueChange7d,
  });
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function buildPlatformDigitalTwin(input: {
  state: PlatformState;
  sourceSnapshotId: string;
  confidencePenalty?: number;
  insufficientEvidence?: boolean;
  sampleSize?: number;
  risks?: string[];
  opportunities?: string[];
}): PlatformDigitalTwin {
  const { state } = input;
  const metrics = buildTwinMetrics(state);
  const health = buildHealthVector(state);
  const dimensions = captureDimensionSnapshot(state);
  const twinHash = hashTwinInputs(state, input.sourceSnapshotId);
  const penalty = input.confidencePenalty ?? 0;
  const confidence = Math.max(0.2, Math.round((1 - penalty) * 100) / 100);

  const riskState = input.risks ?? [];
  if (state.pendingRealOrders >= 10) riskState.push("COD_CRITICAL");
  if (state.domainFailing >= 3) riskState.push("DNS_SPIKE");
  if (state.top2SharePct >= 60) riskState.push("REVENUE_CONCENTRATION");

  const opportunityState = input.opportunities ?? [];
  if (state.firstSaleHighIntent > 0) {
    opportunityState.push("HIGH_INTENT_FIRST_SALE");
  }
  if (state.loggedInEmpty7d > 0) opportunityState.push("HOT_EMPTY");

  return {
    timestamp: state.now,
    sourceSnapshotId: input.sourceSnapshotId,
    metrics,
    health,
    dimensions,
    operationalState: {
      pendingCOD: metrics.pendingCOD,
      pendingGMV: metrics.pendingGMV,
    },
    revenueState: {
      realRevenue7d: metrics.realRevenue7d,
      realOrders7d: metrics.realOrders7d,
      concentrationPct: metrics.top2SharePct,
    },
    activationState: {
      firstSaleCount: metrics.firstSaleCount,
      highIntent: metrics.firstSaleHighIntent,
      emptyStores: metrics.emptyStores,
    },
    supportState: { openSupport: metrics.supportBacklog },
    technicalState: { domainFailing: metrics.domainFailures },
    riskState: [...new Set(riskState)],
    opportunityState: [...new Set(opportunityState)],
    dependencies: buildStateGraph(state),
    constraints: {
      supportCapacity: C.twin.defaultSupportCapacity,
      dailyActivationCapacity: C.twin.defaultDailyActivationCapacity,
      operationsCapacity: C.twin.defaultOperationsCapacity,
    },
    dataQuality: {
      confidencePenalty: penalty,
      insufficientEvidence: input.insufficientEvidence ?? false,
      sampleSize: input.sampleSize ?? state.totalStores,
    },
    confidence,
    twinHash,
  };
}
