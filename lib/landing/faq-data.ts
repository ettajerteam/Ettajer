export type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

export const faqList: FaqItem[] = [
  {
    category: "Setup",
    question: "How fast can I launch with COD?",
    answer:
      "Most merchants go live in under five minutes. Sign up, add products, enable COD checkout, and publish your storefront. WhatsApp and SMS verification can be turned on immediately — no payment gateway or developer required.",
  },
  {
    category: "COD",
    question: "How does Ettajer reduce fake COD orders?",
    answer:
      "After checkout, buyers confirm or cancel via WhatsApp or SMS before you ship. Invalid numbers and unverified orders stay out of your fulfillment queue. Merchants typically see a sharp drop in refused deliveries and courier fees wasted on fake orders.",
  },
  {
    category: "Domains",
    question: "Can I connect my own domain?",
    answer:
      "Yes — on every plan. Add your domain in Settings, update DNS, and Ettajer provisions SSL automatically. Your store stays on the same edge network, so checkout speed and COD conversion are not affected.",
  },
  {
    category: "Migration",
    question: "Can I migrate from Shopify or WooCommerce?",
    answer:
      "Yes. Import products via CSV or connect Shopify directly. We preserve titles, images, variants, and URLs where possible so you do not lose search rankings. Rebuild your storefront in the visual builder — most migrations are done in a single day.",
  },
  {
    category: "Pricing",
    question: "Do you charge transaction fees?",
    answer:
      "Growth and Business plans include 0% Ettajer transaction fees — you keep more of every COD and card sale. Starter includes a small platform fee. Card processing fees from Stripe still apply only if you accept online payments.",
  },
  {
    category: "Growth",
    question: "What makes Ettajer better for Morocco than Shopify?",
    answer:
      "Ettajer is built around COD: localized checkout fields, WhatsApp verification, fake order protection, address validation, and order automation out of the box. No plugins, no workarounds — just a storefront and admin designed for how Moroccan merchants actually sell.",
  },
];
