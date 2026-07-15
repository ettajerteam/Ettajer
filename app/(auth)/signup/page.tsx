import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";
import { getAuthSeo } from "@/lib/auth/auth-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getAuthSeo(locale).signup,
    path: "/signup",
    locale,
  });
}

function SignupFallback() {
  return (
    <div className="animate-pulse rounded-[18px] border border-black/[0.04] bg-white px-10 py-12">
      <div className="mx-auto mb-3 h-8 w-56 rounded-lg bg-[#f5f5f7]" />
      <div className="mx-auto mb-9 h-4 w-64 rounded bg-[#f5f5f7]" />
      <div className="mb-7 h-[50px] rounded-[12px] bg-[#f5f5f7]" />
      <div className="h-[50px] rounded-[12px] bg-[#f5f5f7]" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthLayout variant="signin">
      <Suspense fallback={<SignupFallback />}>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  );
}
