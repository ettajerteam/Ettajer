/**
 * Platform Digital Twin — computed model, rebuildable from PlatformState.
 */
import type { PlatformState } from "@/lib/intelligence/engine-types";
import type { PlatformDimensionSnapshot } from "@/lib/intelligence/memory/types";

export type TwinRelationKind =
  | "CAUSAL_SUPPORTED"
  | "CORRELATION_ONLY"
  | "UNKNOWN";

export type TwinEdge = {
  from: string;
  to: string;
  kind: TwinRelationKind;
  ruleId: string;
  explanation: string;
};

export type TwinMetrics = {
  pendingCOD: number;
  pendingGMV: number;
  realOrders7d: number;
  realRevenue7d: number;
  firstSaleCount: number;
  firstSaleHighIntent: number;
  domainFailures: number;
  supportBacklog: number;
  emptyStores: number;
  activeMerchants: number;
  liveStores: number;
  totalStores: number;
  top2SharePct: number;
  revenueChange7d: number;
  ordersChange7d: number;
};

export type TwinHealthVector = {
  operationsHealth: number;
  activationHealth: number;
  revenueHealth: number;
  supportHealth: number;
  technicalHealth: number;
  merchantHealth: number;
  trustHealth: number;
};

export type PlatformDigitalTwin = {
  timestamp: Date;
  sourceSnapshotId: string;
  metrics: TwinMetrics;
  health: TwinHealthVector;
  dimensions: PlatformDimensionSnapshot;
  operationalState: { pendingCOD: number; pendingGMV: number };
  revenueState: {
    realRevenue7d: number;
    realOrders7d: number;
    concentrationPct: number;
  };
  activationState: {
    firstSaleCount: number;
    highIntent: number;
    emptyStores: number;
  };
  supportState: { openSupport: number };
  technicalState: { domainFailing: number };
  riskState: string[];
  opportunityState: string[];
  dependencies: TwinEdge[];
  constraints: {
    supportCapacity: number;
    dailyActivationCapacity: number;
    operationsCapacity: number;
  };
  dataQuality: {
    confidencePenalty: number;
    insufficientEvidence: boolean;
    sampleSize: number;
  };
  confidence: number;
  /** Opaque hash of relevant twin inputs for cache keys */
  twinHash: string;
};

export type MerchantTwin = {
  merchantId: string;
  storeName?: string;
  stage: string;
  health: number;
  momentum: "up" | "flat" | "down";
  intent: number;
  bottleneck: string;
  risk: string | null;
  opportunity: string | null;
  constraints: string[];
  recommendedIntervention: string | null;
};
