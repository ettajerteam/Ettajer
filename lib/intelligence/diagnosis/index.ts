import type {
  CorrelatedInsight,
  Diagnosis,
  DiagnosisId,
  IntelligenceSignal,
  PlatformState,
} from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

function has(signals: IntelligenceSignal[], id: string) {
  return signals.some((s) => s.id === id);
}

export function diagnoseActivation(
  state: PlatformState,
  signals: IntelligenceSignal[],
  correlations: CorrelatedInsight[]
): Diagnosis | null {
  const firstSaleCorr = correlations.find((c) => c.id === "corr-first-sale-gap");
  if (
    state.firstSaleCount >= T.firstSalePoolElevated ||
    (has(signals, "zero-sale-stores") &&
      state.firstSaleCount > state.hotEmptyCount)
  ) {
    return {
      id: "activation-first-sale-gap",
      diagnosisId: "FIRST_SALE_BOTTLENECK",
      domain: "activation",
      title: "First-sale conversion is the main activation gap.",
      explanation:
        "Most merchants have completed catalog setup but have not generated a real order. " +
        (state.firstSaleHighIntent > 0
          ? `${state.firstSaleHighIntent} show recent activity and should be prioritized.`
          : "Warm the first-sale queue with outreach and COD readiness checks."),
      evidence: [
        {
          label: "firstSaleCount",
          value: state.firstSaleCount,
          source: "activation.funnel",
        },
        {
          label: "firstSaleHighIntent",
          value: state.firstSaleHighIntent,
          source: "activation.temperature",
        },
        {
          label: "noCodConfigured",
          value: state.firstSaleBottlenecks.noCodConfigured,
          source: "store.settings",
        },
      ],
      confidence: firstSaleCorr?.confidence ?? 0.9,
      signalIds: ["zero-sale-stores"],
      recommendedAction: {
        label: "View first-sale targets",
        href: "/admin/activation?stage=listed",
      },
    };
  }

  if (state.loggedInEmpty7d > 0 || state.hotEmptyCount >= T.hotEmptyElevated) {
    return {
      id: "activation-empty-store",
      diagnosisId: "EMPTY_STORE_BOTTLENECK",
      domain: "activation",
      title: "Empty-store catalog creation is the activation bottleneck.",
      explanation: `${Math.max(state.loggedInEmpty7d, state.hotEmptyCount)} merchants need product listing help before commerce can start.`,
      evidence: [
        {
          label: "loggedInEmpty7d",
          value: state.loggedInEmpty7d,
          source: "activation.gap",
        },
        {
          label: "hotEmptyCount",
          value: state.hotEmptyCount,
          source: "activation.gap",
        },
      ],
      confidence: 0.88,
      signalIds: ["empty-active-stores"],
      recommendedAction: {
        label: "Open activation",
        href: "/admin/activation?stage=empty&temp=hot",
      },
    };
  }

  return null;
}

export function diagnoseOperational(
  state: PlatformState,
  signals: IntelligenceSignal[]
): Diagnosis | null {
  if (!has(signals, "pending-cod")) return null;
  return {
    id: "ops-pending-cod",
    diagnosisId: "OPERATIONAL_COD_BOTTLENECK",
    domain: "operations",
    title: "Pending COD verification is blocking courier handoff.",
    explanation: `${state.pendingRealOrders} real orders await verification${
      state.pendingRealGmv > 0
        ? ` (~${Math.round(state.pendingRealGmv)} MAD at risk)`
        : ""
    }.`,
    evidence: [
      {
        label: "pendingRealOrders",
        value: state.pendingRealOrders,
        source: "platform.overview",
      },
      {
        label: "pendingRealGmv",
        value: state.pendingRealGmv,
        source: "platform.overview",
      },
    ],
    confidence: 1,
    signalIds: ["pending-cod"],
    recommendedAction: {
      label: "Review orders",
      href: "/admin/payments?focus=pending",
    },
  };
}

export function diagnoseRevenue(
  state: PlatformState,
  signals: IntelligenceSignal[]
): Diagnosis | null {
  if (!has(signals, "revenue-concentration")) return null;
  return {
    id: "revenue-concentration",
    diagnosisId: "REVENUE_CONCENTRATION",
    domain: "revenue",
    title: "Platform GMV is concentrated in too few merchants.",
    explanation:
      state.concentrationWhy ??
      `${state.top2SharePct}% of tracked GMV comes from the top 2 merchants.`,
    evidence: [
      {
        label: "top2SharePct",
        value: state.top2SharePct,
        source: "platform.gmv",
      },
      ...state.concentration.slice(0, 2).map((c) => ({
        label: c.name,
        value: `${c.sharePct}% · ${Math.round(c.gmv)} MAD`,
        source: "platform.gmv" as const,
      })),
    ],
    confidence: 0.95,
    signalIds: ["revenue-concentration"],
    recommendedAction: {
      label: "Activate mid-tier merchants",
      href: "/admin/activation?stage=listed",
    },
  };
}

export function diagnoseTechnical(
  state: PlatformState,
  signals: IntelligenceSignal[]
): Diagnosis | null {
  if (!has(signals, "dns-failure") && !has(signals, "failed-logins")) {
    return null;
  }
  const ids = [
    has(signals, "dns-failure") ? "dns-failure" : null,
    has(signals, "failed-logins") ? "failed-logins" : null,
  ].filter(Boolean) as string[];

  return {
    id: "technical-bottleneck",
    diagnosisId: "TECHNICAL_BOTTLENECK",
    domain: "technical",
    title: "Technical reliability issues need diagnosis.",
    explanation: [
      state.domainFailing > 0
        ? `${state.domainFailing} custom domains failing DNS.`
        : null,
      state.failedLogins24h >= T.failedLoginsHigh
        ? `${state.failedLogins24h} failed logins in 24h.`
        : null,
    ]
      .filter(Boolean)
      .join(" "),
    evidence: [
      {
        label: "domainFailing",
        value: state.domainFailing,
        source: "domains.live",
      },
      {
        label: "failedLogins24h",
        value: state.failedLogins24h,
        source: "platform.errors",
      },
    ],
    confidence: 0.95,
    signalIds: ids,
    recommendedAction: {
      label: state.domainFailing > 0 ? "Diagnose domains" : "View errors",
      href: state.domainFailing > 0 ? "/admin/domains" : "/admin/errors",
    },
  };
}

export function diagnoseSupport(
  state: PlatformState,
  signals: IntelligenceSignal[]
): Diagnosis | null {
  if (!has(signals, "support-backlog")) return null;
  return {
    id: "support-backlog",
    diagnosisId: "SUPPORT_BOTTLENECK",
    domain: "support",
    title: "Support backlog is creating relationship risk.",
    explanation: `${state.openSupport} unanswered thread${state.openSupport === 1 ? "" : "s"} — merchants are waiting.`,
    evidence: [
      {
        label: "openSupport",
        value: state.openSupport,
        source: "support.inbox",
      },
    ],
    confidence: 1,
    signalIds: ["support-backlog"],
    recommendedAction: {
      label: "Open inbox",
      href: "/admin/messages",
    },
  };
}

export function diagnosePlatform(
  state: PlatformState,
  signals: IntelligenceSignal[],
  correlations: CorrelatedInsight[]
): Diagnosis[] {
  const diagnoses = [
    diagnoseOperational(state, signals),
    diagnoseActivation(state, signals, correlations),
    diagnoseTechnical(state, signals),
    diagnoseSupport(state, signals),
    diagnoseRevenue(state, signals),
  ].filter(Boolean) as Diagnosis[];

  if (diagnoses.length === 0) {
    diagnoses.push({
      id: "none",
      diagnosisId: "NONE" as DiagnosisId,
      domain: "operations",
      title: "No major platform bottleneck detected.",
      explanation: "Signals are clear or below configured thresholds.",
      evidence: [
        {
          label: "signalCount",
          value: signals.length,
          source: "intelligence.engine",
        },
      ],
      confidence: 0.7,
      signalIds: [],
    });
  }

  return diagnoses;
}
