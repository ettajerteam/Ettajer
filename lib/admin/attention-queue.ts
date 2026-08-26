/**
 * Prioritized Attention Required queue for the Console overview.
 * Built only from live platform counters — never hardcoded.
 */

export type AttentionItem = {
  id: string;
  count: number;
  title: string;
  reason: string;
  href: string;
  cta: string;
  urgency: number; // lower = higher priority
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
};

export function buildAttentionQueue(input: AttentionQueueInput): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (input.pendingRealOrders > 0) {
    items.push({
      id: "pending-cod",
      count: input.pendingRealOrders,
      title: "COD orders pending verification",
      reason:
        input.processingRealOrders && input.processingRealOrders > 0
          ? `${input.processingRealOrders} already confirmed · courier handoff may be delayed for the rest`
          : "Courier handoff may be delayed until merchants verify these orders",
      href: "/admin/payments?focus=pending",
      cta: "Review orders",
      urgency: 10,
    });
  }

  if (input.waitingUsers > 0) {
    items.push({
      id: "waiting-users",
      count: input.waitingUsers,
      title: "Merchants waiting for account activation",
      reason: "Stuck in waiting status — they cannot sell until cleared",
      href: "/admin/users?status=waiting",
      cta: "Review users",
      urgency: 15,
    });
  }

  if (input.openSupport > 0) {
    items.push({
      id: "support",
      count: input.openSupport,
      title:
        input.openSupport === 1
          ? "Support conversation unanswered"
          : "Support conversations need a reply",
      reason: "Merchant is waiting for a response",
      href: "/admin/messages",
      cta: "Open inbox",
      urgency: 20,
    });
  }

  if (input.hotEmptyCount > 0 || input.loggedInEmpty7d > 0) {
    const count = Math.max(input.hotEmptyCount, input.loggedInEmpty7d);
    items.push({
      id: "empty-activation",
      count,
      title: "Active merchants have no products",
      reason:
        input.loggedInEmpty7d > 0
          ? `${input.loggedInEmpty7d} logged in recently but have not listed products`
          : "Recent store activity without a catalog",
      href: "/admin/activation?stage=empty",
      cta: "Open activation",
      urgency: 25,
    });
  }

  if (input.activeNoOrders > 0) {
    items.push({
      id: "first-sale",
      count: input.activeNoOrders,
      title: "Stores have products but zero real sales",
      reason: "High-potential first-sale targets — catalog ready, no COD yet",
      href: "/admin/activation?stage=listed",
      cta: "View merchants",
      urgency: 30,
    });
  }

  const domainFailing =
    input.domainsConnected > 0
      ? input.domainsConnected - input.domainsConnectedSuccess
      : 0;
  if (domainFailing > 0) {
    items.push({
      id: "domains",
      count: domainFailing,
      title: "Domains have DNS issues",
      reason: "Broken domains can damage merchant trust",
      href: "/admin/domains",
      cta: "Diagnose",
      urgency: 35,
    });
  }

  if (input.failedLogins24h >= 10) {
    items.push({
      id: "failed-logins",
      count: input.failedLogins24h,
      title: "Failed logins in the last 24h",
      reason: "May indicate credential stuffing or broken auth",
      href: "/admin/errors",
      cta: "Inspect errors",
      urgency: 18,
    });
  }

  return items.sort((a, b) => a.urgency - b.urgency || b.count - a.count);
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
