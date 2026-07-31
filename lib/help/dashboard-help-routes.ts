/** Maps dashboard paths to help article slugs for in-app help links. */
const DASHBOARD_HELP_ROUTES: Record<string, string> = {
  "/dashboard": "how-long-does-setup-take",
  "/dashboard/products": "create-your-first-product",
  "/dashboard/products/inventory": "manage-product-inventory",
  "/dashboard/categories": "collections-vs-categories",
  "/dashboard/collections": "collections-vs-categories",
  "/dashboard/orders": "manage-orders-and-fulfillment",
  "/dashboard/orders/abandoned": "recover-abandoned-carts",
  "/dashboard/orders/drafts": "create-draft-orders",
  "/dashboard/orders/returns": "handle-returns-and-refunds",
  "/dashboard/customers": "manage-customers",
  "/dashboard/themes": "use-the-visual-builder",
  "/dashboard/themes/editor": "add-and-arrange-sections",
  "/dashboard/pages": "add-and-arrange-sections",
  "/dashboard/pages/new": "add-and-arrange-sections",
  "/dashboard/navigation": "add-and-arrange-sections",
  "/dashboard/blog": "add-and-arrange-sections",
  "/dashboard/blog/new": "add-and-arrange-sections",
  "/dashboard/marketing": "meta-ads-launch-checklist",
  "/dashboard/marketing/integrations": "connect-marketing-pixels",
  "/dashboard/marketing/discounts": "create-discounts-and-campaigns",
  "/dashboard/marketing/newsletter": "newsletter-subscribers",
  "/dashboard/marketing/email": "newsletter-subscribers",
  "/dashboard/marketing/email/campaigns": "email-campaigns-guide",
  "/dashboard/marketing/email/templates": "email-campaigns-guide",
  "/dashboard/marketing/email/automations": "email-automations-and-flows",
  "/dashboard/marketing/email/journeys": "email-automations-and-flows",
  "/dashboard/marketing/email/insights": "email-automations-and-flows",
  "/dashboard/marketing/email/subscribers": "email-list-health",
  "/dashboard/marketing/email/segments": "email-list-health",
  "/dashboard/marketing/email/queue": "email-list-health",
  "/dashboard/marketing/email/deliverability": "email-list-health",
  "/dashboard/marketing/email/analytics": "newsletter-subscribers",
  "/dashboard/settings/email": "email-list-health",
  "/dashboard/analytics/live": "track-live-store-visitors",
  "/dashboard/analytics/reports": "read-traffic-and-conversion-reports",
  "/dashboard/settings": "configure-checkout-settings",
  "/dashboard/domains": "connect-a-custom-domain",
  "/dashboard/gift-cards": "gift-cards-for-customers",
};

/** Settings tab → help article (query `?tab=`). */
const SETTINGS_TAB_HELP: Record<string, string> = {
  general: "change-store-name-currency-language",
  website: "connect-a-custom-domain",
  currency: "change-store-name-currency-language",
  email: "email-list-health",
  shipping: "cod-address-fields-morocco",
  payment: "how-cod-checkout-works",
  checkout: "configure-checkout-settings",
  seo: "built-in-seo",
  contact: "customer-messages",
  billing: "upgrade-or-change-your-plan",
};

const EMAIL_PATH_HELP: { prefix: string; slug: string }[] = [
  {
    prefix: "/dashboard/marketing/email/campaigns",
    slug: "email-campaigns-guide",
  },
  {
    prefix: "/dashboard/marketing/email/templates",
    slug: "email-campaigns-guide",
  },
  {
    prefix: "/dashboard/marketing/email/automations",
    slug: "email-automations-and-flows",
  },
  {
    prefix: "/dashboard/marketing/email/journeys",
    slug: "email-automations-and-flows",
  },
  {
    prefix: "/dashboard/marketing/email/insights",
    slug: "email-automations-and-flows",
  },
  {
    prefix: "/dashboard/marketing/email/subscribers",
    slug: "email-list-health",
  },
  {
    prefix: "/dashboard/marketing/email/segments",
    slug: "email-list-health",
  },
  {
    prefix: "/dashboard/marketing/email/queue",
    slug: "email-list-health",
  },
  {
    prefix: "/dashboard/marketing/email/deliverability",
    slug: "email-list-health",
  },
  {
    prefix: "/dashboard/marketing/email/analytics",
    slug: "newsletter-subscribers",
  },
  { prefix: "/dashboard/marketing/email", slug: "newsletter-subscribers" },
];

export function getHelpArticleForPath(
  pathname: string,
  search = ""
): string | undefined {
  if (pathname === "/dashboard/settings/email") {
    return "email-list-health";
  }

  if (
    pathname === "/dashboard/settings" ||
    pathname.startsWith("/dashboard/settings?")
  ) {
    const tab = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search
    ).get("tab");
    if (tab && SETTINGS_TAB_HELP[tab]) {
      return SETTINGS_TAB_HELP[tab];
    }
    return DASHBOARD_HELP_ROUTES["/dashboard/settings"];
  }

  if (DASHBOARD_HELP_ROUTES[pathname]) {
    return DASHBOARD_HELP_ROUTES[pathname];
  }

  for (const entry of EMAIL_PATH_HELP) {
    if (
      pathname === entry.prefix ||
      pathname.startsWith(`${entry.prefix}/`)
    ) {
      return entry.slug;
    }
  }

  if (pathname.startsWith("/dashboard/marketing/")) {
    const platform = pathname.split("/").pop();
    const platformSlugs: Record<string, string> = {
      meta: "connect-meta-pixel",
      tiktok: "connect-tiktok-pixel",
      google: "connect-google-tag-manager",
      pinterest: "connect-pinterest-tag",
      snapchat: "connect-snapchat-pixel",
      gtm: "connect-google-tag-manager",
    };
    if (platform && platformSlugs[platform]) {
      return platformSlugs[platform];
    }
    return "connect-marketing-pixels";
  }

  if (pathname.startsWith("/dashboard/orders/")) {
    return "manage-orders-and-fulfillment";
  }

  if (
    pathname.startsWith("/dashboard/pages/") ||
    pathname.startsWith("/dashboard/blog/")
  ) {
    return "add-and-arrange-sections";
  }

  return undefined;
}
