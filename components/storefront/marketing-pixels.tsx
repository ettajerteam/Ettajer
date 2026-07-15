"use client";

import Script from "next/script";
import { useEffect } from "react";
import type { PublicMarketingIntegrations, PublicPlatformPixel } from "@/lib/marketing-integrations";
import { hasTestModeEnabled } from "@/lib/marketing-integrations";
import { trackPurchase } from "@/lib/marketing-events";
import { logMarketingEvent } from "@/lib/marketing-event-log";
import { MarketingDebugBanner } from "@/components/storefront/marketing-debug-banner";
import { MARKETING_PLATFORMS } from "@/lib/marketing-integrations";

interface MarketingPixelsProps {
  marketing: PublicMarketingIntegrations;
  purchase?: {
    value: number;
    currency: string;
    orderNumber: string;
  };
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (event: string, payload?: Record<string, unknown>) => void;
    };
    pintrk?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    snaptr?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function hasAnyPixel(marketing: PublicMarketingIntegrations): boolean {
  return Boolean(
    marketing.meta ||
      marketing.tiktok ||
      marketing.pinterest ||
      marketing.google ||
      marketing.snapchat ||
      marketing.gtm
  );
}

export function MarketingPixels({ marketing, purchase }: MarketingPixelsProps) {
  useEffect(() => {
    for (const platform of MARKETING_PLATFORMS) {
      const config = marketing[platform.id];
      if (config?.testMode && config.trackPageViews) {
        logMarketingEvent(platform.id, "PageView", { pixelId: config.pixelId });
      }
    }
  }, [marketing]);

  useEffect(() => {
    if (!purchase) return;
    trackPurchase(marketing, purchase);
  }, [marketing, purchase]);

  if (!hasAnyPixel(marketing)) return null;

  return (
    <>
      <MetaPixel config={marketing.meta} />
      <TikTokPixel config={marketing.tiktok} />
      <PinterestPixel config={marketing.pinterest} />
      <GooglePixel config={marketing.google} />
      <SnapchatPixel config={marketing.snapchat} />
      <GtmContainer config={marketing.gtm} />
      {hasTestModeEnabled(marketing) && <MarketingDebugBanner />}
    </>
  );
}

function MetaPixel({ config }: { config?: PublicPlatformPixel }) {
  if (!config?.pixelId) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${config.pixelId}');
        ${config.trackPageViews ? "fbq('track', 'PageView');" : ""}
      `}
    </Script>
  );
}

function TikTokPixel({ config }: { config?: PublicPlatformPixel }) {
  if (!config?.pixelId) return null;
  return (
    <Script id="tiktok-pixel" strategy="afterInteractive">
      {`
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
          ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
          ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
          for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
          ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
          ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};
          var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;
          var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${config.pixelId}');
          ${config.trackPageViews ? "ttq.page();" : ""}
        }(window, document, 'ttq');
      `}
    </Script>
  );
}

function PinterestPixel({ config }: { config?: PublicPlatformPixel }) {
  if (!config?.pixelId) return null;
  return (
    <Script id="pinterest-tag" strategy="afterInteractive">
      {`
        !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
        var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;
        var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
        pintrk('load', '${config.pixelId}');
        ${config.trackPageViews ? "pintrk('page');" : ""}
      `}
    </Script>
  );
}

function GooglePixel({ config }: { config?: PublicPlatformPixel }) {
  if (!config?.pixelId) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${config.pixelId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${config.pixelId}');
        `}
      </Script>
    </>
  );
}

function SnapchatPixel({ config }: { config?: PublicPlatformPixel }) {
  if (!config?.pixelId) return null;
  return (
    <Script id="snapchat-pixel" strategy="afterInteractive">
      {`
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){
        a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);
        })(window,document,'https://sc-static.net/scevent.min.js');
        snaptr('init', '${config.pixelId}');
        ${config.trackPageViews ? "snaptr('track', 'PAGE_VIEW');" : ""}
      `}
    </Script>
  );
}

function GtmContainer({ config }: { config?: PublicPlatformPixel }) {
  if (!config?.pixelId) return null;
  return (
    <>
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${config.pixelId}');
        `}
      </Script>
      {config.trackPageViews && (
        <Script id="gtm-pageview" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: 'page_view' });
          `}
        </Script>
      )}
    </>
  );
}
