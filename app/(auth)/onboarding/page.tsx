import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { OnboardingPageClientRoot } from "@/components/onboarding/onboarding-page-client";
import { getAuthSeo } from "@/lib/auth/auth-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getAuthSeo(locale).onboarding,
    path: "/onboarding",
    locale,
    noIndex: true,
  });
}
export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const existingStore = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });

  if (existingStore) {
    redirect("/dashboard");
  }

  return <OnboardingPageClientRoot />;
}
