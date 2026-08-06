import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import { EmailCampaignDetailClient } from "@/components/email-marketing/email-campaign-detail-client";
import { getCampaignHistoryDetail } from "@/lib/email-marketing/campaigns";
import { listEmailTemplates } from "@/lib/email-marketing/templates";
import { listEmailAutomations } from "@/lib/email-marketing/automations";
import { listAudienceSegments } from "@/lib/email-marketing/segments";
import { listNewsletterSubscribers } from "@/lib/newsletter";

export const metadata = { title: "Campaign" };

export default async function EmailCampaignDetailPage({
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

  let detail;
  try {
    detail = await getCampaignHistoryDetail(store.id, params.id);
  } catch {
    notFound();
  }

  const [templates, subscribers, automations, segments] = await Promise.all([
    listEmailTemplates(store.id),
    listNewsletterSubscribers(store.id, { status: "all" }),
    listEmailAutomations(store.id),
    listAudienceSegments(store.id),
  ]);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Campaign history"
        description={detail.campaign.name || detail.campaign.subject}
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
        <EmailCampaignDetailClient
          campaignId={params.id}
          initialCampaign={detail.campaign}
          initialTimeline={detail.timeline}
          initialPresentationLabel={detail.presentationLabel}
          initialRecipientStatusCounts={detail.recipientStatusCounts}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
