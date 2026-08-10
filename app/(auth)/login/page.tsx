import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleOneTapHost } from "@/components/auth/google-one-tap";
import { getAuthSeo } from "@/lib/auth/auth-seo";
import { getAuthProviders } from "@/lib/auth-providers";
import { auth } from "@/lib/auth-session";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export const dynamic = "force-dynamic";

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
    <div className="overflow-hidden rounded-[1.25rem] border border-white/90 bg-white/90 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.1)] backdrop-blur-xl">
      <div className="flex flex-col items-center border-b border-neutral-100/80 px-6 pb-4 pt-5 sm:px-8 sm:pt-6">
        <div className="mb-3 h-12 w-12 animate-pulse rounded-[14px] bg-neutral-100" />
        <div className="mb-1 h-2.5 w-14 animate-pulse rounded bg-neutral-100" />
        <div className="h-6 w-40 animate-pulse rounded-lg bg-neutral-100" />
        <div className="mt-1.5 h-3.5 w-52 animate-pulse rounded bg-neutral-100" />
      </div>
      <div className="space-y-3 px-6 py-4 sm:px-8 sm:py-5">
        <div className="h-11 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-100" />
          <div className="h-3 w-6 animate-pulse rounded bg-neutral-100" />
          <div className="h-px flex-1 bg-neutral-100" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3.5 w-12 animate-pulse rounded bg-neutral-100" />
          <div className="h-11 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3.5 w-16 animate-pulse rounded bg-neutral-100" />
          <div className="h-11 animate-pulse rounded-2xl bg-neutral-100" />
        </div>
        <div className="h-11 animate-pulse rounded-xl bg-neutral-200" />
      </div>
    </div>
  );
}

/** Only allow same-origin relative paths (open-redirect safe). */
function safeCallbackUrl(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string | string[] };
}) {
  const callbackUrl = safeCallbackUrl(searchParams?.callbackUrl);

  const session = await auth();
  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  const providers = getAuthProviders();
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";

  return (
    <AuthLayout variant="signin">
      <GoogleOneTapHost clientId={googleClientId} autoSelect context="signin" />
      <Suspense fallback={<AuthFormFallback />}>
        <AuthForm mode="login" providers={providers} />
      </Suspense>
    </AuthLayout>
  );
}
