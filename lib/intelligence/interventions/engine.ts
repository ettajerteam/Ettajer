import type { Evidence, PlatformState } from "@/lib/intelligence/engine-types";
import type { MerchantIntelligenceProfile } from "@/lib/intelligence/merchants/profile";
import { INTELLIGENCE_SCORING_CONFIG as S } from "@/lib/intelligence/config/scoring";
import type { InterventionMemoryStats } from "@/lib/intelligence/outcomes/memory";

export type InterventionType =
  | "FIRST_SALE_ASSIST"
  | "COD_CONFIGURATION_ASSIST"
  | "DOMAIN_SETUP_ASSIST"
  | "ACTIVATION_OUTREACH"
  | "DORMANCY_REACTIVATION"
  | "SUPPORT_ESCALATION"
  | "GROWTH_REINFORCEMENT"
  | "COD_VERIFICATION"
  | "DNS_DIAGNOSIS";

export type Intervention = {
  id: string;
  merchantId: string | null;
  type: InterventionType;
  priority: number;
  urgency: number;
  impact: number;
  confidence: number;
  reversibility: number;
  actionability: number;
  timeSensitivity: number;
  reason: string;
  evidence: Evidence[];
  expectedOutcome: string;
  targetMetric: string;
  recommendedRoute: string;
  createdAt: Date;
  expiresAt: Date;
  adaptiveScore?: number;
  historicalNote?: string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function scoreIntervention(parts: {
  impact: number;
  urgency: number;
  confidence: number;
  reversibility: number;
  actionability: number;
}): { score: number; calculation: string } {
  const raw =
    (parts.impact / 100) *
    (parts.urgency / 100) *
    (parts.confidence / 100) *
    (parts.reversibility / 100) *
    (parts.actionability / 100) *
    100;
  const score = clamp(raw * S.intervention.productScale);
  return {
    score,
    calculation: `impact=${parts.impact} × urgency=${parts.urgency} × confidence=${parts.confidence} × reversibility=${parts.reversibility} × actionability=${parts.actionability} → ${score}`,
  };
}

/**
 * adaptiveActionScore =
 * liveScore * liveEvidenceFloor
 * + liveScore * historicalMaxBoost * historicalSuccessRate
 * Historical never overrides live urgency.
 */
export function adaptiveActionScore(
  liveScore: number,
  historicalSuccessRate: number | null
): { score: number; formula: string; note: string } {
  const floor = S.intervention.liveEvidenceFloor;
  const boost = S.intervention.historicalMaxBoost;
  if (historicalSuccessRate == null) {
    return {
      score: liveScore,
      formula: "adaptive = liveScore (insufficient historical evidence)",
      note: "Insufficient historical evidence.",
    };
  }
  const score = clamp(
    liveScore * floor + liveScore * boost * historicalSuccessRate
  );
  return {
    score,
    formula: `adaptive = live×${floor} + live×${boost}×historicalSuccess(${historicalSuccessRate})`,
    note: `Historically, comparable interventions succeeded at ${Math.round(historicalSuccessRate * 100)}%.`,
  };
}

export function buildMerchantInterventions(
  profiles: MerchantIntelligenceProfile[],
  now: Date
): Intervention[] {
  const expires = new Date(now.getTime() + 7 * 86400000);
  const out: Intervention[] = [];

  for (const p of profiles) {
    if (p.currentBottleneck === "NO_PRODUCTS" && p.activityState === "hot") {
      const parts = {
        impact: 55,
        urgency: 60,
        confidence: 85,
        reversibility: 70,
        actionability: 75,
      };
      const { score, calculation } = scoreIntervention(parts);
      out.push({
        id: `int-activation-${p.merchantId}`,
        merchantId: p.merchantId,
        type: "ACTIVATION_OUTREACH",
        priority: score,
        ...parts,
        timeSensitivity: 70,
        reason: "Recently active empty store — high-probability catalog assist.",
        evidence: p.evidence,
        expectedOutcome: "Merchant adds first products within observation window",
        targetMetric: "productCount",
        recommendedRoute: "/admin/activation?stage=empty&temp=hot",
        createdAt: now,
        expiresAt: expires,
      });
      void calculation;
    }

    if (
      p.currentBottleneck === "NO_FIRST_ORDER" ||
      p.currentBottleneck === "NO_DOMAIN"
    ) {
      const parts = {
        impact: clamp(50 + p.firstSaleProbabilityProxy.score * 0.3),
        urgency: 55,
        confidence: 80,
        reversibility: 60,
        actionability: 70,
      };
      const { score } = scoreIntervention(parts);
      out.push({
        id: `int-first-sale-${p.merchantId}`,
        merchantId: p.merchantId,
        type:
          p.currentBottleneck === "NO_DOMAIN"
            ? "DOMAIN_SETUP_ASSIST"
            : "FIRST_SALE_ASSIST",
        priority: score,
        ...parts,
        timeSensitivity: 65,
        reason: p.explainability,
        evidence: p.firstSaleProbabilityProxy.evidence,
        expectedOutcome: "Merchant creates first real order",
        targetMetric: "realOrders",
        recommendedRoute: "/admin/activation?stage=listed",
        createdAt: now,
        expiresAt: expires,
      });
    }

    if (p.currentBottleneck === "NO_COD") {
      const parts = {
        impact: 60,
        urgency: 50,
        confidence: 85,
        reversibility: 80,
        actionability: 75,
      };
      const { score } = scoreIntervention(parts);
      out.push({
        id: `int-cod-${p.merchantId}`,
        merchantId: p.merchantId,
        type: "COD_CONFIGURATION_ASSIST",
        priority: score,
        ...parts,
        timeSensitivity: 55,
        reason: "Catalog live but COD not configured.",
        evidence: p.commerceReadinessScore.evidence,
        expectedOutcome: "COD enabled on store",
        targetMetric: "codConfigured",
        recommendedRoute: "/admin/activation?stage=listed",
        createdAt: now,
        expiresAt: expires,
      });
    }

    if (p.commerceState === "growing" || p.lifecycleStage === "POWER") {
      const parts = {
        impact: 45,
        urgency: 40,
        confidence: 75,
        reversibility: 50,
        actionability: 60,
      };
      const { score } = scoreIntervention(parts);
      out.push({
        id: `int-growth-${p.merchantId}`,
        merchantId: p.merchantId,
        type: "GROWTH_REINFORCEMENT",
        priority: score,
        ...parts,
        timeSensitivity: 40,
        reason: "Merchant shows positive commerce motion — reinforce growth.",
        evidence: p.evidence,
        expectedOutcome: "Sustained order velocity",
        targetMetric: "realOrders",
        recommendedRoute: p.storeId
          ? `/admin/stores/${p.storeId}`
          : "/admin/analytics?range=7",
        createdAt: now,
        expiresAt: expires,
      });
    }

    if (p.churnRisk.score >= 50) {
      const parts = {
        impact: 50,
        urgency: 55,
        confidence: 70,
        reversibility: 45,
        actionability: 55,
      };
      const { score } = scoreIntervention(parts);
      out.push({
        id: `int-dormant-${p.merchantId}`,
        merchantId: p.merchantId,
        type: "DORMANCY_REACTIVATION",
        priority: score,
        ...parts,
        timeSensitivity: 50,
        reason: "Churn-risk heuristics elevated.",
        evidence: p.churnRisk.evidence,
        expectedOutcome: "Merchant returns to active login / orders",
        targetMetric: "lastLoginAt",
        recommendedRoute: "/admin/activation?temp=cold",
        createdAt: now,
        expiresAt: expires,
      });
    }
  }

  return out.sort((a, b) => b.priority - a.priority);
}

export function buildPlatformInterventions(
  state: PlatformState,
  now: Date
): Intervention[] {
  const expires = new Date(now.getTime() + 2 * 86400000);
  const out: Intervention[] = [];

  if (state.pendingRealOrders > 0) {
    const parts = {
      impact: clamp(70 + state.pendingRealOrders),
      urgency: 95,
      confidence: 100,
      reversibility: 95,
      actionability: 100,
    };
    const { score } = scoreIntervention(parts);
    out.push({
      id: "int-platform-cod",
      merchantId: null,
      type: "COD_VERIFICATION",
      priority: score,
      ...parts,
      timeSensitivity: 100,
      reason: `${state.pendingRealOrders} real COD orders awaiting verification.`,
      evidence: [
        {
          label: "pendingRealOrders",
          value: state.pendingRealOrders,
          source: "platform.overview",
        },
      ],
      expectedOutcome: "Pending COD queue reduced",
      targetMetric: "pendingRealOrders",
      recommendedRoute: "/admin/payments?focus=pending",
      createdAt: now,
      expiresAt: expires,
    });
  }

  if (state.domainFailing > 0) {
    const parts = {
      impact: clamp(60 + state.domainFailing * 5),
      urgency: 85,
      confidence: 95,
      reversibility: 75,
      actionability: 90,
    };
    const { score } = scoreIntervention(parts);
    out.push({
      id: "int-platform-dns",
      merchantId: null,
      type: "DNS_DIAGNOSIS",
      priority: score,
      ...parts,
      timeSensitivity: 80,
      reason: `${state.domainFailing} domains failing DNS.`,
      evidence: [
        {
          label: "domainFailing",
          value: state.domainFailing,
          source: "domains.live",
        },
      ],
      expectedOutcome: "DNS failures reduced",
      targetMetric: "domainFailing",
      recommendedRoute: "/admin/domains",
      createdAt: now,
      expiresAt: expires,
    });
  }

  if (state.openSupport > 0) {
    const parts = {
      impact: clamp(50 + state.openSupport * 8),
      urgency: 80,
      confidence: 100,
      reversibility: 90,
      actionability: 95,
    };
    const { score } = scoreIntervention(parts);
    out.push({
      id: "int-platform-support",
      merchantId: null,
      type: "SUPPORT_ESCALATION",
      priority: score,
      ...parts,
      timeSensitivity: 85,
      reason: `${state.openSupport} unanswered support thread(s).`,
      evidence: [
        {
          label: "openSupport",
          value: state.openSupport,
          source: "support.inbox",
        },
      ],
      expectedOutcome: "Support backlog cleared",
      targetMetric: "openSupport",
      recommendedRoute: "/admin/messages",
      createdAt: now,
      expiresAt: expires,
    });
  }

  return out;
}

export function rankInterventions(
  interventions: Intervention[],
  memory: InterventionMemoryStats[] = []
): Intervention[] {
  return interventions
    .map((i) => {
      const hist = memory.find((m) => m.type === i.type);
      const adaptive = adaptiveActionScore(
        i.priority,
        hist && hist.totalAttempts >= 3 ? hist.successRate : null
      );
      return {
        ...i,
        adaptiveScore: adaptive.score,
        historicalNote: adaptive.note,
        priority: adaptive.score,
      };
    })
    .sort(
      (a, b) =>
        (b.adaptiveScore ?? b.priority) - (a.adaptiveScore ?? a.priority)
    );
}

export function getTopIntervention(
  interventions: Intervention[]
): Intervention | null {
  return interventions[0] ?? null;
}
