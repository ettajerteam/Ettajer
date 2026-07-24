/**
 * Namecheap XML API client (domain reseller).
 *
 * Every request must come from a whitelisted IPv4, and ClientIp must match
 * that same public IP. Vercel serverless has rotating outbound IPs — use a
 * static-IP proxy/VPS for production, or call from a machine whose IP is
 * whitelisted (local/dev).
 *
 * Docs: https://www.namecheap.com/support/api/intro/
 */

const PROD_URL = "https://api.namecheap.com/xml.response";
const SANDBOX_URL = "https://api.sandbox.namecheap.com/xml.response";

export type NamecheapEnv = {
  apiUser: string;
  apiKey: string;
  userName: string;
  clientIp: string;
  sandbox: boolean;
};

export function getNamecheapEnv(): NamecheapEnv | null {
  const apiUser = process.env.NAMECHEAP_API_USER?.trim();
  const apiKey = process.env.NAMECHEAP_API_KEY?.trim();
  const userName =
    process.env.NAMECHEAP_USERNAME?.trim() || apiUser || "";
  const clientIp = process.env.NAMECHEAP_CLIENT_IP?.trim();
  if (!apiUser || !apiKey || !userName || !clientIp) return null;

  return {
    apiUser,
    apiKey,
    userName,
    clientIp,
    sandbox: process.env.NAMECHEAP_SANDBOX === "1" || process.env.NAMECHEAP_SANDBOX === "true",
  };
}

export function isNamecheapConfigured(): boolean {
  return getNamecheapEnv() != null;
}

function endpoint(sandbox: boolean): string {
  return sandbox ? SANDBOX_URL : PROD_URL;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getAttr(tag: string, attr: string): string | null {
  const re = new RegExp(`${attr}="([^"]*)"`, "i");
  const m = tag.match(re);
  return m?.[1] ?? null;
}

export type NamecheapApiResult = {
  ok: boolean;
  status: string;
  errors: string[];
  raw: string;
};

export async function namecheapCommand(
  command: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<NamecheapApiResult> {
  const env = getNamecheapEnv();
  if (!env) {
    throw new Error(
      "Namecheap is not configured. Set NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_CLIENT_IP (and optional NAMECHEAP_USERNAME)."
    );
  }

  const url = new URL(endpoint(env.sandbox));
  url.searchParams.set("ApiUser", env.apiUser);
  url.searchParams.set("ApiKey", env.apiKey);
  url.searchParams.set("UserName", env.userName);
  url.searchParams.set("ClientIp", env.clientIp);
  url.searchParams.set("Command", command);

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/xml" },
    cache: "no-store",
  });
  const raw = await res.text();

  const statusMatch = raw.match(/Status="([^"]+)"/i);
  const status = statusMatch?.[1] ?? "UNKNOWN";
  const errors: string[] = [];
  const errorRe = /Number="(\d+)"[^>]*>([^<]*)</gi;
  let em: RegExpExecArray | null;
  while ((em = errorRe.exec(raw))) {
    errors.push(`${em[1]}: ${em[2].trim() || "error"}`);
  }
  // Also catch <Error> without Number
  if (errors.length === 0) {
    const plain = [...raw.matchAll(/<Error[^>]*>([^<]+)<\/Error>/gi)].map((m) =>
      m[1].trim()
    );
    errors.push(...plain);
  }

  return {
    ok: status.toLowerCase() === "ok",
    status,
    errors,
    raw,
  };
}

export type DomainCheckResult = {
  domain: string;
  available: boolean;
  premium?: boolean;
  error?: string;
};

/** Check one or more domains (comma-separated, max ~50 per Namecheap call). */
export async function checkDomains(domainList: string[]): Promise<DomainCheckResult[]> {
  const cleaned = domainList
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  if (!cleaned.length) return [];

  const result = await namecheapCommand("namecheap.domains.check", {
    DomainList: cleaned.join(","),
  });

  if (!result.ok) {
    throw new Error(result.errors.join("; ") || `Namecheap status ${result.status}`);
  }

  const out: DomainCheckResult[] = [];
  const re =
    /<DomainCheckResult\b([^>]*)\/?>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(result.raw))) {
    const tag = m[1];
    const domain = getAttr(tag, "Domain") ?? "";
    const available = (getAttr(tag, "Available") ?? "").toLowerCase() === "true";
    const premium = (getAttr(tag, "IsPremiumName") ?? "").toLowerCase() === "true";
    const errorNo = getAttr(tag, "ErrorNo");
    const description = getAttr(tag, "Description");
    out.push({
      domain,
      available,
      premium,
      ...(errorNo && errorNo !== "0"
        ? { error: description || `Error ${errorNo}` }
        : {}),
    });
  }
  return out;
}

/** Sanity ping — returns balance info if credentials + IP whitelist are correct. */
export async function getAccountBalance(): Promise<{
  ok: boolean;
  availableBalance?: string;
  errors: string[];
  raw: string;
}> {
  const result = await namecheapCommand("namecheap.users.getBalances");
  if (!result.ok) {
    return { ok: false, errors: result.errors, raw: result.raw };
  }
  const avail =
    result.raw.match(/<AvailableBalance>([^<]+)<\/AvailableBalance>/i)?.[1] ??
    result.raw.match(/AvailableBalance="([^"]+)"/i)?.[1];
  return {
    ok: true,
    availableBalance: avail,
    errors: [],
    raw: result.raw,
  };
}

/** Escape helper exported for tests / future XML builders */
export { xmlEscape };
