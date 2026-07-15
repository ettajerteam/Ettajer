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
  "/dashboard/navigation": "add-and-arrange-sections",
  "/dashboard/blog": "add-and-arrange-sections",
  "/dashboard/marketing": "connect-marketing-pixels",
  "/dashboard/marketing/integrations": "connect-meta-pixel",
  "/dashboard/marketing/campaigns": "create-discounts-and-campaigns",
  "/dashboard/marketing/discounts": "create-discounts-and-campaigns",
  "/dashboard/marketing/attribution": "understand-your-analytics-dashboard",
  "/dashboard/analytics/live": "understand-your-analytics-dashboard",
  "/dashboard/analytics/reports": "understand-your-analytics-dashboard",
  "/dashboard/settings": "configure-checkout-settings",
  "/dashboard/gift-cards": "create-discounts-and-campaigns",
};

export function getHelpArticleForPath(pathname: string): string | undefined {
  if (DASHBOARD_HELP_ROUTES[pathname]) {
    return DASHBOARD_HELP_ROUTES[pathname];
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

  return undefined;
}
