import { cookies } from "next/headers";
import {
  toLandingLocale,
  type LandingLocale,
} from "@/lib/landing/landing-i18n";
import { EMAIL_LOCALE_COOKIE } from "@/lib/email/email-locale-constants";

export { EMAIL_LOCALE_COOKIE } from "@/lib/email/email-locale-constants";

export function parseEmailLocale(value?: string | null): LandingLocale {
  if (!value) return "en";
  return toLandingLocale(value);
}

export function getEmailLocaleFromCookieHeader(
  cookieHeader: string | null | undefined,
): LandingLocale {
  if (!cookieHeader) return "en";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${EMAIL_LOCALE_COOKIE}=([^;]+)`),
  );
  if (!match?.[1]) return "en";
  return parseEmailLocale(decodeURIComponent(match[1].trim()));
}

export async function getEmailLocaleFromCookies(): Promise<LandingLocale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(EMAIL_LOCALE_COOKIE)?.value;
  return parseEmailLocale(value);
}

export function resolveEmailLocale(
  ...candidates: (string | null | undefined)[]
): LandingLocale {
  for (const candidate of candidates) {
    if (candidate?.trim()) {
      return parseEmailLocale(candidate);
    }
  }
  return "en";
}

export function resolveRequestEmailLocale(
  request: Request,
  bodyLocale?: string | null,
): LandingLocale {
  return resolveEmailLocale(
    bodyLocale,
    getEmailLocaleFromCookieHeader(request.headers.get("cookie")),
  );
}
