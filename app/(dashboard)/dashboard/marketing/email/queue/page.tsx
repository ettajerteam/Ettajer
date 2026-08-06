import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailQueueClient } from "@/components/email-marketing/email-queue-client";
import {
  getEmailQueueStats,
  listEmailJobs,
  serializeEmailJob,
} from "@/lib/email-marketing/email-queue";
import { listEmailTemplates } from "@/lib/email-marketing/templates";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listNewsletterSubscribers } from "@/lib/newsletter";

export const metadata = { title: "Sending status" };

export default async function EmailQueuePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [stats, jobs, templates, subscribers, automations] = await Promise.all([
    getEmailQueueStats(store.id),
    listEmailJobs(store.id, { take: 75 }),
    listEmailTemplates(store.id),
    listNewsletterSubscribers(store.id, { status: "all" }),
    listEmailAutomations(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Sending status"
        description="Pending, sending, and failed emails"
      />
      <DashboardPageContent>
        <EmailSectionNav
          counts={{
            audience: subscribers.length,
            templates: templates.length,
            automationsOn: automations.filter((a) => a.enabled).length,
          }}
        />
        <EmailQueueClient
          initialStats={stats}
          initialJobs={jobs.map(serializeEmailJob)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
