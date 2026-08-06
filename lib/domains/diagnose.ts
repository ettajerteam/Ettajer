import type { DomainMode } from "@/lib/domains/hostname";

export type DomainVerifyLike = {
  connected: boolean;
  live: boolean;
  dns: { ok: boolean; detail: string; records: string[] } | null;
  wwwDns?: { ok: boolean; detail: string } | null;
  vercelConfigured?: boolean;
  vercel?: {
    found: boolean;
    verified: boolean;
    error: string | null;
  } | null;
  recommendations?: {
    cnameTarget: string;
    aTarget: string;
    misconfigured: boolean;
    currentCnames: string[];
    currentA: string[];
  } | null;
  steps?: {
    saved: boolean;
    provisioned: boolean;
    dns: boolean;
    ssl: boolean;
  };
  expected?: {
    cnameTarget: string;
    aTarget: string;
    mode: DomainMode | null;
    host: string | null;
  };
};

export type DomainDiagnosis = {
  code: "not_provisioned" | "dns_wrong" | "dns_missing" | "www_wrong" | "ssl_pending" | "vercel_error";
  title: string;
  fix: string;
};

/** Derive a clear issue + one-line fix from the verify payload. */
export function diagnoseDomain(verify: DomainVerifyLike | null): DomainDiagnosis | null {
  if (!verify?.connected || verify.live) return null;

  const steps = verify.steps;
  const cname = verify.expected?.cnameTarget ?? verify.recommendations?.cnameTarget ?? "cname.vercel-dns.com";
  const aTarget = verify.expected?.aTarget ?? verify.recommendations?.aTarget ?? "76.76.21.21";
  const host = verify.expected?.host ?? "shop";
  const mode = verify.expected?.mode;

  if (steps && !steps.provisioned) {
    if (verify.vercelConfigured === false) {
      return {
        code: "not_provisioned",
        title: "SSL provisioning isn’t configured yet",
        fix: "Your hostname is saved. Contact Ettajer support if DNS never goes live.",
      };
    }
    return {
      code: "not_provisioned",
      title: "Hostname is still being provisioned",
      fix: "Wait about a minute, then Check DNS again.",
    };
  }

  if (verify.vercel?.error) {
    return {
      code: "vercel_error",
      title: "Platform could not verify this hostname",
      fix: verify.vercel.error,
    };
  }

  if (steps && !steps.dns) {
    const detail = (verify.dns?.detail ?? "").toLowerCase();
    const currentCname = verify.recommendations?.currentCnames?.[0];
    const currentA = verify.recommendations?.currentA?.[0];

    if (
      detail.includes("not found") ||
      detail.includes("no a record") ||
      detail.includes("no cname") ||
      detail.includes("no dns") ||
      detail.includes("propagating")
    ) {
      return {
        code: "dns_missing",
        title: "DNS records not found yet",
        fix:
          mode === "apex"
            ? `Add A @ → ${aTarget} and CNAME www → ${cname}, then wait a few minutes.`
            : `Add CNAME ${host} → ${cname} at your registrar, then wait a few minutes.`,
      };
    }

    if (mode === "apex" || detail.includes("a record")) {
      return {
        code: "dns_wrong",
        title: currentA
          ? `A record points to ${currentA}`
          : "Root domain DNS is incorrect",
        fix: `Set A record Host @ to ${aTarget} (replace any other A values).`,
      };
    }

    return {
      code: "dns_wrong",
      title: currentCname
        ? `CNAME points to ${currentCname}`
        : "Subdomain CNAME is incorrect",
      fix: `Set CNAME Host ${host} to ${cname} (remove old CNAMEs for this host).`,
    };
  }

  if (verify.wwwDns && !verify.wwwDns.ok && mode === "apex") {
    return {
      code: "www_wrong",
      title: "www subdomain is not pointing here yet",
      fix: `Add CNAME www → ${cname} so both brand.com and www.brand.com work.`,
    };
  }

  if (steps && steps.dns && !steps.ssl) {
    return {
      code: "ssl_pending",
      title: "DNS looks good — SSL is still issuing",
      fix: "Keep watching. HTTPS usually finishes within a few minutes after DNS is correct.",
    };
  }

  if (verify.recommendations?.misconfigured) {
    return {
      code: "dns_wrong",
      title: "Platform still reports DNS as incomplete",
      fix:
        mode === "apex"
          ? `Confirm A @ → ${aTarget} and CNAME www → ${cname}, then Check DNS again.`
          : `Confirm CNAME ${host} → ${cname}, then Check DNS again.`,
    };
  }

  return {
    code: "dns_wrong",
    title: verify.dns?.detail || "Domain is not live yet",
    fix: "Double-check the DNS table below, wait for propagation, then Check DNS.",
  };
}
