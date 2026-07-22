"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  CONSENT_UPDATED_EVENT,
  getAnalyticsConsent,
  type CookieConsentState,
} from "@/lib/cookies/consent";

/**
 * Loads GA4 only after the visitor accepts analytics cookies.
 */
export function ConsentGatedAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(getAnalyticsConsent());
    sync();
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<CookieConsentState>).detail;
      if (detail?.choice === "essential") {
        const gtag = (window as Window & { gtag?: (...args: unknown[]) => void })
          .gtag;
        gtag?.("consent", "update", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
      setEnabled(detail?.choice === "all" || getAnalyticsConsent());
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onUpdate);
  }, []);

  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId) || !enabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ettajer-platform-ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          });
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
