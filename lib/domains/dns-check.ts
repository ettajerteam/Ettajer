import { promises as dns } from "node:dns";
import { isApexHostname } from "@/lib/domains/hostname";

const CNAME_TARGET =
  process.env.NEXT_PUBLIC_DOMAIN_CNAME_TARGET?.trim().toLowerCase() ||
  "cname.vercel-dns.com";
const APEX_A_TARGET =
  process.env.NEXT_PUBLIC_DOMAIN_A_TARGET?.trim() || "76.76.21.21";

export type DnsCheckResult = {
  ok: boolean;
  detail: string;
  records: string[];
};

function isVercelCname(value: string): boolean {
  const v = value.replace(/\.$/, "").toLowerCase();
  return v === CNAME_TARGET || v.endsWith(".vercel-dns.com") || v.endsWith(".vercel-dns.net");
}

export async function checkDomainDns(host: string): Promise<DnsCheckResult> {
  const apex = isApexHostname(host);

  if (apex) {
    try {
      const addresses = await dns.resolve4(host);
      const ok = addresses.includes(APEX_A_TARGET);
      return {
        ok,
        records: addresses,
        detail: ok
          ? `A record points to ${APEX_A_TARGET}`
          : addresses.length
            ? `A record is ${addresses.join(", ")} — expected ${APEX_A_TARGET}`
            : `No A record found — add ${APEX_A_TARGET}`,
      };
    } catch (error) {
      // Some registrars use CNAME flattening / ALIAS at apex
      try {
        const cnames = await dns.resolveCname(host);
        const normalized = cnames.map((c) => c.replace(/\.$/, "").toLowerCase());
        const ok = normalized.some(isVercelCname);
        return {
          ok,
          records: normalized,
          detail: ok
            ? `Apex resolves via CNAME to ${normalized.join(", ")}`
            : `Apex DNS not pointing to Ettajer yet`,
        };
      } catch {
        const code =
          error && typeof error === "object" && "code" in error
            ? String((error as { code?: string }).code)
            : "UNKNOWN";
        return {
          ok: false,
          records: [],
          detail:
            code === "ENOTFOUND" || code === "ENODATA"
              ? "DNS not found yet — records may still be propagating"
              : `DNS lookup failed (${code})`,
        };
      }
    }
  }

  // Subdomain: prefer CNAME, fall back to A (Cloudflare proxy / flattening)
  try {
    const cnames = await dns.resolveCname(host);
    const normalized = cnames.map((c) => c.replace(/\.$/, "").toLowerCase());
    const ok = normalized.some(isVercelCname);
    return {
      ok,
      records: normalized,
      detail: ok
        ? `CNAME points to ${normalized.join(", ")}`
        : normalized.length
          ? `CNAME is ${normalized.join(", ")} — expected ${CNAME_TARGET}`
          : `No CNAME found — add ${CNAME_TARGET}`,
    };
  } catch {
    try {
      const addresses = await dns.resolve4(host);
      const ok = addresses.includes(APEX_A_TARGET);
      return {
        ok,
        records: addresses,
        detail: ok
          ? `Resolves to ${APEX_A_TARGET} (A)`
          : addresses.length
            ? `Resolves to ${addresses.join(", ")} — expected CNAME ${CNAME_TARGET} or A ${APEX_A_TARGET}`
            : `No DNS records found yet`,
      };
    } catch (error) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code?: string }).code)
          : "UNKNOWN";
      return {
        ok: false,
        records: [],
        detail:
          code === "ENOTFOUND" || code === "ENODATA"
            ? "DNS not found yet — records may still be propagating"
            : `DNS lookup failed (${code})`,
      };
    }
  }
}

export function getDnsTargets() {
  return { cnameTarget: CNAME_TARGET, aTarget: APEX_A_TARGET };
}
