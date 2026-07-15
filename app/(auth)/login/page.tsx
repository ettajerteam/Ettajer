import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { getAuthSeo } from "@/lib/auth/auth-seo";
import { getAuthProviders } from "@/lib/auth-providers";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getAuthSeo(locale).login,
    path: "/login",
    locale,
  });
}

function AuthFormFallback() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/75 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <div className="flex flex-col items-center border-b border-neutral-100/80 px-7 pb-6 pt-8 sm:px-9 sm:pt-9">
        <div className="mb-4 h-[52px] w-[52px] animate-pulse rounded-[14px] bg-neutral-100" />
        <div className="h-7 w-40 animate-pulse rounded-lg bg-neutral-100" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-neutral-100" />
      </div>
      <div className="space-y-4 px-7 py-7 sm:px-9 sm:py-8">
        <div className="space-y-1.5">
          <div className="h-4 w-12 animate-pulse rounded bg-neutral-100" />
          <div className="h-11 animate-pulse rounded-xl bg-neutral-100" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-100" />
          <div className="h-11 animate-pulse rounded-xl bg-neutral-100" />
        </div>
        <div className="h-11 animate-pulse rounded-xl bg-neutral-200" />
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-100" />
          <div className="h-3 w-6 animate-pulse rounded bg-neutral-100" />
          <div className="h-px flex-1 bg-neutral-100" />
        </div>
        <div className="h-11 animate-pulse rounded-xl bg-neutral-100" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const providers = getAuthProviders();

  return (
    <AuthLayout variant="signin">
      <Suspense fallback={<AuthFormFallback />}>
        <AuthForm mode="login" providers={providers} />
      </Suspense>
    </AuthLayout>
  );
}
