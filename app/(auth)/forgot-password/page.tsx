import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getAuthSeo } from "@/lib/auth/auth-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getAuthSeo(locale).forgotPassword,
    path: "/forgot-password",
    locale,
  });
}
function ForgotPasswordFallback() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/75 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <div className="border-b border-neutral-100/80 px-7 pb-6 pt-8 text-center sm:px-9 sm:pt-9">
        <div className="mx-auto h-7 w-44 animate-pulse rounded-lg bg-neutral-100" />
        <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-neutral-100" />
      </div>
      <div className="space-y-4 px-7 py-7 sm:px-9 sm:py-8">
        <div className="h-11 animate-pulse rounded-xl bg-neutral-100" />
        <div className="h-11 animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout variant="signin">
      <Suspense fallback={<ForgotPasswordFallback />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
