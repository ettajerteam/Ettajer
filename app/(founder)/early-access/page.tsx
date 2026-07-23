import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { getPostAuthRedirect } from "@/lib/auth-redirect";
import { getUserFounderProfile, getFounderCount, USER_STATUS } from "@/lib/founder";
import { getRecentFounderCount, getLaunchTargetDate } from "@/lib/founder/waiting-intelligence";
import { isPlatformLaunched } from "@/lib/founder/launch-date";
import { FounderShell } from "@/components/founder/founder-shell";
import { EarlyAccessContent } from "@/components/founder/early-access-content";
import { FounderFlowRoot } from "@/components/founder/founder-flow-root";
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
export default async function EarlyAccessPage({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserFounderProfile(session.user.id);
  if (!user) redirect("/login");
  if (!user.emailVerified) {
    redirect(`/activate?email=${encodeURIComponent(user.email)}`);
  }
  if (!user.founderNumber) {
    redirect("/dashboard");
  }

  // Platform is live — skip waiting UI, go straight to dashboard or onboarding.
  if (isPlatformLaunched() || user.status !== USER_STATUS.WAITING) {
    redirect(await getPostAuthRedirect());
  }

  const isReturning = searchParams.new !== "1";
  const founderCount = await getFounderCount();
  const foundersJoinedRecently = await getRecentFounderCount(7);

  return (
    <FounderFlowRoot>
      <FounderShell userName={user.name ?? undefined} founderNumber={user.founderNumber} className="max-w-6xl">
        <EarlyAccessContent
          name={user.name ?? "Founder"}
          email={user.email}
          founderNumber={user.founderNumber}
          founderCount={founderCount}
          joinedAt={user.createdAt.toISOString()}
          isReturning={isReturning}
          foundersJoinedRecently={foundersJoinedRecently}
          launchTargetIso={getLaunchTargetDate().toISOString()}
        />
      </FounderShell>
    </FounderFlowRoot>
  );
}
