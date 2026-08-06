import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { EmailSectionNav } from "@/components/email-marketing/email-section-nav";
import {
  EmailHubClient,
  type EmailHubChecklistItem,
  type EmailHubRecentItem,
} from "@/components/email-marketing/email-hub-client";
import { listEmailTemplates } from "@/lib/email-marketing/templates";
import {
  ensureEmailAutomationsSeeded,
  listEmailAutomations,
} from "@/lib/email-marketing/automations";
import { listCampaignHistory } from "@/lib/email-marketing/campaigns";
import { listAudienceSegments } from "@/lib/email-marketing/segments";
import { getNewsletterStats } from "@/lib/newsletter";
import { isResendConfigured } from "@/lib/resend";

export const metadata = { title: "Email" };

export default async function EmailHubPage() {
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

  const [
    stats,
    templates,
    automations,
    segments,
    history,
    verifiedDomains,
    providerCount,
  ] = await Promise.all([
    getNewsletterStats(store.id),
    listEmailTemplates(store.id),
    listEmailAutomations(store.id),
    listAudienceSegments(store.id),
    listCampaignHistory(store.id, { filter: "all", page: 1, pageSize: 5 }),
    prisma.emailSendingDomain.count({
      where: {
        storeId: store.id,
        OR: [
          { verificationStatus: "verified" },
          { AND: [{ spfStatus: "verified" }, { dkimStatus: "verified" }] },
        ],
      },
    }),
    prisma.storeEmailProvider.count({ where: { storeId: store.id } }),
  ]);

  const welcomeOn = automations.some(
    (a) => a.trigger === "newsletter_subscribe" && a.enabled,
  );
  const hasAnyCampaign = history.total > 0;
  const emailSetupDone =
    verifiedDomains > 0 || providerCount > 0 || isResendConfigured();

  const checklist: EmailHubChecklistItem[] = [
    {
      id: "setup",
      label: "Connect email in Settings",
      done: emailSetupDone,
      href: "/dashboard/settings?tab=email",
    },
    {
      id: "template",
      label: "Add a template",
      done: templates.length > 0,
      href: "/dashboard/marketing/email/templates",
    },
    {
      id: "welcome",
      label: "Turn on welcome email",
      done: welcomeOn,
      href: "/dashboard/marketing/email/automations",
    },
    {
      id: "subscribers",
      label: "Get subscribers",
      done: stats.active > 0,
      href: "/dashboard/marketing/email/subscribers",
    },
    {
      id: "campaign",
      label: "Send first campaign",
      done: hasAnyCampaign,
      href: "/dashboard/marketing/email/campaigns",
    },
  ];

  const recent: EmailHubRecentItem[] = history.campaigns.slice(0, 5).map((c) => ({
    id: c.id,
    title: c.name?.trim() || c.subject || "Untitled campaign",
    status: c.status,
    href: `/dashboard/marketing/email/campaigns/${c.id}`,
    createdAt: c.createdAt,
  }));

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Email"
        description="Campaigns and automatic emails"
      />
      <DashboardPageContent>
        <EmailSectionNav
          counts={{
            audience: stats.total,
            templates: templates.length,
            automationsOn: automations.filter((a) => a.enabled).length,
            segments: segments.length,
          }}
        />
        <EmailHubClient
          checklist={checklist}
          stats={{
            activeSubscribers: stats.active,
            totalSubscribers: stats.total,
            templates: templates.length,
            automationsOn: automations.filter((a) => a.enabled).length,
          }}
          recent={recent}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
