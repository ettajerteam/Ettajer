export const OAUTH_CONSENT_COOKIE = "ettajer_oauth_consent";
export const OAUTH_MARKETING_COOKIE = "ettajer_oauth_marketing";

const MAX_AGE_SEC = 600;

export function setOAuthSignupCookies(termsAccepted: boolean, marketingEmails: boolean) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  const base = `path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax${secure ? "; Secure" : ""}`;
  document.cookie = `${OAUTH_CONSENT_COOKIE}=${termsAccepted ? "1" : "0"}; ${base}`;
  document.cookie = `${OAUTH_MARKETING_COOKIE}=${marketingEmails ? "1" : "0"}; ${base}`;
}

export function clearOAuthSignupCookies() {
  const base = "path=/; max-age=0; SameSite=Lax";
  document.cookie = `${OAUTH_CONSENT_COOKIE}=; ${base}`;
  document.cookie = `${OAUTH_MARKETING_COOKIE}=; ${base}`;
}

export function parseOAuthSignupCookies(cookieHeader: string | null): {
  termsAccepted: boolean;
  marketingEmails: boolean;
} {
  if (!cookieHeader) {
    return { termsAccepted: false, marketingEmails: false };
  }

  const read = (name: string) => {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match?.[1] === "1";
  };

  return {
    termsAccepted: read(OAUTH_CONSENT_COOKIE),
    marketingEmails: read(OAUTH_MARKETING_COOKIE),
  };
}
