import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/admin/auth";
import { getPlatformProductDetail } from "@/lib/admin/platform-stats";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminTableShell,
  adminPage,
} from "@/components/admin/admin-ui";
import { formatFounderNumber } from "@/lib/founder/constants";
import { parseProductImages } from "@/lib/product-images";
import { parseProductDetails } from "@/lib/product-details";
import { parseProductCommerce } from "@/lib/product-commerce";
import { getStoreProductUrl } from "@/lib/storefront-urls";
import { cn, formatNumber } from "@/lib/utils";
import {
  dashboardCard,
  dashboardCardPad,
  dashboardKicker,
} from "@/lib/dashboard-ui";

export const metadata = { title: "Product details — Platform Admin" };

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
  return `${formatNumber(amount)} ${currency}`;
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

function variantLabel(variant: unknown) {
  if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
    return "—";
  }
  const entries = Object.entries(variant as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string")
    .map(([k, v]) => `${k}: ${v}`);
  return entries.length ? entries.join(" · ") : "—";
}

export default async function AdminProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminPage();
  const product = await getPlatformProductDetail(params.id);
  if (!product) notFound();

  const { store } = product;
  const currency = store.currency;
  const images = parseProductImages(product.images);
  const details = parseProductDetails(product.details);
  const commerce = parseProductCommerce(product.commerce);
  const storefrontUrl = getStoreProductUrl(store.slug, product.slug);

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
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 dark:bg-white/10">
              {images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[0]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-neutral-400">No image</span>
              )}
            </div>
            <div>
              <AdminPageHeader
                title={product.title}
                description={`/${product.slug} · ${product.status} · ${product.productType}`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={storefrontUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#007AFF] hover:underline"
                >
                  Open on storefront
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Price"
            value={money(product.price, currency)}
            hint={
              product.comparePrice
                ? `Compare ${money(product.comparePrice, currency)}`
                : undefined
            }
            accent="emerald"
          />
          <AdminStatCard
            label="Inventory"
            value={product.inventory}
            hint={product.sku ? `SKU ${product.sku}` : undefined}
          />
          <AdminStatCard
            label="Real units sold"
            value={product.stats.realUnits}
            hint={`${product.stats.realLines} order lines`}
            accent="emerald"
          />
          <AdminStatCard
            label="Test units"
            value={product.stats.testUnits}
            hint={`${product.stats.testLines} test lines`}
            accent="amber"
          />
        </div>

        {images.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((src) => (
              <div
                key={src}
                className="h-20 w-20 overflow-hidden rounded-xl bg-neutral-100 dark:bg-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-2">
          <div className={cn(dashboardCard, dashboardCardPad)}>
            <p className="mb-2 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
              Product details
            </p>
            <dl>
              <DetailRow label="Status" value={product.status} />
              <DetailRow label="Type" value={product.productType} />
              <DetailRow label="Slug" value={product.slug} mono />
              <DetailRow label="SKU" value={product.sku || "—"} mono />
              <DetailRow label="Barcode" value={product.barcode || "—"} mono />
              <DetailRow
                label="Cost"
                value={
                  product.costPrice != null
                    ? money(product.costPrice, currency)
                    : "—"
                }
              />
              <DetailRow
                label="Category"
                value={product.category?.name || "—"}
              />
              <DetailRow
                label="Collections"
                value={
                  product.collections.length
                    ? product.collections.map((c) => c.name).join(", ")
                    : "—"
                }
              />
              <DetailRow
                label="Tags"
                value={product.tags.length ? product.tags.join(", ") : "—"}
              />
              <DetailRow
                label="Vendor"
                value={commerce.vendor || "—"}
              />
              <DetailRow
                label="Ticket printer"
                value={product.ticketPrinterId || "—"}
                mono
              />
              <DetailRow label="Created" value={formatDate(product.createdAt, true)} />
              <DetailRow label="Updated" value={formatDate(product.updatedAt, true)} />
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
            </dl>

            {product.description ? (
              <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-white/5">
                <p className={dashboardKicker}>Description</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                  {product.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {details.length > 0 ? (
          <div>
            <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">Specs</h2>
            <AdminTableShell>
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead className="border-b border-black/[0.06] bg-[#F5F5F7]/80 text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.03]">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Label</th>
                    <th className="px-4 py-2.5 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3">{row.label}</td>
                      <td className="px-4 py-3 text-neutral-600">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTableShell>
          </div>
        ) : null}

        <div>
          <h2 className="mb-2 text-[13px] font-semibold tracking-[-0.01em]">
            Recent orders with this product
          </h2>
          <AdminTableShell>
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-black/[0.06] bg-[#F5F5F7]/80 text-[10px] uppercase tracking-[0.06em] text-neutral-400 dark:border-white/10 dark:bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Variant</th>
                  <th className="px-4 py-2.5 font-medium">Qty</th>
                  <th className="px-4 py-2.5 font-medium">Price</th>
                  <th className="px-4 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {product.recentLines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-neutral-400">
                      No orders yet for this product
                    </td>
                  </tr>
                ) : (
                  product.recentLines.map((line) => (
                    <tr
                      key={line.id}
                      className="border-b last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${line.order.id}`}
                          className="group block"
                        >
                          <p className="font-medium group-hover:text-[#007AFF] dark:group-hover:text-[#5AC8FA]">
                            {line.order.orderNumber}
                          </p>
                          <p className="text-xs capitalize text-neutral-500">
                            {line.order.status}
                          </p>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            line.order.isTest
                              ? "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700"
                              : "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700"
                          }
                        >
                          {line.order.isTest ? "Test" : "Real"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p>{line.order.customerName}</p>
                        <p className="text-xs text-neutral-500">
                          {line.order.customerEmail}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600">
                        {variantLabel(line.variant)}
                      </td>
                      <td className="px-4 py-3 tabular-nums">{line.quantity}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {money(line.price, currency)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {formatDate(line.order.createdAt, true)}
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
