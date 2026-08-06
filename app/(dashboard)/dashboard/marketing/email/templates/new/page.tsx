import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailTemplateEditorClient } from "@/components/email-marketing/email-template-editor-client";
import { listEmailTemplates } from "@/lib/email-marketing/templates";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listNewsletterSubscribers } from "@/lib/newsletter";

export const metadata = { title: "Create template" };

export default async function NewEmailTemplatePage() {
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
        title="Create template"
        description="Design a reusable email for automations and campaigns"
      />
      <DashboardPageContent>
        <EmailSectionNav
          counts={{
            audience: subscribers.length,
            templates: templates.length,
            automationsOn: automations.filter((a) => a.enabled).length,
          }}
        />
        <EmailTemplateEditorClient
          mode="create"
          storeName={store.name}
          storeSlug={store.slug}
          storePrimaryColor={store.primaryColor}
          currency={store.currency}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
