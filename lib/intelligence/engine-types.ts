/**
 * Core engine types for Dr Sara (deterministic intelligence).
 * UI presentation types live alongside in types.ts (SaraBriefing).
 */

export type IntelligenceCategory =
  | "revenue"
  | "activation"
  | "operations"
  | "support"
  | "technical"
  | "merchant"
  | "orders";

export type IntelligenceSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "positive";

export type Evidence = {
  label: string;
  value: string | number | boolean | null;
  source: string;
};

export type IntelligenceSignal = {
  id: string;
  category: IntelligenceCategory;
  severity: IntelligenceSeverity;
  title: string;
  summary: string;
  value?: number;
  unit?: string;
  affectedCount?: number;
  evidence: Evidence[];
  ruleId: string;
  confidence: number;
  createdAt: Date;
  /** Optional financial impact hint (MAD) */
  financialImpact?: number;
  href?: string;
  cta?: string;
};

export type CorrelatedInsight = {
  id: string;
  title: string;
  explanation: string;
  signalIds: string[];
  evidence: Evidence[];
  confidence: number;
  recommendedAction?: {
    label: string;
    href: string;
  };
};

export type DiagnosisId =
  | "EMPTY_STORE_BOTTLENECK"
  | "FIRST_SALE_BOTTLENECK"
  | "TRAFFIC_BOTTLENECK"
  | "TECHNICAL_BOTTLENECK"
  | "SUPPORT_BOTTLENECK"
  | "OPERATIONAL_COD_BOTTLENECK"
  | "REVENUE_CONCENTRATION"
  | "NONE";

export type Diagnosis = {
  id: string;
  diagnosisId: DiagnosisId;
  domain: IntelligenceCategory;
  title: string;
  explanation: string;
  evidence: Evidence[];
  confidence: number;
  signalIds: string[];
  recommendedAction?: {
    label: string;
    href: string;
  };
};

export type PriorityBand = "critical" | "high" | "medium" | "low";

export type PrioritizedItem = {
  id: string;
  signalId: string;
  priorityScore: number;
  band: PriorityBand;
  impactScore: number;
  urgencyScore: number;
  confidenceScore: number;
  calculation: string;
  title: string;
  summary: string;
  severity: IntelligenceSeverity;
  affectedCount: number;
  href: string;
  cta: string;
  evidence: Evidence[];
  ruleId: string;
};

export type HealthDimensionScores = {
  operations: number;
  activation: number;
  revenue: number;
  support: number;
  technical: number;
};

export type PlatformHealthResult = {
  score: number;
  dimensions: HealthDimensionScores;
  status: "healthy" | "stable" | "attention" | "critical";
  reasons: string[];
};

export type MerchantSegmentId =
  | "HOT"
  | "FIRST_SALE"
  | "GROWING"
  | "POWER"
  | "AT_RISK"
  | "DORMANT";

export type MerchantSegmentAssignment = {
  merchantId: string;
  storeId?: string;
  storeName?: string;
  segment: MerchantSegmentId;
  score: number;
  reasons: string[];
  evidence: Evidence[];
};

export type SegmentSummary = {
  id: MerchantSegmentId;
  label: string;
  description: string;
  count: number;
  href: string;
};

export type Opportunity = {
  id: string;
  title: string;
  impact: string;
  confidence: number;
  affectedCount: number;
  reason: string;
  href: string;
  cta: string;
  evidence: Evidence[];
  ruleId: string;
};

export type RiskItem = {
  id: string;
  category: string;
  title: string;
  metric: string;
  detail: string;
  riskLevel: "high" | "medium" | "low" | "none";
  href: string;
  cta: string;
  evidence: Evidence[];
  ruleId: string;
  confidence: number;
};

export type RecommendedAction = {
  id: string;
  type: "navigation";
  label: string;
  description: string;
  href: string;
  urgency: "critical" | "high" | "normal";
  ruleId?: string;
  relatedSignalIds?: string[];
};

export type WhyExplanation = {
  ruleId: string;
  ruleDescription: string;
  evidence: Evidence[];
  calculation: string;
  conclusion: string;
  source: "live platform data";
  engine: "deterministic intelligence";
};

export type DrSaraSnapshot = {
  generatedAt: Date;
  headline: string;
  health: PlatformHealthResult;
  /** Dimension labels for pulse UI */
  pulseDimensions: {
    id: keyof HealthDimensionScores;
    label: string;
    score: number;
    statusLabel: string;
    status: "ok" | "watch" | "attention" | "critical";
  }[];
  priorities: PrioritizedItem[];
  signals: IntelligenceSignal[];
  correlations: CorrelatedInsight[];
  diagnoses: Diagnosis[];
  opportunities: Opportunity[];
  risks: RiskItem[];
  merchantSegments: {
    summary: SegmentSummary[];
    merchants: MerchantSegmentAssignment[];
  };
  recommendedActions: RecommendedAction[];
  criticalCount: number;
  /** V2: single most important next step */
  topAction: {
    label: string;
    href: string;
    whyThisFirst: string;
    priorityScore: number;
    calculation: string;
  } | null;
  /** V2: ranked action list */
  topActions: {
    rank: number;
    label: string;
    href: string;
    whyThisFirst: string;
    priorityScore: number;
  }[];
  temporalTrends: {
    id: string;
    label: string;
    current: number;
    previous: number;
    deltaPct: number;
    direction: string;
    acceleration: string;
    confidence: number;
    anomaly: boolean;
    basis: string;
  }[];
  forecasts: {
    id: string;
    metric: string;
    forecastDirection: string;
    confidence: number;
    statement: string;
    basis: string;
  }[];
  bottlenecks: {
    code: string;
    title: string;
    affectedCount: number;
    highIntent?: number;
    severity: string;
    confidence: number;
    ruleIds: string[];
  }[];
  merchantJourneys: {
    merchantId: string;
    storeName?: string;
    stage: string;
    bottleneck: string;
    healthScore: number;
    recommendedAction: string;
  }[];
  events: {
    type: string;
    timestamp: Date;
    metadata: Record<string, string | number | boolean | null>;
  }[];
  dataQualityWarnings: {
    id: string;
    severity: string;
    message: string;
  }[];
  actionOutcomes: {
    totalTracked: number;
    successCount: number;
    failureCount: number;
    actionSuccessRate: number | null;
    notes: string[];
  };
  registryFired: string[];
  confidence: {
    overall: number;
    evidenceCount: number;
    notes: string[];
  };
  metadata: {
    engine: "deterministic";
    version: string;
    thresholds: Record<string, number | boolean>;
    source: "getPlatformOverview";
  };
};

/**
 * Normalized platform facts for the rule engine.
 * Derived from PlatformOverviewData — never invented.
 */
export type PlatformState = {
  now: Date;
  pendingRealOrders: number;
  processingRealOrders: number;
  pendingRealGmv: number;
  waitingUsers: number;
  openSupport: number;
  failedLogins24h: number;
  domainsConnected: number;
  domainsConnectedSuccess: number;
  domainFailing: number;
  hotEmptyCount: number;
  loggedInEmpty7d: number;
  firstSaleCount: number;
  firstSaleHighIntent: number;
  funnel: {
    totalStores: number;
    noProducts: number;
    draftOnly: number;
    activeNoOrders: number;
    hasOrders: number;
  };
  realOrders: number;
  realOrders7d: number;
  totalRevenue: number;
  realRevenue7d: number;
  revenueChange7d: number;
  ordersChange7d: number;
  top2SharePct: number;
  concentrationElevated: boolean;
  concentrationMessage: string | null;
  concentrationWhy: string | null;
  concentrationRecommended: string | null;
  concentration: {
    id: string;
    name: string;
    slug: string;
    gmv: number;
    sharePct: number;
    orders: number;
  }[];
  firstSaleBottlenecks: {
    lowRecentActivity: number;
    singleProduct: number;
    multiProductReady: number;
    noCustomDomain: number;
    noCodConfigured: number;
  };
  helpToday: {
    storeId: string;
    storeName: string;
    slug: string;
    ownerId: string;
    ownerName: string | null;
    ownerEmail: string;
    intent: string;
    healthScore: number;
  }[];
  attentionSentence: string;
  liveStores: number;
  totalStores: number;
  /** Temporal / event enrichment from overview */
  newUsers7d: number;
  usersChange7d: number;
  sparklines: {
    revenue: number[];
    orders: number[];
    signups: number[];
  };
  today: { orders: number; revenue: number; signups: number };
  yesterday: { orders: number; revenue: number; signups: number };
  liveFeed: {
    id: string;
    category: string;
    title: string;
    detail: string;
    href: string;
    createdAt: Date;
  }[];
};
