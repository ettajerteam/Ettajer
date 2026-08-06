import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleOneTapHost } from "@/components/auth/google-one-tap";
import { getAuthProviders } from "@/lib/auth-providers";
import { getAuthSeo } from "@/lib/auth/auth-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export const dynamic = "force-dynamic";

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
    <div className="animate-pulse rounded-2xl border border-white/90 bg-white px-4 py-5 shadow-sm sm:rounded-xl">
      <div className="mx-auto mb-2 h-10 w-10 rounded-lg bg-[#f5f5f7]" />
      <div className="mx-auto mb-4 h-6 w-40 rounded-md bg-[#f5f5f7]" />
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div className="h-11 rounded-xl bg-[#f5f5f7] sm:h-9" />
        <div className="h-11 rounded-xl bg-[#f5f5f7] sm:h-9" />
      </div>
      <div className="mb-2 h-11 rounded-xl bg-[#f5f5f7] sm:h-9" />
      <div className="mb-2 h-11 rounded-xl bg-[#f5f5f7] sm:h-9" />
      <div className="h-11 rounded-xl bg-[#f5f5f7] sm:h-9" />
    </div>
  );
}

export default function SignupPage() {
  const providers = getAuthProviders();
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() || "";

  return (
    <AuthLayout variant="signin">
      <GoogleOneTapHost clientId={googleClientId} autoSelect={false} context="signup" />
      <Suspense fallback={<SignupFallback />}>
        <SignupForm providers={providers} />
      </Suspense>
    </AuthLayout>
  );
}
