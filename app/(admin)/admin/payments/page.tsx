import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformPayments } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminSectionTitle,
  AdminStatCard,
  AdminTableShell,
  adminHoverLink,
  adminPage,
  adminTd,
  adminTh,
  adminThead,
  adminTr,
} from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Payments — Platform Admin" };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatMoney(amount: number, currency = "MAD") {
  return `${amount.toLocaleString()} ${currency}`;
}

export default async function AdminPaymentsPage() {
  await requireAdminPage();
  const data = await getPlatformPayments();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <AdminPageHeader
          title="Payments & orders"
          description="Real customer orders vs sandbox / test checkouts, broken down by store."
        />

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Real orders"
            value={data.totalRevenue._count}
            hint="Live / COD customer orders"
          />
          <AdminStatCard
            label="Test orders"
            value={data.testRevenue._count}
            hint="Sandbox · Stripe test · @example.com"
            accent="amber"
          />
          <AdminStatCard
            label="Real GMV"
            value={`${(data.totalRevenue._sum.total ?? 0).toLocaleString()} MAD`}
            accent="emerald"
          />
          <AdminStatCard
            label="Avg real order"
            value={`${Math.round(data.totalRevenue._avg.total ?? 0).toLocaleString()} MAD`}
            hint={
              data.testRevenue._count > 0
                ? `Test GMV ${(data.testRevenue._sum.total ?? 0).toLocaleString()} MAD`
                : undefined
            }
          />
        </div>

        <div>
          <AdminSectionTitle title="Orders by store" />
          <AdminTableShell>
            <table className="w-full min-w-[960px] text-left text-[12px]">
              <thead className={adminThead}>
                <tr>
                  <th className={adminTh}>Store</th>
                  <th className={adminTh}>Owner</th>
                  <th className={adminTh}>Real</th>
                  <th className={adminTh}>Test</th>
                  <th className={adminTh}>Total</th>
                  <th className={adminTh}>Real GMV</th>
                  <th className={adminTh}>Test GMV</th>
                </tr>
              </thead>
              <tbody>
                {data.ordersByStore.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-neutral-400">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  data.ordersByStore.map((store) => (
                    <tr key={store.id} className={cn(adminTr, "group")}>
                      <td className={adminTd}>
                        <Link
                          href={`/admin/stores/${store.id}`}
                          className="block"
                        >
                          <p
                            className={cn(
                              "font-medium text-neutral-900 dark:text-white",
                              adminHoverLink
                            )}
                          >
                            {store.name}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            /{store.slug}
                          </p>
                        </Link>
                      </td>
                      <td className={adminTd}>
                        <p>{store.ownerName ?? "—"}</p>
                        <p className="text-[11px] text-neutral-400">
                          {store.ownerEmail}
                        </p>
                      </td>
                      <td className={cn(adminTd, "tabular-nums text-emerald-700")}>
                        {store.realOrders}
                      </td>
                      <td className={cn(adminTd, "tabular-nums text-amber-700")}>
                        {store.testOrders}
                      </td>
                      <td className={cn(adminTd, "tabular-nums font-medium")}>
                        {store.totalOrders}
                      </td>
                      <td className={cn(adminTd, "tabular-nums")}>
                        {formatMoney(store.realGmv, store.currency)}
                      </td>
                      <td className={cn(adminTd, "tabular-nums text-neutral-400")}>
                        {formatMoney(store.testGmv, store.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </AdminTableShell>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <AdminSectionTitle title="Real orders by status" />
            <AdminTableShell>
              <table className="w-full min-w-[360px] text-left text-[12px]">
                <thead className={adminThead}>
                  <tr>
                    <th className={adminTh}>Status</th>
                    <th className={adminTh}>Orders</th>
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

          {data.testOrdersByStatus.length > 0 ? (
            <div>
              <AdminSectionTitle title="Test orders by status" />
              <AdminTableShell>
                <table className="w-full min-w-[360px] text-left text-[12px]">
                  <thead className={adminThead}>
                    <tr>
                      <th className={adminTh}>Status</th>
                      <th className={adminTh}>Orders</th>
                      <th className={adminTh}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.testOrdersByStatus.map((row) => (
                      <tr key={row.status} className={adminTr}>
                        <td className={cn(adminTd, "capitalize")}>{row.status}</td>
                        <td className={cn(adminTd, "tabular-nums")}>{row._count}</td>
                        <td className={cn(adminTd, "tabular-nums")}>
                          {(row._sum.total ?? 0).toLocaleString()} MAD
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AdminTableShell>
            </div>
          ) : null}
        </div>

        <div>
          <AdminSectionTitle title="Recent orders" />
          <AdminTableShell>
            <table className="w-full min-w-[920px] text-left text-[12px]">
              <thead className={adminThead}>
                <tr>
                  <th className={adminTh}>Order</th>
                  <th className={adminTh}>Type</th>
                  <th className={adminTh}>Store</th>
                  <th className={adminTh}>Customer</th>
                  <th className={adminTh}>Total</th>
                  <th className={adminTh}>When</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className={cn(adminTr, "group")}>
                    <td className={adminTd}>
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <p
                          className={cn(
                            "font-medium text-neutral-900 dark:text-white",
                            adminHoverLink
                          )}
                        >
                          {order.orderNumber}
                        </p>
                        <p className="text-[11px] capitalize text-neutral-400">
                          {order.status}
                          {order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
                        </p>
                      </Link>
                    </td>
                    <td className={adminTd}>
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <span
                          className={
                            order.isTest
                              ? "inline-flex rounded bg-amber-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                              : "inline-flex rounded bg-emerald-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          }
                        >
                          {order.isTest ? "Test" : "Real"}
                        </span>
                      </Link>
                    </td>
                    <td className={adminTd}>
                      <Link
                        href={`/admin/stores/${order.store.id}`}
                        className="block"
                      >
                        <p
                          className={cn(
                            "text-neutral-900 dark:text-white",
                            adminHoverLink
                          )}
                        >
                          {order.store.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          /{order.store.slug}
                        </p>
                      </Link>
                    </td>
                    <td className={adminTd}>
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <p>{order.customerName}</p>
                        <p className="text-[11px] text-neutral-400">
                          {order.customerEmail}
                        </p>
                      </Link>
                    </td>
                    <td className={adminTd}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block tabular-nums"
                      >
                        {order.total.toLocaleString()} {order.store.currency}
                      </Link>
                    </td>
                    <td className={cn(adminTd, "text-[11px] text-neutral-400")}>
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        {formatDate(order.createdAt)}
                      </Link>
                    </td>
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
