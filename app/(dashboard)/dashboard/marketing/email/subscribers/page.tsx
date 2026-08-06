import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  listNewsletterSends,
  listNewsletterSubscribers,
  serializeNewsletterSend,
  serializeNewsletterSubscriber,
} from "@/lib/newsletter";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { NewsletterSubscribersClient } from "@/components/newsletter/newsletter-subscribers-client";
import { listEmailTemplates } from "@/lib/email-marketing/templates";
import {
  ensureEmailAutomationsSeeded,
  listEmailAutomations,
} from "@/lib/email-marketing/automations";
import { listAudienceSegments } from "@/lib/email-marketing/segments";

export const metadata = { title: "Subscribers" };

export default async function EmailSubscribersPage() {
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

  const [subscribers, sends, templates, automations, segments] =
    await Promise.all([
      listNewsletterSubscribers(store.id, { status: "all" }),
      listNewsletterSends(store.id, 8),
      listEmailTemplates(store.id),
      listEmailAutomations(store.id),
      listAudienceSegments(store.id),
    ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Subscribers"
        description="Your newsletter list"
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
        <NewsletterSubscribersClient
          initial={subscribers.map(serializeNewsletterSubscriber)}
          initialSends={sends.map(serializeNewsletterSend)}
          storeSlug={store.slug}
          storeName={store.name}
          storePrimaryColor={store.primaryColor}
          emailTemplates={templates.map((t) => ({
            id: t.id,
            name: t.name,
            subject: t.subject,
          }))}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
