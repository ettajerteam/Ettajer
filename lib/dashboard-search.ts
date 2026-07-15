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
    id: "page-campaigns",
    type: "page",
    title: "Marketing campaigns",
    subtitle: "Abandoned cart recovery",
    href: "/dashboard/marketing/campaigns",
  },
  {
    id: "page-attribution",
    type: "page",
    title: "Traffic attribution",
    subtitle: "UTM tracking and sources",
    href: "/dashboard/marketing/attribution",
  },
  {
    id: "page-settings",
    type: "page",
    title: "Settings",
    subtitle: "Store configuration",
    href: "/dashboard/settings",
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
