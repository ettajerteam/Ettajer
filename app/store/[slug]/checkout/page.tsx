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
import { buildStorefrontMetadata } from "@/lib/seo/storefront-metadata";
import { getStoreCheckoutUrl, getStoreUrl } from "@/lib/storefront-urls";
import { cn } from "@/lib/utils";
import type { ThemeId } from "@/lib/themes";

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
  return buildStorefrontMetadata({
    storeName: store.name,
    path: getStoreCheckoutUrl(store.slug),
    title: "Checkout",
    description: `Secure checkout at ${store.name}`,
    noIndex: true,
  });
}

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const storeData = await getStoreBySlug(params.slug);
  if (!storeData) notFound();

  const store = applyPreviewOverrides(
    serializePublicStore(storeData, storeData.settings),
    searchParams
  );
  const isPreview = searchParams.preview === "true";
  const themeId = (store.theme in { minimal: 1, modern: 1, bold: 1 }
    ? store.theme
    : "minimal") as ThemeId;
  const isBold = themeId === "bold";

  return (
    <StorefrontShell store={store} preview={isPreview}>
      <div
        className={cn("min-h-screen", isBold ? "bg-zinc-950 text-white" : "bg-white")}
        style={themeId === "modern" ? { backgroundColor: store.secondaryColor } : undefined}
      >
        <StorefrontHeader
          store={store}
          variant={themeId}
          backHref={getStoreUrl(store.slug)}
          backLabel="← Continue shopping"
        />
        <main className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 sm:pb-16 sm:pt-10">
          <header className="mb-6 max-w-lg sm:mb-8 lg:max-w-none">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
              Secure checkout
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Checkout
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              {store.checkout.cashOnDelivery
                ? "A calm, three-step order — pay cash on delivery if you prefer."
                : "Complete your order in three quiet steps."}
            </p>
          </header>
          <CheckoutForm store={store} />
          <p className="mt-10 text-center text-[11px] text-neutral-400 lg:text-left">
            Need help?{" "}
            <Link href={getStoreUrl(store.slug)} className="underline underline-offset-2 hover:text-neutral-600">
              Return to {store.name}
            </Link>
          </p>
        </main>
      </div>
    </StorefrontShell>
  );
}
