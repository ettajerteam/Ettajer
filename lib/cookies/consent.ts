export const COOKIE_CONSENT_NAME = "ettajer_cookie_consent";
export const COOKIE_CONSENT_MAX_AGE_DAYS = 365;
export const CONSENT_UPDATED_EVENT = "ettajer:cookie-consent";

export type CookieConsentChoice = "all" | "essential";

export type CookieConsentState = {
  choice: CookieConsentChoice;
  decidedAt: string;
};

function cookieBase(): string {
  const maxAge = COOKIE_CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function parseConsentCookie(
  value: string | null | undefined,
): CookieConsentState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as CookieConsentState;
    if (parsed.choice === "all" || parsed.choice === "essential") {
      return parsed;
    }
  } catch {
    if (value === "all" || value === "essential") {
      return { choice: value, decidedAt: new Date().toISOString() };
    }
  }
  return null;
}

export function readConsentCookie(): CookieConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_CONSENT_NAME}=([^;]*)`),
  );
  return parseConsentCookie(match?.[1] ? decodeURIComponent(match[1]) : null);
}

export function writeConsentCookie(choice: CookieConsentChoice): CookieConsentState {
  const state: CookieConsentState = {
    choice,
    decidedAt: new Date().toISOString(),
  };
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(
      JSON.stringify(state),
    )}; ${cookieBase()}`;
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: state }));
  }
  return state;
}

export function hasConsentDecision(): boolean {
  return readConsentCookie() !== null;
}

export function getAnalyticsConsent(): boolean {
  return readConsentCookie()?.choice === "all";
}
