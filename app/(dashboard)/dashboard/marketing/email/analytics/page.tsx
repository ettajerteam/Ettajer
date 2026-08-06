import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailAnalyticsClient } from "@/components/email-marketing/email-analytics-client";
import { getEmailAnalyticsBundle } from "@/lib/email-marketing/email-analytics";
import { listEmailTemplates } from "@/lib/email-marketing/templates";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listNewsletterSubscribers } from "@/lib/newsletter";

export const metadata = { title: "Analytics" };

export default async function EmailAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const days = 30;
  const [bundle, templates, subscribers, automations] = await Promise.all([
    getEmailAnalyticsBundle(store.id, { days }),
    listEmailTemplates(store.id),
    listNewsletterSubscribers(store.id, { status: "all" }),
    listEmailAutomations(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Analytics"
        description="See opens, clicks, and what worked"
      />
      <DashboardPageContent>
        <EmailSectionNav
          counts={{
            audience: subscribers.length,
            templates: templates.length,
            automationsOn: automations.filter((a) => a.enabled).length,
          }}
        />
        <EmailAnalyticsClient
          initialSummary={bundle.summary}
          initialDaily={bundle.daily}
          initialCampaigns={bundle.campaigns}
          initialDays={days}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
