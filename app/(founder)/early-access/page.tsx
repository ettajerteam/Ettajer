import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { getPostAuthRedirect } from "@/lib/auth-redirect";
import { getFounderSeo } from "@/lib/founder/founder-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getFounderSeo(locale).earlyAccess,
    path: "/early-access",
    locale,
    noIndex: true,
  });
}
export default async function EarlyAccessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  redirect(await getPostAuthRedirect());
}
