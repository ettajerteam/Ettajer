import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformStores } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";

export const metadata = { title: "Stores — Platform Admin" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function AdminStoresPage() {
  await requireAdminPage();
  const stores = await getPlatformStores();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Stores"
          description="Every merchant storefront on the platform."
        />

        <AdminTableShell>
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Store</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{store.name}</p>
                    <p className="text-xs text-neutral-500">/{store.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{store.user.name ?? "—"}</p>
                    <p className="text-xs text-neutral-500">{store.user.email}</p>
                  </td>
                  <td className="px-4 py-3">{store._count.products}</td>
                  <td className="px-4 py-3">{store._count.orders}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(store.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/store/${store.slug}`}
                      className="text-xs font-medium text-violet-600 hover:underline"
                      target="_blank"
                    >
                      View storefront
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </div>
    </AdminLayout>
  );
}
