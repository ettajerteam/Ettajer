"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import {
  EmailHealthCheckButton,
  EMAIL_SETTINGS_TIPS,
} from "@/components/settings/email-health-popup-button";
import {
  ShippingHealthCheckButton,
  SHIPPING_SETTINGS_TIPS,
} from "@/components/settings/shipping-health-popup-button";
import {
  PaymentHealthCheckButton,
  PAYMENT_SETTINGS_TIPS,
  PaymentTipsFooter,
} from "@/components/settings/payment-health-popup-button";
import type { DashboardTipItem } from "@/components/shared/dashboard-tips-button";
import type { SettingsTab } from "@/components/settings/settings-nav";
import type { ReactNode } from "react";

const GENERAL_TIPS: DashboardTipItem[] = [
  {
    title: "Start with your brand",
    body: "Name and logo appear on your storefront, checkout, and invoices.",
  },
  {
    title: "Add a WhatsApp line",
    body: "Shoppers in Morocco often prefer chat — show it in the footer when ready.",
  },
  {
    title: "Keep contact accurate",
    body: "Email and phone are used for order follow-up and storefront contact.",
  },
];

const WEBSITE_TIPS: DashboardTipItem[] = [
  {
    title: "Pick a clean store URL",
    body: "Your ettajer.store slug is the shareable link until a custom domain is connected.",
  },
  {
    title: "Custom domains",
    body: "Point your domain from Domains in Online Store, then verify DNS.",
  },
];

const CURRENCY_TIPS: DashboardTipItem[] = [
  {
    title: "Currency matches your market",
    body: "Prices display in this currency across catalog, cart, and checkout.",
  },
  {
    title: "Language is storefront UI",
    body: "English, French, or Arabic for labels shoppers see on your site.",
  },
];

const CHECKOUT_TIPS: DashboardTipItem[] = [
  {
    title: "Minimum order",
    body: "Block tiny COD orders that aren’t worth delivering.",
  },
  {
    title: "COD message",
    body: "Explain cash-on-delivery clearly so shoppers know what to expect.",
  },
  {
    title: "Announcement bar",
    body: "Short promos (free shipping, sale) sit above the storefront header.",
  },
];

const SEO_TIPS: DashboardTipItem[] = [
  {
    title: "Title and description",
    body: "These appear in Google and when someone shares your store link.",
  },
  {
    title: "Don’t noindex live shops",
    body: "Only hide from search while you’re still building.",
  },
];

type TabHeaderConfig = {
  tips?: DashboardTipItem[];
  tipsTitle?: string;
  tipsDescription?: string;
  tipsFooter?: ReactNode;
  health?: "email" | "shipping" | "payment";
};

const TAB_HEADER: Partial<Record<SettingsTab, TabHeaderConfig>> = {
  general: {
    tips: GENERAL_TIPS,
    tipsTitle: "General tips",
    tipsDescription: "Brand and contact details for your store.",
  },
  website: {
    tips: WEBSITE_TIPS,
    tipsTitle: "Domain tips",
    tipsDescription: "Your public store URL and custom domain.",
  },
  currency: {
    tips: CURRENCY_TIPS,
    tipsTitle: "Language tips",
    tipsDescription: "How prices and storefront copy are shown.",
  },
  email: {
    tips: [...EMAIL_SETTINGS_TIPS],
    tipsTitle: "Email tips",
    tipsDescription: "Get sending ready for campaigns and automations.",
    health: "email",
  },
  shipping: {
    tips: [...SHIPPING_SETTINGS_TIPS],
    tipsTitle: "Shipping tips",
    tipsDescription:
      "Cover more countries and offer free delivery where it makes sense.",
    health: "shipping",
  },
  payment: {
    tips: [...PAYMENT_SETTINGS_TIPS],
    tipsTitle: "Payment tips",
    tipsDescription:
      "Connect Stripe or PayPal so money goes to you — keep COD for cash deliveries.",
    tipsFooter: <PaymentTipsFooter />,
    health: "payment",
  },
  checkout: {
    tips: CHECKOUT_TIPS,
    tipsTitle: "Checkout tips",
    tipsDescription: "Order rules and messages customers see when buying.",
  },
  seo: {
    tips: SEO_TIPS,
    tipsTitle: "SEO tips",
    tipsDescription: "Search and social sharing for your store.",
  },
  print: {
    tips: [
      {
        title: "E-ticket size",
        body: "Pick a label size that matches your thermal printer paper before packing orders.",
      },
      {
        title: "Invoice details",
        body: "Add ICE or company info under Invoice so PDFs look official for customers.",
      },
    ],
    tipsTitle: "Print tips",
    tipsDescription: "E-tickets and invoices for your orders.",
  },
  taxes: {
    tips: [
      {
        title: "Enable when needed",
        body: "Tax is off by default. Turn it on and set a rate (e.g. 20% TVA) when you need it on receipts.",
      },
      {
        title: "Inclusive vs exclusive",
        body: "If catalog prices already include tax, enable “prices include tax” so totals stay the same.",
      },
      {
        title: "What is taxed",
        body: "Tax applies to merchandise after discounts — not shipping or COD fees in this version.",
      },
    ],
    tipsTitle: "Tax tips",
    tipsDescription: "Store-wide rate for checkout and invoices.",
  },
  notifications: {
    tips: [
      {
        title: "Dashboard bell",
        body: "Choose which alerts appear when you click the header notification icon.",
      },
      {
        title: "Merchant email",
        body: "Get an email when a new order arrives — uses your store contact address.",
      },
      {
        title: "Abandoned carts",
        body: "Unrecovered checkouts from the last 14 days appear in the bell when enabled.",
      },
      {
        title: "Customer emails",
        body: "Order status mail for shoppers is configured under Email settings.",
      },
    ],
    tipsTitle: "Notifications",
    tipsDescription: "Bell alerts and merchant order emails.",
  },
  plan: {
    tips: [
      {
        title: "Overview",
        body: "See your active plan, price, and live usage for products, domains, and stores.",
      },
      {
        title: "Plans",
        body: "Compare Starter, Growth, and Business — request an upgrade from Contact.",
      },
      {
        title: "Billing",
        body: "Payment method and invoices will live here when self-serve billing ships.",
      },
    ],
    tipsTitle: "Plan",
    tipsDescription: "Subscription, usage, upgrades, and invoices.",
  },
  legal: {
    tips: [
      {
        title: "Publish policies",
        body: "Create and publish Privacy, Terms, and Shipping pages so footer links work.",
      },
      {
        title: "Checkout terms",
        body: "Require buyers to accept Terms before placing an order.",
      },
      {
        title: "Invoices",
        body: "Company details for PDF invoices live under Print → Invoice.",
      },
    ],
    tipsTitle: "Legal",
    tipsDescription: "Store policies, checkout terms, and invoices.",
  },
};

function SettingsHeaderInner() {
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as SettingsTab | null) ?? "general";
  const config = TAB_HEADER[tab];

  const besideHelp =
    config?.health === "email" ? (
      <EmailHealthCheckButton />
    ) : config?.health === "shipping" ? (
      <ShippingHealthCheckButton />
    ) : config?.health === "payment" ? (
      <PaymentHealthCheckButton />
    ) : null;

  return (
    <DashboardHeader
      title="Settings"
      description="Store details, selling, and online store"
      tips={config?.tips}
      tipsTitle={config?.tipsTitle}
      tipsDescription={config?.tipsDescription}
      tipsFooter={config?.tipsFooter}
      besideHelp={besideHelp}
    />
  );
}

/** Settings page header — tips (+ health where available) next to Help. */
export function SettingsDashboardHeader() {
  return (
    <Suspense
      fallback={
        <DashboardHeader
          title="Settings"
          description="Store details, selling, and online store"
        />
      }
    >
      <SettingsHeaderInner />
    </Suspense>
  );
}
