import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { getUserFounderProfile, USER_STATUS } from "@/lib/founder";
import { FounderShell } from "@/components/founder/founder-shell";
import { WelcomeContent } from "@/components/founder/welcome-content";
import { FounderFlowRoot } from "@/components/founder/founder-flow-root";
import { getFounderSeo } from "@/lib/founder/founder-seo";
import { buildPageMetadata, getServerLocale } from "@/lib/seo/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    seo: getFounderSeo(locale).welcome,
    path: "/welcome",
    locale,
    noIndex: true,
  });
}
export default async function WelcomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signup");

  const user = await getUserFounderProfile(session.user.id);
  if (!user?.emailVerified) {
    redirect(`/activate?email=${encodeURIComponent(user?.email ?? "")}`);
  }
  if (!user?.founderNumber || user.status !== USER_STATUS.WAITING) {
    redirect("/dashboard");
  }

  return (
    <FounderFlowRoot>
      <FounderShell userName={user.name ?? undefined} founderNumber={user.founderNumber}>
        <WelcomeContent
          name={user.name ?? "Founder"}
          email={user.email}
          founderNumber={user.founderNumber}
        />
      </FounderShell>
    </FounderFlowRoot>
  );
}
