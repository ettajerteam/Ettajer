import { serializePageContent } from "@/lib/page-content";

export type PageTemplateId =
  | "about"
  | "faq"
  | "shipping"
  | "privacy"
  | "terms"
  | "contact";

export type PageTemplateCategory = "trust" | "support" | "legal";

export type PageTemplate = {
  id: PageTemplateId;
  title: string;
  slug: string;
  description: string;
  category: PageTemplateCategory;
  /** TipTap-friendly HTML starter body */
  body: string;
  metaDescription: string;
};

export const PAGE_TEMPLATE_CATEGORIES: {
  id: PageTemplateCategory;
  label: string;
  hint: string;
}[] = [
  { id: "trust", label: "Trust", hint: "Who you are" },
  { id: "support", label: "Support", hint: "Help buyers" },
  { id: "legal", label: "Legal", hint: "Policies" },
];

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "about",
    title: "About us",
    slug: "about",
    category: "trust",
    description: "Your story, values, and why shoppers should trust you.",
    metaDescription:
      "Learn who we are, what we sell, and why customers choose us for cash-on-delivery shopping.",
    body: [
      "<h2>Our story</h2>",
      "<p>Tell shoppers how your store started and what you care about. Keep it personal and short.</p>",
      "<h2>What we stand for</h2>",
      "<ul><li>Quality products you can rely on</li><li>Clear prices and honest delivery times</li><li>Friendly support before and after you order</li></ul>",
      "<h2>Why shop with us</h2>",
      "<p>Add a sentence about your shipping area, payment options (including COD), and return policy.</p>",
    ].join(""),
  },
  {
    id: "faq",
    title: "FAQ",
    slug: "faq",
    category: "support",
    description: "Answers that cut support messages before checkout.",
    metaDescription:
      "Common questions about ordering, cash on delivery, shipping, and returns.",
    body: [
      "<h2>How do I place an order?</h2>",
      "<p>Add products to your cart, enter your phone and address, then confirm. We’ll call if we need anything.</p>",
      "<h2>Do you offer cash on delivery?</h2>",
      "<p>Yes — you can pay when the order arrives (where COD is available).</p>",
      "<h2>How long does delivery take?</h2>",
      "<p>Most orders arrive in 1–3 business days. Timing depends on your city.</p>",
      "<h2>Can I change or cancel an order?</h2>",
      "<p>Contact us as soon as possible with your order number. We’ll help if it hasn’t shipped yet.</p>",
    ].join(""),
  },
  {
    id: "shipping",
    title: "Shipping & returns",
    slug: "shipping",
    category: "support",
    description: "Delivery windows, fees, and how returns work.",
    metaDescription:
      "Shipping times, delivery fees, and how to return or exchange an order.",
    body: [
      "<h2>Shipping</h2>",
      "<p>We deliver across Morocco. Typical delivery is 1–3 business days after confirmation.</p>",
      "<h2>Delivery fees</h2>",
      "<p>Fees depend on your city. The exact amount is shown at checkout before you confirm.</p>",
      "<h2>Returns & exchanges</h2>",
      "<p>If something isn’t right, contact us within 7 days with your order number and photos if needed. Unused items in original packaging are easiest to return.</p>",
      "<h2>Damaged or wrong items</h2>",
      "<p>Tell us right away — we’ll arrange a replacement or refund.</p>",
    ].join(""),
  },
  {
    id: "contact",
    title: "Contact",
    slug: "contact",
    category: "support",
    description: "Phone, WhatsApp, and where shoppers can reach you.",
    metaDescription:
      "Get in touch for order help, shipping questions, or product advice.",
    body: [
      "<h2>We’re here to help</h2>",
      "<p>Have a question about a product or an order? Reach out and we’ll reply as soon as we can.</p>",
      "<h2>Phone / WhatsApp</h2>",
      "<p>Add your support number here.</p>",
      "<h2>Email</h2>",
      "<p>Add your support email here.</p>",
      "<h2>Hours</h2>",
      "<p>Example: Mon–Sat, 9:00–18:00</p>",
    ].join(""),
  },
  {
    id: "privacy",
    title: "Privacy policy",
    slug: "privacy",
    category: "legal",
    description: "How you collect and use customer data.",
    metaDescription:
      "How we collect, use, and protect your personal information when you shop with us.",
    body: [
      "<h2>Information we collect</h2>",
      "<p>When you order, we collect your name, phone, address, and order details so we can deliver and support you.</p>",
      "<h2>How we use it</h2>",
      "<ul><li>Process and deliver orders</li><li>Contact you about your order</li><li>Improve our store and prevent fraud</li></ul>",
      "<h2>Sharing</h2>",
      "<p>We only share what’s needed with delivery partners or payment providers. We don’t sell your data.</p>",
      "<h2>Contact</h2>",
      "<p>Questions about privacy? Reach us through the contact details on this store.</p>",
    ].join(""),
  },
  {
    id: "terms",
    title: "Terms of service",
    slug: "terms",
    category: "legal",
    description: "Basic rules for using your store and ordering.",
    metaDescription:
      "Terms that apply when you browse, order, and receive products from our store.",
    body: [
      "<h2>Orders</h2>",
      "<p>Placing an order means you agree to provide accurate contact and delivery details.</p>",
      "<h2>Pricing</h2>",
      "<p>Prices are shown in the store currency and may change. The checkout total is the amount due.</p>",
      "<h2>COD & payment</h2>",
      "<p>If you choose cash on delivery, payment is due when the order is handed over.</p>",
      "<h2>Availability</h2>",
      "<p>We may cancel or adjust an order if a product is out of stock — we’ll contact you first.</p>",
    ].join(""),
  },
];

export function getPageTemplate(id: string | null | undefined) {
  if (!id) return null;
  return PAGE_TEMPLATES.find((t) => t.id === id) ?? null;
}

/** Footer / trust pages most stores should publish. */
export const ESSENTIAL_PAGE_SLUGS = [
  "about",
  "faq",
  "shipping",
  "privacy",
  "terms",
  "contact",
] as const;

export function getMissingEssentialTemplates(existingSlugs: string[]) {
  const set = new Set(existingSlugs.map((s) => s.toLowerCase()));
  return PAGE_TEMPLATES.filter((t) => !set.has(t.slug));
}

export function packTemplateContent(template: PageTemplate) {
  return serializePageContent({
    body: template.body,
    metaDescription: template.metaDescription,
  });
}
