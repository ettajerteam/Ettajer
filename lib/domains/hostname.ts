/** Shared custom-domain helpers for merchant stores. */

const MULTI_PART_TLDS = new Set([
  "co.ma",
  "com.ma",
  "net.ma",
  "org.ma",
  "ac.ma",
  "press.ma",
  "co.uk",
  "org.uk",
  "ac.uk",
  "com.au",
  "net.au",
  "org.au",
  "co.nz",
  "com.br",
]);

export function isApexHostname(host: string): boolean {
  const parts = host.toLowerCase().split(".").filter(Boolean);
  if (parts.length <= 2) return true;
  const lastTwo = parts.slice(-2).join(".");
  return MULTI_PART_TLDS.has(lastTwo) && parts.length === 3;
}

export function subdomainLabel(host: string): string {
  if (isApexHostname(host)) return "www";
  return host.split(".")[0] || "www";
}

/** Basic hostname validation (no protocol/path). */
export function isValidHostname(host: string): boolean {
  if (!host || host.length > 253) return false;
  if (host.includes("..") || host.startsWith("-") || host.endsWith("-")) return false;
  if (host.startsWith(".") || host.endsWith(".")) return false;
  const labels = host.split(".");
  if (labels.length < 2) return false;
  return labels.every((label) => {
    if (!label || label.length > 63) return false;
    if (label.startsWith("-") || label.endsWith("-")) return false;
    return /^[a-z0-9-]+$/i.test(label);
  });
}

export type DomainMode = "subdomain" | "apex";

export type DomainPrimary = "apex" | "www";

export function detectDomainMode(host: string): DomainMode {
  return isApexHostname(host) ? "apex" : "subdomain";
}

/** Apex root if host is apex or www.apex; otherwise null (nested subdomain). */
export function apexRoot(host: string): string | null {
  const h = host.toLowerCase();
  if (isApexHostname(h)) return h;
  if (h.startsWith("www.") && isApexHostname(h.slice(4))) return h.slice(4);
  return null;
}

export function parseDomainPrimary(
  value: string | null | undefined
): DomainPrimary {
  return value === "www" ? "www" : "apex";
}

/** Canonical hostname customers should land on. */
export function preferredHostname(
  customDomain: string,
  primary: DomainPrimary | null | undefined
): string {
  const apex = apexRoot(customDomain);
  if (!apex) return customDomain.toLowerCase();
  return parseDomainPrimary(primary) === "www" ? `www.${apex}` : apex;
}

/** The non-preferred host in an apex/www pair (for redirects). */
export function alternateHostname(
  customDomain: string,
  primary: DomainPrimary | null | undefined
): string | null {
  const apex = apexRoot(customDomain);
  if (!apex) return null;
  return parseDomainPrimary(primary) === "www" ? apex : `www.${apex}`;
}

/** Hostnames that should resolve to the same store as `host`. */
export function domainLookupCandidates(host: string): string[] {
  const h = host.toLowerCase();
  const out = new Set<string>([h]);
  if (h.startsWith("www.")) out.add(h.slice(4));
  else out.add(`www.${h}`);
  const apex = apexRoot(h);
  if (apex) {
    out.add(apex);
    out.add(`www.${apex}`);
  }
  return Array.from(out);
}
