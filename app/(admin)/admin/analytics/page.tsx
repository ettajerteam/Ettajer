import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformAnalytics } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";

export const metadata = { title: "Analytics — Platform Admin" };

export default async function AdminAnalyticsPage() {
  await requireAdminPage();
  const data = await getPlatformAnalytics();

  const revenue30 = data.ordersLast30.reduce((sum, o) => sum + o.total, 0);

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Site analytics"
          description="Platform-wide counts and order breakdown."
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Stores" value={data.storeCount} />
          <AdminStatCard label="Products" value={data.productCount} />
          <AdminStatCard label="Customers" value={data.customerCount} />
          <AdminStatCard
            label="Revenue (30d)"
            value={`${revenue30.toLocaleString()} MAD`}
            accent="emerald"
          />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold">Orders by status</h2>
          <AdminTableShell>
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Count</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.ordersByStatus.map((row) => (
                  <tr key={row.status} className="border-b last:border-0">
                    <td className="px-4 py-3 capitalize">{row.status}</td>
                    <td className="px-4 py-3">{row._count}</td>
                    <td className="px-4 py-3">{(row._sum.total ?? 0).toLocaleString()} MAD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableShell>
        </div>
      </div>
    </AdminLayout>
  );
}
