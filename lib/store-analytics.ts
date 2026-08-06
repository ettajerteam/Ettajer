import { headers } from "next/headers";

export type TrackedDevice = "mobile" | "desktop" | "tablet";

export function parseUserAgent(ua: string | null | undefined): {
  device: TrackedDevice;
  browser: string;
} {
  const value = ua ?? "";
  const lower = value.toLowerCase();

  let device: TrackedDevice = "desktop";
  if (/ipad|tablet|kindle|playbook|silk|(android(?!.*mobile))/i.test(value)) {
    device = "tablet";
  } else if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(value)) {
    device = "mobile";
  }

  let browser = "Other";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome/") && !lower.includes("edg/")) browser = "Chrome";
  else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "Safari";
  else if (lower.includes("firefox/")) browser = "Firefox";

  return { device, browser };
}

export async function readRequestGeo() {
  const h = await headers();
  return {
    country: h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || null,
    city: h.get("x-vercel-ip-city") || null,
    userAgent: h.get("user-agent"),
  };
}

export function normalizePath(path: string): string {
  if (!path) return "/";
  try {
    const url = path.startsWith("http") ? new URL(path) : null;
    const raw = url ? url.pathname : path;
    const cleaned = raw.split("?")[0]?.split("#")[0] || "/";
    return cleaned.length > 240 ? cleaned.slice(0, 240) : cleaned;
  } catch {
    return "/";
  }
}

export function classifyReferrer(referrer: string | null | undefined, utmSource?: string | null) {
  if (utmSource?.trim()) {
    const source = utmSource.trim().toLowerCase();
    if (source.includes("google") || source.includes("bing")) return "Organic";
    if (source.includes("facebook") || source.includes("ig") || source.includes("instagram") || source.includes("tiktok")) {
      return "Social";
    }
    if (source.includes("mail") || source.includes("newsletter")) return "Email";
    if (source.includes("cpc") || source.includes("ads") || source.includes("meta")) return "Ads";
    return "Referral";
  }

  if (!referrer) return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (!host) return "Direct";
    if (host.includes("google.") || host.includes("bing.") || host.includes("yahoo.")) return "Organic";
    if (
      host.includes("instagram.") ||
      host.includes("facebook.") ||
      host.includes("tiktok.") ||
      host.includes("t.co") ||
      host.includes("twitter.") ||
      host.includes("x.com")
    ) {
      return "Social";
    }
    return "Referral";
  } catch {
    return "Direct";
  }
}
