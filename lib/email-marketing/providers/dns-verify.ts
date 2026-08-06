import { promises as dns } from "node:dns";
import type {
  EmailDnsRecordExpectation,
  EmailDnsStatus,
  EmailProviderDnsExpectations,
} from "@/lib/email-marketing/providers/types";

export interface DnsRecordCheckResult {
  purpose: "spf" | "dkim" | "dmarc";
  status: EmailDnsStatus;
  host: string;
  type: "TXT" | "CNAME";
  observed: string[];
  detail: string;
  expected: EmailDnsRecordExpectation;
}

async function resolveTxtJoined(host: string): Promise<string[]> {
  try {
    const records = await dns.resolveTxt(host);
    return records.map((parts) => parts.join(""));
  } catch {
    return [];
  }
}

async function resolveCname(host: string): Promise<string[]> {
  try {
    const records = await dns.resolveCname(host);
    return records.map((r) => r.replace(/\.$/, "").toLowerCase());
  } catch {
    return [];
  }
}

function includesAll(haystacks: string[], needles: string[]): boolean {
  if (needles.length === 0) return haystacks.length > 0;
  const joined = haystacks.map((h) => h.toLowerCase());
  return needles.every((n) =>
    joined.some((h) => h.includes(n.toLowerCase()))
  );
}

export async function verifyDnsExpectation(
  expectation: EmailDnsRecordExpectation
): Promise<DnsRecordCheckResult> {
  const host = expectation.host.replace(/\.$/, "").toLowerCase();

  if (expectation.type === "CNAME") {
    const observed = await resolveCname(host);
    // Some ESPs publish DKIM as TXT — fall back
    const txtFallback = observed.length ? [] : await resolveTxtJoined(host);
    const values = observed.length ? observed : txtFallback;
    const ok =
      expectation.valueIncludes.length === 0
        ? values.length > 0
        : includesAll(values, expectation.valueIncludes);

    return {
      purpose: expectation.purpose,
      status: ok ? "verified" : values.length ? "failed" : "pending",
      host,
      type: expectation.type,
      observed: values,
      detail: ok
        ? `${expectation.purpose.toUpperCase()} record found on ${host}`
        : values.length
          ? `${expectation.purpose.toUpperCase()} present but does not match expected value`
          : `No ${expectation.type} record on ${host} yet — DNS may still be propagating`,
      expected: expectation,
    };
  }

  const observed = await resolveTxtJoined(host);
  const ok = includesAll(observed, expectation.valueIncludes);

  return {
    purpose: expectation.purpose,
    status: ok ? "verified" : observed.length ? "failed" : "pending",
    host,
    type: "TXT",
    observed,
    detail: ok
      ? `${expectation.purpose.toUpperCase()} verified on ${host}`
      : observed.length
        ? `${expectation.purpose.toUpperCase()} TXT found but missing required tokens (${expectation.valueIncludes.join(", ")})`
        : `No TXT record on ${host} — add: ${expectation.recommendedValue}`,
    expected: expectation,
  };
}

export async function verifyProviderDns(
  expectations: EmailProviderDnsExpectations
): Promise<{
  spf: DnsRecordCheckResult;
  dkim: DnsRecordCheckResult;
  dmarc: DnsRecordCheckResult;
  allVerified: boolean;
}> {
  const byPurpose = {
    spf: expectations.records.find((r) => r.purpose === "spf"),
    dkim: expectations.records.find((r) => r.purpose === "dkim"),
    dmarc: expectations.records.find((r) => r.purpose === "dmarc"),
  };

  const [spf, dkim, dmarc] = await Promise.all([
    byPurpose.spf
      ? verifyDnsExpectation(byPurpose.spf)
      : Promise.resolve({
          purpose: "spf" as const,
          status: "unknown" as const,
          host: "",
          type: "TXT" as const,
          observed: [],
          detail: "No SPF expectation for this provider",
          expected: {
            type: "TXT" as const,
            host: "",
            valueIncludes: [],
            recommendedValue: "",
            purpose: "spf" as const,
          },
        }),
    byPurpose.dkim
      ? verifyDnsExpectation(byPurpose.dkim)
      : Promise.resolve({
          purpose: "dkim" as const,
          status: "unknown" as const,
          host: "",
          type: "CNAME" as const,
          observed: [],
          detail: "No DKIM expectation for this provider",
          expected: {
            type: "CNAME" as const,
            host: "",
            valueIncludes: [],
            recommendedValue: "",
            purpose: "dkim" as const,
          },
        }),
    byPurpose.dmarc
      ? verifyDnsExpectation(byPurpose.dmarc)
      : Promise.resolve({
          purpose: "dmarc" as const,
          status: "unknown" as const,
          host: "",
          type: "TXT" as const,
          observed: [],
          detail: "No DMARC expectation for this provider",
          expected: {
            type: "TXT" as const,
            host: "",
            valueIncludes: [],
            recommendedValue: "",
            purpose: "dmarc" as const,
          },
        }),
  ]);

  return {
    spf,
    dkim,
    dmarc,
    allVerified:
      spf.status === "verified" &&
      dkim.status === "verified" &&
      dmarc.status === "verified",
  };
}
