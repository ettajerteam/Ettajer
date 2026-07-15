import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, Package } from "lucide-react";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Button } from "@/components/ui/button";
import {
  getStoreBySlug,
  serializePublicStore,
} from "@/lib/storefront";
import { getPublicOrder, serializeOrderDetail } from "@/lib/orders";
import { formatCurrency } from "@/lib/utils";
import { applyPreviewOverrides } from "@/lib/preview-engine";

interface PageProps {
  params: { slug: string };
  searchParams: {
    order?: string;
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
  return {
    title: searchParams.order
      ? `Order ${searchParams.order} — ${store.name}`
      : `Order Confirmation — ${store.name}`,
  };
}

export default async function OrderConfirmationPage({ params, searchParams }: PageProps) {
  const orderNumber = searchParams.order;
  if (!orderNumber) notFound();

  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const order = await getPublicOrder(params.slug, orderNumber);
  if (!order) notFound();

  const store = applyPreviewOverrides(
    serializePublicStore(storeData, storeData.settings),
    searchParams
  );
  const detail = serializeOrderDetail(order);
  const isPreview = searchParams.preview === "true";

  return (
    <StorefrontShell
      store={store}
      preview={isPreview}
      purchaseEvent={{
        value: detail.total,
        currency: store.currency,
        orderNumber: detail.orderNumber,
      }}
    >
      <div className="min-h-screen bg-white">
        <main className="max-w-lg mx-auto px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Thank you!</h1>
          <p className="text-gray-500 mb-8">
            Your order has been placed successfully. A confirmation email has been sent to{" "}
            <span className="font-medium text-gray-700">{detail.customerEmail}</span>.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 text-left mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-[#007AFF]" />
              <span className="font-semibold">Order Summary</span>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Order number</span>
                <span className="font-mono font-medium">{detail.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="capitalize font-medium text-amber-600">{detail.status}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              {detail.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.price * item.quantity, store.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(detail.subtotal, store.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>
                  {detail.shipping === 0
                    ? "Free"
                    : formatCurrency(detail.shipping, store.currency)}
                </span>
              </div>
              {detail.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount{detail.couponCode ? ` (${detail.couponCode})` : ""}</span>
                  <span>−{formatCurrency(detail.discount, store.currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-[#007AFF]">
                  {formatCurrency(detail.total, store.currency)}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Shipping to</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {detail.shippingAddress.street}
                <br />
                {detail.shippingAddress.city}, {detail.shippingAddress.postalCode}
                <br />
                {detail.shippingAddress.country}
              </p>
            </div>
          </div>

          <Button asChild className="rounded-xl h-12 px-8 text-white" style={{ backgroundColor: "#007AFF" }}>
            <Link href={`/store/${store.slug}`}>Continue Shopping</Link>
          </Button>
        </main>
      </div>
    </StorefrontShell>
  );
}
