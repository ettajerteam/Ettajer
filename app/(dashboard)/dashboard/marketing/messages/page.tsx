import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import {
  listContactSubmissions,
  serializeContactSubmission,
} from "@/lib/contact-submissions";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ContactMessagesClient } from "@/components/contact/contact-messages-client";

export const metadata = { title: "Messages" };

export default async function ContactMessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const submissions = await listContactSubmissions(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Messages"
        description="Contact form submissions from your storefront"
      />
      <DashboardPageContent>
        <ContactMessagesClient initial={submissions.map(serializeContactSubmission)} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
