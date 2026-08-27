/**
 * Deterministic candidate action generation from live signals/diagnoses/state.
 * No hardcoded "today's winner".
 */
import type {
  Diagnosis,
  IntelligenceSignal,
  PlatformState,
  RecommendedAction,
} from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";
import { isValidAdminHref } from "@/lib/intelligence/recommendations/actions";
import type { DecisionCandidate } from "@/lib/intelligence/decisions/types";
import { DECISION_THRESHOLDS } from "@/lib/intelligence/decisions/config";

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function urgencyFromCount(count: number, high: number, critical: number): number {
  if (count >= critical) return 1;
  if (count >= high) return 0.85;
  if (count > 0) return 0.65;
  return 0.2;
}

function signalIds(signals: IntelligenceSignal[]): Set<string> {
  return new Set(signals.map((s) => s.id));
}

function diagnosisIds(diagnoses: Diagnosis[]): Set<string> {
  return new Set(diagnoses.map((d) => d.diagnosisId));
}

/**
 * Build unique decision candidates from platform intelligence.
 * Always includes NO_ACTION.
 */
export function generateDecisionCandidates(input: {
  state: PlatformState;
  signals: IntelligenceSignal[];
  diagnoses: Diagnosis[];
  recommendedActions: RecommendedAction[];
  evidenceQuality: number;
}): DecisionCandidate[] {
  const { state, signals, diagnoses, recommendedActions } = input;
  const ids = signalIds(signals);
  const dx = diagnosisIds(diagnoses);
  const out: DecisionCandidate[] = [];
  const seen = new Set<string>();

  const push = (c: DecisionCandidate) => {
    if (seen.has(c.id)) return;
    seen.add(c.id);
    out.push(c);
  };

  // REVIEW_PENDING_COD
  if (
    state.pendingRealOrders > 0 ||
    ids.has("pending-cod") ||
    dx.has("OPERATIONAL_COD_BOTTLENECK")
  ) {
    const action = recommendedActions.find((a) => a.id === "PENDING_COD");
    push({
      id: "REVIEW_PENDING_COD",
      type: "REVIEW_PENDING_COD",
      title: action?.label ?? "Review pending COD",
      description:
        action?.description ??
        `${state.pendingRealOrders} orders awaiting verification`,
      route: action?.href ?? "/admin/payments?focus=pending",
      domain: "operations",
      affectedCount: state.pendingRealOrders,
      evidence: [
        `pendingRealOrders=${state.pendingRealOrders}`,
        `pendingRealGmv=${state.pendingRealGmv}`,
        `processingRealOrders=${state.processingRealOrders}`,
      ],
      triggeredRules: [
        action?.ruleId ?? "orders.pending_real_cod > 0",
        ...signals.filter((s) => s.id === "pending-cod").map((s) => s.ruleId),
      ].filter(Boolean) as string[],
      expectedImpact: clamp01(
        state.pendingRealOrders >= T.pendingOrdersCritical
          ? 0.9
          : state.pendingRealOrders >= T.pendingOrdersHigh
            ? 0.75
            : 0.55
      ),
      urgency: urgencyFromCount(
        state.pendingRealOrders,
        T.pendingOrdersHigh,
        T.pendingOrdersCritical
      ),
      confidence: clamp01(0.55 + input.evidenceQuality * 0.35),
      reversibility: 0.95,
      actionability: isValidAdminHref("/admin/payments?focus=pending")
        ? 1
        : 0.2,
      cost: DECISION_THRESHOLDS.costReview,
      timeToImpact: "immediate",
      risk: 0.2,
      constraints: [],
      scenarioSupport: emptySupport(),
      mode: "RECOMMENDED",
    });
  }

  // DIAGNOSE_DNS
  if (state.domainFailing > 0 || ids.has("dns-failure") || dx.has("TECHNICAL_BOTTLENECK")) {
    const action = recommendedActions.find((a) => a.id === "DNS_FAILURE");
    push({
      id: "DIAGNOSE_DNS",
      type: "DIAGNOSE_DNS",
      title: action?.label ?? "Diagnose domains",
      description:
        action?.description ?? `${state.domainFailing} DNS failing`,
      route: action?.href ?? "/admin/domains",
      domain: "technical",
      affectedCount: state.domainFailing,
      evidence: [
        `domainFailing=${state.domainFailing}`,
        `domainsConnected=${state.domainsConnected}`,
        `domainsConnectedSuccess=${state.domainsConnectedSuccess}`,
      ],
      triggeredRules: [
        action?.ruleId ?? "technical.custom_domain && dnsStatus != healthy",
        ...signals.filter((s) => s.id === "dns-failure").map((s) => s.ruleId),
      ].filter(Boolean) as string[],
      expectedImpact: clamp01(state.domainFailing >= 3 ? 0.8 : 0.6),
      urgency: urgencyFromCount(state.domainFailing, 2, 3),
      confidence: clamp01(0.5 + input.evidenceQuality * 0.35),
      reversibility: 0.75,
      actionability: 0.9,
      cost: DECISION_THRESHOLDS.costReview,
      timeToImpact: "<24h",
      risk: 0.3,
      constraints: [],
      scenarioSupport: emptySupport(),
      mode: "RECOMMENDED",
    });
  }

  // ANSWER_SUPPORT
  if (state.openSupport > 0 || ids.has("support-backlog") || dx.has("SUPPORT_BOTTLENECK")) {
    const action = recommendedActions.find((a) => a.id === "SUPPORT_BACKLOG");
    push({
      id: "ANSWER_SUPPORT",
      type: "ANSWER_SUPPORT",
      title: action?.label ?? "Open support inbox",
      description:
        action?.description ?? `${state.openSupport} open conversations`,
      route: action?.href ?? "/admin/messages",
      domain: "support",
      affectedCount: state.openSupport,
      evidence: [`openSupport=${state.openSupport}`],
      triggeredRules: [
        action?.ruleId ?? "support.unanswered_threads > 0",
        ...signals
          .filter((s) => s.id === "support-backlog")
          .map((s) => s.ruleId),
      ].filter(Boolean) as string[],
      expectedImpact: clamp01(
        state.openSupport >= T.supportBacklogHigh ? 0.7 : 0.5
      ),
      urgency: urgencyFromCount(
        state.openSupport,
        T.supportBacklogHigh,
        T.supportBacklogHigh * 2
      ),
      confidence: clamp01(0.5 + input.evidenceQuality * 0.35),
      reversibility: 0.9,
      actionability: 0.95,
      cost: DECISION_THRESHOLDS.costNavigation,
      timeToImpact: "immediate",
      risk: 0.25,
      constraints: [],
      scenarioSupport: emptySupport(),
      mode: "RECOMMENDED",
    });
  }

  // PRIORITIZE_FIRST_SALE
  if (
    state.firstSaleCount > 0 ||
    ids.has("zero-sale-stores") ||
    ids.has("empty-active-stores") ||
    dx.has("FIRST_SALE_BOTTLENECK") ||
    dx.has("EMPTY_STORE_BOTTLENECK")
  ) {
    const action = recommendedActions.find((a) => a.id === "FIRST_SALE_TARGET");
    push({
      id: "PRIORITIZE_FIRST_SALE",
      type: "PRIORITIZE_FIRST_SALE",
      title: "Prioritize first-sale merchants",
      description: `${state.firstSaleCount} catalog-ready stores with zero real sales (${state.firstSaleHighIntent} high-intent)`,
      route: action?.href ?? "/admin/activation",
      domain: "activation",
      affectedCount: state.firstSaleCount,
      evidence: [
        `firstSaleCount=${state.firstSaleCount}`,
        `firstSaleHighIntent=${state.firstSaleHighIntent}`,
      ],
      triggeredRules: [
        "activation.live_products && realOrders = 0",
        ...signals
          .filter(
            (s) => s.id === "zero-sale-stores" || s.id === "empty-active-stores"
          )
          .map((s) => s.ruleId),
      ].filter(Boolean) as string[],
      expectedImpact: 0.45,
      urgency: clamp01(
        state.firstSaleCount >= T.firstSalePoolElevated ? 0.55 : 0.4
      ),
      confidence: clamp01(0.4 + input.evidenceQuality * 0.25),
      reversibility: 0.6,
      actionability: 0.7,
      cost: DECISION_THRESHOLDS.costStrategic,
      timeToImpact: "7–14 days",
      risk: 0.35,
      constraints: [],
      scenarioSupport: emptySupport(),
      mode: "RECOMMENDED",
    });
  }

  // ACTIVATE_MID_TIER_MERCHANTS (hot empty / logged-in empty)
  if (state.hotEmptyCount > 0 || state.loggedInEmpty7d > 0) {
    push({
      id: "ACTIVATE_MID_TIER_MERCHANTS",
      type: "ACTIVATE_MID_TIER_MERCHANTS",
      title: "Activate mid-tier / empty-store merchants",
      description: `${Math.max(state.hotEmptyCount, state.loggedInEmpty7d)} recently active empty stores`,
      route: "/admin/activation",
      domain: "activation",
      affectedCount: Math.max(state.hotEmptyCount, state.loggedInEmpty7d),
      evidence: [
        `hotEmptyCount=${state.hotEmptyCount}`,
        `loggedInEmpty7d=${state.loggedInEmpty7d}`,
      ],
      triggeredRules: ["activation.empty_store_recent_login"],
      expectedImpact: 0.4,
      urgency: 0.45,
      confidence: clamp01(0.35 + input.evidenceQuality * 0.25),
      reversibility: 0.65,
      actionability: 0.7,
      cost: DECISION_THRESHOLDS.costStrategic,
      timeToImpact: "3–7 days",
      risk: 0.4,
      constraints: [],
      scenarioSupport: emptySupport(),
      mode: "RECOMMENDED",
    });
  }

  // REVIEW_REVENUE_CONCENTRATION
  if (
    state.concentrationElevated ||
    state.top2SharePct >= T.revenueConcentrationHigh * 100 ||
    ids.has("revenue-concentration") ||
    dx.has("REVENUE_CONCENTRATION")
  ) {
    push({
      id: "REVIEW_REVENUE_CONCENTRATION",
      type: "REVIEW_REVENUE_CONCENTRATION",
      title: "Review revenue concentration",
      description:
        state.concentrationMessage ??
        `${state.top2SharePct}% of tracked GMV from top 2 merchants`,
      route: state.concentration[0]
        ? `/admin/stores/${state.concentration[0].id}`
        : "/admin/analytics?range=30",
      domain: "revenue",
      affectedCount: state.concentration.length || 2,
      evidence: [
        `top2SharePct=${state.top2SharePct}`,
        state.concentrationWhy ?? "concentration elevated",
      ],
      triggeredRules: ["revenue.top2_share elevated"],
      expectedImpact: 0.35,
      urgency: clamp01(
        state.top2SharePct >= T.revenueConcentrationCritical * 100
          ? 0.55
          : 0.35
      ),
      confidence: clamp01(0.45 + input.evidenceQuality * 0.2),
      reversibility: 0.4,
      actionability: 0.55,
      cost: DECISION_THRESHOLDS.costStrategic,
      timeToImpact: "14–30 days",
      risk: 0.45,
      constraints: [],
      scenarioSupport: emptySupport(),
      mode: "RECOMMENDED",
    });
  }

  // NO_ACTION — always present
  push({
    id: "NO_ACTION",
    type: "NO_ACTION",
    title: "No action",
    description: "Defer intervention; continue observation.",
    route: "/admin/sara",
    domain: "baseline",
    affectedCount: 0,
    evidence: ["NO_ACTION baseline candidate always generated."],
    triggeredRules: ["decision.no_action_baseline"],
    expectedImpact: 0,
    urgency: 0.1,
    confidence: clamp01(0.5 + input.evidenceQuality * 0.3),
    reversibility: 1,
    actionability: 0,
    cost: 0,
    timeToImpact: "1–3 days",
    risk: state.pendingRealOrders > 0 || state.domainFailing > 0 ? 0.7 : 0.2,
    constraints: [],
    scenarioSupport: emptySupport(),
    mode: "RECOMMENDED",
  });

  return dedupeCandidates(out);
}

function emptySupport(): DecisionCandidate["scenarioSupport"] {
  return {
    strength: "NONE",
    scenarioId: null,
    baseline: {},
    expectedAfter: {},
    expectedDirection: null,
    uncertainty: "HIGH",
    scenarioConfidence: 0,
    assumptions: [],
    tradeoffs: [],
    note: "Scenario support not yet attached.",
  };
}

/** Deterministic dedupe by id (first wins). */
export function dedupeCandidates(
  candidates: DecisionCandidate[]
): DecisionCandidate[] {
  const seen = new Set<string>();
  const out: DecisionCandidate[] = [];
  for (const c of candidates) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
}
