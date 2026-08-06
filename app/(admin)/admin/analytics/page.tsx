import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformAnalytics } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminSectionTitle,
  AdminStatCard,
  AdminTableShell,
  adminPage,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";
import { homeStatCell, homeKicker, homeSubtitle } from "@/components/dashboard/home/home-ui";

export const metadata = { title: "Analytics — Platform Admin" };

export default async function AdminAnalyticsPage() {
  await requireAdminPage();
  const data = await getPlatformAnalytics();

  const revenue30 = data.ordersLast30.reduce((sum, o) => sum + o.total, 0);
  const orders30 = data.ordersLast30.length;
  const avg30 = orders30 > 0 ? Math.round(revenue30 / orders30) : 0;

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Site analytics"
          description="Real orders only in revenue — test and sandbox checkouts are counted separately."
        />

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Stores" value={data.storeCount} />
          <AdminStatCard label="Products" value={data.productCount} />
          <AdminStatCard
            label="Real orders"
            value={data.realOrderCount}
            hint={`${data.testOrderCount} test orders`}
          />
          <AdminStatCard
            label="Revenue (30d, real)"
            value={`${revenue30.toLocaleString()} MAD`}
            accent="emerald"
            hint={`${data.customerCount} customers`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className={homeStatCell}>
            <p className={homeKicker}>Orders (30d)</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              {orders30.toLocaleString()}
            </p>
            <p className={cn("mt-0.5", homeSubtitle)}>Real only</p>
          </div>
          <div className={homeStatCell}>
            <p className={homeKicker}>Avg order (30d)</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              {avg30.toLocaleString()} MAD
            </p>
            <p className={cn("mt-0.5", homeSubtitle)}>Real checkouts</p>
          </div>
          <div className={homeStatCell}>
            <p className={homeKicker}>Customers</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              {data.customerCount.toLocaleString()}
            </p>
            <p className={cn("mt-0.5", homeSubtitle)}>Across all stores</p>
          </div>
          <div className={homeStatCell}>
            <p className={homeKicker}>Test share</p>
            <p className="mt-1 text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-white">
              {data.realOrderCount + data.testOrderCount > 0
                ? `${Math.round(
                    (data.testOrderCount /
                      (data.realOrderCount + data.testOrderCount)) *
                      100
                  )}%`
                : "0%"}
            </p>
            <p className={cn("mt-0.5", homeSubtitle)}>Of all orders</p>
          </div>
        </div>

        <div>
          <AdminSectionTitle title="Real orders by status" />
          <AdminTableShell>
            <table className="w-full min-w-[480px] text-left text-[12px]">
              <thead className={adminThead}>
                <tr>
                  <th className={adminTh}>Status</th>
                  <th className={adminTh}>Count</th>
                  <th className={adminTh}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.ordersByStatus.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-neutral-400">
                      No real orders yet
                    </td>
                  </tr>
                ) : (
                  data.ordersByStatus.map((row) => (
                    <tr key={row.status} className={adminTr}>
                      <td className={cn(adminTd, "capitalize")}>{row.status}</td>
                      <td className={cn(adminTd, "tabular-nums")}>{row._count}</td>
                      <td className={cn(adminTd, "tabular-nums")}>
                        {(row._sum.total ?? 0).toLocaleString()} MAD
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AdminTableShell>
        </div>
      </div>
    </AdminLayout>
  );
}
