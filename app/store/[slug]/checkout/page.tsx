import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { CheckoutForm } from "@/components/storefront/checkout/checkout-form";
import {
  getStoreBySlug,
  serializePublicStore,
} from "@/lib/storefront";
import { applyPreviewOverrides } from "@/lib/preview-engine";

interface PageProps {
  params: { slug: string };
  searchParams: {
    preview?: string;
    theme?: string;
    primary?: string;
    secondary?: string;
    font?: string;
    logo?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const store = await getStoreBySlug(params.slug);
  if (!store) return { title: "Checkout" };
  return { title: `Checkout — ${store.name}` };
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const store = applyPreviewOverrides(
    serializePublicStore(storeData, storeData.settings),
    searchParams
  );
  const isPreview = searchParams.preview === "true";

  return (
    <StorefrontShell store={store} preview={isPreview}>
      <div className="min-h-screen bg-white">
        <StorefrontHeader
          store={store}
          variant={store.theme === "bold" ? "bold" : store.theme === "modern" ? "modern" : "minimal"}
          backHref={`/store/${store.slug}`}
          backLabel="← Continue shopping"
        />
        <main className="max-w-6xl mx-auto px-6 py-10 sm:py-16">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-2">
            Checkout
          </h1>
          <p className="text-center text-gray-500 text-sm mb-10">
            Complete your order in 3 easy steps
          </p>
          <CheckoutForm store={store} />
        </main>
      </div>
    </StorefrontShell>
  );
}
