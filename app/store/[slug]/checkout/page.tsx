import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Lock, ShieldCheck } from "lucide-react";
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
  const primary = store.primaryColor || "#007AFF";

  return (
    <StorefrontShell store={store} preview={isPreview}>
      <div
        className={cn(
          "min-h-screen",
          isBold ? "bg-zinc-950 text-white" : "bg-white"
        )}
        style={
          themeId === "modern"
            ? { backgroundColor: store.secondaryColor }
            : undefined
        }
      >
        <StorefrontHeader
          store={store}
          variant={themeId}
          backHref={getStoreUrl(store.slug)}
          backLabel="← Continue shopping"
        />

        {/* Soft desktop atmosphere behind the checkout stage */}
        <div
          className={cn(
            "relative",
            !isBold &&
              "lg:bg-[linear-gradient(180deg,#f7f7f8_0%,#ffffff_42%)]"
          )}
        >
          <main className="relative mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
            <header className="mb-8 flex flex-col gap-5 sm:mb-10 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-sm backdrop-blur">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: primary }}
                  />
                  Secure checkout · {store.name}
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                  Checkout
                </h1>
                <p className="mt-2 max-w-md text-[15px] leading-relaxed text-neutral-500">
                  {store.checkout.cashOnDelivery
                    ? "Enter your details, confirm delivery, then pay on arrival if you prefer."
                    : "Enter your details and complete payment in a few clear steps."}
                </p>
              </div>

              <ul className="hidden items-center gap-5 text-[12px] text-neutral-500 lg:flex">
                <li className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-neutral-400" />
                  Encrypted
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-neutral-400" />
                  Private to this store
                </li>
                {store.checkout.cashOnDelivery ? (
                  <li className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-700">
                    Cash on delivery available
                  </li>
                ) : null}
              </ul>
            </header>

            <CheckoutForm store={store} />

            <p className="mt-12 text-center text-[11px] text-neutral-400 lg:text-left">
              Need help?{" "}
              <Link
                href={getStoreUrl(store.slug)}
                className="underline underline-offset-2 hover:text-neutral-600"
              >
                Return to {store.name}
              </Link>
            </p>
          </main>
        </div>
      </div>
    </StorefrontShell>
  );
}
