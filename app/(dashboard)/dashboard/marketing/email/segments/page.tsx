import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailSegmentsClient } from "@/components/email-marketing/email-segments-client";
import {
  listAudienceSegments,
  serializeAudienceSegment,
} from "@/lib/email-marketing/segments";
import { listEmailTemplates } from "@/lib/email-marketing/templates";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listNewsletterSubscribers } from "@/lib/newsletter";

export const metadata = { title: "Segments" };

export default async function EmailSegmentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [segments, templates, subscribers, automations] = await Promise.all([
    listAudienceSegments(store.id),
    listEmailTemplates(store.id),
    listNewsletterSubscribers(store.id, { status: "all" }),
    listEmailAutomations(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Segments"
        description="Groups of subscribers for targeted sends"
      />
      <DashboardPageContent>
        <EmailSectionNav
          counts={{
            audience: subscribers.length,
            templates: templates.length,
            automationsOn: automations.filter((a) => a.enabled).length,
            segments: segments.length,
          }}
        />
        <EmailSegmentsClient
          initialSegments={segments.map(serializeAudienceSegment)}
          currency={store.currency}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
