import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { EMAIL_LOCALE_COOKIE } from "@/lib/email/email-locale-constants";

/** Mirrors UI locale to a cookie so server-side email sends can read it. */
export function syncEmailLocaleCookie(locale: LandingLocale) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${EMAIL_LOCALE_COOKIE}=${encodeURIComponent(locale)};path=/;max-age=${maxAge};SameSite=Lax`;
}
