import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailAutomationsClient } from "@/components/email-marketing/email-automations-client";
import {
  ensureEmailAutomationsSeeded,
  listEmailAutomations,
  serializeEmailAutomation,
} from "@/lib/email-marketing/automations";
import {
  listEmailTemplates,
  serializeEmailTemplate,
} from "@/lib/email-marketing/templates";
import { listNewsletterSubscribers } from "@/lib/newsletter";

export const metadata = { title: "Automations" };

export default async function EmailAutomationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    include: { settings: { select: { newsletterAutomations: true } } },
  });
  if (!store) redirect("/onboarding");

  await ensureEmailAutomationsSeeded({
    id: store.id,
    name: store.name,
    settings: store.settings,
  });

  const [automations, templates, subscribers] = await Promise.all([
    listEmailAutomations(store.id),
    listEmailTemplates(store.id),
    listNewsletterSubscribers(store.id, { status: "all" }),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Automations"
        description="Send one email when something happens"
      />
      <DashboardPageContent>
        <EmailSectionNav
          counts={{
            audience: subscribers.length,
            templates: templates.length,
            automationsOn: automations.filter((a) => a.enabled).length,
          }}
        />
        <EmailAutomationsClient
          initialAutomations={automations.map(serializeEmailAutomation)}
          templates={templates.map(serializeEmailTemplate)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
