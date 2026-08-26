/**
 * Deterministic scoring weights — no magic numbers in evaluators.
 */
import { INTELLIGENCE_THRESHOLDS } from "@/lib/intelligence/thresholds";

export const INTELLIGENCE_SCORING_CONFIG = {
  intent: {
    recentActivity: 30,
    productReadiness: 25,
    checkoutReadiness: 20,
    storefrontReadiness: 15,
    trafficSignals: 10,
  },
  activation: {
    hasStore: 25,
    hasProducts: 25,
    publishedProducts: 25,
    recentLogin: 25,
  },
  commerceReadiness: {
    publishedCatalog: 40,
    codConfigured: 30,
    domainHealthy: 20,
    recentActivity: 10,
  },
  firstSaleProxy: {
    catalogReady: 35,
    recentActivity: 25,
    checkoutReady: 20,
    domainReady: 10,
    noOrdersYet: 10,
  },
  churnRisk: {
    orderDeclineWeight: 40,
    loginColdWeight: 30,
    supportOpenWeight: 15,
    zeroRecentOrdersWeight: 15,
  },
  intervention: {
    impactWeight: 1,
    urgencyWeight: 1,
    confidenceWeight: 1,
    reversibilityWeight: 1,
    actionabilityWeight: 1,
    /** Scale factor after product of normalized factors (0–1 each) */
    productScale: 1.2,
    /** Historical success contributes at most this fraction of final score */
    historicalMaxBoost: 0.15,
    /** Live urgency always dominates — historical cannot reduce below this share */
    liveEvidenceFloor: 0.85,
  },
  merchantIntervention: {
    intentWeight: 0.35,
    firstSaleWeight: 0.35,
    churnInverseWeight: 0.15,
    commerceWeight: 0.15,
  },
  causal: {
    /** Base confidence when 2 corroborating signals align */
    baseTwoSignals: 0.62,
    /** Per additional corroborating signal */
    perExtraSignal: 0.08,
    /** Cap */
    max: 0.92,
    /** Penalty when sample size below minimum */
    smallSamplePenalty: 0.12,
    minSampleForFullConfidence: 5,
  },
  anomaly: {
    pctChangeThreshold: 50,
    strongPctChange: 100,
    minBaselineForPct: 1,
    velocityDeviation: 40,
  },
  forecast: {
    minSparkPoints: 4,
    minPreviousForConfidence: 0.01,
    unavailableConfidence: 0,
  },
  outcome: {
    observationWindowDays: 7,
    partialSuccessRatio: 0.25,
    /** Expected backlog clearance fraction for COD_VERIFICATION */
    expectedCodClearanceRatio: 0.5,
    /** Partial if realized ≥ this share of expected */
    partialOfExpectedRatio: 0.5,
  },
  decisionV4: {
    /** Weights for product factors (normalized 0–1 then geometric mean × 100) */
    historicalEffectivenessDefault: 0.5,
    minHistoryForEffectiveness: 3,
    evidenceQualityFull: 1,
    evidenceQualityWeak: 0.6,
    evidenceQualityInsufficient: 0.3,
  },
  earlyWarning: {
    risingDelta: 1,
    escalatingSteps: 2,
    recoveringDropRatio: 0.2,
  },
  cooldown: {
    /** Default cooldown minutes after execution while recovering */
    defaultMinutes: 30,
    /** Retrigger if metric worsens by this absolute amount */
    worsenAbsolute: 1,
  },
  autonomy: {
    /** Default: recommend only */
    defaultLevel: 1,
    autoExecute: false,
  },
  thresholds: INTELLIGENCE_THRESHOLDS,
} as const;

export type IntelligenceScoringConfig = typeof INTELLIGENCE_SCORING_CONFIG;
