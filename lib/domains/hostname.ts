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

export function detectDomainMode(host: string): DomainMode {
  return isApexHostname(host) ? "apex" : "subdomain";
}
