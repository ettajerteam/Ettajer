import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailCampaignsClient } from "@/components/email-marketing/email-campaigns-client";
import {
  listEmailTemplates,
  serializeEmailTemplate,
} from "@/lib/email-marketing/templates";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listCampaignHistory } from "@/lib/email-marketing/campaigns";
import { listAudienceSegments } from "@/lib/email-marketing/segments";
import {
  getNewsletterStats,
  listNewsletterSubscribers,
} from "@/lib/newsletter";

export const metadata = { title: "Campaigns" };

export default async function EmailCampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const [templates, subscribers, history, stats, automations, segments] =
    await Promise.all([
      listEmailTemplates(store.id),
      listNewsletterSubscribers(store.id, { status: "all" }),
      listCampaignHistory(store.id, { filter: "all", page: 1, pageSize: 20 }),
      getNewsletterStats(store.id),
      listEmailAutomations(store.id),
      listAudienceSegments(store.id),
    ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Campaigns"
        description="Send one email to many people"
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
        <EmailCampaignsClient
          templates={templates.map(serializeEmailTemplate)}
          activeCount={stats.active}
          audienceStats={{
            total: stats.total,
            active: stats.active,
            unsubscribed: stats.unsubscribed,
            bounced: stats.bounced,
            complained: stats.complained,
          }}
          initialCampaigns={history.campaigns}
          initialCounts={history.counts}
          initialTotal={history.total}
          initialPage={history.page}
          initialPageSize={history.pageSize}
          initialTotalPages={history.totalPages}
          segments={segments.map((s) => ({
            id: s.id,
            name: s.name,
            cachedCount: s.cachedCount,
          }))}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
