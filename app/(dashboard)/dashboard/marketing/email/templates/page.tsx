import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  listEmailTemplates,
  serializeEmailTemplate,
} from "@/lib/email-marketing/templates";
import { listEmailGallery } from "@/lib/email-marketing/gallery";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listNewsletterSubscribers } from "@/lib/newsletter";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailTemplatesClient } from "@/components/email-marketing/email-templates-client";

export const metadata = { title: "Templates" };

export default async function EmailTemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [templates, subscribers, automations] = await Promise.all([
    listEmailTemplates(store.id),
    listNewsletterSubscribers(store.id, { status: "all" }),
    listEmailAutomations(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Templates"
        description="Reusable emails for campaigns and automations"
      />
      <DashboardPageContent>
        <EmailSectionNav
          counts={{
            audience: subscribers.length,
            templates: templates.length,
            automationsOn: automations.filter((a) => a.enabled).length,
          }}
        />
        <EmailTemplatesClient
          initial={templates.map(serializeEmailTemplate)}
          gallery={listEmailGallery()}
          storePrimaryColor={store.primaryColor}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
