import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { COOKIES_SECTIONS_FR } from "@/lib/legal/cookies-sections-fr";
import { COOKIES_SECTIONS_AR } from "@/lib/legal/cookies-sections-ar";

export const COOKIES_LAST_UPDATED = "July 14, 2026";
export const COOKIES_VERSION = "1.0";

export type CookieTableRow = {
  name: string;
  purpose: string;
  duration: string;
  type: string;
};

export type CookiesSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  table?: CookieTableRow[];
};

export const COOKIES_SECTIONS: CookiesSection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      "This Cookie Policy explains how Ettajer (\"Ettajer\", \"we\", \"us\", or \"our\") uses cookies and similar technologies on our website, merchant dashboard, authentication flows, and related platform pages (collectively, the \"Service\").",
      "This policy should be read together with our Privacy Policy and Terms of Service. By continuing to use the Service, you consent to the use of cookies and similar technologies as described here, except where your browser or account settings allow you to block non-essential technologies.",
    ],
  },
  {
    id: "what-are-cookies",
    title: "2. What are cookies?",
    paragraphs: [
      "Cookies are small text files placed on your device when you visit a website. They help websites remember information about your visit, such as login status, preferences, or security tokens.",
      "We also use similar technologies such as local storage, session storage, and server-side session identifiers. In this policy, we refer to all of these collectively as \"cookies\" unless a distinction is necessary.",
    ],
  },
  {
    id: "why-we-use",
    title: "3. Why we use cookies",
    paragraphs: [
      "Ettajer uses cookies to operate a secure, reliable ecommerce platform for merchants. Without certain cookies, core features such as signing in, maintaining a session, or protecting accounts would not work properly.",
    ],
    bullets: [
      "Keep you signed in to your merchant dashboard",
      "Protect accounts against unauthorized access and abuse",
      "Remember language or interface preferences where supported",
      "Measure product usage and diagnose technical issues",
      "Support checkout, cart, and storefront functionality where applicable",
      "Enable optional integrations configured by merchants",
    ],
  },
  {
    id: "types",
    title: "4. Types of cookies we use",
    paragraphs: [
      "We group cookies into the categories below. Essential cookies are required for the Service to function. Other categories may be limited or disabled through browser settings, though some features may stop working correctly.",
    ],
    bullets: [
      "Essential cookies: authentication, session management, security, load balancing, and fraud prevention",
      "Functional cookies: preferences such as language selection or UI state that improves your experience",
      "Analytics cookies: help us understand feature usage, performance, and errors in aggregate",
      "Third-party cookies: set by external services you or a merchant connect, such as analytics or advertising pixels",
    ],
  },
  {
    id: "platform-cookies",
    title: "5. Ettajer platform cookies",
    paragraphs: [
      "The table below describes common cookies and storage keys used on Ettajer-owned pages such as the marketing site, signup flow, login, dashboard, and help center. Exact names may vary as we improve the platform.",
    ],
    table: [
      {
        name: "session / auth token",
        purpose: "Keeps you signed in and verifies authenticated requests to your account",
        duration: "Session or up to 30 days if \"remember me\" is enabled",
        type: "Essential",
      },
      {
        name: "csrf / security token",
        purpose: "Helps protect forms and account actions against cross-site request forgery",
        duration: "Session",
        type: "Essential",
      },
      {
        name: "language preference",
        purpose: "Stores selected language for the interface where localization is enabled",
        duration: "Up to 12 months",
        type: "Functional",
      },
      {
        name: "cookie consent state",
        purpose: "Remembers cookie notice dismissal or preference choices where shown",
        duration: "Up to 12 months",
        type: "Functional",
      },
      {
        name: "analytics session",
        purpose: "Counts visits and feature usage in aggregate to improve the product",
        duration: "Session to 24 months depending on provider",
        type: "Analytics",
      },
    ],
  },
  {
    id: "storefront-cookies",
    title: "6. Merchant storefront cookies",
    paragraphs: [
      "When buyers visit a storefront published by an Ettajer merchant, additional cookies or local storage entries may be used to support shopping functionality.",
    ],
    bullets: [
      "Cart and session identifiers so buyers can add products and complete checkout",
      "Checkout progress and form state for COD order flows",
      "Performance and caching helpers for fast page delivery",
      "Marketing or analytics pixels installed by the merchant, such as Meta, Google, TikTok, or similar tools",
    ],
  },
  {
    id: "third-party",
    title: "7. Third-party cookies & integrations",
    paragraphs: [
      "Merchants may connect third-party services to their storefronts or dashboards. Those services may set their own cookies or collect identifiers according to their own policies.",
      "Ettajer does not control third-party cookies. We encourage merchants to disclose the tools they enable and to review provider documentation. Buyers should consult the merchant storefront and the third party's policy for more information.",
    ],
    bullets: [
      "Advertising and conversion pixels",
      "Analytics platforms",
      "Messaging or verification providers",
      "Payment or billing processors for merchant subscriptions",
    ],
  },
  {
    id: "managing",
    title: "8. How to manage cookies",
    paragraphs: [
      "Most browsers allow you to block, delete, or limit cookies through settings. You can usually find these controls in your browser's privacy or security section.",
      "If you block essential cookies, parts of the Service may not function, including login, account activation, dashboard access, and checkout flows.",
    ],
    bullets: [
      "Chrome: Settings → Privacy and security → Cookies and other site data",
      "Safari: Settings → Privacy → Block all cookies / Manage website data",
      "Firefox: Settings → Privacy & Security → Cookies and Site Data",
      "Edge: Settings → Cookies and site permissions → Manage and delete cookies",
      "Mobile browsers: privacy settings vary by device and app version",
    ],
  },
  {
    id: "do-not-track",
    title: "9. Do Not Track & global privacy controls",
    paragraphs: [
      "Some browsers offer \"Do Not Track\" or similar signals. Because industry standards for responding to these signals are not uniform, Ettajer may not respond to every signal in the same way.",
      "Where required by applicable law, we honor legally recognized opt-out mechanisms for certain analytics or advertising technologies.",
    ],
  },
  {
    id: "retention",
    title: "10. Cookie retention",
    paragraphs: [
      "Session cookies expire when you close your browser. Persistent cookies remain until they reach their expiration date or you delete them manually.",
      "We review cookie usage periodically and aim to keep retention periods no longer than necessary for the purpose described.",
    ],
  },
  {
    id: "changes",
    title: "11. Changes to this policy",
    paragraphs: [
      "We may update this Cookie Policy when we add features, integrations, or legal requirements change. The \"Last updated\" date at the top of this page will reflect the latest version.",
      "Material changes may also be communicated through the website, dashboard notices, or email where appropriate.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact us",
    paragraphs: [
      "If you have questions about our use of cookies or similar technologies, contact:",
      "Ettajer — Privacy & Support",
      "Email: support@ettajer.com",
      "For broader privacy requests, see our Privacy Policy at /privacy.",
    ],
  },
];

export function getCookiesSections(locale: LandingLocale): CookiesSection[] {
  if (locale === "fr") return COOKIES_SECTIONS_FR;
  if (locale === "ar") return COOKIES_SECTIONS_AR;
  return COOKIES_SECTIONS;
}
