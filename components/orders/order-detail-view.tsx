"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Printer,
  Ticket,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderStatusUpdate } from "@/components/orders/order-status-update";
import { OrderPaymentPanel } from "@/components/orders/order-payment-panel";
import { OrderMerchantNote } from "@/components/orders/order-merchant-note";
import { encodeCustomerId } from "@/lib/customer-id";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";
import {
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "@/types/orders";
import type { OrderDetail } from "@/types/orders";
import { dashboardCard, dashboardTitle, dashboardSubtitle } from "@/lib/dashboard-ui";

interface OrderDetailViewProps {
  order: OrderDetail;
  currency: string;
  onRefresh: () => void;
}

const paymentStyles: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  refunded: "bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  partially_refunded: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

function hasAddress(addr: OrderDetail["shippingAddress"]) {
  return Boolean(addr.street || addr.city || addr.postalCode || addr.country);
}

function formatAddress(addr: OrderDetail["shippingAddress"]) {
  return [
    addr.street,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.postalCode,
    addr.country,
  ]
    .filter(Boolean)
    .join("\n");
}

async function openEticketWindow(payload: {
  orderIds: string[];
  itemIds?: string[];
  singlePerItem?: boolean;
}) {
  const res = await fetch("/api/orders/etickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "Failed to print e-tickets");
  }
  const html = await res.text();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error("Allow pop-ups to print e-tickets");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function OrderDetailView({ order, currency, onRefresh }: OrderDetailViewProps) {
  const addr = order.shippingAddress;
  const customerHref = `/dashboard/customers/${encodeCustomerId(order.customerEmail)}`;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const [copied, setCopied] = useState<"order" | "address" | "email" | null>(null);

  const handlePrintInvoice = () => {
    window.open(`/api/orders/${order.id}/invoice`, "_blank");
  };

  const copyText = async (value: string, key: "order" | "address" | "email") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      toast.success("Copied");
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  const whatsappHref = order.customerPhone
    ? (() => {
        const digits = order.customerPhone
          .replace(/[^\d+]/g, "")
          .replace(/^\+/, "");
        const city = order.shippingAddress.city?.trim();
        const text = [
          `Hi ${order.customerName},`,
          `This is about your order ${order.orderNumber} (${formatCurrency(order.total, currency)}${city ? ` · ${city}` : ""}).`,
          "Can you confirm your order and delivery address?",
        ].join(" ");
        return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
      })()
    : null;

  return (
    <div className="space-y-3 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5 h-8 w-8 shrink-0 rounded-md text-neutral-500 hover:text-neutral-900"
            asChild
          >
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                {order.orderNumber}
              </h2>
              <button
                type="button"
                onClick={() => void copyText(order.orderNumber, "order")}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-[#F5F5F7] hover:text-neutral-700 dark:hover:bg-white/5"
                aria-label="Copy order number"
              >
                {copied === "order" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              <OrderStatusBadge status={order.status} />
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  paymentStyles[order.paymentStatus] ?? paymentStyles.unpaid
                )}
              >
                {getPaymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
            <p className={cn(dashboardSubtitle, "mt-0.5")} suppressHydrationWarning>
              {formatDateTime(order.createdAt)} · {getPaymentMethodLabel(order.paymentMethod)} ·{" "}
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pl-10 sm:pl-0">
          <Button
            variant="outline"
            className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] dark:border-white/10"
            onClick={() => {
              void (async () => {
                try {
                  await openEticketWindow({ orderIds: [order.id] });
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Print failed");
                }
              })();
            }}
          >
            <Ticket className="mr-1.5 h-3 w-3" />
            E-tickets
          </Button>
          <Button
            variant="outline"
            className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] dark:border-white/10"
            onClick={handlePrintInvoice}
          >
            <Printer className="mr-1.5 h-3 w-3" />
            Invoice
          </Button>
          {order.customerPhone && (
            <Button
              variant="outline"
              className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] dark:border-white/10"
              asChild
            >
              <a href={`tel:${order.customerPhone}`}>
                <Phone className="mr-1.5 h-3 w-3" />
                Call
              </a>
            </Button>
          )}
          {whatsappHref && (
            <Button
              variant="outline"
              className="h-7 rounded-md border-black/[0.06] px-2.5 text-[11px] dark:border-white/10"
              asChild
            >
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-1.5 h-3 w-3" />
                WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Overview strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Total", value: formatCurrency(order.total, currency) },
          { label: "Items", value: String(itemCount) },
          { label: "Payment", value: getPaymentStatusLabel(order.paymentStatus) },
          { label: "Method", value: getPaymentMethodLabel(order.paymentMethod) },
        ].map((stat) => (
          <div key={stat.label} className={cn(dashboardCard, "px-3 py-2.5")}>
            <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
              {stat.label}
            </p>
            <p className="mt-0.5 truncate text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {/* Items */}
          <div className={cn(dashboardCard, "overflow-hidden")}>
            <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F5F7] dark:bg-white/[0.06]">
                  <Package className="h-3.5 w-3.5 text-neutral-500" />
                </div>
                <div>
                  <h3 className={dashboardTitle}>Items</h3>
                  <p className={dashboardSubtitle}>
                    {order.items.length} line{order.items.length === 1 ? "" : "s"} ·{" "}
                    {formatCurrency(order.subtotal, currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-black/[0.04] dark:divide-white/5">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#F5F5F7]/70 dark:hover:bg-white/[0.03]"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-black/[0.06] bg-[#F5F5F7] dark:border-white/10 dark:bg-white/[0.05]">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-neutral-900 dark:text-white">
                      {item.title}
                    </p>
                    {item.variant && (
                      <p className="text-[10px] text-neutral-400">
                        {Object.entries(item.variant)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                    <p className="text-[10px] text-neutral-400">
                      {formatCurrency(item.price, currency)} × {item.quantity}
                      {item.sku || item.barcode
                        ? ` · ${item.sku || item.barcode}`
                        : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-neutral-400 hover:text-neutral-900"
                    title="Print one e-ticket"
                    onClick={() => {
                      void (async () => {
                        try {
                          await openEticketWindow({
                            orderIds: [order.id],
                            itemIds: [item.id],
                            singlePerItem: true,
                          });
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Print failed"
                          );
                        }
                      })();
                    }}
                  >
                    <Ticket className="h-3.5 w-3.5" />
                  </Button>
                  <p className="shrink-0 text-[12px] font-semibold text-neutral-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 border-t border-black/[0.05] px-4 py-3 text-[12px] dark:border-white/10">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>
                  {order.shipping > 0 ? formatCurrency(order.shipping, currency) : "Free"}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>−{formatCurrency(order.discount, currency)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-neutral-400">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax, currency)}</span>
                </div>
              )}
              {order.refundedAmount > 0 && (
                <div className="flex justify-between text-pink-700">
                  <span>Refunded</span>
                  <span>−{formatCurrency(order.refundedAmount, currency)}</span>
                </div>
              )}
              <Separator className="my-1.5" />
              <div className="flex justify-between text-[13px] font-semibold text-neutral-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(order.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Customer + address */}
          <div className={cn(dashboardCard, "p-4")}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#F5F5F7] dark:bg-white/[0.06]">
                  <User className="h-3.5 w-3.5 text-neutral-500" />
                </div>
                <div>
                  <h3 className={dashboardTitle}>Customer</h3>
                  <p className={dashboardSubtitle}>Contact & shipping</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-md px-2 text-[11px] text-neutral-500 hover:text-neutral-900"
                asChild
              >
                <Link href={customerHref}>
                  Profile
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                  Contact
                </p>
                <Link
                  href={customerHref}
                  className="block text-[12px] font-medium text-neutral-900 hover:text-[#007AFF] dark:text-white"
                >
                  {order.customerName}
                </Link>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Mail className="h-3 w-3 shrink-0 text-neutral-400" />
                  <a href={`mailto:${order.customerEmail}`} className="truncate text-[#007AFF] hover:underline">
                    {order.customerEmail}
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyText(order.customerEmail, "email")}
                    className="ml-auto text-neutral-400 hover:text-neutral-700"
                    aria-label="Copy email"
                  >
                    {copied === "email" ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                    <Phone className="h-3 w-3 shrink-0 text-neutral-400" />
                    <a href={`tel:${order.customerPhone}`} className="hover:text-[#007AFF]">
                      {order.customerPhone}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-[10px] border border-black/[0.05] bg-[#F5F5F7]/50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                    Shipping
                  </p>
                  {hasAddress(addr) && (
                    <button
                      type="button"
                      onClick={() => void copyText(formatAddress(addr), "address")}
                      className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-700"
                    >
                      {copied === "address" ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      Copy
                    </button>
                  )}
                </div>
                {hasAddress(addr) ? (
                  <div className="flex items-start gap-1.5 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-neutral-400" />
                    <div>
                      {addr.street ? <p>{addr.street}</p> : null}
                      <p>
                        {[addr.city, addr.state].filter(Boolean).join(", ")}
                        {addr.postalCode ? ` ${addr.postalCode}` : ""}
                      </p>
                      {addr.country ? <p>{addr.country}</p> : null}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400">No shipping address on this order.</p>
                )}
              </div>
            </div>
          </div>

          {(order.utmSource || order.utmMedium || order.utmCampaign) && (
            <div className={cn(dashboardCard, "p-4")}>
              <h3 className={cn(dashboardTitle, "mb-3")}>Attribution</h3>
              <div className="grid gap-2 text-[12px] sm:grid-cols-2">
                {order.utmSource && (
                  <div>
                    <p className="text-[10px] text-neutral-400">Source</p>
                    <p className="font-medium text-neutral-900 dark:text-white">{order.utmSource}</p>
                  </div>
                )}
                {order.utmMedium && (
                  <div>
                    <p className="text-[10px] text-neutral-400">Medium</p>
                    <p className="font-medium text-neutral-900 dark:text-white">{order.utmMedium}</p>
                  </div>
                )}
                {order.utmCampaign && (
                  <div>
                    <p className="text-[10px] text-neutral-400">Campaign</p>
                    <p className="font-medium text-neutral-900 dark:text-white">{order.utmCampaign}</p>
                  </div>
                )}
                {order.utmContent && (
                  <div>
                    <p className="text-[10px] text-neutral-400">Content</p>
                    <p className="font-medium text-neutral-900 dark:text-white">{order.utmContent}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={cn(dashboardCard, "p-4 lg:hidden")}>
            <h3 className={cn(dashboardTitle, "mb-3")}>Order timeline</h3>
            <OrderTimeline currentStatus={order.status} history={order.statusHistory} />
          </div>
        </div>

        <div className="space-y-3">
          <div className={cn(dashboardCard, "p-4")}>
            <h3 className={cn(dashboardTitle, "mb-1")}>Fulfillment</h3>
            <p className={cn(dashboardSubtitle, "mb-3")}>Move this order to the next step</p>
            <OrderStatusUpdate
              orderId={order.id}
              currentStatus={order.status}
              onUpdated={onRefresh}
            />
          </div>

          <div className={cn(dashboardCard, "p-4")}>
            <h3 className={cn(dashboardTitle, "mb-3")}>Payment</h3>
            <OrderPaymentPanel order={order} currency={currency} onUpdated={onRefresh} />
          </div>

          <div className={cn(dashboardCard, "p-4")}>
            <h3 className={cn(dashboardTitle, "mb-3")}>Merchant notes</h3>
            <OrderMerchantNote
              orderId={order.id}
              initialNote={order.merchantNote}
              onUpdated={onRefresh}
            />
          </div>

          <div className={cn(dashboardCard, "hidden p-4 lg:block")}>
            <h3 className={cn(dashboardTitle, "mb-3")}>Timeline</h3>
            <OrderTimeline currentStatus={order.status} history={order.statusHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
