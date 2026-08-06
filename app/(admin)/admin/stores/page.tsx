import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformStores } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminStoresTable,
  type AdminStoreRow,
} from "@/components/admin/admin-stores-table";
import { AdminPageHeader, adminPage } from "@/components/admin/admin-ui";

export const metadata = { title: "Stores — Platform Admin" };

export default async function AdminStoresPage() {
  await requireAdminPage();
  const stores = await getPlatformStores();

  const rows: AdminStoreRow[] = stores.map((store) => ({
    id: store.id,
    name: store.name,
    slug: store.slug,
    logo: store.logo,
    category: store.category,
    primaryColor: store.primaryColor,
    currency: store.currency,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
    lastOrderAt: store.lastOrderAt,
    user: store.user,
    products: store._count.products,
    customers: store._count.customers,
    realOrders: store.orderStats.realOrders,
    testOrders: store.orderStats.testOrders,
    totalOrders: store.orderStats.totalOrders,
    realGmv: store.orderStats.realGmv,
    testGmv: store.orderStats.testGmv,
  }));

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Stores"
          description="Browse every storefront with orders, products, and owner data — filter and sort before opening a store."
        />
        <AdminStoresTable stores={rows} />
      </div>
    </AdminLayout>
  );
}
