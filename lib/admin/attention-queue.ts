/**
 * Prioritized Attention Center for Ettajer Console.
 * Deterministic scoring — never an LLM, never hardcoded counts.
 */

export type AttentionTier = "high" | "medium" | "opportunity" | "watch";

export type AttentionItem = {
  id: string;
  count: number;
  title: string;
  /** Why this matters operationally */
  why: string;
  /** Business impact line */
  impact: string;
  href: string;
  cta: string;
  /** @deprecated prefer priorityScore — kept for sort compat */
  urgency: number;
  /** Higher = more important */
  priorityScore: number;
  tier: AttentionTier;
  tierLabel: string;
  /** Short reason the score ranked here */
  priorityReason: string;
  /** Alias for why — older UI */
  reason: string;
};

export type AttentionQueueInput = {
  pendingRealOrders: number;
  waitingUsers: number;
  hotEmptyCount: number;
  loggedInEmpty7d: number;
  activeNoOrders: number;
  domainsConnected: number;
  domainsConnectedSuccess: number;
  openSupport: number;
  failedLogins24h: number;
  processingRealOrders?: number;
  /** Optional: estimated GMV sitting in pending (if available) */
  pendingRealGmv?: number;
};

function tierFromScore(score: number): { tier: AttentionTier; label: string } {
  if (score >= 70) return { tier: "high", label: "High priority" };
  if (score >= 45) return { tier: "medium", label: "Medium" };
  if (score >= 25) return { tier: "opportunity", label: "Opportunity" };
  return { tier: "watch", label: "Watch" };
}

/**
 * priority ≈ business_impact + urgency + merchant_value + recency
 * All components are 0–40-ish; total typically 0–100+.
 */
function scoreParts(parts: {
  businessImpact: number;
  urgency: number;
  merchantValue: number;
  recency: number;
}) {
  return (
    parts.businessImpact +
    parts.urgency +
    parts.merchantValue +
    parts.recency
  );
}

export function buildAttentionQueue(input: AttentionQueueInput): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (input.pendingRealOrders > 0) {
    const priorityScore = scoreParts({
      businessImpact: Math.min(40, 20 + input.pendingRealOrders),
      urgency: 35,
      merchantValue: 15,
      recency: 20,
    });
    const { tier, label } = tierFromScore(priorityScore);
    const gmvHint =
      input.pendingRealGmv && input.pendingRealGmv > 0
        ? ` · ~${Math.round(input.pendingRealGmv).toLocaleString()} MAD at risk`
        : "";
    items.push({
      id: "pending-cod",
      count: input.pendingRealOrders,
      title: "COD orders pending verification",
      why: "Courier handoff may be delayed until merchants verify these orders.",
      impact: `${input.pendingRealOrders} order${input.pendingRealOrders === 1 ? "" : "s"} · real GMV at risk${gmvHint}`,
      href: "/admin/payments?focus=pending",
      cta: "Review orders",
      urgency: 10,
      priorityScore,
      tier,
      tierLabel: label,
      priorityReason: "High business impact + time-sensitive COD handoff",
      reason: "Courier handoff may be delayed until merchants verify these orders.",
    });
  }

  if (input.waitingUsers > 0) {
    const priorityScore = scoreParts({
      businessImpact: 25,
      urgency: 30,
      merchantValue: 20,
      recency: 15,
    });
    const { tier, label } = tierFromScore(priorityScore);
    items.push({
      id: "waiting-users",
      count: input.waitingUsers,
      title: "Merchants waiting for account activation",
      why: "Stuck in waiting status — they cannot sell until cleared.",
      impact: `${input.waitingUsers} account${input.waitingUsers === 1 ? "" : "s"} blocked from commerce`,
      href: "/admin/users?status=waiting",
      cta: "Review users",
      urgency: 15,
      priorityScore,
      tier,
      tierLabel: label,
      priorityReason: "Blocked merchants cannot generate any GMV",
      reason: "Stuck in waiting status — they cannot sell until cleared.",
    });
  }

  if (input.failedLogins24h >= 10) {
    const priorityScore = scoreParts({
      businessImpact: 20,
      urgency: 32,
      merchantValue: 10,
      recency: 25,
    });
    const { tier, label } = tierFromScore(priorityScore);
    items.push({
      id: "failed-logins",
      count: input.failedLogins24h,
      title: "Failed logins in the last 24h",
      why: "May indicate credential stuffing or a broken auth path blocking merchants.",
      impact: `${input.failedLogins24h} failed attempts · auth reliability risk`,
      href: "/admin/errors",
      cta: "Inspect errors",
      urgency: 18,
      priorityScore,
      tier,
      tierLabel: label,
      priorityReason: "Recent auth spike · platform access risk",
      reason: "May indicate credential stuffing or broken auth",
    });
  }

  if (input.openSupport > 0) {
    const priorityScore = scoreParts({
      businessImpact: 18,
      urgency: 28,
      merchantValue: 22,
      recency: 18,
    });
    const { tier, label } = tierFromScore(priorityScore);
    items.push({
      id: "support",
      count: input.openSupport,
      title:
        input.openSupport === 1
          ? "Support thread unanswered"
          : "Support threads unanswered",
      why: "A merchant is waiting for a response.",
      impact: `${input.openSupport} open thread${input.openSupport === 1 ? "" : "s"} · trust & activation risk`,
      href: "/admin/messages",
      cta: "Open inbox",
      urgency: 20,
      priorityScore,
      tier,
      tierLabel: label,
      priorityReason: "Merchant waiting · relationship impact",
      reason: "Merchant is waiting for a response",
    });
  }

  const domainFailing =
    input.domainsConnected > 0
      ? input.domainsConnected - input.domainsConnectedSuccess
      : 0;
  if (domainFailing > 0) {
    const priorityScore = scoreParts({
      businessImpact: 22,
      urgency: 20,
      merchantValue: 18,
      recency: 12,
    });
    const { tier, label } = tierFromScore(priorityScore);
    items.push({
      id: "domains",
      count: domainFailing,
      title: "Domains require attention",
      why: "DNS problems may prevent merchants from confidently sharing their storefront.",
      impact: `${domainFailing} domain${domainFailing === 1 ? "" : "s"} failing live DNS checks`,
      href: "/admin/domains",
      cta: "Diagnose domains",
      urgency: 22,
      priorityScore,
      tier,
      tierLabel: label,
      priorityReason: "Storefront trust · verified DNS failure",
      reason: "Broken domains can damage merchant trust",
    });
  }

  if (input.hotEmptyCount > 0 || input.loggedInEmpty7d > 0) {
    const count = Math.max(input.hotEmptyCount, input.loggedInEmpty7d);
    const priorityScore = scoreParts({
      businessImpact: 14,
      urgency: 14,
      merchantValue: 18,
      recency: input.loggedInEmpty7d > 0 ? 16 : 8,
    });
    const { tier, label } = tierFromScore(priorityScore);
    items.push({
      id: "empty-activation",
      count,
      title: "Active merchants have no products",
      why:
        input.loggedInEmpty7d > 0
          ? `${input.loggedInEmpty7d} logged in during the last 7 days.`
          : "Recent store activity without a catalog.",
      impact: `${count} high-intent empty store${count === 1 ? "" : "s"} · activation gap`,
      href: "/admin/activation?stage=empty",
      cta: "Open activation",
      urgency: 25,
      priorityScore,
      tier,
      tierLabel: label,
      priorityReason: "Recent activity + zero products = help-today targets",
      reason:
        input.loggedInEmpty7d > 0
          ? `${input.loggedInEmpty7d} logged in recently but have not listed products`
          : "Recent store activity without a catalog",
    });
  }

  if (input.activeNoOrders > 0) {
    const priorityScore = scoreParts({
      businessImpact: 18,
      urgency: 6,
      merchantValue: 12,
      recency: 4,
    });
    const { tier, label } = tierFromScore(priorityScore);
    items.push({
      id: "first-sale",
      count: input.activeNoOrders,
      title: "Stores have products but zero real sales",
      why: "Catalogs are ready but merchants have not converted to their first real order.",
      impact: `${input.activeNoOrders} first-sale target${input.activeNoOrders === 1 ? "" : "s"} · largest growth pool`,
      href: "/admin/activation?stage=listed",
      cta: "View first-sale targets",
      urgency: 30,
      priorityScore,
      tier,
      tierLabel: label,
      priorityReason: "Large opportunity · lower urgency than COD/support",
      reason: "High-potential first-sale targets — catalog ready, no COD yet",
    });
  }

  return items.sort(
    (a, b) => b.priorityScore - a.priorityScore || b.count - a.count
  );
}

/** One-line attention sentence for the overview hero. */
export function buildAttentionSentence(items: AttentionItem[]): string {
  if (items.length === 0) {
    return "No critical blockers right now — platform pulse is clear.";
  }
  return items
    .slice(0, 3)
    .map((item) => {
      switch (item.id) {
        case "pending-cod":
          return `${item.count} order${item.count === 1 ? "" : "s"} need attention`;
        case "empty-activation":
          return `${item.count} merchant${item.count === 1 ? "" : "s"} need activation`;
        case "domains":
          return `${item.count} domain${item.count === 1 ? "" : "s"} require diagnosis`;
        case "support":
          return `${item.count} support thread${item.count === 1 ? "" : "s"} unanswered`;
        case "first-sale":
          return `${item.count} store${item.count === 1 ? "" : "s"} await first sale`;
        case "waiting-users":
          return `${item.count} account${item.count === 1 ? "" : "s"} waiting`;
        case "failed-logins":
          return `${item.count} failed logins (24h)`;
        default:
          return `${item.count} · ${item.title}`;
      }
    })
    .join(" · ");
}
