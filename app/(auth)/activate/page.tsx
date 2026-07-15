import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ActivateAccountForm } from "@/components/auth/activate-account-form";
import { getAuthSeo } from "@/lib/auth/auth-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getAuthSeo(locale).activate,
    path: "/activate",
    locale,
  });
}

function ActivateFallback() {
  return (
    <div className="animate-pulse rounded-[18px] border border-black/[0.04] bg-white px-10 py-12">
      <div className="mx-auto mb-3 h-8 w-48 rounded-lg bg-[#f5f5f7]" />
      <div className="mx-auto mb-9 h-4 w-64 rounded bg-[#f5f5f7]" />
      <div className="flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 w-10 rounded-xl bg-[#f5f5f7]" />
        ))}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <AuthLayout variant="signin">
      <Suspense fallback={<ActivateFallback />}>
        <ActivateAccountForm />
      </Suspense>
    </AuthLayout>
  );
}
