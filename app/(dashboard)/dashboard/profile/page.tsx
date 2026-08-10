import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { loadUserPlan, serializeAccountProfile } from "@/lib/account-profile";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { ProfilePageClient } from "@/components/shared/profile-page-client";

export const metadata = {
  title: "Profile",
  description: "Your Ettajer account — photo, name, password, and preferences.",
};

export default async function DashboardProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      marketingEmails: true,
      founderNumber: true,
      passwordHash: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) redirect("/login");

  const store = await prisma.store.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!store) redirect("/onboarding");

  const plan = await loadUserPlan(user.id);

  return (
    <DashboardLayout>
      <DashboardPageContent>
        <ProfilePageClient
          initialProfile={serializeAccountProfile({ ...user, plan })}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
