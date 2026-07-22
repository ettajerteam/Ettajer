"use client";

import { useEffect } from "react";
import {
  CONSENT_UPDATED_EVENT,
  getAnalyticsConsent,
  type CookieConsentState,
} from "@/lib/cookies/consent";

function pushConsent(granted: boolean) {
  const win = window as Window & {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };
  if (!win.gtag) {
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({
      event: "consent_update",
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
    });
    return;
  }
  win.gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

/**
 * Syncs cookie banner choice into GTM Consent Mode.
 */
export function GtmConsentSync() {
  useEffect(() => {
    pushConsent(getAnalyticsConsent());

    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      const granted =
        detail?.choice === "all" || getAnalyticsConsent();
      pushConsent(granted);
    };

    window.addEventListener(CONSENT_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onUpdate);
  }, []);

  return null;
}
