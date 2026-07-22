import Script from "next/script";
import { GtmConsentSync } from "@/components/seo/gtm-consent-sync";

const GTM_ID_RE = /^GTM-[A-Z0-9]+$/i;

export function getGtmId(): string | null {
  const id =
    process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-WZ7QXGGP";
  return GTM_ID_RE.test(id) ? id : null;
}

/**
 * Platform Google Tag Manager (ettajer.com).
 * Head script + body noscript per Google’s install snippet, with Consent Mode defaults.
 */
export function GoogleTagManager() {
  const gtmId = getGtmId();
  if (!gtmId) return null;

  return (
    <>
      <Script id="ettajer-gtm-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script id="ettajer-gtm" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
      <GtmConsentSync />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
