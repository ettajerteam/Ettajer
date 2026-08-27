import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformStoreDetail } from "@/lib/admin/platform-stats";
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
import { parsePaymentGateways } from "@/lib/store-settings";
import { scoreMerchantHealth } from "@/lib/admin/merchant-health";

export const metadata = { title: "Store details — Platform Admin" };

function formatDate(value: Date | string | null | undefined, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
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
          mono && "font-mono text-xs break-all"
        )}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

export default async function AdminStoreDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminPage();
  const store = await getPlatformStoreDetail(params.id);
  if (!store) notFound();

  const gateways = parsePaymentGateways(store.settings?.paymentGateways);
  const owner = store.user;
  const health = scoreMerchantHealth({
    hasStore: true,
    storeCreatedAt: store.createdAt,
    lastLoginAt: owner.lastLoginAt,
    productCount: store.stats.products,
    activeProductCount: store.stats.activeProducts,
    hasThemeCustomized: store.lifecycle.themeConfigured,
    hasCustomDomain: Boolean(store.settings?.customDomain),
    realOrders: store.stats.realOrders,
    realGmv: store.stats.realGmv,
  });
  const lifecycleSteps = [
    {
      label: "Account created",
      at: formatDate(store.lifecycle.accountCreatedAt, true),
      done: true,
    },
    {
      label: "Store created",
      at: formatDate(store.lifecycle.storeCreatedAt, true),
      done: true,
    },
    {
      label: "Theme configured",
      at: store.lifecycle.themeConfigured ? "Detected" : "Not detected",
      done: store.lifecycle.themeConfigured,
    },
    {
      label: "Product added",
      at: formatDate(store.lifecycle.firstProductAt, true),
      done: Boolean(store.lifecycle.firstProductAt),
    },
    {
      label: "Product published",
      at: store.lifecycle.hasPublishedProducts ? "Live products" : "None live",
      done: store.lifecycle.hasPublishedProducts,
    },
    {
      label: "First real order",
      at: formatDate(store.lifecycle.firstRealOrderAt, true),
      done: Boolean(store.lifecycle.firstRealOrderAt),
    },
    {
      label: "First delivery",
      at: formatDate(store.lifecycle.firstDeliveryAt, true),
      done: Boolean(store.lifecycle.firstDeliveryAt),
    },
  ];
  const initials = (owner.name || owner.email)
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AdminLayout>
      <div className={adminPage}>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/stores"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All stores
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-[13px] font-semibold tracking-[-0.01em] text-white"
              style={{ backgroundColor: store.primaryColor || "#7C3AED" }}
            >
              {store.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={store.logo}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                store.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <AdminPageHeader
                title={store.name}
                description={`/${store.slug} · ${store.currency}`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={`/store/${store.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#007AFF] hover:underline"
                >
                  Open storefront
                  <ExternalLink className="h-3 w-3" />
                </Link>
                {store.settings?.customDomain ? (
                  <span className="text-xs text-neutral-400">
                    · {store.settings.customDomain}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Real orders"
            value={store.stats.realOrders}
            accent="emerald"
            hint={`${store.stats.realGmv.toLocaleString()} ${store.currency} GMV`}
          />
          <AdminStatCard
            label="Test orders"
            value={store.stats.testOrders}
            accent="amber"
            hint={`${store.stats.testGmv.toLocaleString()} ${store.currency}`}
          />
          <AdminStatCard
            label="Products"
            value={store.stats.products}
            hint={`${store.stats.activeProducts} live · ${store.stats.draftProducts} draft`}
          />
          <AdminStatCard
            label="Health score"
            value={`${health.score}/100`}
            hint={health.bandLabel}
            accent={
              health.band === "healthy"
                ? "emerald"
                : health.band === "risk"
                  ? "rose"
                  : health.band === "attention"
                    ? "amber"
                    : "blue"
            }
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className={cn(dashboardCard, dashboardCardPad)}>
            <p className="mb-1 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Health score
            </p>
            <p className="text-[28px] font-semibold tracking-tight tabular-nums text-neutral-900 dark:text-white">
              {health.score}
              <span className="text-[14px] font-medium text-neutral-400">
                {" "}
                / 100
              </span>
            </p>
            <p className={cn("mt-0.5", dashboardKicker)}>{health.bandLabel}</p>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
              Why
            </p>
            <ul className="mt-1.5 space-y-1">
              {health.why.map((line) => (
                <li
                  key={line}
                  className="text-[12px] text-neutral-600 dark:text-neutral-300"
                >
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
              Recommended next action
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-neutral-700 dark:text-neutral-200">
              {health.recommendedAction}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={`/admin/users/${owner.id}`}
                className="text-[12px] font-medium text-[#007AFF] hover:underline"
              >
                Open merchant
              </Link>
              <Link
                href={`/store/${store.slug}`}
                target="_blank"
                className="text-[12px] font-medium text-[#007AFF] hover:underline"
              >
                View storefront
              </Link>
              <Link
                href="/admin/messages"
                className="text-[12px] font-medium text-[#007AFF] hover:underline"
              >
                Send message
              </Link>
            </div>
          </div>

          <div className={cn(dashboardCard, dashboardCardPad)}>
            <p className="mb-2 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Lifecycle
            </p>
            <ol className="space-y-2">
              {lifecycleSteps.map((step) => (
                <li key={step.label} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-0.5 text-[12px]",
                      step.done
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-neutral-300"
                    )}
                  >
                    {step.done ? "✓" : "○"}
                  </span>
                  <div>
                    <p
                      className={cn(
                        "text-[12px] font-medium",
                        step.done
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-400"
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-[11px] text-neutral-400">{step.at}</p>
                  </div>
                </li>
              ))}
            </ol>
            {health.bottleneck !== "none" ? (
              <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/70 px-2.5 py-2 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-amber-800 dark:text-amber-300">
                  Current bottleneck: {health.bottleneck.replace("_", " ")}
                </p>
                <p className="mt-1 text-[12px] text-amber-900/90 dark:text-amber-100/90">
                  {health.recommendedAction}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className={cn(dashboardCard, dashboardCardPad)}>
            <p className="mb-2 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Store details
            </p>
            <dl>
              <DetailRow label="Slug" value={`/${store.slug}`} mono />
              <DetailRow label="Currency" value={store.currency} />
              <DetailRow label="Language" value={store.language} />
              <DetailRow label="Category" value={store.category || "—"} />
              <DetailRow
                label="Business model"
                value={store.businessModel || "—"}
              />
              <DetailRow label="Theme" value={store.theme} />
              <DetailRow
                label="Template"
                value={store.websiteTemplateId || "—"}
              />
              <DetailRow
                label="Contact email"
                value={store.contactEmail || "—"}
              />
              <DetailRow label="Phone" value={store.phone || "—"} />
              <DetailRow label="Address" value={store.address || "—"} />
              <DetailRow
                label="Custom domain"
                value={store.settings?.customDomain || "—"}
              />
              <DetailRow
                label="Payments"
                value={[
                  gateways.cashOnDelivery ? "COD" : null,
                  gateways.paypal
                    ? `PayPal (${gateways.paypalMode})`
                    : null,
                  gateways.stripe ? "Stripe" : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "None"}
              />
              <DetailRow label="Created" value={formatDate(store.createdAt, true)} />
              <DetailRow label="Updated" value={formatDate(store.updatedAt, true)} />
            </dl>
          </div>

          <div className={cn(dashboardCard, dashboardCardPad)}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
                Owner
              </p>
              <Link
                href={`/admin/users/${owner.id}`}
                className="text-xs font-medium text-[#007AFF] hover:underline"
              >
                View user profile
              </Link>
            </div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#007AFF] text-xs font-semibold text-white">
                {owner.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={owner.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {owner.name || "—"}
                </p>
                <p className="text-xs text-neutral-500">{owner.email}</p>
              </div>
            </div>
            <dl>
              <DetailRow label="Status" value={owner.status} />
              <DetailRow label="Role" value={owner.role} />
              <DetailRow
                label="Founder #"
                value={
                  owner.founderNumber
                    ? formatFounderNumber(owner.founderNumber)
                    : "—"
                }
              />
              <DetailRow
                label="Email verified"
                value={owner.emailVerified ? formatDate(owner.emailVerified, true) : "No"}
              />
              <DetailRow
                label="Last login"
                value={formatDate(owner.lastLoginAt, true)}
              />
              <DetailRow
                label="Joined"
                value={formatDate(owner.createdAt, true)}
              />
            </dl>
          </div>
        </div>

        {store.ordersByStatus.length > 0 ? (
          <div>
            <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">Orders by status</h2>
            <AdminTableShell>
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-black/[0.06] bg-[#F5F5F7]/80 text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.03]">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Count</th>
                    <th className="px-4 py-2.5 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {store.ordersByStatus.map((row) => (
                    <tr key={row.status} className="border-b last:border-0">
                      <td className="px-4 py-3 capitalize">{row.status}</td>
                      <td className="px-4 py-3">{row._count}</td>
                      <td className="px-4 py-3">
                        {(row._sum.total ?? 0).toLocaleString()} {store.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableShell>
          </div>
        ) : null}

        <div>
          <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">
            Orders ({store.stats.totalOrders})
          </h2>
          <AdminTableShell>
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-black/[0.06] bg-[#F5F5F7]/80 text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Payment</th>
                  <th className="px-4 py-2.5 font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {store.orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-neutral-400">
                      No orders for this store yet
                    </td>
                  </tr>
                ) : (
                  store.orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="group block"
                        >
                          <p className="font-medium text-neutral-900 group-hover:text-[#007AFF] dark:text-white dark:group-hover:text-[#5AC8FA]">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs capitalize text-neutral-500">
                            {order.status}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="block">
                          <span
                            className={
                              order.isTest
                                ? "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700"
                                : "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                            }
                          >
                            {order.isTest ? "Test" : "Real"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="block">
                          <p>{order.customerName}</p>
                          <p className="text-xs text-neutral-500">
                            {order.customerEmail}
                          </p>
                          {order.customerPhone ? (
                            <p className="text-xs text-neutral-400">
                              {order.customerPhone}
                            </p>
                          ) : null}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs capitalize text-neutral-600">
                        <Link href={`/admin/orders/${order.id}`} className="block">
                          {order.paymentMethod ?? "—"}
                          {order.paymentStatus
                            ? ` · ${order.paymentStatus}`
                            : ""}
                        </Link>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <Link href={`/admin/orders/${order.id}`} className="block">
                          {order.total.toLocaleString()} {store.currency}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Link href={`/admin/orders/${order.id}`} className="block">
                          {formatDate(order.createdAt, true)}
                        </Link>
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
