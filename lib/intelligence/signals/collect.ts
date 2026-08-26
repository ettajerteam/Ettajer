import type {
  Evidence,
  IntelligenceSignal,
  IntelligenceSeverity,
  PlatformState,
} from "@/lib/intelligence/engine-types";
import { INTELLIGENCE_THRESHOLDS as T } from "@/lib/intelligence/thresholds";

function evidence(
  label: string,
  value: Evidence["value"],
  source: string
): Evidence {
  return { label, value, source };
}

function signal(
  partial: Omit<IntelligenceSignal, "createdAt" | "confidence"> & {
    confidence?: number;
    createdAt?: Date;
  },
  now: Date
): IntelligenceSignal {
  return {
    confidence: partial.confidence ?? 1,
    createdAt: partial.createdAt ?? now,
    ...partial,
  };
}

function pendingSeverity(count: number): IntelligenceSeverity {
  if (count >= T.pendingOrdersCritical) return "critical";
  if (count >= T.pendingOrdersHigh) return "high";
  return "high";
}

/** Orders / COD operational signals */
export function collectOrderSignals(state: PlatformState): IntelligenceSignal[] {
  const out: IntelligenceSignal[] = [];
  const now = state.now;

  if (state.pendingRealOrders > 0) {
    out.push(
      signal(
        {
          id: "pending-cod",
          category: "orders",
          severity: pendingSeverity(state.pendingRealOrders),
          title: `${state.pendingRealOrders} COD orders pending verification`,
          summary: "Courier handoff may be delayed until merchants verify these orders.",
          value: state.pendingRealOrders,
          unit: "orders",
          affectedCount: state.pendingRealOrders,
          financialImpact: state.pendingRealGmv || undefined,
          ruleId: "orders.pending_real_cod > 0",
          href: "/admin/payments?focus=pending",
          cta: "Review orders",
          evidence: [
            evidence(
              "pendingRealOrders",
              state.pendingRealOrders,
              "platform.overview"
            ),
            evidence(
              "pendingRealGmv",
              state.pendingRealGmv,
              "platform.overview"
            ),
            evidence(
              "processingRealOrders",
              state.processingRealOrders,
              "platform.overview"
            ),
          ],
        },
        now
      )
    );
  }

  return out;
}

export function collectOperationalSignals(
  state: PlatformState
): IntelligenceSignal[] {
  const out: IntelligenceSignal[] = [];
  const now = state.now;

  if (state.waitingUsers > 0) {
    out.push(
      signal(
        {
          id: "waiting-users",
          category: "operations",
          severity: "high",
          title: `${state.waitingUsers} merchants waiting for account activation`,
          summary: "Stuck in waiting status — they cannot sell until cleared.",
          value: state.waitingUsers,
          affectedCount: state.waitingUsers,
          ruleId: "operations.waiting_users > 0",
          href: "/admin/users?status=waiting",
          cta: "Review users",
          evidence: [
            evidence("waitingUsers", state.waitingUsers, "platform.overview"),
          ],
        },
        now
      )
    );
  }

  return out;
}

export function collectActivationSignals(
  state: PlatformState
): IntelligenceSignal[] {
  const out: IntelligenceSignal[] = [];
  const now = state.now;

  if (
    T.emptyStoreOpportunity &&
    (state.hotEmptyCount > 0 || state.loggedInEmpty7d > 0)
  ) {
    const count = Math.max(state.hotEmptyCount, state.loggedInEmpty7d);
    out.push(
      signal(
        {
          id: "empty-active-stores",
          category: "activation",
          severity:
            state.loggedInEmpty7d >= T.hotEmptyElevated ? "medium" : "low",
          title: `${count} active merchants have no products`,
          summary:
            state.loggedInEmpty7d > 0
              ? `${state.loggedInEmpty7d} logged in during the last ${T.activationWindowDays} days.`
              : "Recent store activity without a catalog.",
          value: count,
          affectedCount: count,
          ruleId:
            "activation.empty_store && merchant.logged_in_within_window",
          href: "/admin/activation?stage=empty&temp=hot",
          cta: "Open activation",
          evidence: [
            evidence("hotEmptyCount", state.hotEmptyCount, "activation.gap"),
            evidence(
              "loggedInEmpty7d",
              state.loggedInEmpty7d,
              "activation.gap"
            ),
            evidence(
              "activationWindowDays",
              T.activationWindowDays,
              "thresholds"
            ),
          ],
        },
        now
      )
    );
  }

  if (state.firstSaleCount > 0) {
    out.push(
      signal(
        {
          id: "zero-sale-stores",
          category: "activation",
          severity:
            state.firstSaleCount >= T.firstSalePoolElevated ? "medium" : "low",
          title: `${state.firstSaleCount} stores have products but zero real sales`,
          summary:
            "Catalogs are ready but merchants have not converted to a first real order.",
          value: state.firstSaleCount,
          affectedCount: state.firstSaleCount,
          ruleId: "activation.live_products && realOrders = 0",
          href: "/admin/activation?stage=listed",
          cta: "View first-sale targets",
          evidence: [
            evidence(
              "firstSaleCount",
              state.firstSaleCount,
              "activation.funnel"
            ),
            evidence(
              "firstSaleHighIntent",
              state.firstSaleHighIntent,
              "activation.temperature"
            ),
            evidence(
              "noCodConfigured",
              state.firstSaleBottlenecks.noCodConfigured,
              "store.settings"
            ),
            evidence(
              "noCustomDomain",
              state.firstSaleBottlenecks.noCustomDomain,
              "store.settings"
            ),
          ],
        },
        now
      )
    );
  }

  return out;
}

export function collectSupportSignals(
  state: PlatformState
): IntelligenceSignal[] {
  const out: IntelligenceSignal[] = [];
  if (state.openSupport <= 0) return out;

  const severity: IntelligenceSeverity =
    state.openSupport >= T.supportBacklogHigh ? "high" : "high";

  out.push(
    signal(
      {
        id: "support-backlog",
        category: "support",
        severity,
        title:
          state.openSupport === 1
            ? "1 support thread unanswered"
            : `${state.openSupport} support threads unanswered`,
        summary: "A merchant is waiting for a response.",
        value: state.openSupport,
        affectedCount: state.openSupport,
        ruleId: "support.unanswered_threads > 0",
        href: "/admin/messages",
        cta: "Open inbox",
        evidence: [
          evidence("openSupport", state.openSupport, "support.inbox"),
        ],
      },
      state.now
    )
  );
  return out;
}

export function collectTechnicalSignals(
  state: PlatformState
): IntelligenceSignal[] {
  const out: IntelligenceSignal[] = [];
  const now = state.now;

  if (state.domainFailing > 0) {
    out.push(
      signal(
        {
          id: "dns-failure",
          category: "technical",
          severity: state.domainFailing >= 3 ? "critical" : "high",
          title: `${state.domainFailing} custom domains failing DNS`,
          summary:
            "Broken domains can damage merchant trust and storefront reach.",
          value: state.domainFailing,
          affectedCount: state.domainFailing,
          ruleId: "technical.custom_domain && dnsStatus != healthy",
          href: "/admin/domains",
          cta: "Diagnose",
          evidence: [
            evidence(
              "domainsConnected",
              state.domainsConnected,
              "domains.live"
            ),
            evidence(
              "domainsConnectedSuccess",
              state.domainsConnectedSuccess,
              "domains.live"
            ),
            evidence("domainFailing", state.domainFailing, "domains.live"),
          ],
        },
        now
      )
    );
  }

  if (state.failedLogins24h >= T.failedLoginsHigh) {
    out.push(
      signal(
        {
          id: "failed-logins",
          category: "technical",
          severity: "high",
          title: `${state.failedLogins24h} failed logins in the last 24h`,
          summary:
            "May indicate credential stuffing or a broken auth path blocking merchants.",
          value: state.failedLogins24h,
          affectedCount: state.failedLogins24h,
          ruleId: `technical.failed_logins_24h >= ${T.failedLoginsHigh}`,
          href: "/admin/errors",
          cta: "Inspect errors",
          evidence: [
            evidence(
              "failedLogins24h",
              state.failedLogins24h,
              "platform.errors"
            ),
            evidence("threshold", T.failedLoginsHigh, "thresholds"),
          ],
        },
        now
      )
    );
  }

  return out;
}

export function collectRevenueSignals(
  state: PlatformState
): IntelligenceSignal[] {
  const out: IntelligenceSignal[] = [];
  const now = state.now;
  const share = state.top2SharePct / 100;

  if (share >= T.revenueConcentrationHigh && state.top2SharePct > 0) {
    const severity: IntelligenceSeverity =
      share >= T.revenueConcentrationCritical ? "critical" : "high";
    out.push(
      signal(
        {
          id: "revenue-concentration",
          category: "revenue",
          severity,
          title: `${state.top2SharePct}% of tracked GMV from top 2 merchants`,
          summary:
            state.concentrationWhy ??
            "Revenue is concentrated in a small merchant set.",
          value: state.top2SharePct,
          unit: "%",
          affectedCount: Math.min(2, state.concentration.length),
          ruleId: `revenue.top2_share >= ${T.revenueConcentrationHigh}`,
          href: "/admin/analytics?range=30",
          cta: "View merchants",
          evidence: [
            evidence("top2SharePct", state.top2SharePct, "platform.gmv"),
            evidence(
              "thresholdHigh",
              T.revenueConcentrationHigh,
              "thresholds"
            ),
            evidence(
              "thresholdCritical",
              T.revenueConcentrationCritical,
              "thresholds"
            ),
            ...state.concentration.slice(0, 2).map((c) =>
              evidence(`merchant:${c.name}`, `${c.sharePct}%`, "platform.gmv")
            ),
          ],
        },
        now
      )
    );
  }

  if (
    state.revenueChange7d >= T.revenueMomentumPositive &&
    state.realRevenue7d > 0
  ) {
    out.push(
      signal(
        {
          id: "revenue-momentum",
          category: "revenue",
          severity: "positive",
          title: `Real GMV increased +${state.revenueChange7d}% over the previous 7 days`,
          summary: "Momentum is strong versus the prior window.",
          value: state.revenueChange7d,
          unit: "%",
          ruleId: `revenue.change_7d >= ${T.revenueMomentumPositive}`,
          href: "/admin/analytics?range=7",
          cta: "View analytics",
          confidence: 0.95,
          evidence: [
            evidence(
              "revenueChange7d",
              state.revenueChange7d,
              "platform.analytics"
            ),
            evidence(
              "realRevenue7d",
              state.realRevenue7d,
              "platform.analytics"
            ),
            evidence("totalRevenue", state.totalRevenue, "platform.gmv"),
          ],
        },
        now
      )
    );
  }

  return out;
}

export function collectMerchantSignals(
  state: PlatformState
): IntelligenceSignal[] {
  const out: IntelligenceSignal[] = [];
  if (state.helpToday.length === 0) return out;

  out.push(
    signal(
      {
        id: "help-today-merchants",
        category: "merchant",
        severity: "medium",
        title: `${state.helpToday.length} merchants on today's help list`,
        summary: "Ranked activation targets from merchant health scoring.",
        value: state.helpToday.length,
        affectedCount: state.helpToday.length,
        ruleId: "merchant.help_today.length > 0",
        href: "/admin/activation",
        cta: "Open help list",
        evidence: state.helpToday.slice(0, 5).map((h) =>
          evidence(
            h.storeName,
            `intent=${h.intent}; health=${h.healthScore}`,
            "merchant.health"
          )
        ),
      },
      state.now
    )
  );
  return out;
}

/** Collect all domain signals from platform state. */
export function collectAllSignals(
  state: PlatformState
): IntelligenceSignal[] {
  return [
    ...collectOrderSignals(state),
    ...collectOperationalSignals(state),
    ...collectActivationSignals(state),
    ...collectSupportSignals(state),
    ...collectTechnicalSignals(state),
    ...collectRevenueSignals(state),
    ...collectMerchantSignals(state),
  ];
}
