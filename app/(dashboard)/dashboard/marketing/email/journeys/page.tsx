import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailJourneysClient } from "@/components/email-marketing/email-journeys-client";
import { listJourneys } from "@/lib/email-marketing/atlas/journeys";
import {
  getNewsletterStats,
  listNewsletterSubscribers,
} from "@/lib/newsletter";
import { listEmailTemplates } from "@/lib/email-marketing/templates";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listAudienceSegments } from "@/lib/email-marketing/segments";

export const metadata = { title: "Email flows" };

export default async function EmailJourneysPage({
  searchParams,
}: {
  searchParams?: { ai?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [journeys, subscribers, templates, automations, segments, stats] =
    await Promise.all([
      listJourneys(store.id),
      listNewsletterSubscribers(store.id, { status: "all" }),
      listEmailTemplates(store.id),
      listEmailAutomations(store.id),
      listAudienceSegments(store.id),
      getNewsletterStats(store.id),
    ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Email flows"
        description="Multi-step flows with delays"
      />
      <DashboardPageContent>
        <EmailSectionNav
          counts={{
            audience: stats.active || subscribers.length,
            templates: templates.length,
            automationsOn: automations.filter(
              (a: { enabled: boolean }) => a.enabled
            ).length,
            segments: segments.length,
          }}
        />
        <EmailJourneysClient
          initialJourneys={journeys}
          storeName={store.name}
          openAi={searchParams?.ai === "1"}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
