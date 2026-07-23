/**
 * Canonical public origin for emails, magic links, and absolute CTAs.
 * Never emit localhost from production/serverless.
 */

export const CANONICAL_APP_URL = "https://www.ettajer.com";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export function isLocalOrPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "::1" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local")
  );
}

export function isUsablePublicAppUrl(raw: string | undefined | null): boolean {
  if (!raw?.trim()) return false;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (isLocalOrPrivateHost(url.hostname)) {
      // Allow localhost only in local development (not on Vercel)
      if (process.env.VERCEL || process.env.NODE_ENV === "production") {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Absolute app origin for transactional emails and auth links.
 */
export function getAppUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXTAUTH_URL,
  ];

  for (const candidate of candidates) {
    const raw = candidate?.trim();
    if (!raw || !isUsablePublicAppUrl(raw)) continue;
    return stripTrailingSlash(raw);
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return CANONICAL_APP_URL;
  }

  return "http://localhost:3000";
}
