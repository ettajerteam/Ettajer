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
  /** V3 */
  causalHypotheses: {
    id: string;
    ruleId: string;
    hypothesis: string;
    confidence: number;
    affectedCount: number;
    evidenceLines: string[];
  }[];
  anomalies: {
    id: string;
    ruleId: string;
    title: string;
    baseline: number;
    observed: number;
    deltaPct: number;
    confidence: number;
  }[];
  merchantIntelligence: {
    merchantId: string;
    storeName?: string;
    lifecycleStage: string;
    bottleneck: string;
    intentScore: number;
    interventionScore: number;
    opportunity: string | null;
  }[];
  interventions: {
    id: string;
    type: string;
    merchantId: string | null;
    priority: number;
    reason: string;
    recommendedRoute: string;
    expectedOutcome: string;
  }[];
  topIntervention: {
    type: string;
    merchantId: string | null;
    reason: string;
    recommendedRoute: string;
    priority: number;
    whyThisFirst: string;
  } | null;
  whyFirst: {
    decision: string;
    whyThis: string;
    whyNow: string;
    whyNotAlternative: string;
    evidence: string[];
  } | null;
  actionHistory: {
    actionId: string;
    type: string;
    status: string;
    timestamp: Date;
  }[];
  interventionMemory: {
    type: string;
    totalAttempts: number;
    successRate: number | null;
    note: string;
  }[];
  richSegments: {
    id: string;
    label: string;
    count: number;
    ruleId: string;
    priority: number;
  }[];
  graph: {
    nodeCount: number;
    edgeCount: number;
  };
  executionTrace: {
    snapshotId: string;
    rulesEvaluated: number;
    rulesFired: number;
    signalsGenerated: number;
    diagnoses: number;
    interventions: number;
    topAction: string | null;
    warnings: number;
    executionTimeMs: number;
  };
  /** V4 — additive control-loop fields */
  earlyWarnings: {
    id: string;
    metric: string;
    state: string;
    current: number;
    velocity: number;
    recoveryScore: number;
    ruleId: string;
  }[];
  recovery: {
    metric: string;
    state: string;
    recoveryScore: number;
    recoveryVelocity: number;
  }[];
  stateTransitions: {
    overall: string;
    fromCycleId: string | null;
    toCycleId: string;
    dimensions: {
      dimension: string;
      from: number;
      to: number;
      label: string;
      delta: number;
    }[];
    evidence: string[];
  } | null;
  blockedInterventions: {
    id: string;
    type: string;
    blockedBy: string[];
    reasons: string[];
  }[];
  interventionChains: {
    chainId: string;
    name: string;
    nextStep: string | null;
  }[];
  learning: {
    rulePerformance: {
      type: string;
      successRate: number | null;
      adaptivePriority: number;
      note: string;
    }[];
    update: string | null;
    /** V7 additive */
    topDecisionMemory?: {
      decisionType: string;
      confidenceBeforeMemory: number;
      confidenceAfterMemory: number;
      historicalReliability: string;
      evidenceStrength: string;
      memoryImpact: string;
      adjustment: {
        before: number;
        after: number;
        delta: number;
        reason: string;
        applied: boolean;
      };
      note: string;
    } | null;
    learningTrace?: { stage: string; detail: string }[];
    scoreAdjustments?: {
      decisionType: string;
      historicalReliabilityBonus: number;
      predictionAccuracyBonus: number;
      recentFailurePenalty: number;
      evidencePenalty: number;
      net: number;
      blockedPreserved: boolean;
    }[];
  };
  decisionV4: {
    scoreComponents: Record<string, number> | null;
    whyThisActionWon: string | null;
    historicalEffectiveness: number | null;
  };
  explainabilityV4: {
    decision: string;
    whatHappened: string;
    whyItMatters: string;
    evidence: string[];
    whatNext: string;
    whyThisAction: string;
    whatHappenedLastTime: string;
    whatWeExpect: string;
    whenWeMeasure: string;
    ifFails: string;
  } | null;
  negativeSignals: {
    id: string;
    ruleId: string;
    title: string;
    confidence: number;
  }[];
  secondaryDiagnoses: {
    primary: string;
    deepestBottleneck: string;
    explanation: string;
  }[];
  autonomy: {
    level: number;
    label: string;
    autoExecute: boolean;
  };
  executionTraceV4: {
    cycleId: string;
    stages: { stage: string; detail: string; count?: number }[];
    blockedInterventions: number;
    learningUpdate: string | null;
  } | null;
  dataQualityV2: {
    dataFreshness: string;
    sampleSize: number;
    missingDimensions: string[];
    confidencePenalty: number;
    insufficientEvidence: boolean;
  };
  /** V5 — Digital Twin & scenarios (additive) */
  digitalTwin: {
    twinHash: string;
    confidence: number;
    health: Record<string, number>;
    metrics: Record<string, number>;
    constraints: Record<string, number>;
    dependencyCount: number;
    version?: string;
    provenanced?: {
      pendingCOD: number;
      pendingGMV: number;
      domainFailures: number;
      supportBacklog: number;
      realRevenue7d: number;
      freshness: string;
      source: string;
    };
    contract?: {
      version: string;
      risks: string[];
      opportunities: string[];
    };
  } | null;
  scenarios: {
    scenarioId: string;
    kind: string;
    label: string;
    intervention: string | null;
    expectedImpact: number;
    confidence: number;
    blockedFactors: string[];
  }[];
  scenarioRanking: {
    rank: number;
    scenarioId: string;
    label: string;
    score: number;
    advantage: number;
  }[];
  topScenario: {
    scenarioId: string;
    label: string;
    intervention: string | null;
    score: number;
    whyChosen: string;
  } | null;
  interventionAdvantage: {
    scenarioId: string;
    advantage: number;
    riskReduction: number;
    formula: string;
  } | null;
  counterfactuals: {
    id: string;
    statement: string;
    evidenceStrength: string;
    confidence: number;
  }[];
  scenarioComparisons: {
    scenarioId: string;
    label: string;
    score: number;
    horizon: string;
    timeToImpact: string;
    confidence: number;
    whySelected: string | null;
    whyNot: string | null;
  }[];
  tradeoffs: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
  assumptions: {
    id: string;
    description: string;
    confidence: number;
    status: string;
    category: string;
  }[];
  scenarioForecasts: {
    scenarioId: string;
    label: string;
    kind: "SIMULATED";
    metrics: Record<string, { before: number; expectedAfter: [number, number] }>;
    confidence: number;
  }[];
  scenarioRisks: {
    scenarioId: string;
    expectedRisk: number;
    blockedFactors: string[];
  }[];
  simulationTrace: {
    kind: "SIMULATED";
    stages: { stage: string; detail: string }[];
  } | null;
  scenarioDataQuality: {
    status: "OK" | "DEGRADED";
    warnings: string[];
    confidencePenalty: number;
  } | null;
  formalCounterfactual: {
    kind: "COUNTERFACTUAL";
    statement: string;
    confidence: number;
    evidenceStrength: string;
    uncertainty: string;
  } | null;
  stateTrajectory: {
    dimension: string;
    now: number;
    points: { label: string; range: [number, number] }[];
  }[];
  portfolioScenarios: {
    id: string;
    label: string;
    selectedSize: number;
    capacityLimit: number;
    note: string;
  }[];
  merchantTwins: {
    merchantId: string;
    stage: string;
    bottleneck: string;
    recommendedIntervention: string | null;
  }[];
  decisionChanges: {
    previousTopAction: string | null;
    currentTopAction: string | null;
    changed: boolean;
    changeReason: string;
    stability: string;
  } | null;
  uncertainty: {
    confidence: number;
    evidenceQuality: number;
    assumptionCount: number;
    dataQualityPenalty: number;
  };
  escalationRisk: {
    note: string;
    escalationRisk: boolean;
  } | null;
  recoverySimulation: {
    onTrack: boolean;
    note: string;
  } | null;
  /** V6 — Decision Intelligence (additive) */
  decision: {
    topDecision: {
      id: string;
      version: string;
      selectedAction: {
        id: string;
        type: string;
        title: string;
        route: string;
        mode: "RECOMMENDED";
      };
      score: number;
      confidence: number;
      /** V7 memory enrichment */
      confidenceBeforeMemory?: number;
      confidenceAfterMemory?: number;
      historicalReliability?: string;
      evidenceStrength?: string;
      memoryImpact?: string;
      whyThis: string[];
      whyNot: { actionId: string; title: string; reasons: string[] }[];
      expectedOutcome: {
        kind: "SIMULATED" | "NONE";
        baseline: Record<string, number>;
        expectedAfter: Record<string, [number, number]>;
        note: string;
      };
      uncertainty: {
        level: string;
        dataQuality: string;
        notes: string[];
      };
      scenarioSupport: {
        strength: string;
        scenarioId: string | null;
        baseline: Record<string, number>;
        expectedAfter: Record<string, [number, number]>;
      };
      constraints: {
        constraintId: string;
        status: string;
        reason: string;
      }[];
      alternatives: {
        id: string;
        title: string;
        score: number;
        blocked: boolean;
      }[];
      mode: "RECOMMENDED";
    } | null;
    alternatives: {
      id: string;
      title: string;
      score: number;
      blocked: boolean;
      domain: string;
    }[];
    candidates: {
      id: string;
      title: string;
      score: number;
      blocked: boolean;
      route: string;
      urgency: number;
      confidence: number;
    }[];
    trace: { stage: string; detail: string; count?: number }[];
  } | null;
  /** V7 — Memory & learning (additive) */
  memory: {
    fingerprints: string[];
    primaryFingerprint: string;
    decisionHistorySummary: {
      totalRecords: number;
      byType: Record<string, number>;
    };
    successRates: {
      decisionType: string;
      totalMeasured: number;
      successRate: number | null;
      evidenceStrength: string;
      sampleQuality: string;
    }[];
    reliability: {
      decisionType: string;
      band: string;
      evidenceStrength: string;
      sampleSize: number;
      note: string;
    }[];
  } | null;
  /** V8 — Intervention orchestration (plan only; never executes) */
  intervention: {
    interventionId: string;
    type: string;
    status: string;
    executionMode: string;
    objective: string;
    target: { label: string; count: number; route: string };
    safetyLevel: string;
    overallRisk: string;
    approval: string;
    blastRadius: string;
    idempotencyKey: string;
    reviewHref: string;
    measurement: {
      primaryMetric: string;
      baseline: Record<string, number>;
      expectedAfter: Record<string, [number, number]>;
      measurementWindow: string;
    };
    rollback: { possible: boolean; reversibility: string };
    trace: { stage: string; detail: string }[];
    rationale: string[];
  } | null;
  /** V9 — Controlled execution governance (snapshot never auto-executes) */
  execution: {
    status: string;
    killSwitch: string;
    autoExecute: false;
    approval: {
      approvalId: string | null;
      lifecycle: string | null;
      requiresApproval: boolean;
      expiresAt: string | null;
    } | null;
    authorization: { authorized: boolean; reasons: string[] };
    governor: { verdict: string; reasons: string[] };
    idempotency: { key: string | null };
    verification: { note: string };
    outcome: {
      success: boolean | null;
      productionMutation: "NONE";
    } | null;
    executionTrace: {
      stage: string;
      timestamp: string;
      stateFingerprint: string;
      actor: string;
      result: string;
      reason: string;
      identifiers: Record<string, string>;
    }[];
    modeDefault: "DRY_RUN";
    note: string;
  } | null;
  /** V10 — Platform Intelligence OS (orchestrates V1–V9; never auto-executes) */
  intelligenceOS: {
    cycleId: string;
    status: string;
    health: {
      composite: number;
      weakDimensions: string[];
      note: string;
    };
    graph: {
      nodeCount: number;
      edgeCount: number;
      nodes: { id: string; type: string; label: string }[];
    };
    warnings: {
      id: string;
      severity: string;
      title: string;
      evidence: string[];
      trajectory: string;
      estimatedHorizon: string;
      recommendedResponse: string;
    }[];
    opportunities: {
      id: string;
      title: string;
      impact: string;
      confidence: number;
      evidence: string[];
      recommendedAction: string;
    }[];
    portfolio: {
      orderedIds: string[];
      items: {
        rank: number;
        decisionId: string;
        interventionType: string;
        title: string;
        score: number;
        approvalRequired: boolean;
      }[];
      whyOrderedThisWay: string[];
      combinedRisk: string;
    };
    bestStrategy: {
      strategyId: string;
      label: string;
      whyThisStrategy: string[];
      alternativesRejected: { strategyId: string; reasons: string[] }[];
    } | null;
    autonomy: {
      mode: string;
      controlledAutoEnabled: boolean;
      autoExecute: false;
      reasons: string[];
    };
    governance: {
      decision: string;
      reasons: string[];
    };
    learning: {
      evidenceNotes: string[];
      confidenceAdjustment: {
        before: number;
        after: number;
        delta: number;
        reason: string;
      };
    };
    adaptation: {
      priorityDeltas: { decisionId: string; delta: number; reason: string }[];
      confidenceCaps: {
        decisionId: string;
        maxConfidence: number;
        reason: string;
      }[];
      notes: string[];
    };
    trace: { stage: string; result: string; reason: string }[];
    productionMutation: "NONE";
    note: string;
  } | null;
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
