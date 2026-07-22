"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getStoreProductsUrl, getStoreUrl } from "@/lib/storefront-urls";

/**
 * Store-scoped 404 — keeps the quiet editorial language when a product,
 * collection, or page under /store/[slug] is missing.
 */
export function StoreNotFoundView() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const homeHref = slug ? getStoreUrl(slug) : "/";
  const shopHref = slug ? getStoreProductsUrl(slug) : "/";

  return (
    <div className="flex min-h-[70vh] flex-col bg-[#0a0a0a] text-white">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-20 text-center sm:py-28">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          This page isn’t here
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm font-light leading-relaxed text-white/55">
          The piece or page may have moved, sold out of the archive, or never existed at this address.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={shopHref}
            className="inline-flex h-11 items-center rounded-full bg-white px-6 text-[13px] font-semibold text-neutral-900 transition hover:bg-white/90"
          >
            Browse the shop
          </Link>
          <Link
            href={homeHref}
            className="inline-flex h-11 items-center rounded-full border border-white/25 px-6 text-[13px] font-medium text-white/80 transition hover:border-white/50"
          >
            Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
