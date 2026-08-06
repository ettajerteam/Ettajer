import type { DashboardSearchResult } from "@/types/dashboard-search";

export const DASHBOARD_QUICK_LINKS: DashboardSearchResult[] = [
  {
    id: "quick-orders",
    type: "page",
    title: "Orders",
    subtitle: "Manage and fulfill orders",
    href: "/dashboard/orders",
  },
  {
    id: "quick-products",
    type: "page",
    title: "Products",
    subtitle: "Catalog and inventory",
    href: "/dashboard/products",
  },
  {
    id: "quick-analytics",
    type: "page",
    title: "Analytics",
    subtitle: "Reports and performance",
    href: "/dashboard/analytics/reports",
  },
  {
    id: "quick-marketing",
    type: "page",
    title: "Marketing",
    subtitle: "Ad integrations and discounts",
    href: "/dashboard/marketing",
  },
  {
    id: "quick-draft",
    type: "page",
    title: "New draft order",
    subtitle: "Create an order manually",
    href: "/dashboard/orders/drafts/new",
  },
];

const PAGE_LINKS: DashboardSearchResult[] = [
  {
    id: "page-orders",
    type: "page",
    title: "Orders",
    subtitle: "Manage all orders",
    href: "/dashboard/orders",
  },
  {
    id: "page-products",
    type: "page",
    title: "Products",
    subtitle: "Catalog and inventory",
    href: "/dashboard/products",
  },
  {
    id: "page-customers",
    type: "page",
    title: "Customers",
    subtitle: "Customer directory",
    href: "/dashboard/customers",
  },
  {
    id: "page-messages",
    type: "page",
    title: "Messages",
    subtitle: "Chat with verified Ettajer team",
    href: "/dashboard/messages",
  },
  {
    id: "page-analytics",
    type: "page",
    title: "Analytics",
    subtitle: "Reports and live view",
    href: "/dashboard/analytics/reports",
  },
  {
    id: "page-collections",
    type: "page",
    title: "Collections",
    subtitle: "Curated product groups",
    href: "/dashboard/collections",
  },
  {
    id: "page-categories",
    type: "page",
    title: "Categories",
    subtitle: "Product categories",
    href: "/dashboard/categories",
  },
  {
    id: "page-marketing",
    type: "page",
    title: "Marketing integrations",
    subtitle: "Meta, TikTok, Pinterest, Google",
    href: "/dashboard/marketing",
  },
  {
    id: "page-discounts",
    type: "page",
    title: "Discount codes",
    subtitle: "Coupons and promotions",
    href: "/dashboard/marketing/discounts",
  },
  {
    id: "page-email-marketing",
    type: "page",
    title: "Email",
    subtitle: "Home, campaigns, automations, subscribers",
    href: "/dashboard/marketing/email",
  },
  {
    id: "page-email-segments",
    type: "page",
    title: "Segments",
    subtitle: "Groups of subscribers for targeted sends",
    href: "/dashboard/marketing/email/segments",
  },
  {
    id: "page-email-campaigns",
    type: "page",
    title: "Campaigns",
    subtitle: "Draft, schedule, send, and archive",
    href: "/dashboard/marketing/email/campaigns",
  },
  {
    id: "page-email-analytics",
    type: "page",
    title: "Analytics",
    subtitle: "Sends, opens, clicks, and campaign rates",
    href: "/dashboard/marketing/email/analytics",
  },
  {
    id: "page-email-queue",
    type: "page",
    title: "Sending status",
    subtitle: "Pending, sending, and failed emails",
    href: "/dashboard/marketing/email/queue",
  },
  {
    id: "page-settings",
    type: "page",
    title: "Settings",
    subtitle: "Store configuration",
    href: "/dashboard/settings",
  },
  {
    id: "page-settings-payment",
    type: "page",
    title: "Payments",
    subtitle: "COD and card checkout",
    href: "/dashboard/settings?tab=payment",
  },
  {
    id: "page-settings-checkout",
    type: "page",
    title: "Checkout settings",
    subtitle: "Minimum order, COD message, announce bar",
    href: "/dashboard/settings?tab=checkout",
  },
  {
    id: "page-settings-seo",
    type: "page",
    title: "SEO settings",
    subtitle: "Search title and meta description",
    href: "/dashboard/settings?tab=seo",
  },
  {
    id: "page-settings-contact",
    type: "page",
    title: "Store contact",
    subtitle: "WhatsApp, email, and footer contact",
    href: "/dashboard/settings?tab=general",
  },
  {
    id: "page-settings-taxes",
    type: "page",
    title: "Taxes",
    subtitle: "VAT rate, inclusive prices, invoices",
    href: "/dashboard/settings?tab=taxes",
  },
  {
    id: "page-settings-legal",
    type: "page",
    title: "Legal",
    subtitle: "Policies, terms, and checkout consent",
    href: "/dashboard/settings?tab=legal",
  },
    {
    id: "page-notifications",
    type: "page",
    title: "Notifications",
    subtitle: "Orders, carts, messages, and stock",
    href: "/dashboard/notifications",
  },
{
    id: "page-settings-notifications",
    type: "page",
    title: "Notification settings",
    subtitle: "Bell alerts and merchant emails",
    href: "/dashboard/settings?tab=notifications",
  },
  {
    id: "page-settings-plan",
    type: "page",
    title: "Plan",
    subtitle: "Usage, upgrades, and billing",
    href: "/dashboard/settings?tab=plan",
  },
  {
    id: "page-settings-shipping",
    type: "page",
    title: "Shipping settings",
    subtitle: "Zones, rates, free shipping",
    href: "/dashboard/settings?tab=shipping",
  },
  {
    id: "page-settings-website",
    type: "page",
    title: "Domains",
    subtitle: "Store slug and custom domain",
    href: "/dashboard/settings?tab=website",
  },
  {
    id: "page-settings-print",
    type: "page",
    title: "Print",
    subtitle: "Ticket printers and stations",
    href: "/dashboard/settings?tab=print",
  },
  {
    id: "page-settings-languages",
    type: "page",
    title: "Languages",
    subtitle: "Currency and storefront language",
    href: "/dashboard/settings?tab=currency",
  },
];

export function filterPageLinks(query: string): DashboardSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return PAGE_LINKS.filter(
    (page) =>
      page.title.toLowerCase().includes(normalized) ||
      page.subtitle.toLowerCase().includes(normalized)
  );
}

export async function searchDashboard(query: string): Promise<DashboardSearchResult[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return DASHBOARD_QUICK_LINKS;

  const [ordersRes, productsRes] = await Promise.all([
    fetch(`/api/orders?search=${encodeURIComponent(normalized)}`),
    fetch(`/api/products?search=${encodeURIComponent(normalized)}`),
  ]);

  const orderResults: DashboardSearchResult[] = [];
  const productResults: DashboardSearchResult[] = [];

  if (ordersRes.ok) {
    const data = await ordersRes.json();
    const orders = (data.orders ?? []).slice(0, 4);
    for (const order of orders) {
      orderResults.push({
        id: `order-${order.id}`,
        type: "order",
        title: `Order #${order.orderNumber}`,
        subtitle: `${order.customerName} · ${order.status}`,
        href: `/dashboard/orders/${order.id}`,
      });
    }
  }

  if (productsRes.ok) {
    const data = await productsRes.json();
    const products = (data.products ?? []).slice(0, 3);
    for (const product of products) {
      productResults.push({
        id: `product-${product.id}`,
        type: "product",
        title: product.title,
        subtitle: `${product.inventory ?? 0} in stock`,
        href: "/dashboard/products",
      });
    }
  }

  const pageResults = filterPageLinks(normalized);

  return [...orderResults, ...productResults, ...pageResults].slice(0, 8);
}
