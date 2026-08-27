/**
 * Rule catalog — deterministic transformations from PlatformState → signals.
 * Signal emitters live in signals/; this module documents rule IDs.
 */
export const RULE_CATALOG = {
  "orders.pending_real_cod > 0": {
    description: "Pending real COD orders require verification before courier handoff.",
    domain: "orders",
  },
  "operations.waiting_users > 0": {
    description: "Users in waiting status cannot operate stores.",
    domain: "operations",
  },
  "activation.empty_store && merchant.logged_in_within_window": {
    description: "Recently active merchants with zero products are activation targets.",
    domain: "activation",
  },
  "activation.live_products && realOrders = 0": {
    description: "Stores with live products and zero real orders are first-sale targets.",
    domain: "activation",
  },
  "support.unanswered_threads > 0": {
    description: "Unanswered support threads create relationship risk.",
    domain: "support",
  },
  "technical.custom_domain && dnsStatus != healthy": {
    description: "Custom domains failing live DNS checks damage storefront trust.",
    domain: "technical",
  },
  "revenue.top2_share high": {
    description: "GMV concentrated in top merchants elevates platform risk.",
    domain: "revenue",
  },
} as const;

export function describeRule(ruleId: string): string {
  const exact = (RULE_CATALOG as Record<string, { description: string }>)[
    ruleId
  ];
  if (exact) return exact.description;
  for (const [id, meta] of Object.entries(RULE_CATALOG)) {
    if (ruleId.startsWith(id.split(" ")[0]!) || ruleId.includes(id.slice(0, 20))) {
      return meta.description;
    }
  }
  return `Deterministic rule: ${ruleId}`;
}
