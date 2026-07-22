import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformPayments } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";

export const metadata = { title: "Payments — Platform Admin" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function AdminPaymentsPage() {
  await requireAdminPage();
  const data = await getPlatformPayments();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Payments & orders"
          description="COD and checkout orders across all merchant stores."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <AdminStatCard
            label="Total orders"
            value={data.totalRevenue._count}
          />
          <AdminStatCard
            label="Total GMV"
            value={`${(data.totalRevenue._sum.total ?? 0).toLocaleString()} MAD`}
            accent="emerald"
          />
          <AdminStatCard
            label="Avg order value"
            value={`${Math.round(data.totalRevenue._avg.total ?? 0).toLocaleString()} MAD`}
          />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold">By status</h2>
          <AdminTableShell>
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Orders</th>
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

        <div>
          <h2 className="mb-2 text-sm font-semibold">Recent orders</h2>
          <AdminTableShell>
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Store</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs capitalize text-neutral-500">{order.status}</p>
                    </td>
                    <td className="px-4 py-3">{order.store.name}</td>
                    <td className="px-4 py-3">
                      <p>{order.customerName}</p>
                      <p className="text-xs text-neutral-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      {order.total.toLocaleString()} {order.store.currency}
                    </td>
                    <td className="px-4 py-3 text-xs">{formatDate(order.createdAt)}</td>
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
