import { Suspense } from "react";
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
import { MessengerInboxClient } from "@/components/shared/messenger-inbox-client";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const submissions = await listContactSubmissions(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Messages"
        description="Inbox for customers and Ettajer support"
      />
      <DashboardPageContent>
        <Suspense fallback={null}>
          <MessengerInboxClient
            initialContacts={submissions.map(serializeContactSubmission)}
          />
        </Suspense>
      </DashboardPageContent>
    </DashboardLayout>
  );
}
