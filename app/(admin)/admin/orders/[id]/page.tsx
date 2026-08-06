import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformOrderDetail } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";
import { formatFounderNumber } from "@/lib/founder/constants";
import { cn } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
} from "@/lib/dashboard-ui";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getStatusLabel,
} from "@/types/orders";

export const metadata = { title: "Order details — Platform Admin" };

function formatDate(value: Date | string | null | undefined, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

function money(amount: number, currency: string) {
  return `${amount.toLocaleString()} ${currency}`;
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-0.5 border-b border-neutral-100 py-2.5 last:border-0 dark:border-white/5 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className={dashboardKicker}>{label}</dt>
      <dd
        className={cn(
          "text-sm text-neutral-900 dark:text-white",
          mono && "break-all font-mono text-xs"
        )}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function formatAddress(addr: {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}) {
  const lines = [
    addr.street,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.postalCode,
    addr.country,
  ].filter(Boolean);
  return lines.length ? lines.join("\n") : "—";
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminPage();
  const order = await getPlatformOrderDetail(params.id);
  if (!order) notFound();

  const { store } = order;
  const currency = store.currency;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const addressText = formatAddress(order.shippingAddress);

  return (
    <AdminLayout>
      <div className={adminPage}>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/admin/stores/${store.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to store
          </Link>
          <Link
            href="/admin/payments"
            className="text-xs text-neutral-400 hover:text-neutral-700 hover:underline dark:hover:text-neutral-200"
          >
            All payments
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <AdminPageHeader
              title={order.orderNumber}
              description={`${store.name} · ${getStatusLabel(order.status)} · ${formatDate(order.createdAt, true)}`}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={
                  order.isTest
                    ? "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700"
                    : "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                }
              >
                {order.isTest ? "Test" : "Real"}
              </span>
              <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                {getPaymentStatusLabel(order.paymentStatus)}
              </span>
              <span className="text-xs text-neutral-400">
                {getPaymentMethodLabel(order.paymentMethod)}
              </span>
            </div>
          </div>
          <Link
            href={`/store/${store.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#007AFF] hover:underline"
          >
            Open storefront
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Total"
            value={money(order.total, currency)}
            accent="emerald"
          />
          <AdminStatCard
            label="Items"
            value={itemCount}
            hint={`${order.items.length} line${order.items.length === 1 ? "" : "s"}`}
          />
          <AdminStatCard
            label="Subtotal"
            value={money(order.subtotal, currency)}
            hint={
              order.shipping > 0
                ? `+ ${money(order.shipping, currency)} shipping`
                : "Free shipping"
            }
          />
          <AdminStatCard
            label="Tax / discount"
            value={money(order.tax, currency)}
            hint={
              order.discount > 0
                ? `− ${money(order.discount, currency)} discount${
                    order.couponCode ? ` (${order.couponCode})` : ""
                  }`
                : order.couponCode
                  ? `Coupon ${order.couponCode}`
                  : undefined
            }
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className={cn(dashboardCard, dashboardCardPad)}>
            <p className="mb-2 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Customer
            </p>
            <dl>
              <DetailRow label="Name" value={order.customerName} />
              <DetailRow label="Email" value={order.customerEmail} mono />
              <DetailRow label="Phone" value={order.customerPhone || "—"} />
              <DetailRow
                label="Shipping"
                value={
                  <span className="whitespace-pre-line">{addressText}</span>
                }
              />
              {order.customerRecord ? (
                <>
                  <DetailRow
                    label="CRM orders"
                    value={order.customerRecord._count.orders}
                  />
                  <DetailRow
                    label="Customer since"
                    value={formatDate(order.customerRecord.createdAt)}
                  />
                  {order.customerRecord.tags.length > 0 ? (
                    <DetailRow
                      label="Tags"
                      value={order.customerRecord.tags.join(", ")}
                    />
                  ) : null}
                </>
              ) : null}
            </dl>
          </div>

          <div className={cn(dashboardCard, dashboardCardPad)}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                Store & owner
              </p>
              <Link
                href={`/admin/stores/${store.id}`}
                className="text-xs font-medium text-[#007AFF] hover:underline"
              >
                View store
              </Link>
            </div>
            <dl>
              <DetailRow label="Store" value={store.name} />
              <DetailRow label="Slug" value={`/${store.slug}`} mono />
              <DetailRow label="Currency" value={store.currency} />
              <DetailRow
                label="Owner"
                value={
                  <Link
                    href={`/admin/users/${store.user.id}`}
                    className="text-[#007AFF] hover:underline"
                  >
                    {store.user.name || store.user.email}
                  </Link>
                }
              />
              <DetailRow label="Owner email" value={store.user.email} mono />
              <DetailRow
                label="Founder #"
                value={
                  store.user.founderNumber
                    ? formatFounderNumber(store.user.founderNumber)
                    : "—"
                }
              />
              <DetailRow label="Owner status" value={store.user.status} />
            </dl>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className={cn(dashboardCard, dashboardCardPad)}>
            <p className="mb-2 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Payment & totals
            </p>
            <dl>
              <DetailRow
                label="Method"
                value={getPaymentMethodLabel(order.paymentMethod)}
              />
              <DetailRow
                label="Payment status"
                value={getPaymentStatusLabel(order.paymentStatus)}
              />
              <DetailRow
                label="Refunded"
                value={money(order.refundedAmount, currency)}
              />
              <DetailRow label="Subtotal" value={money(order.subtotal, currency)} />
              <DetailRow label="Shipping" value={money(order.shipping, currency)} />
              <DetailRow label="Tax" value={money(order.tax, currency)} />
              <DetailRow
                label="Discount"
                value={money(order.discount, currency)}
              />
              <DetailRow label="Total" value={money(order.total, currency)} />
              <DetailRow label="Coupon" value={order.couponCode || "—"} />
              <DetailRow
                label="Inventory restored"
                value={order.inventoryRestored ? "Yes" : "No"}
              />
            </dl>
          </div>

          <div className={cn(dashboardCard, dashboardCardPad)}>
            <p className="mb-2 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Meta
            </p>
            <dl>
              <DetailRow label="Order ID" value={order.id} mono />
              <DetailRow label="Created" value={formatDate(order.createdAt, true)} />
              <DetailRow label="Updated" value={formatDate(order.updatedAt, true)} />
              <DetailRow
                label="Merchant note"
                value={order.merchantNote || "—"}
              />
              <DetailRow label="UTM source" value={order.utmSource || "—"} />
              <DetailRow label="UTM medium" value={order.utmMedium || "—"} />
              <DetailRow label="UTM campaign" value={order.utmCampaign || "—"} />
              <DetailRow label="UTM term" value={order.utmTerm || "—"} />
              <DetailRow label="UTM content" value={order.utmContent || "—"} />
            </dl>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">
            Products ({itemCount})
          </h2>
          <AdminTableShell>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-black/[0.06] bg-[#F5F5F7]/80 text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">SKU / barcode</th>
                  <th className="px-4 py-2.5 font-medium">Variant</th>
                  <th className="px-4 py-2.5 font-medium">Qty</th>
                  <th className="px-4 py-2.5 font-medium">Price</th>
                  <th className="px-4 py-2.5 font-medium">Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-neutral-400">
                      No line items
                    </td>
                  </tr>
                ) : (
                  order.items.map((item) => {
                    const variantText = item.variant
                      ? Object.entries(item.variant)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")
                      : "—";
                    return (
                      <tr
                        key={item.id}
                        className="border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="flex items-center gap-3 rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#007AFF]/40"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-white/10">
                              {item.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] text-neutral-400">
                                  —
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 hover:text-[#007AFF] dark:text-white dark:hover:text-[#5AC8FA]">
                                {item.title}
                              </p>
                              <p className="font-mono text-[11px] text-neutral-400">
                                {item.productId}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="block"
                          >
                            <p>{item.sku || "—"}</p>
                            <p className="text-neutral-400">
                              {item.barcode || "—"}
                            </p>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="block"
                          >
                            {variantText}
                          </Link>
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="block"
                          >
                            {item.quantity}
                          </Link>
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="block"
                          >
                            {money(item.price, currency)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 tabular-nums font-medium">
                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="block"
                          >
                            {money(item.price * item.quantity, currency)}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </AdminTableShell>
        </div>

        <div>
          <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">Status history</h2>
          <AdminTableShell>
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="border-b border-black/[0.06] bg-[#F5F5F7]/80 text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Note</th>
                  <th className="px-4 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {order.statusHistory.map((event) => (
                  <tr key={event.id} className="border-b last:border-0">
                    <td className="px-4 py-3 capitalize">
                      {getStatusLabel(event.status)}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {event.note || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {formatDate(event.createdAt, true)}
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
