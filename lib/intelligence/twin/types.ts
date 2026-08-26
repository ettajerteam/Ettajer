/**
 * Platform Digital Twin — computed model, rebuildable from PlatformState.
 */
import type { PlatformDimensionSnapshot } from "@/lib/intelligence/memory/types";
import type { ProvenancedValue } from "@/lib/intelligence/twin/provenance";

export type TwinRelationKind =
  | "CAUSAL_SUPPORTED"
  | "CORRELATION_ONLY"
  | "UNKNOWN";

/** Explicit relationship labels — never claim causality from correlation alone. */
export type TwinRelationshipLabel =
  | "dependency"
  | "correlation"
  | "inferred causal relationship"
  | "observed relationship";

export type TwinEdge = {
  from: string;
  to: string;
  /** @deprecated prefer `relationship` for V5 consumers */
  kind: TwinRelationKind;
  relationship: TwinRelationshipLabel;
  strength: number;
  evidence: string;
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
  /** Provenance-bearing core metrics (deterministic confidence rules) */
  provenanced: {
    pendingCOD: ProvenancedValue;
    pendingGMV: ProvenancedValue;
    domainFailures: ProvenancedValue;
    supportBacklog: ProvenancedValue;
    realRevenue7d: ProvenancedValue;
  };
  version: "5.0.0";
};

/**
 * Strongly typed twin state contract for consumers (additive to PlatformDigitalTwin).
 */
export type DigitalTwinState = {
  version: "5.0.0";
  generatedAt: Date;
  platform: {
    totalStores: number;
    liveStores: number;
    activeMerchants: number;
  };
  merchants: { emptyStores: number; firstSaleCount: number };
  commerce: {
    pendingCOD: ProvenancedValue;
    pendingGMV: ProvenancedValue;
    realOrders7d: number;
  };
  activation: { highIntent: number; emptyStores: number };
  operations: { pendingCOD: number };
  technical: { domainFailing: ProvenancedValue };
  support: { openSupport: ProvenancedValue };
  revenue: {
    realRevenue7d: ProvenancedValue;
    concentrationPct: number;
  };
  risks: string[];
  opportunities: string[];
  temporal: PlatformDimensionSnapshot;
  dependencies: TwinEdge[];
  dataQuality: PlatformDigitalTwin["dataQuality"];
  twinHash: string;
  confidence: number;
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
