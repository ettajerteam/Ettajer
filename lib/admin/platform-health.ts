/**
 * Platform health strip — derived only from existing platform signals.
 * Never invents a probe that the backend does not perform.
 */

export type HealthStatus = "operational" | "attention" | "issues" | "unknown";

export type PlatformHealthItem = {
  id: string;
  label: string;
  status: HealthStatus;
  statusLabel: string;
  detail: string;
  href: string;
};

export type PlatformHealthInput = {
  pendingRealOrders: number;
  realOrders7d: number;
  liveStores: number;
  totalStores: number;
  domainsConnected: number;
  domainsConnectedSuccess: number;
  failedLogins24h: number;
  openSupport: number;
  emailConfigured: boolean;
};

export function derivePlatformHealth(
  input: PlatformHealthInput
): {
  items: PlatformHealthItem[];
  overall: HealthStatus;
  overallLabel: string;
} {
  const domainFailing =
    input.domainsConnected > 0
      ? input.domainsConnected - input.domainsConnectedSuccess
      : 0;

  const commerce: PlatformHealthItem = {
    id: "commerce",
    label: "Commerce",
    status:
      input.pendingRealOrders >= 10
        ? "attention"
        : input.realOrders7d > 0 || input.pendingRealOrders === 0
          ? "operational"
          : "operational",
    statusLabel:
      input.pendingRealOrders >= 10
        ? `${input.pendingRealOrders} pending`
        : "Operational",
    detail:
      input.pendingRealOrders > 0
        ? `${input.pendingRealOrders} pending COD · ${input.realOrders7d} real orders / 7d`
        : `${input.realOrders7d} real orders in last 7d`,
    href: "/admin/payments",
  };

  const storefronts: PlatformHealthItem = {
    id: "storefronts",
    label: "Storefronts",
    status: input.liveStores > 0 ? "operational" : "attention",
    statusLabel: input.liveStores > 0 ? "Operational" : "No live stores",
    detail: `${input.liveStores} live · ${input.totalStores} total`,
    href: "/admin/stores",
  };

  const payments: PlatformHealthItem = {
    id: "payments",
    label: "Payments",
    status: input.pendingRealOrders >= 5 ? "attention" : "operational",
    statusLabel:
      input.pendingRealOrders >= 5
        ? `${input.pendingRealOrders} pending COD`
        : "Operational",
    detail:
      "Status from order pipeline (COD pending / confirmed) — not a payment-gateway probe.",
    href: "/admin/payments?focus=pending",
  };

  const email: PlatformHealthItem = {
    id: "email",
    label: "Email",
    status: input.emailConfigured ? "operational" : "unknown",
    statusLabel: input.emailConfigured ? "Configured" : "Not configured",
    detail: input.emailConfigured
      ? "Resend / email provider env is present"
      : "No RESEND_API_KEY detected in this environment",
    href: "/admin/email",
  };

  const domains: PlatformHealthItem = {
    id: "domains",
    label: "Domains",
    status:
      domainFailing > 0
        ? "issues"
        : input.domainsConnected > 0
          ? "operational"
          : "unknown",
    statusLabel:
      domainFailing > 0
        ? `${domainFailing} issue${domainFailing === 1 ? "" : "s"}`
        : input.domainsConnected > 0
          ? "Operational"
          : "None linked",
    detail:
      input.domainsConnected > 0
        ? `${input.domainsConnectedSuccess}/${input.domainsConnected} DNS OK (live check)`
        : "No custom domains saved",
    href: "/admin/domains",
  };

  const auth: PlatformHealthItem = {
    id: "auth",
    label: "Authentication",
    status: input.failedLogins24h >= 10 ? "issues" : "operational",
    statusLabel:
      input.failedLogins24h >= 10
        ? `${input.failedLogins24h} failed / 24h`
        : "Operational",
    detail: `${input.failedLogins24h} failed logins in 24h`,
    href: "/admin/errors",
  };

  const items = [commerce, storefronts, payments, email, domains, auth];

  const hasIssues = items.some((i) => i.status === "issues");
  const hasAttention = items.some((i) => i.status === "attention");
  const overall: HealthStatus = hasIssues
    ? "issues"
    : hasAttention
      ? "attention"
      : "operational";
  const overallLabel =
    overall === "operational"
      ? "All systems operational"
      : overall === "issues"
        ? "Issues detected"
        : "Needs attention";

  return { items, overall, overallLabel };
}
