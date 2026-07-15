import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Wallet, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getCustomerByEmail, decodeCustomerId } from "@/lib/customers";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCurrency } from "@/lib/utils";

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

  const stats = [
    {
      label: "Total spent",
      value: formatCurrency(customer.totalSpent, store.currency),
      icon: Wallet,
    },
    {
      label: "Orders",
      value: customer.orderCount.toString(),
      icon: ShoppingBag,
    },
    {
      label: "Avg. order value",
      value: formatCurrency(customer.averageOrderValue, store.currency),
      icon: TrendingUp,
    },
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
      <DashboardPageContent className="space-y-4">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to customers
        </Link>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="premium-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10 text-sm font-bold text-[#007AFF]">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Customer since {new Date(customer.firstOrderAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                )}
                {addressLine && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{addressLine}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="premium-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/80">
                      <stat.icon className="h-5 w-5 text-foreground/70" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-semibold tracking-[-0.01em]">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="premium-card overflow-hidden">
            <div className="border-b border-border/80 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Order history</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Order</th>
                    <th className="px-6 py-3 font-medium">Items</th>
                    <th className="px-6 py-3 font-medium">Total</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="hidden px-6 py-3 font-medium md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border/80 last:border-0 transition-colors duration-200 hover:bg-muted/35"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-sm font-medium text-foreground transition-colors hover:text-[#007AFF]"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{order.itemCount}</td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {formatCurrency(order.total, store.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="hidden px-6 py-4 text-sm text-muted-foreground md:table-cell">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
