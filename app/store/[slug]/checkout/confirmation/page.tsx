import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Package, Banknote } from "lucide-react";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import {
  getStoreBySlug,
  serializePublicStore,
} from "@/lib/storefront";
import { getPublicOrder, serializeOrderDetail } from "@/lib/orders";
import { fulfillStripePaidOrder } from "@/lib/payments/stripe-fulfill";
import { retrieveStripeCheckoutSession } from "@/lib/payments/stripe-checkout";
import { formatCurrency } from "@/lib/utils";
import { applyPreviewOverrides } from "@/lib/preview-engine";
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";
import {
  getOrderConfirmationUrl,
  getStoreCheckoutUrl,
  getStoreProductsUrl,
  getStoreUrl,
} from "@/lib/storefront-urls";

interface PageProps {
  params: { slug: string };
  searchParams: {
    order?: string;
    session_id?: string;
    preview?: string;
    theme?: string;
    primary?: string;
    secondary?: string;
    font?: string;
    logo?: string;
  };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return { title: "Order Confirmation" };
  return buildStorefrontMetadata({
    storeName: store.name,
    path: searchParams.order
      ? getOrderConfirmationUrl(store.slug, searchParams.order)
      : `${getStoreCheckoutUrl(store.slug)}/confirmation`,
    title: searchParams.order ? `Order ${searchParams.order}` : "Order Confirmation",
    description: `Order confirmation for ${store.name}`,
    noIndex: true,
  });
}

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  const orderNumber = searchParams.order;
  if (!orderNumber) notFound();

  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  // Complete Stripe payment if returning from Checkout
  if (searchParams.session_id) {
    try {
      const session = await retrieveStripeCheckoutSession(searchParams.session_id);
      const orderId =
        session.metadata?.orderId ||
        (typeof session.client_reference_id === "string"
          ? session.client_reference_id
          : null);
      if (orderId) {
        await fulfillStripePaidOrder({
          orderId,
          sessionId: searchParams.session_id,
        });
      }
    } catch (err) {
      console.error("Stripe confirmation fulfill failed:", err);
    }
  }

  const order = await getPublicOrder(params.slug, orderNumber);
  if (!order) notFound();

  const store = applyPreviewOverrides(
    serializePublicStore(storeData, storeData.settings),
    searchParams
  );
  const detail = serializeOrderDetail(order);
  const isPreview = searchParams.preview === "true";
  const isCod = detail.paymentMethod === "cod";
  const isStripe = detail.paymentMethod === "stripe";
  const isPaypal = detail.paymentMethod === "paypal";
  const isPaid = detail.paymentStatus === "paid";

  return (
    <StorefrontShell
      store={store}
      preview={isPreview}
      purchaseEvent={{
        value: detail.total,
        currency: store.currency,
        orderNumber: detail.orderNumber,
        contentIds: detail.items.map((item) => item.productId).filter(Boolean),
        numItems: detail.items.reduce((sum, item) => sum + item.quantity, 0),
        email: detail.customerEmail,
        phone: detail.customerPhone,
        name: detail.customerName,
        city: detail.shippingAddress?.city ?? null,
        country: detail.shippingAddress?.country ?? null,
        zip: detail.shippingAddress?.postalCode ?? null,
      }}
    >
      <div className="min-h-screen bg-white">
        <main className="mx-auto max-w-lg px-5 py-14 text-center sm:px-6 sm:py-20">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Order confirmed
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">Thank you</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-500">
            {store.checkout.successMessage?.trim()
              ? store.checkout.successMessage
              : (
                  <>
                    {detail.customerEmail &&
                    !detail.customerEmail.startsWith("guest@") ? (
                      <>
                        We’ve emailed{" "}
                        <span className="font-medium text-neutral-700">
                          {detail.customerEmail}
                        </span>
                        {isCod
                          ? ". Have cash ready for the courier when your package arrives."
                          : isPaid
                            ? ". Your payment was received — we’ll update you when your order ships."
                            : ". We’ll update you when your order ships."}
                      </>
                    ) : isCod ? (
                      "Have cash ready for the courier when your package arrives."
                    ) : isPaid ? (
                      "Your payment was received — we’ll update you when your order ships."
                    ) : (
                      "We’ll update you when your order ships."
                    )}
                  </>
                )}
          </p>

          <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5 text-left sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-neutral-400" />
              <span className="text-[13px] font-semibold text-neutral-900">Order summary</span>
            </div>
            <div className="mb-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Order number</span>
                <span className="font-mono font-medium text-neutral-900">{detail.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className="capitalize font-medium text-amber-700">{detail.status}</span>
              </div>
              {isCod ? (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment</span>
                  <span className="inline-flex items-center gap-1 font-medium text-neutral-800">
                    <Banknote className="h-3.5 w-3.5" />
                    Cash on delivery
                  </span>
                </div>
              ) : isStripe || isPaypal ? (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment</span>
                  <span className="font-medium text-neutral-800">
                    {isStripe ? "Card (Stripe)" : "PayPal"}
                    {isPaid ? " · Paid" : " · Pending"}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 border-t border-neutral-200 pt-4">
              {detail.items.map((item) => {
                const variantLabel = item.variant
                  ? Object.entries(item.variant)
                      .filter(([, v]) => Boolean(v?.trim()))
                      .map(([k, v]) => `${k} ${v}`)
                      .join(" · ")
                  : null;
                return (
                  <div key={item.id} className="flex justify-between gap-3 text-[13px]">
                    <span className="min-w-0 text-neutral-700">
                      <span className="font-medium text-neutral-900">{item.title}</span>
                      {variantLabel ? (
                        <span className="mt-0.5 block text-[11px] text-neutral-500">
                          {variantLabel}
                        </span>
                      ) : null}
                      <span className="text-neutral-400"> × {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {formatCurrency(item.price * item.quantity, store.currency)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-[13px]">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(detail.subtotal, store.currency)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {detail.shipping === 0
                    ? "Free"
                    : formatCurrency(detail.shipping, store.currency)}
                </span>
              </div>
              {detail.discount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount{detail.couponCode ? ` (${detail.couponCode})` : ""}</span>
                  <span className="tabular-nums">
                    −{formatCurrency(detail.discount, store.currency)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between pt-1 text-[15px] font-semibold text-neutral-900">
                <span>Total</span>
                <span className="tabular-nums" style={{ color: "var(--store-primary)" }}>
                  {formatCurrency(detail.total, store.currency)}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-neutral-200 pt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Shipping to
              </p>
              <p className="text-[13px] leading-relaxed text-neutral-700">
                {detail.shippingAddress.street}
                <br />
                {detail.shippingAddress.city}, {detail.shippingAddress.postalCode}
                <br />
                {detail.shippingAddress.country}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={getStoreProductsUrl(store.slug)}
              className="inline-flex h-12 w-full items-center justify-center rounded-full px-8 text-[13px] font-semibold sm:w-auto"
              style={{ backgroundColor: "var(--store-cta, var(--store-primary))", color: "var(--store-on-cta, #fff)" }}
            >
              Continue shopping
            </Link>
            <Link
              href={getStoreUrl(store.slug)}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-neutral-200 px-8 text-[13px] font-medium text-neutral-700 sm:w-auto"
            >
              Back to store
            </Link>
          </div>
        </main>
      </div>
    </StorefrontShell>
  );
}
