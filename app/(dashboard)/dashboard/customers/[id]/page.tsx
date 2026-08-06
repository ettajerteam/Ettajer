import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getCustomerByEmail, decodeCustomerId } from "@/lib/customers";
import { getCustomerIntelligence } from "@/lib/email-marketing/atlas/intelligence";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  dashboardCard,
  dashboardKicker,
  dashboardMetric,
  dashboardStack,
  dashboardSubtitle,
  dashboardTitle,
} from "@/lib/dashboard-ui";

export const metadata = { title: "Customer" };

interface PageProps {
  params: { id: string };
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const email = decodeCustomerId(params.id);
  const customer = email ? await getCustomerByEmail(store.id, email) : null;
  if (!customer) notFound();

  const intelligence = await getCustomerIntelligence(store.id, customer.email);

  const stats = [
    {
      label: "Total spent",
      value: formatCurrency(customer.totalSpent, store.currency),
    },
    {
      label: "Orders",
      value: customer.orderCount.toLocaleString(),
    },
    {
      label: "Avg. order",
      value: formatCurrency(customer.averageOrderValue, store.currency),
    },
    ...(intelligence
      ? [
          {
            label: "Lifetime value",
            value: formatCurrency(intelligence.lifetimeValue, store.currency),
          },
          {
            label: "Churn risk",
            value: `${Math.round(intelligence.churnRisk)}%`,
          },
          {
            label: "Buy propensity",
            value: `${Math.round(intelligence.purchasePropensity)}%`,
          },
        ]
      : []),
  ];

  const addressLine = customer.address
    ? [
        customer.address.street,
        customer.address.city,
        customer.address.state,
        customer.address.postalCode,
        customer.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <DashboardLayout>
      <DashboardHeader title={customer.name} description={customer.email} />
      <DashboardPageContent>
        <div className={dashboardStack}>
          <Link
            href="/dashboard/customers"
            className="inline-flex items-center gap-1.5 text-[12px] text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to customers
          </Link>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className={cn(dashboardCard, "px-3.5 py-3")}>
                <p className={dashboardKicker}>{stat.label}</p>
                <p className={cn(dashboardMetric, "mt-1 truncate")}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
            <aside className={cn(dashboardCard, "p-4")}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[12px] font-semibold text-neutral-600 dark:bg-white/[0.08] dark:text-neutral-300">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className={cn(dashboardTitle, "truncate")}>{customer.name}</p>
                  <p className={dashboardSubtitle}>
                    Customer since{" "}
                    <span suppressHydrationWarning>
                      {formatDate(customer.firstOrderAt)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 text-[12px] text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="truncate transition-colors hover:text-[#007AFF]"
                  >
                    {customer.email}
                  </a>
                </div>
                {customer.phone ? (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <a
                      href={`tel:${customer.phone}`}
                      className="truncate transition-colors hover:text-[#007AFF]"
                    >
                      {customer.phone}
                    </a>
                  </div>
                ) : null}
                {addressLine ? (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                    <span className="leading-relaxed">{addressLine}</span>
                  </div>
                ) : null}
              </div>

              {intelligence ? (
                <div className="mt-4 space-y-2 border-t border-black/[0.05] pt-4 dark:border-white/10">
                  <p className={dashboardKicker}>Atlas intelligence</p>
                  <p className="text-[12px] text-neutral-600 dark:text-neutral-300">
                    Email engagement{" "}
                    <span className="font-medium tabular-nums">
                      {Math.round(intelligence.emailEngagementScore)}
                    </span>
                    {intelligence.predictedNextPurchaseAt ? (
                      <>
                        {" "}
                        · Next purchase ~{" "}
                        <span suppressHydrationWarning>
                          {formatDate(intelligence.predictedNextPurchaseAt)}
                        </span>
                      </>
                    ) : null}
                  </p>
                  {intelligence.predictiveLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {intelligence.predictiveLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-md bg-[#007AFF]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#007AFF]"
                        >
                          {label.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-[11px] text-neutral-400">
                    Revenue from email{" "}
                    {formatCurrency(
                      intelligence.revenueFromEmail,
                      store.currency
                    )}
                    {intelligence.optimalSendHour != null
                      ? ` · Best send ~${intelligence.optimalSendHour}:00 UTC`
                      : ""}
                  </p>
                </div>
              ) : (
                <p className="mt-4 border-t border-black/[0.05] pt-4 text-[11px] text-neutral-400 dark:border-white/10">
                  Run Insights → Score audience to unlock Atlas predictions for
                  this customer.
                </p>
              )}
            </aside>

            <section className={cn(dashboardCard, "overflow-hidden")}>
              <div className="border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
                <h2 className={dashboardTitle}>
                  Order history
                  <span className="ml-1.5 font-normal text-neutral-400">
                    {customer.orders.length}
                  </span>
                </h2>
                <p className={dashboardSubtitle}>Orders placed by this customer</p>
              </div>

              {customer.orders.length === 0 ? (
                <p className="px-4 py-8 text-center text-[12px] text-neutral-400">
                  No orders yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-black/[0.05] text-left text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10">
                        <th className="px-4 py-2.5">Order</th>
                        <th className="px-4 py-2.5">Items</th>
                        <th className="px-4 py-2.5">Total</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="hidden px-4 py-2.5 md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-black/[0.04] last:border-0 transition-colors duration-150 hover:bg-[#F5F5F7]/80 dark:border-white/5 dark:hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-2.5">
                            <Link
                              href={`/dashboard/orders/${order.id}`}
                              className="font-medium text-neutral-900 transition-colors hover:text-[#007AFF] dark:text-white"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5 tabular-nums text-neutral-500">
                            {order.itemCount}
                          </td>
                          <td className="px-4 py-2.5 font-medium tabular-nums text-neutral-900 dark:text-white">
                            {formatCurrency(order.total, store.currency)}
                          </td>
                          <td className="px-4 py-2.5">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="hidden px-4 py-2.5 text-neutral-400 md:table-cell">
                            <span suppressHydrationWarning>
                              {formatDate(order.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
