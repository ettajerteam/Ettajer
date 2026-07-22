import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  listNewsletterSubscribers,
  serializeNewsletterSubscriber,
} from "@/lib/newsletter";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { NewsletterSubscribersClient } from "@/components/newsletter/newsletter-subscribers-client";
import { MarketingSectionNav } from "@/components/marketing/marketing-section-nav";

export const metadata = { title: "Newsletter" };

export default async function NewsletterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const subscribers = await listNewsletterSubscribers(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Marketing"
        description="Newsletter subscribers from your storefront"
      />
      <DashboardPageContent>
        <div className="space-y-4">
          <MarketingSectionNav />
          <NewsletterSubscribersClient
            initial={subscribers.map(serializeNewsletterSubscriber)}
          />
        </div>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
