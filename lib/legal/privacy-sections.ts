import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { PRIVACY_SECTIONS_FR } from "@/lib/legal/privacy-sections-fr";
import { PRIVACY_SECTIONS_AR } from "@/lib/legal/privacy-sections-ar";

export const PRIVACY_LAST_UPDATED = "July 14, 2026";
export const PRIVACY_VERSION = "1.0";

export type PrivacySection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    paragraphs: [
      "This Privacy Policy explains how Ettajer (\"Ettajer\", \"we\", \"us\", or \"our\") collects, uses, discloses, and protects personal information when you visit our website, create a merchant account, use our dashboard, publish a storefront, or otherwise interact with our services (collectively, the \"Service\").",
      "We are committed to handling personal data responsibly and transparently. This policy applies to merchants, site visitors, and — where relevant — buyers who interact with storefronts powered by Ettajer.",
      "By using the Service, you acknowledge that you have read this Privacy Policy. Where registration requires acceptance, you also confirm that you agree to our data practices as described here and in our Terms of Service.",
    ],
  },
  {
    id: "controller",
    title: "2. Who is responsible for your data",
    paragraphs: [
      "For the purposes of this Privacy Policy, Ettajer is the operator of the platform and the entity responsible for processing personal data related to merchant accounts, billing, platform security, support communications, and our own marketing to registered users.",
      "When you operate a storefront on Ettajer, you may also process personal data about your buyers (such as names, phone numbers, and delivery addresses). In those cases, you are responsible for your own buyer-facing privacy notices and compliance obligations as an independent business.",
      "Questions about this policy or our data practices can be sent to support@ettajer.com.",
    ],
  },
  {
    id: "information-we-collect",
    title: "3. Information we collect",
    paragraphs: [
      "We collect information in three broad ways: information you provide directly, information generated through your use of the Service, and information from third parties or integrations you enable.",
    ],
    bullets: [
      "Account registration data: name, email address, password (stored in hashed form), business details, and preferences such as language or marketing opt-in",
      "Billing data: subscription plan, payment status, invoices, and limited payment metadata from payment processors (we do not store full card numbers on our servers)",
      "Storefront and merchant content: products, images, pages, branding, and configuration settings you upload",
      "Order and operations data: order records, buyer contact details submitted at checkout, verification statuses, and fulfillment notes within your dashboard",
      "Support communications: messages you send through contact forms, email, or help requests",
      "Technical and usage data: IP address, device type, browser, pages viewed, timestamps, logs, cookies, and diagnostic events",
      "Security data: login attempts, activation requests, rate-limit events, and fraud-prevention signals",
    ],
  },
  {
    id: "buyer-data",
    title: "4. Buyer & COD checkout data",
    paragraphs: [
      "When a buyer places an order on a merchant storefront hosted by Ettajer, we process order information on behalf of that merchant so the order can be fulfilled. This commonly includes buyer name, phone number, delivery address, city, neighborhood, order contents, and COD-related details.",
      "Verification features such as WhatsApp or SMS confirmation may process buyer phone numbers and message delivery status to help merchants reduce fake or low-intent orders. Merchants choose whether and how to use these tools.",
      "Ettajer processes buyer checkout data to provide the platform service to merchants. Merchants remain responsible for informing buyers how their data will be used, how long it will be retained, and how buyers can exercise their rights.",
    ],
  },
  {
    id: "how-we-use",
    title: "5. How we use personal information",
    paragraphs: [
      "We use personal information only where we have a legitimate purpose related to operating, securing, and improving the Service.",
    ],
    bullets: [
      "Create and manage merchant accounts, including activation and authentication",
      "Provide storefront hosting, order management, COD workflows, and dashboard features",
      "Process subscriptions, invoices, and account-related communications",
      "Send transactional messages such as verification emails, security alerts, and service notices",
      "Send optional marketing emails when you have opted in, and honor opt-out requests",
      "Provide customer support and respond to inquiries",
      "Monitor performance, debug errors, prevent abuse, and protect against fraud or unauthorized access",
      "Comply with legal obligations, enforce our Terms, and resolve disputes",
      "Analyze aggregated or de-identified usage trends to improve the product",
    ],
  },
  {
    id: "legal-bases",
    title: "6. Legal bases for processing",
    paragraphs: [
      "Depending on your location and the type of data involved, we rely on one or more of the following legal bases:",
    ],
    bullets: [
      "Contract: processing needed to provide the Service you requested, such as account creation, storefront operation, and billing",
      "Consent: where you opt in to marketing emails or enable certain optional features",
      "Legitimate interests: securing the platform, preventing abuse, improving features, and communicating about important service changes, balanced against your rights",
      "Legal obligation: retaining or disclosing information where required by applicable law, regulation, or valid legal process",
    ],
  },
  {
    id: "marketing",
    title: "7. Marketing communications",
    paragraphs: [
      "During signup, you may optionally choose to receive marketing emails about product updates, merchant tips, promotions, and new features. Marketing emails are not required to use the Service.",
      "You can withdraw marketing consent at any time by using the unsubscribe link in a marketing email or by contacting support@ettajer.com. Transactional and security-related messages may still be sent while your account remains active.",
      "We do not sell your email address to unrelated third-party marketers.",
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies & similar technologies",
    paragraphs: [
      "We use cookies, local storage, and similar technologies to keep you signed in, remember preferences, measure product usage, and protect accounts.",
    ],
    bullets: [
      "Essential cookies: required for authentication, session management, and security",
      "Preference cookies: remember settings such as language or interface choices",
      "Analytics cookies: help us understand how the Service is used so we can improve it",
      "Merchant-configured tracking: storefronts may include third-party analytics or advertising pixels configured by merchants, which are governed by those providers' policies",
    ],
  },
  {
    id: "sharing",
    title: "9. When we share information",
    paragraphs: [
      "We do not sell personal information. We share data only in the circumstances below:",
    ],
    bullets: [
      "Service providers: hosting, email delivery, payment processing, analytics, customer support tools, and security vendors that process data under our instructions",
      "Integrations you enable: advertising, analytics, messaging, or logistics tools connected by merchants",
      "Legal and safety: when required by law, court order, or governmental request, or to protect rights, safety, and integrity of the platform",
      "Business transfers: in connection with a merger, acquisition, financing, or sale of assets, subject to appropriate confidentiality safeguards",
      "With your direction: when you ask us to share information or make it public through your storefront",
    ],
  },
  {
    id: "retention",
    title: "10. Data retention",
    paragraphs: [
      "We retain personal information only for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce agreements.",
    ],
    bullets: [
      "Active merchant account data is retained while the account remains open and as needed to deliver the Service",
      "Order and buyer data in your dashboard is retained according to your account status and operational needs",
      "Billing and tax records may be retained for the period required by applicable law",
      "Security logs and abuse-prevention records may be retained for a limited period to protect the platform",
      "When an account is closed, we delete or anonymize data within a reasonable period unless retention is required by law or legitimate business needs such as fraud prevention",
    ],
  },
  {
    id: "security",
    title: "11. Security measures",
    paragraphs: [
      "We implement administrative, technical, and organizational safeguards designed to protect personal information, including access controls, encrypted transport (HTTPS), hashed passwords, rate limiting, and monitoring for suspicious activity.",
      "No method of transmission or storage is completely secure. While we work to protect your information, we cannot guarantee absolute security. You are responsible for safeguarding your account credentials and using a strong, unique password.",
      "If we become aware of a data incident that poses a significant risk, we will take appropriate steps, which may include investigation, mitigation, and notification where required by law.",
    ],
  },
  {
    id: "your-rights",
    title: "12. Your privacy rights",
    paragraphs: [
      "Depending on your location, you may have rights regarding your personal information. These may include:",
    ],
    bullets: [
      "Access: request a copy of personal information we hold about you",
      "Correction: request correction of inaccurate or incomplete information",
      "Deletion: request deletion of certain information, subject to legal and contractual limits",
      "Restriction or objection: object to or request limitation of certain processing activities",
      "Portability: request a machine-readable copy of information you provided where applicable",
      "Withdraw consent: where processing is based on consent, such as marketing emails",
    ],
  },
  {
    id: "merchant-obligations",
    title: "13. Merchant responsibilities",
    paragraphs: [
      "If you are a merchant, you act as an independent business responsible for buyer data collected through your storefront. You should:",
    ],
    bullets: [
      "Publish a clear privacy notice on your storefront where required by law",
      "Collect only buyer information necessary for orders, delivery, and customer support",
      "Respond to buyer privacy requests related to data you control",
      "Use verification and messaging tools lawfully and respectfully",
      "Keep product and promotional claims accurate and non-deceptive",
    ],
  },
  {
    id: "children",
    title: "14. Children's privacy",
    paragraphs: [
      "The Service is intended for merchants and business users who are at least 18 years old. We do not knowingly collect personal information from children under 18.",
      "If you believe a child has provided personal information to us, contact support@ettajer.com and we will take appropriate steps to review and delete the information where required.",
    ],
  },
  {
    id: "international",
    title: "15. International users & transfers",
    paragraphs: [
      "Ettajer is operated with Moroccan merchants as a primary audience, but the Service may be accessed from other countries. Your information may be processed in Morocco and in other locations where our service providers operate.",
      "Where required, we take steps designed to ensure appropriate safeguards for cross-border transfers. By using the Service, you understand that your information may be processed outside your home country.",
    ],
  },
  {
    id: "third-party-links",
    title: "16. Third-party websites",
    paragraphs: [
      "Our website or merchant storefronts may contain links to third-party websites, courier portals, messaging apps, or payment pages. We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before providing personal information.",
    ],
  },
  {
    id: "changes",
    title: "17. Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. When we make material changes, we will post the updated policy on this page, revise the \"Last updated\" date, and where appropriate notify account holders by email or in-dashboard notice.",
      "Your continued use of the Service after an update becomes effective means you acknowledge the revised policy.",
    ],
  },
  {
    id: "contact",
    title: "18. Contact us",
    paragraphs: [
      "For privacy questions, requests, or complaints, contact:",
      "Ettajer — Privacy & Support",
      "Email: support@ettajer.com",
      "Website: https://ettajer.com",
      "You may also reach us through the Contact page at /contact, the Help Center at /help, or our Cookie Policy at /cookies.",
    ],
  },
];

export function getPrivacySections(locale: LandingLocale): PrivacySection[] {
  if (locale === "fr") return PRIVACY_SECTIONS_FR;
  if (locale === "ar") return PRIVACY_SECTIONS_AR;
  return PRIVACY_SECTIONS;
}
