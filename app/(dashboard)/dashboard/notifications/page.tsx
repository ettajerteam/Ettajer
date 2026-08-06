import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { NotificationsPageClient } from "@/components/shared/notifications-page-client";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!store) redirect("/onboarding");

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Notifications"
        description="Orders, abandoned carts, messages, and stock alerts"
      />
      <DashboardPageContent>
        <NotificationsPageClient />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
