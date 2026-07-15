import type { LandingLocale } from "@/lib/landing/landing-i18n";
import { TERMS_SECTIONS_FR } from "@/lib/legal/terms-sections-fr";
import { TERMS_SECTIONS_AR } from "@/lib/legal/terms-sections-ar";

export const TERMS_LAST_UPDATED = "July 14, 2026";
export const TERMS_VERSION = "1.0";

export type TermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "introduction",
    title: "1. Introduction & acceptance",
    paragraphs: [
      "These Terms of Service (\"Terms\") govern your access to and use of the Ettajer platform, including our website, merchant dashboard, storefront builder, APIs, mobile experiences, and related services (collectively, the \"Service\"), operated by Ettajer (\"Ettajer\", \"we\", \"us\", or \"our\").",
      "By creating an account, accessing the Service, or clicking to accept these Terms during registration, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the Service.",
      "If you register on behalf of a company or other legal entity, you represent that you have authority to bind that entity to these Terms. In that case, \"you\" and \"your\" refer to that entity.",
    ],
  },
  {
    id: "definitions",
    title: "2. Definitions",
    paragraphs: ["For clarity throughout these Terms:"],
    bullets: [
      "\"Account\" means the registered merchant profile used to access the Service.",
      "\"Buyer\" or \"Customer\" means an end user who places an order through your storefront.",
      "\"COD\" means cash on delivery — a payment method where the buyer pays upon receiving goods.",
      "\"Content\" means text, images, product data, branding, code snippets, and other materials you upload or publish through the Service.",
      "\"Order\" means a transaction initiated by a Buyer through your storefront.",
      "\"Storefront\" means the public-facing ecommerce site you create and publish using Ettajer.",
      "\"Subscription\" means your paid or promotional access plan to the Service.",
    ],
  },
  {
    id: "eligibility",
    title: "3. Eligibility & account registration",
    paragraphs: [
      "You must be at least 18 years old and legally capable of entering into binding contracts to use the Service. If you are registering as a business, you must have the legal capacity to operate that business in your jurisdiction.",
      "You agree to provide accurate, current, and complete registration information, including your legal name, valid email address, and any business details we reasonably request. You are responsible for keeping your account information up to date.",
      "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your Account. Notify us immediately at support@ettajer.com if you suspect unauthorized access.",
      "We may refuse registration, suspend, or terminate Accounts that provide false information, violate these Terms, or pose a security, legal, or fraud risk.",
    ],
  },
  {
    id: "services",
    title: "4. Description of the Service",
    paragraphs: [
      "Ettajer provides software tools that enable merchants — particularly those operating in Morocco and similar markets — to launch and manage online stores with features such as visual storefront building, product and order management, COD-oriented checkout flows, buyer verification tools, integrations, and hosting of published storefront pages.",
      "We may add, modify, or discontinue features at any time. We will use reasonable efforts to notify merchants of material changes that significantly affect core workflows, but we are not obligated to maintain any specific feature indefinitely.",
      "The Service is provided as a business platform. Ettajer is not the seller of record for products listed on your Storefront unless explicitly stated otherwise in a separate written agreement.",
    ],
    bullets: [
      "Storefront builder and theme customization",
      "Product, collection, and inventory management",
      "Order dashboard and status workflows",
      "COD checkout and localized buyer fields",
      "WhatsApp and SMS verification tools (where enabled)",
      "Marketing integrations and analytics connections",
      "Edge-hosted delivery of published storefront content",
    ],
  },
  {
    id: "merchant-responsibilities",
    title: "5. Merchant responsibilities",
    paragraphs: [
      "You are solely responsible for your Storefront, products, pricing, promotions, fulfillment, customer service, refunds, returns, and compliance with all laws applicable to your business.",
      "You represent and warrant that you have all rights necessary to sell your products, use your branding, and publish your Content through the Service.",
      "You must not use the Service for unlawful, deceptive, abusive, or harmful purposes. You are responsible for the accuracy of product descriptions, availability, delivery timelines, and any claims made to Buyers.",
    ],
    bullets: [
      "Comply with consumer protection, advertising, tax, and ecommerce regulations in Morocco and any market where you sell",
      "Honor orders placed through your Storefront according to your stated policies",
      "Respond to Buyer inquiries and disputes in a timely and professional manner",
      "Maintain appropriate records of transactions, communications, and fulfillment",
      "Ensure product quality, safety, and lawful import/export where applicable",
    ],
  },
  {
    id: "cod-terms",
    title: "6. Cash on delivery (COD) terms",
    paragraphs: [
      "Ettajer provides tools designed to support COD workflows common among Moroccan merchants, including localized checkout fields, order verification, and operational automation. Ettajer does not guarantee that any Buyer will complete payment upon delivery, accept a package, or that a courier will successfully collect funds.",
      "Verification features such as WhatsApp or SMS confirmation are aids to reduce fake or low-intent orders. They do not eliminate fraud risk entirely. You remain responsible for assessing order risk, packaging, shipping, and collection outcomes.",
      "You are responsible for relationships with couriers, logistics providers, and any third parties involved in fulfillment or cash collection. Ettajer is not a courier, payment processor for card transactions, or escrow agent unless explicitly stated in a separate agreement.",
    ],
    bullets: [
      "Configure checkout fields accurately for your delivery zones",
      "Review high-risk orders before fulfillment when appropriate",
      "Maintain clear COD policies visible to Buyers",
      "Handle refused deliveries, partial payments, and returns according to your policies",
      "Do not use verification tools to harass Buyers or collect data beyond lawful purposes",
    ],
  },
  {
    id: "billing",
    title: "7. Subscriptions, billing & pricing",
    paragraphs: [
      "Access to certain features requires a Subscription. Plan names, pricing, currency options, promotional offers, and included features are described on our pricing pages and may change from time to time.",
      "Where a promotional offer such as a reduced or zero-cost first month is displayed, it applies only under the conditions stated at checkout and for eligible new Accounts unless otherwise specified. After any promotional period, standard plan pricing applies unless you cancel or change plans.",
      "You authorize us to charge applicable Subscription fees using the payment method you provide. If payment fails, we may suspend or limit access until the balance is resolved.",
      "Fees are generally non-refundable except where required by applicable law or explicitly stated in writing by Ettajer. Downgrades or cancellations take effect according to the billing cycle rules shown in your account settings.",
    ],
    bullets: [
      "Prices may be shown in MAD, USD, or other supported currencies",
      "Annual and monthly billing options may differ in total cost",
      "Taxes, duties, or government charges may apply where required by law",
      "Founder, early-access, or beta pricing may include special conditions communicated separately",
    ],
  },
  {
    id: "acceptable-use",
    title: "8. Acceptable use policy",
    paragraphs: [
      "You agree not to misuse the Service or assist others in doing so. We may investigate and take action — including suspension or termination — if we believe your use violates this section or creates risk for Ettajer, other merchants, or Buyers.",
    ],
    bullets: [
      "No illegal products or services, including counterfeit goods, prohibited substances, stolen items, or content that violates intellectual property rights",
      "No malware, phishing, spam, scraping attacks, or attempts to breach platform security",
      "No harassment, hate speech, exploitation, or content that is sexually abusive toward minors",
      "No false or misleading pricing, bait-and-switch practices, or impersonation of other brands or persons",
      "No circumvention of rate limits, account restrictions, or verification systems",
      "No resale or sublicensing of the Service except as expressly permitted",
      "No automated abuse of signup, login, activation, or support channels",
    ],
  },
  {
    id: "intellectual-property",
    title: "9. Intellectual property",
    paragraphs: [
      "Ettajer and its licensors own all rights, title, and interest in the Service, including software, designs, templates, documentation, trademarks, logos, and underlying technology. These Terms do not grant you ownership of the Service or our brand assets.",
      "Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for your internal business purposes during an active Subscription.",
      "You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works of the Service except as permitted by law or with our prior written consent.",
      "If you provide feedback or suggestions about the Service, you grant Ettajer a perpetual, worldwide, royalty-free license to use that feedback without obligation to you.",
    ],
  },
  {
    id: "your-content",
    title: "10. Your content & storefront data",
    paragraphs: [
      "You retain ownership of Content you upload, provided you have the necessary rights to that Content. You grant Ettajer a worldwide, non-exclusive license to host, reproduce, display, and transmit your Content solely as needed to operate the Service, publish your Storefront, create backups, and provide support.",
      "You are responsible for ensuring your Content does not infringe third-party rights or violate law. We may remove or restrict Content that we reasonably believe violates these Terms or applicable law.",
      "You are responsible for maintaining your own backups of critical business data where appropriate. While we implement reliability measures, no system is fault-free.",
    ],
    bullets: [
      "Product images, descriptions, and pricing you publish",
      "Customer communications you initiate through connected tools",
      "Store branding, custom pages, and configuration settings",
      "Order and buyer data generated through your Storefront",
    ],
  },
  {
    id: "privacy",
    title: "11. Privacy & data protection",
    paragraphs: [
      "Our collection and use of personal data is described in our Privacy Policy. By using the Service, you acknowledge that we process account, usage, and technical data as described there.",
      "As a merchant, you may process Buyer personal data through your Storefront. You are responsible for providing appropriate notices to Buyers, obtaining lawful bases for processing where required, and handling data subject requests in accordance with applicable law.",
      "You must not upload sensitive personal data to the Service unless the feature is explicitly designed for that purpose and you have implemented appropriate safeguards.",
    ],
  },
  {
    id: "third-parties",
    title: "12. Third-party services",
    paragraphs: [
      "The Service may integrate with third-party tools such as analytics providers, advertising pixels, messaging platforms, courier systems, or payment services. Your use of third-party services is governed by their own terms and policies.",
      "Ettajer does not control and is not responsible for third-party services, outages, pricing changes, policy enforcement, or data handling by those providers. Enabling an integration constitutes your instruction for us to exchange data as needed to operate that integration.",
    ],
  },
  {
    id: "availability",
    title: "13. Service availability & modifications",
    paragraphs: [
      "We strive to keep the Service reliable and secure, but uninterrupted or error-free operation is not guaranteed. Maintenance, updates, network issues, third-party failures, or force majeure events may cause temporary downtime.",
      "We may update the Service to improve performance, security, or functionality. Material changes that negatively affect paid features will be handled in accordance with applicable law and your Subscription terms.",
      "Beta, experimental, or early-access features may be offered \"as is\" with limited support and may be changed or withdrawn at any time.",
    ],
  },
  {
    id: "termination",
    title: "14. Suspension & termination",
    paragraphs: [
      "You may cancel your Account or Subscription according to in-product settings or by contacting support@ettajer.com. Cancellation stops future billing as described in your plan terms but may not entitle you to refunds for amounts already paid.",
      "We may suspend or terminate your access immediately if you materially breach these Terms, fail to pay fees, create legal exposure, abuse the platform, or if required by law or court order.",
      "Upon termination, your right to use the Service ends. We may retain or delete data according to our Privacy Policy, legal obligations, and reasonable backup schedules. Public Storefront access may be disabled when your Account is closed or unpaid.",
    ],
  },
  {
    id: "disclaimers",
    title: "15. Disclaimers",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.",
      "Ettajer does not warrant that the Service will meet your business requirements, increase sales, eliminate fraudulent orders, or guarantee delivery or payment collection outcomes for COD transactions.",
      "Any statements on our website about typical results, merchant examples, or performance metrics are illustrative only and not guarantees.",
    ],
  },
  {
    id: "liability",
    title: "16. Limitation of liability",
    paragraphs: [
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ETTAJER AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, GOODWILL, DATA, OR BUSINESS OPPORTUNITIES, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE.",
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ETTAJER'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THE SERVICE OR THESE TERMS WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO ETTAJER FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS (USD $100) OR THE EQUIVALENT IN MAD.",
      "Some jurisdictions do not allow certain limitations of liability. In those jurisdictions, our liability is limited to the greatest extent permitted by law.",
    ],
  },
  {
    id: "indemnification",
    title: "17. Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless Ettajer and its affiliates, officers, directors, employees, and agents from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to:",
    ],
    bullets: [
      "Your Storefront, products, Content, or business practices",
      "Your violation of these Terms or applicable law",
      "Buyer disputes, refunds, injuries, or losses connected to your products or fulfillment",
      "Your misuse of verification, messaging, or marketing tools",
      "Infringement or alleged infringement of third-party rights by your Content",
    ],
  },
  {
    id: "governing-law",
    title: "18. Governing law & disputes",
    paragraphs: [
      "These Terms are governed by the laws of the Kingdom of Morocco, without regard to conflict-of-law principles, except where mandatory consumer protection rules in your jurisdiction provide otherwise.",
      "Before initiating formal proceedings, you agree to contact support@ettajer.com and attempt to resolve the dispute informally within thirty (30) days.",
      "If informal resolution fails, disputes shall be submitted to the competent courts of Morocco, unless applicable law requires a different forum. Nothing in this section limits either party's right to seek injunctive relief for intellectual property misuse or security threats.",
    ],
  },
  {
    id: "changes",
    title: "19. Changes to these Terms",
    paragraphs: [
      "We may update these Terms from time to time. When we make material changes, we will provide notice by posting the updated Terms on this page, updating the \"Last updated\" date, and where appropriate, notifying you by email or in-dashboard message.",
      "Your continued use of the Service after the effective date of revised Terms constitutes acceptance of the changes. If you do not agree, you must stop using the Service and cancel your Account.",
    ],
  },
  {
    id: "contact",
    title: "20. Contact information",
    paragraphs: [
      "Questions about these Terms should be sent to:",
      "Ettajer — Legal & Support",
      "Email: support@ettajer.com",
      "Website: https://ettajer.com",
      "For account, billing, or technical matters, you may also use our Help Center at /help or the Contact page at /contact.",
    ],
  },
];

export function getTermsSections(locale: LandingLocale): TermsSection[] {
  if (locale === "fr") return TERMS_SECTIONS_FR;
  if (locale === "ar") return TERMS_SECTIONS_AR;
  return TERMS_SECTIONS;
}
