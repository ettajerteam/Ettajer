import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailTemplateEditorClient } from "@/components/email-marketing/email-template-editor-client";
import {
  getEmailTemplate,
  listEmailTemplates,
  serializeEmailTemplate,
} from "@/lib/email-marketing/templates";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listNewsletterSubscribers } from "@/lib/newsletter";

export const metadata = { title: "Edit template" };

export default async function EditEmailTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const template = await getEmailTemplate(params.id, store.id);
  if (!template) notFound();

  const [templates, subscribers, automations] = await Promise.all([
    listEmailTemplates(store.id),
    listNewsletterSubscribers(store.id, { status: "all" }),
    listEmailAutomations(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Edit template"
        description={template.name}
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
          mode="edit"
          storeName={store.name}
          storeSlug={store.slug}
          storePrimaryColor={store.primaryColor}
          currency={store.currency}
          initial={serializeEmailTemplate(template)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
