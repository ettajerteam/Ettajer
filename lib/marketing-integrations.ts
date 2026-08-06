import { normalizeFacebookDomainVerificationCode } from "@/lib/meta-domain-verification";

export type MarketingPlatformId = "meta" | "tiktok" | "pinterest" | "google" | "snapchat" | "gtm";

export interface MarketingPlatformLink {
  enabled: boolean;
  pixelId: string | null;
  connected: boolean;
  trackPageViews: boolean;
  trackViewContent: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchases: boolean;
  testMode: boolean;
  /** Meta Test Events code (TEST…) — used by Conversions API when testMode is on */
  testEventCode: string | null;
  accountId: string | null;
  accessToken: string | null;
  /** Meta Commerce catalog ID (for Dynamic Ads / Advantage+) */
  catalogId: string | null;
  /** Optional secret key required on the public product feed URL */
  catalogFeedToken: string | null;
  /** Meta ad account for Custom Audiences (act_…) */
  adAccountId: string | null;
  /** Meta Custom Audience ID — purchasers list */
  purchasersAudienceId: string | null;
  /** Meta Custom Audience ID — abandoned checkout list */
  abandonersAudienceId: string | null;
  /** ISO timestamp of last purchasers audience sync */
  purchasersAudienceSyncedAt: string | null;
  /** ISO timestamp of last abandoners audience sync */
  abandonersAudienceSyncedAt: string | null;
  /** When true, daily cron re-syncs existing Meta custom audiences */
  audiencesAutoSync: boolean;
  /**
   * Meta Business Manager domain verification content
   * (`facebook-domain-verification` meta tag).
   */
  domainVerificationCode: string | null;
  /** ISO timestamp when merchant marked the domain verified in Meta */
  domainVerifiedAt: string | null;
}

export type MarketingIntegrations = Record<MarketingPlatformId, MarketingPlatformLink>;

export interface MarketingSetupStep {
  title: string;
  description: string;
}

export interface MarketingResourceLink {
  label: string;
  url: string;
}

export interface MarketingEventDetail {
  name: string;
  trigger: string;
  description: string;
}

export interface MarketingPlatformConfig {
  id: MarketingPlatformId;
  name: string;
  subtitle: string;
  description: string;
  longDescription: string;
  logo: string;
  color: string;
  accent: string;
  glow: string;
  ring: string;
  pixelLabel: string;
  pixelPlaceholder: string;
  pixelHelp: string;
  accountLabel: string;
  accountPlaceholder: string;
  docsUrl: string;
  consoleUrl: string;
  events: string[];
  eventDetails: MarketingEventDetail[];
  setupSteps: MarketingSetupStep[];
  resources: MarketingResourceLink[];
  benefits: string[];
}

export const MARKETING_PLATFORMS: MarketingPlatformConfig[] = [
  {
    id: "meta",
    name: "Meta",
    subtitle: "Facebook & Instagram",
    description: "Track ad clicks, retarget visitors, and attribute purchases from Meta campaigns.",
    longDescription:
      "Connect Meta Pixel plus Conversions API for accurate tracking when cookies are blocked — measure visits, build retargeting audiences, and sync your product catalog for Dynamic Ads and Advantage+ shopping.",
    logo: "/marketing/logos/meta.svg",
    color: "#1877F2",
    accent: "bg-[#1877F2]/10 text-[#1877F2]",
    glow: "from-[#1877F2]/[0.08]",
    ring: "ring-[#1877F2]/15",
    pixelLabel: "Meta Pixel ID",
    pixelPlaceholder: "e.g. 123456789012345",
    pixelHelp: "Found in Meta Events Manager under Data Sources → Pixels.",
    accountLabel: "Meta Business ID",
    accountPlaceholder: "e.g. 123456789012345",
    docsUrl: "https://business.facebook.com/events_manager",
    consoleUrl: "https://business.facebook.com/events_manager",
    events: ["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"],
    eventDetails: [
      {
        name: "PageView",
        trigger: "Every storefront page",
        description: "Fires when a customer views any page on your store.",
      },
      {
        name: "ViewContent",
        trigger: "Product page",
        description:
          "Fires on product detail pages. content_ids match catalog feed product IDs for Dynamic Ads.",
      },
      {
        name: "AddToCart",
        trigger: "Add to cart",
        description: "Fires when a product is added to the cart.",
      },
      {
        name: "InitiateCheckout",
        trigger: "After checkout contact",
        description:
          "Fires after the customer enters contact details — includes hashed email/phone for advanced matching.",
      },
      {
        name: "Purchase",
        trigger: "Order confirmation",
        description:
          "Fires after checkout with value, currency, and order number. Pixel and CAPI share the same event_id.",
      },
    ],
    setupSteps: [
      {
        title: "Connect with Meta",
        description:
          "Click Connect with Meta, log in to your Business account, and pick a pixel — no copy-paste.",
      },
      {
        title: "Confirm events & CAPI",
        description:
          "Your access token is saved for Conversions API. On the Events tab, choose which actions to send.",
      },
      {
        title: "Connect your product catalog",
        description:
          "On the Catalog tab, copy the feed URL into Commerce Manager and paste your Catalog ID back here.",
      },
      {
        title: "Go live & verify",
        description:
          "Enable tracking, save, then confirm hits in Events Manager (or use test mode under Advanced).",
      },
    ],
    resources: [
      { label: "Events Manager", url: "https://business.facebook.com/events_manager" },
      { label: "Pixel setup guide", url: "https://www.facebook.com/business/help/952192354843755" },
      { label: "Conversions API", url: "https://www.facebook.com/business/help/2041148702652965" },
      { label: "Commerce Manager", url: "https://business.facebook.com/commerce" },
      { label: "Catalog feed specs", url: "https://www.facebook.com/business/help/120325381656392?id=725943027795860" },
      { label: "Custom Audiences", url: "https://www.facebook.com/business/help/744354708981227" },
      { label: "Verify domain", url: "https://www.facebook.com/business/help/321167023127050" },
      { label: "Test events tool", url: "https://business.facebook.com/events_manager2/test_events" },
    ],
    benefits: [
      "Retargeting audiences",
      "Custom audience lists",
      "Domain verification",
      "Dynamic Ads catalog",
      "CAPI when cookies blocked",
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    subtitle: "TikTok Ads",
    description: "Measure short-form ad performance and optimize TikTok conversion campaigns.",
    longDescription:
      "Install TikTok Pixel to track visitors from TikTok ads, measure add-to-cart intent, and report completed purchases back to TikTok Ads Manager.",
    logo: "/marketing/logos/tiktok.svg",
    color: "#000000",
    accent: "bg-neutral-900/10 text-neutral-900 dark:text-white",
    glow: "from-neutral-900/[0.06]",
    ring: "ring-neutral-900/10 dark:ring-white/10",
    pixelLabel: "TikTok Pixel ID",
    pixelPlaceholder: "e.g. CXXXXXXXXXXXXXXX",
    pixelHelp: "Available in TikTok Ads Manager → Assets → Events → Web Events.",
    accountLabel: "TikTok Ads account ID",
    accountPlaceholder: "Optional ads account reference",
    docsUrl: "https://ads.tiktok.com/help/article/get-started-pixel",
    consoleUrl: "https://ads.tiktok.com/",
    events: ["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "CompletePayment"],
    eventDetails: [
      { name: "PageView", trigger: "Storefront pages", description: "Tracks browsing sessions from TikTok traffic." },
      { name: "ViewContent", trigger: "Product page", description: "Tracks product detail views from TikTok visitors." },
      { name: "AddToCart", trigger: "Add to cart", description: "Tracks when items are added to cart." },
      { name: "InitiateCheckout", trigger: "Checkout page", description: "Tracks checkout starts." },
      { name: "CompletePayment", trigger: "Order confirmation", description: "Reports successful purchases with value and order ID." },
    ],
    setupSteps: [
      {
        title: "Create a Web Events pixel",
        description: "In TikTok Ads Manager, create or open your website pixel.",
      },
      {
        title: "Copy the Pixel code ID",
        description: "Use the ID that starts with C in your pixel settings.",
      },
      {
        title: "Enable and verify",
        description: "Save settings and check TikTok Events Manager for live hits.",
      },
    ],
    resources: [
      { label: "TikTok Ads Manager", url: "https://ads.tiktok.com/" },
      { label: "Pixel documentation", url: "https://ads.tiktok.com/help/article/get-started-pixel" },
      { label: "Events API overview", url: "https://ads.tiktok.com/help/article/events-api" },
    ],
    benefits: ["Conversion campaigns", "Creative insights", "Lookalike audiences"],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    subtitle: "Pinterest Ads",
    description: "Track pin traffic, catalog views, and checkout events from Pinterest ads.",
    longDescription:
      "Add Pinterest Tag plus Conversions API to capture pin-driven traffic, measure shopping intent when cookies are blocked, and sync your product catalog for shopping ads and product Pins.",
    logo: "/marketing/logos/pinterest.svg",
    color: "#E60023",
    accent: "bg-[#E60023]/10 text-[#E60023]",
    glow: "from-[#E60023]/[0.08]",
    ring: "ring-[#E60023]/15",
    pixelLabel: "Pinterest Tag ID",
    pixelPlaceholder: "e.g. 2612XXXXXXXXXXXX",
    pixelHelp: "Located in Pinterest Ads → Conversions → Tag setup.",
    accountLabel: "Pinterest ad account ID",
    accountPlaceholder: "e.g. 549755813888",
    docsUrl: "https://help.pinterest.com/en/business/article/install-the-pinterest-tag",
    consoleUrl: "https://ads.pinterest.com/",
    events: ["PageVisit", "ViewContent", "AddToCart", "InitiateCheckout", "Checkout"],
    eventDetails: [
      { name: "page_visit / pagevisit", trigger: "Storefront pages", description: "Visits from pins and ads — Tag + CAPI with shared event_id." },
      { name: "view_content", trigger: "Product page", description: "Product views with Tag ↔ CAPI dedupe." },
      { name: "add_to_cart", trigger: "Add to cart", description: "Browser Tag + cart API Conversions API." },
      { name: "initiate_checkout", trigger: "Checkout page", description: "Checkout start with hashed email/phone matching." },
      { name: "checkout", trigger: "Order confirmation", description: "Purchase with purchase_{orderNumber} event_id dedupe." },
    ],
    setupSteps: [
      {
        title: "Connect with Pinterest (or paste Tag ID)",
        description:
          "Use Connect with Pinterest to pick a Tag, or paste Tag ID + numeric Ad account ID on Connection.",
      },
      {
        title: "Add Conversion access token",
        description:
          "Under Advanced, paste a Conversion access token from Pinterest Ads (required for Conversions API — separate from OAuth).",
      },
      {
        title: "Enable events & verify",
        description: "Turn on Purchase/AddToCart, save, then check Tag Helper and Ettajer Diagnostics.",
      },
      {
        title: "Connect product catalog",
        description:
          "Open the Catalog tab, copy the TSV feed URL, and add it as a data source in Pinterest Catalogs.",
      },
    ],
    resources: [
      { label: "Pinterest Ads", url: "https://ads.pinterest.com/" },
      { label: "Tag install guide", url: "https://help.pinterest.com/en/business/article/install-the-pinterest-tag" },
      {
        label: "Conversions API",
        url: "https://developers.pinterest.com/docs/track-conversions/track-conversions-in-the-api/",
      },
      {
        label: "Retail catalogs",
        url: "https://help.pinterest.com/en/business/article/before-you-get-started-with-catalogs",
      },
      { label: "Conversion insights", url: "https://help.pinterest.com/en/business/article/understanding-conversion-insights" },
    ],
    benefits: [
      "Connect with Pinterest to pick Tag + ad account",
      "Tag + Conversions API with event_id dedupe",
      "Product catalog feed for shopping ads & Pins",
    ],
  },
  {
    id: "google",
    name: "Google",
    subtitle: "Google Analytics 4",
    description: "Understand storefront traffic, product interest, and completed purchases.",
    longDescription:
      "Connect GA4 to analyze acquisition channels, monitor product discovery, and measure ecommerce revenue from your Ettajer storefront.",
    logo: "/marketing/logos/google.svg",
    color: "#4285F4",
    accent: "bg-[#4285F4]/10 text-[#4285F4]",
    glow: "from-[#4285F4]/[0.08]",
    ring: "ring-[#4285F4]/15",
    pixelLabel: "Measurement ID",
    pixelPlaceholder: "e.g. G-XXXXXXXXXX",
    pixelHelp: "Found in GA4 Admin → Data Streams → your web stream.",
    accountLabel: "Google Analytics property ID",
    accountPlaceholder: "e.g. 123456789",
    docsUrl: "https://support.google.com/analytics/answer/9304153",
    consoleUrl: "https://analytics.google.com/",
    events: ["page_view", "view_item", "add_to_cart", "begin_checkout", "purchase"],
    eventDetails: [
      { name: "page_view", trigger: "All storefront pages", description: "Standard GA4 page view on every customer visit." },
      { name: "view_item", trigger: "Product page", description: "Tracks product detail views." },
      { name: "add_to_cart", trigger: "Add to cart", description: "Tracks items added to cart." },
      { name: "begin_checkout", trigger: "Checkout page", description: "Tracks checkout funnel starts." },
      { name: "purchase", trigger: "Order confirmation", description: "Ecommerce purchase event with transaction ID and revenue." },
    ],
    setupSteps: [
      {
        title: "Create a GA4 property",
        description: "Set up Google Analytics 4 for your website if you haven't already.",
      },
      {
        title: "Copy Measurement ID",
        description: "Use the G-XXXXXXXXXX ID from your web data stream.",
      },
      {
        title: "Review realtime report",
        description: "Open GA4 Realtime after saving to confirm incoming events.",
      },
    ],
    resources: [
      { label: "Google Analytics", url: "https://analytics.google.com/" },
      { label: "Set up GA4", url: "https://support.google.com/analytics/answer/9304153" },
      { label: "Ecommerce events", url: "https://support.google.com/analytics/answer/9267735" },
    ],
    benefits: ["Traffic analytics", "Funnel reporting", "Revenue dashboards"],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    subtitle: "Snap Ads",
    description: "Track Snapchat ad traffic and optimize conversion campaigns in MENA markets.",
    longDescription:
      "Install the Snapchat Pixel to measure visits from Snap Ads, retarget shoppers, and report purchases back to Snapchat Ads Manager.",
    logo: "/marketing/logos/snapchat.svg",
    color: "#FFFC00",
    accent: "bg-[#FFFC00]/20 text-neutral-900 dark:text-[#FFFC00]",
    glow: "from-[#FFFC00]/[0.12]",
    ring: "ring-[#FFFC00]/25",
    pixelLabel: "Snap Pixel ID",
    pixelPlaceholder: "e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    pixelHelp: "Found in Snapchat Ads Manager → Events Manager → Snap Pixel.",
    accountLabel: "Snapchat ad account ID",
    accountPlaceholder: "Optional ad account reference",
    docsUrl: "https://businesshelp.snapchat.com/s/article/snap-pixel",
    consoleUrl: "https://ads.snapchat.com/",
    events: ["PAGE_VIEW", "VIEW_CONTENT", "ADD_CART", "START_CHECKOUT", "PURCHASE"],
    eventDetails: [
      { name: "PAGE_VIEW", trigger: "Storefront pages", description: "Tracks page views from Snapchat traffic." },
      { name: "VIEW_CONTENT", trigger: "Product page", description: "Tracks product detail views." },
      { name: "ADD_CART", trigger: "Add to cart", description: "Tracks add-to-cart actions." },
      { name: "START_CHECKOUT", trigger: "Checkout page", description: "Tracks checkout starts." },
      { name: "PURCHASE", trigger: "Order confirmation", description: "Reports completed purchases with value." },
    ],
    setupSteps: [
      { title: "Open Snapchat Ads Manager", description: "Go to Events Manager and create or open your Snap Pixel." },
      { title: "Copy Pixel ID", description: "Copy the UUID-style pixel ID from your pixel settings." },
      { title: "Verify events", description: "Save here and use Snapchat's event testing tool to confirm hits." },
    ],
    resources: [
      { label: "Snapchat Ads Manager", url: "https://ads.snapchat.com/" },
      { label: "Snap Pixel guide", url: "https://businesshelp.snapchat.com/s/article/snap-pixel" },
      { label: "Conversion tracking", url: "https://businesshelp.snapchat.com/s/article/pixel-implementation" },
    ],
    benefits: ["Gen Z reach", "Story ads", "App & web conversions"],
  },
  {
    id: "gtm",
    name: "Google Tag Manager",
    subtitle: "Tag container",
    description: "Manage all marketing tags from one container without editing code.",
    longDescription:
      "Add your GTM container to push ecommerce events to dataLayer. Connect GA4, Google Ads, and other tags inside GTM.",
    logo: "/marketing/logos/gtm.svg",
    color: "#246FDB",
    accent: "bg-[#246FDB]/10 text-[#246FDB]",
    glow: "from-[#246FDB]/[0.08]",
    ring: "ring-[#246FDB]/15",
    pixelLabel: "Container ID",
    pixelPlaceholder: "e.g. GTM-XXXXXXX",
    pixelHelp: "Found in Google Tag Manager → Admin → Container ID.",
    accountLabel: "GTM account ID",
    accountPlaceholder: "Optional account reference",
    docsUrl: "https://support.google.com/tagmanager/answer/6103696",
    consoleUrl: "https://tagmanager.google.com/",
    events: ["page_view", "view_item", "add_to_cart", "begin_checkout", "purchase"],
    eventDetails: [
      { name: "page_view", trigger: "All storefront pages", description: "Pushed to dataLayer on every page load." },
      { name: "view_item", trigger: "Product page", description: "Ecommerce view_item event in dataLayer." },
      { name: "add_to_cart", trigger: "Add to cart", description: "Ecommerce add_to_cart event in dataLayer." },
      { name: "begin_checkout", trigger: "Checkout page", description: "Ecommerce begin_checkout event in dataLayer." },
      { name: "purchase", trigger: "Order confirmation", description: "Ecommerce purchase event with transaction data." },
    ],
    setupSteps: [
      { title: "Create a GTM container", description: "Set up a web container in Google Tag Manager." },
      { title: "Copy Container ID", description: "Use the GTM-XXXXXXX ID from your container settings." },
      { title: "Configure tags in GTM", description: "Create triggers for dataLayer ecommerce events inside GTM." },
    ],
    resources: [
      { label: "Tag Manager", url: "https://tagmanager.google.com/" },
      { label: "GTM setup guide", url: "https://support.google.com/tagmanager/answer/6103696" },
      { label: "Ecommerce dataLayer", url: "https://developers.google.com/tag-manager/ecommerce-ga4" },
    ],
    benefits: ["One container", "No code changes", "Flexible tag routing"],
  },
];

const EMPTY_LINK: MarketingPlatformLink = {
  enabled: false,
  pixelId: null,
  connected: false,
  trackPageViews: true,
  trackViewContent: true,
  trackAddToCart: true,
  trackInitiateCheckout: true,
  trackPurchases: true,
  testMode: false,
  testEventCode: null,
  accountId: null,
  accessToken: null,
  catalogId: null,
  catalogFeedToken: null,
  adAccountId: null,
  purchasersAudienceId: null,
  abandonersAudienceId: null,
  purchasersAudienceSyncedAt: null,
  abandonersAudienceSyncedAt: null,
  audiencesAutoSync: false,
  domainVerificationCode: null,
  domainVerifiedAt: null,
};

export const DEFAULT_MARKETING_INTEGRATIONS: MarketingIntegrations = {
  meta: { ...EMPTY_LINK },
  tiktok: { ...EMPTY_LINK },
  pinterest: { ...EMPTY_LINK },
  google: { ...EMPTY_LINK },
  snapchat: { ...EMPTY_LINK },
  gtm: { ...EMPTY_LINK },
};

function hasAnyEventEnabled(link: MarketingPlatformLink): boolean {
  return (
    link.trackPageViews ||
    link.trackViewContent ||
    link.trackAddToCart ||
    link.trackInitiateCheckout ||
    link.trackPurchases
  );
}

export function countEnabledTrackingEvents(link: MarketingPlatformLink): number {
  return [
    link.trackPageViews,
    link.trackViewContent,
    link.trackAddToCart,
    link.trackInitiateCheckout,
    link.trackPurchases,
  ].filter(Boolean).length;
}

export function maskPixelId(pixelId: string | null | undefined): string | null {
  if (!pixelId) return null;
  const id = pixelId.trim();
  if (id.length <= 6) return id;
  return `${id.slice(0, 3)}••••${id.slice(-3)}`;
}

function parsePlatformLink(data: unknown): MarketingPlatformLink {
  if (typeof data !== "object" || data === null) return { ...EMPTY_LINK };
  const value = data as Record<string, unknown>;
  const pixelId = typeof value.pixelId === "string" ? value.pixelId.trim() || null : null;
  const enabled = Boolean(value.enabled);
  const accountId = typeof value.accountId === "string" ? value.accountId.trim() || null : null;
  const accessToken = typeof value.accessToken === "string" ? value.accessToken.trim() || null : null;
  const testEventCode =
    typeof value.testEventCode === "string" ? value.testEventCode.trim() || null : null;
  const catalogId = typeof value.catalogId === "string" ? value.catalogId.trim() || null : null;
  const catalogFeedToken =
    typeof value.catalogFeedToken === "string" ? value.catalogFeedToken.trim() || null : null;
  const adAccountId =
    typeof value.adAccountId === "string" ? value.adAccountId.trim() || null : null;
  const purchasersAudienceId =
    typeof value.purchasersAudienceId === "string"
      ? value.purchasersAudienceId.trim() || null
      : null;
  const abandonersAudienceId =
    typeof value.abandonersAudienceId === "string"
      ? value.abandonersAudienceId.trim() || null
      : null;
  const purchasersAudienceSyncedAt =
    typeof value.purchasersAudienceSyncedAt === "string"
      ? value.purchasersAudienceSyncedAt.trim() || null
      : null;
  const abandonersAudienceSyncedAt =
    typeof value.abandonersAudienceSyncedAt === "string"
      ? value.abandonersAudienceSyncedAt.trim() || null
      : null;
  const audiencesAutoSync = Boolean(value.audiencesAutoSync);
  const domainVerificationCode =
    typeof value.domainVerificationCode === "string"
      ? normalizeFacebookDomainVerificationCode(value.domainVerificationCode)
      : null;
  const domainVerifiedAt =
    typeof value.domainVerifiedAt === "string"
      ? value.domainVerifiedAt.trim() || null
      : null;
  const link: MarketingPlatformLink = {
    enabled,
    pixelId,
    connected: false,
    trackPageViews: value.trackPageViews !== false,
    trackViewContent: value.trackViewContent !== false,
    trackAddToCart: value.trackAddToCart !== false,
    trackInitiateCheckout: value.trackInitiateCheckout !== false,
    trackPurchases: value.trackPurchases !== false,
    testMode: Boolean(value.testMode),
    testEventCode,
    accountId,
    accessToken,
    catalogId,
    catalogFeedToken,
    adAccountId,
    purchasersAudienceId,
    abandonersAudienceId,
    purchasersAudienceSyncedAt,
    abandonersAudienceSyncedAt,
    audiencesAutoSync,
    domainVerificationCode,
    domainVerifiedAt,
  };
  // connected is computed after platform id is known — set by normalizePlatformLinkForId
  return link;
}

export function isPlatformLive(
  platformId: MarketingPlatformId,
  link: MarketingPlatformLink
): boolean {
  if (!link.enabled || !link.pixelId || !hasAnyEventEnabled(link)) return false;
  return validatePixelId(platformId, link.pixelId) === null;
}

export function normalizePlatformLinkForId(
  platformId: MarketingPlatformId,
  link: MarketingPlatformLink
): MarketingPlatformLink {
  const pixelId = link.pixelId?.trim() || null;
  return {
    ...link,
    pixelId,
    accountId: link.accountId?.trim() || null,
    accessToken: link.accessToken?.trim() || null,
    testEventCode: link.testEventCode?.trim() || null,
    catalogId: link.catalogId?.trim() || null,
    catalogFeedToken: link.catalogFeedToken?.trim() || null,
    adAccountId: link.adAccountId?.trim() || null,
    purchasersAudienceId: link.purchasersAudienceId?.trim() || null,
    abandonersAudienceId: link.abandonersAudienceId?.trim() || null,
    purchasersAudienceSyncedAt: link.purchasersAudienceSyncedAt?.trim() || null,
    abandonersAudienceSyncedAt: link.abandonersAudienceSyncedAt?.trim() || null,
    audiencesAutoSync: Boolean(link.audiencesAutoSync),
    domainVerificationCode:
      normalizeFacebookDomainVerificationCode(link.domainVerificationCode) ??
      null,
    domainVerifiedAt: link.domainVerifiedAt?.trim() || null,
    connected: isPlatformLive(platformId, { ...link, pixelId }),
  };
}

export function normalizeMarketingIntegrations(
  integrations: MarketingIntegrations
): MarketingIntegrations {
  return Object.fromEntries(
    MARKETING_PLATFORMS.map((platform) => [
      platform.id,
      normalizePlatformLinkForId(platform.id, integrations[platform.id]),
    ])
  ) as MarketingIntegrations;
}

export function parseMarketingIntegrations(data: unknown): MarketingIntegrations {
  if (typeof data !== "object" || data === null) {
    return normalizeMarketingIntegrations(DEFAULT_MARKETING_INTEGRATIONS);
  }
  const value = data as Record<string, unknown>;
  return normalizeMarketingIntegrations({
    meta: parsePlatformLink(value.meta),
    tiktok: parsePlatformLink(value.tiktok),
    pinterest: parsePlatformLink(value.pinterest),
    google: parsePlatformLink(value.google),
    snapchat: parsePlatformLink(value.snapchat),
    gtm: parsePlatformLink(value.gtm),
  });
}

export function getMarketingPlatform(platformId: string): MarketingPlatformConfig | null {
  return MARKETING_PLATFORMS.find((platform) => platform.id === platformId) ?? null;
}

export function parseMarketingPlatformId(value: string): MarketingPlatformId | null {
  if (
    value === "meta" ||
    value === "tiktok" ||
    value === "pinterest" ||
    value === "google" ||
    value === "snapchat" ||
    value === "gtm"
  ) {
    return value;
  }
  return null;
}

export function countConnectedIntegrations(integrations: MarketingIntegrations): number {
  return MARKETING_PLATFORMS.filter((platform) => integrations[platform.id].connected).length;
}

export function countEnabledIntegrations(integrations: MarketingIntegrations): number {
  return MARKETING_PLATFORMS.filter((platform) => integrations[platform.id].enabled).length;
}

export function countNeedsSetupIntegrations(integrations: MarketingIntegrations): number {
  return MARKETING_PLATFORMS.filter(
    (platform) => integrations[platform.id].enabled && !integrations[platform.id].connected
  ).length;
}

export type IntegrationBriefTone = "positive" | "neutral" | "attention";

export function getIntegrationBrief(integrations: MarketingIntegrations): {
  message: string;
  tone: IntegrationBriefTone;
} {
  const connected = countConnectedIntegrations(integrations);
  const needsSetup = countNeedsSetupIntegrations(integrations);
  const total = MARKETING_PLATFORMS.length;

  if (needsSetup > 0) {
    return {
      tone: "attention",
      message: `${needsSetup} platform${needsSetup === 1 ? "" : "s"} enabled but missing a pixel ID. Add IDs to start tracking.`,
    };
  }

  if (connected === total) {
    return {
      tone: "positive",
      message: "All marketing platforms are live. Storefront visits and purchases are being tracked.",
    };
  }

  if (connected > 0) {
    return {
      tone: "neutral",
      message: `${connected} of ${total} platforms connected. Enable more channels to expand attribution coverage.`,
    };
  }

  return {
    tone: "neutral",
    message: "Connect ad platforms to start measuring performance on your storefront.",
  };
}

export function getPlatformStatus(link: MarketingPlatformLink): "live" | "setup" | "off" {
  if (!link.enabled) return "off";
  if (link.connected) return "live";
  return "setup";
}

export function validatePixelId(platformId: MarketingPlatformId, pixelId: string): string | null {
  const id = pixelId.trim();
  if (!id) return "Pixel ID is required when tracking is enabled.";

  switch (platformId) {
    case "meta":
      if (!/^\d{10,20}$/.test(id)) {
        return "Enter a valid Meta Pixel ID (10–20 digits).";
      }
      return null;
    case "tiktok":
      if (!/^C[A-Z0-9]{10,}$/i.test(id)) {
        return "TikTok Pixel IDs usually start with C followed by letters and numbers.";
      }
      return null;
    case "pinterest":
      if (!/^\d{10,16}$/.test(id)) {
        return "Enter a valid Pinterest Tag ID (numeric).";
      }
      return null;
    case "google":
      if (!/^G-[A-Z0-9]{6,}$/i.test(id)) {
        return "Use a GA4 Measurement ID like G-XXXXXXXXXX.";
      }
      return null;
    case "snapchat":
      if (!/^[a-f0-9-]{30,40}$/i.test(id)) {
        return "Enter a valid Snap Pixel ID (UUID format).";
      }
      return null;
    case "gtm":
      if (!/^GTM-[A-Z0-9]+$/i.test(id)) {
        return "Use a GTM Container ID like GTM-XXXXXXX.";
      }
      return null;
    default:
      return null;
  }
}

export function validatePlatformLink(
  platformId: MarketingPlatformId,
  link: MarketingPlatformLink
): string | null {
  if (!link.enabled) return null;
  if (!hasAnyEventEnabled(link)) {
    return "Enable at least one tracking event.";
  }
  return validatePixelId(platformId, link.pixelId ?? "");
}

export function validateMarketingIntegrations(integrations: MarketingIntegrations): string | null {
  for (const platform of MARKETING_PLATFORMS) {
    const error = validatePlatformLink(platform.id, integrations[platform.id]);
    if (error) return `${platform.name}: ${error}`;
  }
  return null;
}

export function getSetupProgress(
  link: MarketingPlatformLink,
  platformId?: MarketingPlatformId
): number {
  if (platformId === "meta") {
    let steps = 0;
    if (link.pixelId) steps += 1;
    if (link.accessToken && hasAnyEventEnabled(link)) steps += 1;
    if (link.catalogId) steps += 1;
    if (link.connected) steps += 1;
    return Math.round((steps / 4) * 100);
  }

  let steps = 0;
  if (link.enabled) steps += 1;
  if (link.pixelId) steps += 1;
  if (hasAnyEventEnabled(link)) steps += 1;
  if (link.connected) steps += 1;
  return Math.round((steps / 4) * 100);
}

export function getActiveIntegrations(integrations: MarketingIntegrations): MarketingPlatformId[] {
  return MARKETING_PLATFORMS.filter((platform) => integrations[platform.id].connected).map(
    (platform) => platform.id
  );
}

export interface PublicPlatformPixel {
  pixelId: string;
  trackPageViews: boolean;
  trackViewContent: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchases: boolean;
  testMode: boolean;
  /** True when Meta Conversions API access token is configured (token never exposed) */
  capiEnabled: boolean;
}

export interface PublicMarketingIntegrations {
  meta?: PublicPlatformPixel;
  tiktok?: PublicPlatformPixel;
  pinterest?: PublicPlatformPixel;
  google?: PublicPlatformPixel;
  snapchat?: PublicPlatformPixel;
  gtm?: PublicPlatformPixel;
}

export function toPublicMarketingIntegrations(
  integrations: MarketingIntegrations
): PublicMarketingIntegrations {
  const publicIntegrations: PublicMarketingIntegrations = {};
  const normalized = normalizeMarketingIntegrations(integrations);

  for (const platform of MARKETING_PLATFORMS) {
    const link = normalized[platform.id];
    if (!link.connected || !link.pixelId) continue;
    publicIntegrations[platform.id] = {
      pixelId: link.pixelId,
      trackPageViews: link.trackPageViews,
      trackViewContent: link.trackViewContent,
      trackAddToCart: link.trackAddToCart,
      trackInitiateCheckout: link.trackInitiateCheckout,
      trackPurchases: link.trackPurchases,
      testMode: link.testMode,
      capiEnabled:
        (platform.id === "meta" || platform.id === "pinterest") &&
        Boolean(link.accessToken?.trim()) &&
        (platform.id !== "pinterest" || Boolean(link.accountId?.trim())),
    };
  }

  return publicIntegrations;
}

export function hasTestModeEnabled(integrations: PublicMarketingIntegrations): boolean {
  return MARKETING_PLATFORMS.some((platform) => integrations[platform.id]?.testMode);
}
