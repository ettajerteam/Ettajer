import {
  getAbsoluteStoreUrl,
  normalizeCustomDomain,
} from "@/lib/storefront-urls";

const META_TAG_NAME = "facebook-domain-verification";

/** Build the HTML meta tag merchants paste into Meta docs / view in source. */
export function buildFacebookDomainVerificationMetaTag(code: string): string {
  const content = code.trim();
  return `<meta name="${META_TAG_NAME}" content="${content}" />`;
}

/** Extract Meta domain verification content from HTML (homepage source). */
export function extractFacebookDomainVerificationCode(
  html: string
): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+name=["']${META_TAG_NAME}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${META_TAG_NAME}["']`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const value = match?.[1]?.trim();
    if (value) return value;
  }
  return null;
}

/** Pull just the content value if a merchant pastes the full meta tag. */
export function normalizeFacebookDomainVerificationCode(
  raw: string | null | undefined
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fromTag = extractFacebookDomainVerificationCode(trimmed);
  if (fromTag) return fromTag.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128) || null;

  const contentAttr = trimmed.match(/content=["']([^"']+)["']/i)?.[1];
  const candidate = (contentAttr ?? trimmed).trim();
  const cleaned = candidate.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 128);
  return cleaned || null;
}

/** Root domain Meta expects (example.com, not www / path). */
export function metaVerifyRootDomain(hostname: string | null | undefined): string | null {
  const host = normalizeCustomDomain(hostname);
  if (!host) return null;
  const parts = host.split(".").filter(Boolean);
  if (parts.length < 2) return host;
  // Keep last two labels for typical domains; leave multi-part TLDs as-is (co.uk etc. still OK as guidance)
  if (parts.length === 2) return host;
  const last = parts[parts.length - 1]!;
  const second = parts[parts.length - 2]!;
  // common multi-part TLDs
  const multi = new Set(["co", "com", "org", "net", "gov", "ac"]);
  if (parts.length >= 3 && multi.has(second) && last.length <= 3) {
    return parts.slice(-3).join(".");
  }
  return `${second}.${last}`;
}

export function getMetaDomainVerificationTargets(input: {
  storeSlug: string;
  customDomain: string | null;
}): {
  storefrontUrl: string;
  customDomain: string | null;
  rootDomain: string | null;
  verifyOnCustomDomain: boolean;
} {
  const custom = normalizeCustomDomain(input.customDomain);
  const storefrontUrl = custom
    ? `https://${custom}`
    : getAbsoluteStoreUrl(input.storeSlug);

  return {
    storefrontUrl,
    customDomain: custom,
    rootDomain: custom ? metaVerifyRootDomain(custom) : null,
    verifyOnCustomDomain: Boolean(custom),
  };
}

export async function checkFacebookDomainVerificationTag(input: {
  url: string;
  expectedCode: string;
}): Promise<{
  ok: boolean;
  foundCode: string | null;
  matches: boolean;
  status: number | null;
  error: string | null;
}> {
  const expected = input.expectedCode.trim();
  if (!expected) {
    return {
      ok: false,
      foundCode: null,
      matches: false,
      status: null,
      error: "Save a verification code first",
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    const res = await fetch(input.url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "text/html",
        "User-Agent":
          "EttajerMetaDomainCheck/1.0 (+https://www.ettajer.com)",
      },
    });
    clearTimeout(timer);

    const html = await res.text();
    const foundCode = extractFacebookDomainVerificationCode(html);
    const matches = Boolean(
      foundCode && foundCode.toLowerCase() === expected.toLowerCase()
    );

    return {
      ok: res.ok && matches,
      foundCode,
      matches,
      status: res.status,
      error: res.ok
        ? null
        : `Storefront returned HTTP ${res.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      foundCode: null,
      matches: false,
      status: null,
      error:
        error instanceof Error
          ? error.name === "AbortError"
            ? "Timed out fetching storefront"
            : error.message
          : "Could not reach storefront",
    };
  }
}
